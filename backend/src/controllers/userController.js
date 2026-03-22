import User from "../models/User.js";

export const assignAdmin = async (req, res) => {
    const { name, email, password, hospitalId } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    const user = await User.create({
        name,
        email,
        password,
        role: "admin",
        hospitalId,
        permissions: ["tickets:read", "tickets:reply"],
    });

    res.status(201).json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hospitalId: user.hospitalId,
        permissions: user.permissions || [],
    });
};

export const getUsers = async (req, res) => {
    const users = await User.find({}).select("-password");
    res.json(users);
};

export const getAdmins = async (req, res) => {
    const admins = await User.find({ role: "admin" }).select("name email hospitalId");
    res.json(admins);
};

export const updateUserHospital = async (req, res) => {
    const { hospitalId } = req.body;
    const userId = req.user.id;

    // Validate that the user exists and is a patient
    const user = await User.findById(userId);
    
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "patient") {
        return res.status(403).json({ message: "Only patients can update their hospital" });
    }

    // Validate hospitalId format (basic validation)
    if (!hospitalId || typeof hospitalId !== 'string') {
        return res.status(400).json({ message: "Valid hospitalId is required" });
    }

    // Update the user's hospital
    user.hospitalId = hospitalId;
    await user.save();

    res.status(200).json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hospitalId: user.hospitalId,
        permissions: user.permissions || [],
    });
};
