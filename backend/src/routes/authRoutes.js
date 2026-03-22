import express from "express";
import { registerPatient, loginUser, getMe } from "../controllers/authController.js";
import { updateUserHospital } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerPatient);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.patch("/me", protect, updateUserHospital);

export default router;
