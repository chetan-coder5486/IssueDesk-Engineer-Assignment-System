import express from 'express';
import { getComments, addComment, editComment, deleteComment } from '../controllers/comment.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Get comments for a ticket
router.get('/tickets/:ticketId/comments', getComments);

// Add comment to a ticket
router.post('/tickets/:ticketId/comments', addComment);

// Edit a comment
router.patch('/comments/:commentId', editComment);

// Delete a comment
router.delete('/comments/:commentId', deleteComment);

export default router;
