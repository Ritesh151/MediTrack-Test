import mongoose from "mongoose";
import caseNumberGenerator from "../utils/caseNumberGenerator.js";

const ticketSchema = new mongoose.Schema({
    caseNumber: {
        type: String,
        required: true,
        unique: true,
        index: true,
        immutable: true,
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
        required: true,
    },
    assignedAdminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    issueTitle: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 200
    },
    description: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 2000
    },
    status: {
        type: String,
        enum: ["pending", "assigned", "resolved"],
        default: "pending"
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high", "urgent"],
        default: "medium"
    },
    reply: {
        doctorName: String,
        doctorPhone: String,
        specialization: String,
        replyMessage: String,
        repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        repliedAt: Date,
    },
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Pre-validation hook to generate caseNumber atomically
// This ensures caseNumber is ALWAYS generated before any database write
ticketSchema.pre("validate", async function (next) {
    // Only generate if not already set (prevents regeneration on updates)
    if (!this.caseNumber) {
        let lastError = null;
        
        // Retry logic at schema level for extra safety
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                this.caseNumber = await caseNumberGenerator.generateCaseNumber();
                
                // Validate the generated case number format
                if (!this.caseNumber || typeof this.caseNumber !== 'string') {
                    throw new Error('Generated case number is invalid');
                }
                
                // Case number generated successfully
                return next();
            } catch (error) {
                lastError = error;
                console.error(`Case number generation attempt ${attempt + 1} failed:`, error.message);
                
                // If it's a duplicate key error, retry immediately
                if (error.code === 11000 && attempt < 2) {
                    continue;
                }
            }
        }
        
        // All retries exhausted
        console.error("All case number generation attempts failed:", lastError);
        const validationError = new mongoose.Error.ValidationError();
        validationError.addError('caseNumber', new mongoose.Error.ValidatorError({
            message: 'Case number generation failed after multiple attempts. Please try again.',
            path: 'caseNumber',
            value: null,
            kind: 'required'
        }));
        return next(validationError);
    }
    next();
});

// Compound indexes for performance
ticketSchema.index({ patientId: 1, createdAt: -1 });
ticketSchema.index({ hospitalId: 1, status: 1 });
ticketSchema.index({ assignedAdminId: 1, status: 1 });

// Final safety check before save - this is the last line of defense
ticketSchema.pre("save", function(next) {
    // Case number must exist and be a non-empty string
    if (!this.caseNumber || typeof this.caseNumber !== 'string' || this.caseNumber.trim() === '') {
        const error = new Error("CRITICAL: Case number is required but was not generated. This indicates a system error.");
        console.error("CRITICAL: Attempted to save ticket without caseNumber:", {
            _id: this._id,
            caseNumber: this.caseNumber,
            patientId: this.patientId
        });
        return next(error);
    }
    
    // Validate case number format (MT-YYYYMMDD-XXXXX)
    const caseNumberPattern = /^MT-\d{8}-\d{5}$/;
    if (!caseNumberPattern.test(this.caseNumber)) {
        const error = new Error(`CRITICAL: Invalid case number format: ${this.caseNumber}`);
        console.error("CRITICAL: Invalid caseNumber format:", this.caseNumber);
        return next(error);
    }
    
    next();
});

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
