import express from 'express';
import { login, signup, logout, refresh, getAllEngineers, getAllUsers, updateEngineerWorkload, getDashboardStats } from '../controllers/user.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/logout', logout);

// Admin routes (protected)
router.get('/engineers', isAuthenticated, getAllEngineers);
router.get('/users', isAuthenticated, getAllUsers);
router.patch('/engineers/:userId', isAuthenticated, updateEngineerWorkload);
router.get('/dashboard-stats', isAuthenticated, getDashboardStats);

export default router;