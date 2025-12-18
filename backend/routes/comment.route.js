import express from 'express';
import { getComments, addComment, editComment, deleteComment } from '../controllers/comment.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { attachUserRole } from '../middlewares/authorize.js';

const router = express.Router();

// All routes require authentication + user role info
router.use(isAuthenticated);
router.use(attachUserRole);

// Get comments for a ticket (Reporter, Assignee, or ADMIN)
router.get('/tickets/:ticketId/comments', getComments);

// Add comment to a ticket (Reporter, Assignee, or ADMIN)
router.post('/tickets/:ticketId/comments', addComment);

// Edit a comment (Author only)
router.patch('/comments/:commentId', editComment);

// Delete a comment (Author or ADMIN)
router.delete('/comments/:commentId', deleteComment);

export default router;
