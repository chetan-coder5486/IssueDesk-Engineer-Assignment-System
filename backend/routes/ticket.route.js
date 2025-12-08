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

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Create a new ticket
router.post('/', createTicket);

// Get all tickets (admin/manager view)
router.get('/', getAllTickets);

// Get tickets reported by current user
router.get('/my-tickets', getTicketByReporter);

// Get tickets assigned to current user (for engineers)
router.get('/assigned', getTicketByAssignee);

// Get single ticket by ID
router.get('/:id', getTicketById);

// Update ticket status
router.patch('/:id/status', updateTicketStatus);

// Assign ticket to an engineer
router.patch('/:id/assign', assignTicket);

// Endpoint to trigger deadline reminder emails (body: { hours?: number })
router.post('/notify-deadlines', sendDeadlineNotifications);

// Delete ticket
router.delete('/:id', deleteTicket);

export default router;
