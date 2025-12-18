import express from 'express';
import {
    createTicket,
    getAllTickets,
    getTicketById,
    getTicketByReporter,
    getTicketByAssignee,
    updateTicketStatus,
    assignTicket,
    deleteTicket,
    sendDeadlineNotifications,
} from '../controllers/ticket.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { attachUserRole } from '../middlewares/authorize.js';

const router = express.Router();

// All routes require authentication + user role info
router.use(isAuthenticated);
router.use(attachUserRole);

// Create a new ticket (RANGER, ADMIN only)
router.post('/', createTicket);

// Get all tickets (ADMIN only)
router.get('/', getAllTickets);

// Get tickets reported by current user (RANGER, ADMIN)
router.get('/my-tickets', getTicketByReporter);

// Get tickets assigned to current user (ENGINEER, ADMIN)
router.get('/assigned', getTicketByAssignee);

// Get single ticket by ID (Reporter, Assignee, or ADMIN)
router.get('/:id', getTicketById);

// Update ticket status (ENGINEER - own assigned, ADMIN - any)
router.patch('/:id/status', updateTicketStatus);

// Assign ticket to an engineer (ADMIN only)
router.patch('/:id/assign', assignTicket);

// Trigger deadline reminder emails (ADMIN only)
router.post('/notify-deadlines', sendDeadlineNotifications);

// Delete ticket (ADMIN - any, RANGER - own if OPEN)
router.delete('/:id', deleteTicket);

export default router;
