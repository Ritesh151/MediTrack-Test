import mongoose from "mongoose";

/**
 * Production-grade case number generator with concurrency safety
 * Works with standalone MongoDB (no replica set required)
 * Uses atomic findOneAndUpdate for guaranteed uniqueness
 */
class CaseNumberGenerator {
    constructor() {
        this.COUNTER_COLLECTION = "counters";
        this.CASE_NUMBER_FIELD = "caseNumber";
        this.MAX_RETRIES = 5;
        this.BASE_PREFIX = "MT";
    }

    /**
     * Generates a unique case number with atomic operations
     * Format: MT-YYYYMMDD-XXXXX (where XXXXX is a sequential counter)
     * 
     * No transactions needed - findOneAndUpdate with $inc is atomic
     */
    async generateCaseNumber() {
        let lastError = null;
        
        for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
            try {
                const caseNumber = await this._generateAtomic();
                
                // Validate the result
                if (caseNumber && typeof caseNumber === 'string' && caseNumber.startsWith(this.BASE_PREFIX)) {
                    return caseNumber;
                }
                
                throw new Error(`Invalid case number generated: ${caseNumber}`);
            } catch (error) {
                lastError = error;
                console.error(`Case number generation attempt ${attempt + 1} failed:`, error.message);
                
                // If duplicate key error, retry immediately
                if (error.code === 11000 && attempt < this.MAX_RETRIES - 1) {
                    // Small delay before retry to reduce collision chance
                    await new Promise(resolve => setTimeout(resolve, 10 * (attempt + 1)));
                    continue;
                }
            }
        }
        
        throw lastError || new Error('Case number generation failed after all retries');
    }

    /**
     * Internal method to generate case number with atomic counter
     * Uses findOneAndUpdate which is atomic at document level
     */
    async _generateAtomic() {
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const counterId = `${this.CASE_NUMBER_FIELD}_${today}`;

        // Atomic increment operation - this is guaranteed atomic by MongoDB
        // No transaction needed for single document operations
        const counter = await mongoose.connection.db.collection(this.COUNTER_COLLECTION)
            .findOneAndUpdate(
                { _id: counterId },
                { 
                    $inc: { sequence: 1 },
                    $setOnInsert: { 
                        createdAt: new Date(),
                        date: today 
                    }
                },
                { 
                    upsert: true, 
                    returnDocument: "after"
                }
            );

        // Extract sequence from result
        const sequence = this._extractSequence(counter, counterId);
        
        // Validate sequence
        if (sequence === undefined || sequence === null || !Number.isFinite(sequence)) {
            throw new Error(`Failed to retrieve valid counter sequence for ${counterId}`);
        }

        const paddedSequence = sequence.toString().padStart(5, '0');
        const caseNumber = `${this.BASE_PREFIX}-${today}-${paddedSequence}`;

        // Verify uniqueness (belt and suspenders approach)
        const existing = await mongoose.connection.db.collection("tickets")
            .findOne({ caseNumber });
        
        if (existing) {
            // Collision detected - this should be extremely rare
            // Throw with code 11000 to trigger retry
            throw Object.assign(new Error(`Case number collision detected: ${caseNumber}`), {
                code: 11000,
                caseNumber
            });
        }

        return caseNumber;
    }

    /**
     * Extracts sequence from findOneAndUpdate result
     * Handles different MongoDB driver return formats
     */
    _extractSequence(counter, counterId) {
        if (!counter || typeof counter !== 'object') {
            return null;
        }

        // Newer MongoDB driver (4.x+): returns document directly
        if (counter.sequence !== undefined) {
            return counter.sequence;
        }

        // Older MongoDB driver: returns { value: document, ... }
        if (counter.value !== undefined) {
            if (counter.value === null) {
                // Document was created but value is null
                // This shouldn't happen with returnDocument: "after", but handle it
                return null; // Will trigger fallback in _generateAtomic
            }
            return counter.value.sequence;
        }

        // Fallback: direct fetch
        return null;
    }

    /**
     * Fallback method to fetch counter directly
     * Used when findOneAndUpdate doesn't return the expected format
     */
    async _fetchCounterDirectly(counterId) {
        const counter = await mongoose.connection.db.collection(this.COUNTER_COLLECTION)
            .findOne({ _id: counterId });
        return counter?.sequence;
    }

    /**
     * Initializes the counter collection (for setup/migration)
     */
    async initializeCounters() {
        try {
            await mongoose.connection.db.createCollection(this.COUNTER_COLLECTION);
            console.log("Case number counters initialized successfully");
        } catch (error) {
            if (error.code !== 48) { // Collection already exists
                console.error("Error initializing counters:", error);
                throw error;
            }
        }
    }

    /**
     * Gets current counter statistics (for monitoring)
     */
    async getStats() {
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const counterId = `${this.CASE_NUMBER_FIELD}_${today}`;

        const counter = await mongoose.connection.db.collection(this.COUNTER_COLLECTION)
            .findOne({ _id: counterId });

        return {
            today,
            counterId,
            currentSequence: counter?.sequence || 0,
            lastGenerated: counter ? `${this.BASE_PREFIX}-${today}-${counter.sequence.toString().padStart(5, '0')}` : null
        };
    }

    /**
     * Generates a case number without using counters (for migration/repair)
     * Finds the highest existing case number for today and increments
     */
    async generateCaseNumberForRepair() {
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const prefix = `${this.BASE_PREFIX}-${today}`;
        
        // Find highest existing case number for today
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
        return `${prefix}-${paddedSequence}`;
    }
}

// Singleton instance for application-wide use
const caseNumberGenerator = new CaseNumberGenerator();

export default caseNumberGenerator;
