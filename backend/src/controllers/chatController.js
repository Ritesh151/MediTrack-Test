import Message from '../models/Message.js';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

/**
 * Helper to get user ID consistently from req.user
 * Mongoose documents have both _id and id (getter for _id)
 */
const getUserId = (user) => {
  return user._id || user.id || user._doc?._id;
};

/**
 * Helper to check if user is authorized for a ticket's chat
 * Authorization rules:
 * 1. Patient who created the ticket can always chat
 * 2. Admin assigned to the ticket can chat
 * 3. Admin from the same hospital can chat on unassigned tickets
 */
const isUserAuthorized = (ticket, userId, userRole, userHospitalId) => {
  const userIdStr = userId.toString();
  
  // Patient who created the ticket
  if (ticket.patientId && ticket.patientId.toString() === userIdStr) {
    return true;
  }
  
  // Admin assigned to the ticket
  if (ticket.assignedAdminId && ticket.assignedAdminId.toString() === userIdStr) {
    return true;
  }
  
  // Admin from the same hospital for unassigned tickets
  // This matches the logic in getTickets for admin visibility
  if (userRole === 'admin' || userRole === 'super') {
    // If ticket is unassigned and belongs to admin's hospital
    const isUnassigned = !ticket.assignedAdminId;
    const hospitalMatches = ticket.hospitalId && 
      ticket.hospitalId.toString() === (userHospitalId || '').toString();
    
    if (isUnassigned && hospitalMatches) {
      return true;
    }
    
    // Super admin can access any ticket
    if (userRole === 'super') {
      return true;
    }
  }
  
  return false;
};

export const sendMessage = async (req, res) => {
  console.log('CHAT API: sendMessage called for ticket:', req.params.ticketId);
  try {
    const { ticketId } = req.params;
    const { content } = req.body;
    const userId = getUserId(req.user);
    const userRole = req.user.role;
    const userHospitalId = req.user.hospitalId;

    console.log('CHAT API: User ID:', userId, 'Role:', userRole);
    console.log('CHAT API: Content:', content);

    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Authorization check
    const authorized = isUserAuthorized(ticket, userId, userRole, userHospitalId);
    console.log('CHAT API: Authorization check:', authorized);

    if (!authorized) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized for this chat. You must be the ticket owner, assigned admin, or hospital admin for unassigned tickets.' 
      });
    }

    // Create message
    const message = await Message.create({
      ticketId,
      senderId: userId,
      content: content.trim(),
    });

    // Populate sender info before returning
    await message.populate('senderId', 'name email role');
    
    // Transform for consistent response format
    const response = {
      _id: message._id,
      ticketId: message.ticketId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt
    };

    console.log('CHAT API: Message created successfully');
    res.status(201).json(response);
  } catch (error) {
    console.error('SEND MESSAGE ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error while sending message' });
  }
};

export const getMessages = async (req, res) => {
  console.log('CHAT API: getMessages called for ticket:', req.params.ticketId);
  try {
    const { ticketId } = req.params;
    const userId = getUserId(req.user);
    const userRole = req.user.role;
    const userHospitalId = req.user.hospitalId;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Authorization check
    const authorized = isUserAuthorized(ticket, userId, userRole, userHospitalId);
    console.log('CHAT API: Authorization check for getMessages:', authorized);

    if (!authorized) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized for this chat. You must be the ticket owner, assigned admin, or hospital admin for unassigned tickets.' 
      });
    }

    // Get messages with populated sender info
    const messages = await Message.find({ ticketId })
      .populate('senderId', 'name email role')
      .sort({ createdAt: 1 });

    // Transform messages for consistent response
    const response = messages.map(msg => ({
      _id: msg._id,
      ticketId: msg.ticketId,
      senderId: msg.senderId,
      content: msg.content,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt
    }));

    console.log('CHAT API: Found', messages.length, 'messages');
    res.status(200).json(response);
  } catch (error) {
    console.error('GET MESSAGES ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching messages' });
  }
};
