import express from "express";
import caseNumberGenerator from "../utils/caseNumberGenerator.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Initialize case number counters (admin endpoint)
 */
router.post("/initialize-counters", protect, authorize("super"), async (req, res) => {
    try {
        await caseNumberGenerator.initializeCounters();
        res.json({
            success: true,
            message: "Case number counters initialized successfully"
        });
    } catch (error) {
        console.error("Error initializing counters:", error);
        res.status(500).json({
            success: false,
            message: "Failed to initialize counters",
            error: error.message
        });
    }
});

/**
 * Get case number generation statistics
 */
router.get("/case-number-stats", protect, authorize("super"), async (req, res) => {
    try {
        const stats = await caseNumberGenerator.getStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error("Error getting stats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get case number stats",
            error: error.message
        });
    }
});

export default router;
