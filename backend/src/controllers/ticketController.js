import Ticket from "../models/Ticket.js";
import mongoose from "mongoose";
import caseNumberGenerator from "../utils/caseNumberGenerator.js";

export const createTicket = async (req, res) => {
    console.log("Create Ticket Request - Body:", req.body);
    console.log("Create Ticket Request - User:", req.user);

    const { issueTitle, description, priority } = req.body;

    try {
        // Validate required fields
        if (!issueTitle || !description) {
            return res.status(400).json({
                success: false,
                message: "Issue title and description are required"
            });
        }

        // Validate hospitalId
        if (!req.user.hospitalId) {
            return res.status(400).json({
                success: false,
                message: "Hospital ID is required for ticket creation"
            });
        }

        // Convert hospitalId to ObjectId if it's a string
        let hospitalObjectId;
        try {
            hospitalObjectId = req.user.hospitalId instanceof mongoose.Types.ObjectId 
                ? req.user.hospitalId 
                : new mongoose.Types.ObjectId(req.user.hospitalId);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Invalid hospital ID format"
            });
        }

        // Create ticket with backend-controlled caseNumber generation
        const ticket = new Ticket({
            patientId: req.user.id,
            hospitalId: hospitalObjectId,
            issueTitle: issueTitle.trim(),
            description: description.trim(),
            priority: priority || "medium",
            status: "pending",
        });

        // Case number will be generated automatically in pre-validate hook
        await ticket.validate();
        await ticket.save();

        console.log("Ticket Created Successfully:", {
            id: ticket._id,
            caseNumber: ticket.caseNumber
        });

        // Populate references for response
        await ticket.populate("patientId", "name email");

        res.status(201).json({
            success: true,
            message: "Ticket created successfully",
            data: ticket
        });

    } catch (error) {
        console.error("Error creating ticket:", error);
        
        // Handle specific error cases
        if (error.code === 11000) {
            // Duplicate key error - should be extremely rare with our generator
            return res.status(500).json({
                success: false,
                message: "Case number generation conflict. Please try again.",
                error: "DUPLICATE_CASE_NUMBER"
            });
        }

        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: messages
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create ticket. Please try again.",
            error: process.env.NODE_ENV === "development" ? error.message : "INTERNAL_ERROR"
        });
    }
};

