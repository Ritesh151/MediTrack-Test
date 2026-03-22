import mongoose from "mongoose";
import caseNumberGenerator from "./src/utils/caseNumberGenerator.js";
import Ticket from "./src/models/Ticket.js";

// Test configuration
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/meditrack_test";

async function testCaseNumberSystem() {
    console.log("🧪 Testing Case Number Generation System\n");

    try {
        // Connect to test database
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to test database");

        // Initialize counters
        await caseNumberGenerator.initializeCounters();
        console.log("✅ Counters initialized");

        // Test 1: Basic generation
        console.log("\n📋 Test 1: Basic case number generation");
        const caseNumber1 = await caseNumberGenerator.generateCaseNumber();
        console.log(`Generated: ${caseNumber1}`);
        console.log("✅ Basic generation successful");

        // Test 2: Concurrency test - generate multiple case numbers
        console.log("\n📋 Test 2: Concurrency test (10 parallel generations)");
        const promises = [];
        for (let i = 0; i < 10; i++) {
            promises.push(caseNumberGenerator.generateCaseNumber());
        }
        
        const caseNumbers = await Promise.all(promises);
        const uniqueCaseNumbers = [...new Set(caseNumbers)];
        
        console.log(`Generated ${caseNumbers.length} case numbers`);
        console.log(`Unique case numbers: ${uniqueCaseNumbers.length}`);
        
        if (caseNumbers.length === uniqueCaseNumbers.length) {
            console.log("✅ Concurrency test passed - all case numbers are unique");
        } else {
            console.log("❌ Concurrency test failed - duplicates detected");
            return false;
        }

        // Test 3: Ticket creation with case numbers
        console.log("\n📋 Test 3: Ticket creation with auto-generated case numbers");
        
        // Clear any existing tickets
        await Ticket.deleteMany({});
        
        const testTickets = [];
        for (let i = 0; i < 5; i++) {
            const ticket = new Ticket({
                patientId: new mongoose.Types.ObjectId(),
                hospitalId: new mongoose.Types.ObjectId(),
                issueTitle: `Test Issue ${i + 1}`,
                description: `Test description for issue ${i + 1}`,
            });
            
            await ticket.save();
            testTickets.push(ticket);
        }
        
        console.log(`Created ${testTickets.length} tickets`);
        
        // Verify all tickets have case numbers
        const allHaveCaseNumbers = testTickets.every(t => t.caseNumber);
        const allCaseNumbersUnique = testTickets.every((t, i, arr) => 
            arr.findIndex(x => x.caseNumber === t.caseNumber) === i
        );
        
        if (allHaveCaseNumbers && allCaseNumbersUnique) {
            console.log("✅ Ticket creation test passed - all tickets have unique case numbers");
        } else {
            console.log("❌ Ticket creation test failed");
            return false;
        }

        // Test 4: Get statistics
        console.log("\n📋 Test 4: Statistics");
        const stats = await caseNumberGenerator.getStats();
        console.log("Current stats:", stats);
        console.log("✅ Statistics retrieved successfully");

        // Test 5: Error handling - attempt duplicate insertion
        console.log("\n📋 Test 5: Error handling");
        try {
            const duplicateTicket = new Ticket({
                patientId: new mongoose.Types.ObjectId(),
                hospitalId: new mongoose.Types.ObjectId(),
                issueTitle: "Duplicate Test",
                description: "This should fail",
                caseNumber: testTickets[0].caseNumber // Try to use existing case number
            });
            
            await duplicateTicket.save();
            console.log("❌ Error handling test failed - duplicate was allowed");
            return false;
        } catch (error) {
            if (error.code === 11000) {
                console.log("✅ Error handling test passed - duplicate correctly rejected");
            } else {
                console.log("❌ Error handling test failed - unexpected error:", error.message);
                return false;
            }
        }

        console.log("\n🎉 All tests passed! Case number system is working correctly.");
        return true;

    } catch (error) {
        console.error("❌ Test failed with error:", error);
        return false;
    } finally {
        // Cleanup
        try {
            await Ticket.deleteMany({});
            await mongoose.connection.db.collection("counters").deleteMany({});
            await mongoose.disconnect();
            console.log("\n🧹 Test database cleaned up");
        } catch (error) {
            console.error("Cleanup error:", error);
        }
    }
}

// Run tests
if (import.meta.url === `file://${process.argv[1]}`) {
    testCaseNumberSystem()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error("Test runner error:", error);
            process.exit(1);
        });
}

export default testCaseNumberSystem;
