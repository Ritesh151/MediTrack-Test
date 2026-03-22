import express from 'express';
import { sendMessage, getMessages } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:ticketId', protect, sendMessage);
router.get('/:ticketId', protect, getMessages);

export default router;
