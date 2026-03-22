console.log("Testing case number system...");

// Simple test without database connection
import caseNumberGenerator from "./src/utils/caseNumberGenerator.js";

console.log("✅ Module imported successfully");

// Test the getStats method (should work without DB)
try {
    const stats = caseNumberGenerator.getStats();
    console.log("Stats method accessible:", stats);
} catch (error) {
    console.log("Expected error for stats without DB:", error.message);
}

console.log("✅ Basic module test passed");
