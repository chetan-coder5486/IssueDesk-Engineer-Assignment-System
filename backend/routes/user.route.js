import express from 'express';
import { login, signup, logout, refresh, getAllEngineers, getAllUsers, updateEngineerWorkload, getDashboardStats, syncEngineerWorkloads, forgotPassword, resetPassword } from '../controllers/user.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { authorize, isAdmin } from '../middlewares/authorize.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Admin-only routes (protected)
router.get('/engineers', isAuthenticated, isAdmin, getAllEngineers);
router.get('/users', isAuthenticated, isAdmin, getAllUsers);
router.patch('/engineers/:userId', isAuthenticated, isAdmin, updateEngineerWorkload);
router.get('/dashboard-stats', isAuthenticated, isAdmin, getDashboardStats);
router.post('/sync-workloads', isAuthenticated, isAdmin, syncEngineerWorkloads);

export default router;