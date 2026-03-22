import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Migration script to fix existing tickets with null or invalid caseNumbers
 * Works with standalone MongoDB (no replica set required)
 * 
 * Usage: node src/scripts/migrateCaseNumbers.js
 * 
 * This script will:
 * 1. Find all tickets with null, empty, or invalid caseNumbers
 * 2. Generate valid caseNumbers for them using direct calculation
 * 3. Update the counters collection to prevent future collisions
 */

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrack';
const BASE_PREFIX = 'MT';

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

async function findInvalidTickets() {
    const tickets = await mongoose.connection.db.collection('tickets').find({
        $or: [
            { caseNumber: null },
            { caseNumber: { $exists: false } },
            { caseNumber: '' },
            { caseNumber: { $not: /^MT-\d{8}-\d{5}$/ } }
        ]
    }).toArray();
    
    return tickets;
}

/**
 * Generates a case number for repair without using transactions
 * Finds the highest existing case number for today and increments
 */
async function generateCaseNumberForRepair() {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `${BASE_PREFIX}-${today}`;
    
    // Find highest existing case number for today across ALL tickets
    const result = await mongoose.connection.db.collection("tickets")
        .find({ caseNumber: { $regex: `^${prefix}` } })
        .sort({ caseNumber: -1 })
        .limit(1)
        .toArray();
    
    let nextSequence = 1;
    if (result.length > 0 && result[0].caseNumber) {
        const match = result[0].caseNumber.match(/-(\d{5})$/);
        if (match) {
            nextSequence = parseInt(match[1], 10) + 1;
        }
    }
    
    const paddedSequence = nextSequence.toString().padStart(5, '0');
    const newCaseNumber = `${prefix}-${paddedSequence}`;
    
    // Verify it doesn't already exist (belt and suspenders)
    const existing = await mongoose.connection.db.collection('tickets')
        .findOne({ caseNumber: newCaseNumber });
    
    if (existing) {
        // Recursively try next number
        return generateCaseNumberForRepair();
    }
    
    return newCaseNumber;
}

async function migrateTicket(ticket) {
    console.log(`\n📋 Migrating ticket ${ticket._id}`);
    console.log(`   Current caseNumber: ${ticket.caseNumber}`);
    
    // Generate new case number using repair method (no transactions)
    const newCaseNumber = await generateCaseNumberForRepair();
    
    // Update the ticket
    await mongoose.connection.db.collection('tickets').updateOne(
        { _id: ticket._id },
        { $set: { caseNumber: newCaseNumber } }
    );
    
    console.log(`   ✅ New caseNumber: ${newCaseNumber}`);
    return newCaseNumber;
}

async function syncCounters() {
    console.log('\n🔄 Syncing counters with existing tickets...');
    
    // Get all tickets with valid caseNumbers grouped by date
    const tickets = await mongoose.connection.db.collection('tickets')
        .find({ caseNumber: /^MT-\d{8}-\d{5}$/ })
        .sort({ caseNumber: 1 })
        .toArray();
    
    // Group by date and find max sequence
    const dateSequences = {};
    
    for (const ticket of tickets) {
        const match = ticket.caseNumber.match(/^MT-(\d{8})-(\d{5})$/);
        if (match) {
            const date = match[1];
            const sequence = parseInt(match[2], 10);
            
            if (!dateSequences[date]) {
                dateSequences[date] = 0;
            }
            
            if (sequence > dateSequences[date]) {
                dateSequences[date] = sequence;
            }
        }
    }
    
    // Update counters for each date
    for (const [date, maxSequence] of Object.entries(dateSequences)) {
        const counterId = `caseNumber_${date}`;
        
        await mongoose.connection.db.collection('counters').updateOne(
            { _id: counterId },
            { 
                $set: { 
                    sequence: maxSequence,
                    date: date,
                    updatedAt: new Date()
                },
                $setOnInsert: {
                    createdAt: new Date()
                }
            },
            { upsert: true }
        );
        
        console.log(`   📅 ${date}: sequence set to ${maxSequence}`);
    }
    
    console.log('   ✅ Counters synced');
}

async function runMigration() {
    console.log('🚀 Starting caseNumber migration...\n');
    
    await connectDB();
    
    // Find invalid tickets
    const invalidTickets = await findInvalidTickets();
    
    if (invalidTickets.length === 0) {
        console.log('✅ No invalid tickets found. Database is clean.');
    } else {
        console.log(`⚠️  Found ${invalidTickets.length} tickets with invalid caseNumbers:\n`);
        
        // Migrate each ticket sequentially to avoid collisions
        for (const ticket of invalidTickets) {
            try {
                await migrateTicket(ticket);
            } catch (error) {
                console.error(`   ❌ Failed to migrate ticket ${ticket._id}:`, error.message);
            }
        }
    }
    
    // Sync counters
    await syncCounters();
    
    // Verify no duplicates
    console.log('\n🔍 Verifying no duplicate caseNumbers...');
    const duplicates = await mongoose.connection.db.collection('tickets').aggregate([
        { $group: { _id: '$caseNumber', count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } }
    ]).toArray();
    
    if (duplicates.length > 0) {
        console.error('❌ Found duplicate caseNumbers:', duplicates);
    } else {
        console.log('✅ No duplicate caseNumbers found');
    }
    
    // Verify no null caseNumbers
    const nullCount = await mongoose.connection.db.collection('tickets').countDocuments({
        $or: [
            { caseNumber: null },
            { caseNumber: { $exists: false } },
            { caseNumber: '' }
        ]
    });
    
    if (nullCount > 0) {
        console.error(`❌ Found ${nullCount} tickets with null/empty caseNumbers`);
    } else {
        console.log('✅ No null/empty caseNumbers found');
    }
    
    console.log('\n✨ Migration complete!');
    
    await mongoose.disconnect();
    process.exit(0);
}

// Run migration
runMigration().catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
});