export const getTickets = async (req, res) => {
    // Patient sees only their own tickets.
    if (req.user.role === "patient") {
        const tickets = await Ticket.find({ patientId: req.user.id })
            .populate("patientId", "name email")
            .populate("assignedAdminId", "name")
            .sort("-createdAt");

        res.json(tickets);
        return;
    }

    // Admin sees:
    // 1. Tickets explicitly assigned to them (via assignedAdminId)
    // 2. Unassigned tickets (no assignedAdminId) that belong to their hospital
    // 3. Legacy unassigned tickets where ticket.hospitalId is empty but patient's hospitalId matches
    if (req.user.role === "admin") {
        const adminId = new mongoose.Types.ObjectId(req.user.id);
        const adminHospitalId = req.user.hospitalId || "";

        const tickets = await Ticket.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "patientId",
                    foreignField: "_id",
                    as: "patient",
                },
            },
            { $unwind: "$patient" },
            {
                $match: {
                    $or: [
                        // Case 1: Ticket explicitly assigned to this admin
                        { assignedAdminId: adminId },
                        // Case 2: Ticket belongs to admin's hospital AND is not yet assigned to anyone else
                        {
                            $and: [
                                { hospitalId: adminHospitalId },
                                {
                                    $or: [
                                        { assignedAdminId: { $exists: false } },
                                        { assignedAdminId: null },
                                    ],
                                },
                            ],
                        },
                        // Case 3: Legacy ticket with empty hospitalId — match via patient's hospital, unassigned
                        {
                            $and: [
                                {
                                    $or: [
                                        { hospitalId: { $exists: false } },
                                        { hospitalId: "" },
                                        { hospitalId: null },
                                    ],
                                },
                                { "patient.hospitalId": adminHospitalId },
                                {
                                    $or: [
                                        { assignedAdminId: { $exists: false } },
                                        { assignedAdminId: null },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "users",
                    localField: "assignedAdminId",
                    foreignField: "_id",
                    as: "assignedAdmin",
                },
            },
            {
                $unwind: {
                    path: "$assignedAdmin",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    patientId: {
                        _id: "$patient._id",
                        name: "$patient.name",
                        email: "$patient.email",
                    },
                    assignedAdminId: {
                        _id: "$assignedAdmin._id",
                        name: "$assignedAdmin.name",
                    },
                    hospitalId: 1,
                    issueTitle: 1,
                    description: 1,
                    status: 1,
                    reply: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
        ]);

        res.json(tickets);
        return;
    }

    // Super user sees all tickets.
    const tickets = await Ticket.find({})
        .populate("patientId", "name email")
        .populate("assignedAdminId", "name")
        .sort("-createdAt");

    res.json(tickets);
};

export const getPendingTickets = async (req, res) => {
    const tickets = await Ticket.find({ status: "pending" })
        .populate("patientId", "name email")
        .sort("-createdAt");
    res.json(tickets);
};

export const getUserTickets = async (req, res) => {
    try {
        // Patients can only see their own tickets
        if (req.user.role === 'patient') {
            const tickets = await Ticket.find({ patientId: req.user.id })
                .populate("hospitalId", "name city address")
                .sort("-createdAt");
            return res.json(tickets);
        }

        // Admins see tickets from their hospital
        if (req.user.role === 'admin') {
            const tickets = await Ticket.find({ hospitalId: req.user.hospitalId })
                .populate("patientId", "name email")
                .populate("hospitalId", "name city address")
                .sort("-createdAt");
            return res.json(tickets);
        }

        // Super users see all tickets
        const tickets = await Ticket.find({})
            .populate("patientId", "name email")
            .populate("hospitalId", "name city address")
            .sort("-createdAt");
        res.json(tickets);
    } catch (error) {
        console.error("Error fetching user tickets:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch tickets"
        });
    }
};

export const assignTicket = async (req, res) => {
    const { adminId } = req.body;

    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
        res.status(400);
        throw new Error("Invalid adminId provided");
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        res.status(404);
        throw new Error("Ticket not found");
    }

    // Cast to ObjectId explicitly so aggregate ObjectId comparisons always work
    ticket.assignedAdminId = new mongoose.Types.ObjectId(adminId);
    ticket.status = "assigned";
    await ticket.save();

    // Return populated ticket so frontend gets all details
    const populated = await Ticket.findById(ticket._id)
        .populate("patientId", "name email")
        .populate("assignedAdminId", "name email");

    res.json(populated);
};

export const replyToTicket = async (req, res) => {
    const { doctorName, doctorPhone, specialization, replyMessage } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        res.status(404);
        throw new Error("Ticket not found");
    }

    if (ticket.assignedAdminId.toString() !== req.user.id.toString()) {
        res.status(403);
        throw new Error("Only the assigned admin can reply to this ticket");
    }

    ticket.reply = {
        doctorName,
        doctorPhone,
        specialization,
        replyMessage,
        repliedBy: req.user.id,
        repliedAt: new Date(),
    };
    ticket.status = "resolved";
    await ticket.save();

    res.json(ticket);
};

export const getTicketDetails = async (req, res) => {
    const ticket = await Ticket.findById(req.params.id)
        .populate("patientId", "name email")
        .populate("assignedAdminId", "name")
        .populate("reply.repliedBy", "name");

    if (!ticket) {
        res.status(404);
        throw new Error("Ticket not found");
    }

    res.json(ticket);
};

export const getStats = async (req, res) => {
    const totalTickets = await Ticket.countDocuments();
    const pendingTickets = await Ticket.countDocuments({ status: "pending" });
    const resolvedTickets = await Ticket.countDocuments({ status: "resolved" });

    // Calculate stats by hospital type
    // We need to join with User (patients) and then with Hospital to get the type
    // However, since hospitalId might be a simple string or an ObjectId, 
    // and Ticket only has patientId, we aggregate based on the patient's hospital type.

    const stats = await Ticket.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "patientId",
                foreignField: "_id",
                as: "patient"
            }
        },
        { $unwind: "$patient" },
        {
            $lookup: {
                from: "hospitals",
                let: { hId: "$patient.hospitalId" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $eq: ["$code", "$$hId"] },
                                    {
                                        $and: [
                                            { $eq: [{ $strLenCP: "$$hId" }, 24] },
                                            { $eq: ["$_id", { $toObjectId: "$$hId" }] }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ],
                as: "hospital"
            }
        },
        { $unwind: "$hospital" },
        {
            $group: {
                _id: "$hospital.type",
                count: { $sum: 1 }
            }
        }
    ]);

    const statsByType = {
        gov: 0,
        private: 0,
        semi: 0
    };

    stats.forEach(item => {
        if (statsByType.hasOwnProperty(item._id)) {
            statsByType[item._id] = item.count;
        }
    });

    res.json({
        totalTickets,
        pendingTickets,
        resolvedTickets,
        statsByType
    });
};

// Legacy support or fallback
export const updateTicket = async (req, res) => {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(ticket);
};

export const deleteTicket = async (req, res) => {
    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ message: "Ticket deleted" });
};
