import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Ticket from '../models/ticket.model.js';
import { generateAccess, generateRefresh } from '../utils/generateToken.js';

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const isProduction = process.env.NODE_ENV === 'production';

const buildCookieOptions = (maxAge) => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax', // 'lax' needed for dev cross-origin requests
    maxAge,
});

const signup = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            confirmPassword,
            role,
            department,
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Force RANGER role - ADMIN can only be created manually
        const userRole = (role === 'ADMIN') ? 'RANGER' : (role || 'RANGER');

        const user = new User({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash: hashedPassword,
            role: userRole,
            department: department || 'None',
        });

        const accessToken = generateAccess(user._id);
        const refreshToken = generateRefresh(user._id);

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('accessToken', accessToken, buildCookieOptions(ACCESS_TOKEN_MAX_AGE));
        res.cookie('refreshToken', refreshToken, buildCookieOptions(REFRESH_TOKEN_MAX_AGE));

        return res.status(201).json({
            message: 'Signup successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
            },
        });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ message: 'Failed to signup user' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const accessToken = generateAccess(user._id);
        const refreshToken = generateRefresh(user._id);

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('accessToken', accessToken, buildCookieOptions(ACCESS_TOKEN_MAX_AGE));
        res.cookie('refreshToken', refreshToken, buildCookieOptions(REFRESH_TOKEN_MAX_AGE));

        return res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Failed to login user' });
    }
};

const refresh = async (req, res) => {
    try {
        const refreshTokenFromCookie = req.cookies?.refreshToken;
        if (!refreshTokenFromCookie) {
            return res.status(401).json({ message: 'Refresh token missing' });
        }

        const user = await User.findOne({ refreshToken: refreshTokenFromCookie });
        if (!user) {
            return res.status(403).json({ message: 'Refresh token is invalid' });
        }

        const decoded = jwt.verify(refreshTokenFromCookie, process.env.REFRESH_TOKEN_SECRET);
        if (decoded.id !== user._id.toString()) {
            return res.status(403).json({ message: 'Refresh token mismatch' });
        }

        const newAccessToken = generateAccess(user._id);
        const newRefreshToken = generateRefresh(user._id);

        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie('accessToken', newAccessToken, buildCookieOptions(ACCESS_TOKEN_MAX_AGE));
        res.cookie('refreshToken', newRefreshToken, buildCookieOptions(REFRESH_TOKEN_MAX_AGE));

        return res.json({ message: 'Access token refreshed' });
    } catch (error) {
        console.error('Refresh token error:', error);
        const status = error?.name === 'TokenExpiredError' ? 401 : 403;
        return res.status(status).json({ message: 'Unable to refresh access token' });
    }
};

const logout = async (req, res) => {
    try {
        const refreshTokenFromCookie = req.cookies?.refreshToken;
        if (refreshTokenFromCookie) {
            const user = await User.findOne({ refreshToken: refreshTokenFromCookie });
            if (user) {
                user.refreshToken = '';
                await user.save();
            }
        }

        res.clearCookie('accessToken', buildCookieOptions(0));
        res.clearCookie('refreshToken', buildCookieOptions(0));

        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({ message: 'Failed to logout user' });
    }
};

// Get all engineers (for admin assignment)
const getAllEngineers = async (req, res) => {
    try {
        const engineers = await User.find({ role: 'ENGINEER' })
            .select('name email department isOnline workloadScore skills')
            .sort({ workloadScore: 1, name: 1 });

        // Calculate actual workload from assigned tickets (active statuses only)
        const engineerIds = engineers.map(e => e._id);
        const workloadCounts = await Ticket.aggregate([
            {
                $match: {
                    assignee: { $in: engineerIds },
                    status: { $in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_PARTS'] }
                }
            },
            {
                $group: {
                    _id: '$assignee',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Create a map for quick lookup
        const workloadMap = {};
        workloadCounts.forEach(w => {
            workloadMap[w._id.toString()] = w.count;
        });

        // Merge actual workload into engineer data
        const engineersWithWorkload = engineers.map(engineer => {
            const actualWorkload = workloadMap[engineer._id.toString()] || 0;
            return {
                ...engineer.toObject(),
                workloadScore: actualWorkload // Override with actual count
            };
        });

        // Sort by actual workload
        engineersWithWorkload.sort((a, b) => a.workloadScore - b.workloadScore);

        return res.status(200).json({ engineers: engineersWithWorkload });
    } catch (error) {
        console.error('Get engineers error:', error);
        return res.status(500).json({ message: 'Failed to fetch engineers' });
    }
};

// Get all users (for admin)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('name email role department isOnline workloadScore createdAt')
            .sort({ createdAt: -1 });
        return res.status(200).json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        return res.status(500).json({ message: 'Failed to fetch users' });
    }
};

// Update engineer workload
const updateEngineerWorkload = async (req, res) => {
    try {
        const { userId } = req.params;
        const { workloadScore, isOnline } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (workloadScore !== undefined) user.workloadScore = workloadScore;
        if (isOnline !== undefined) user.isOnline = isOnline;

        await user.save();
        return res.status(200).json({ message: 'Engineer updated', user });
    } catch (error) {
        console.error('Update engineer error:', error);
        return res.status(500).json({ message: 'Failed to update engineer' });
    }
};

// Get dashboard stats (for admin)
const getDashboardStats = async (req, res) => {
    try {
        const Ticket = (await import('../models/ticket.model.js')).default;

        const totalUsers = await User.countDocuments();
        const totalEngineers = await User.countDocuments({ role: 'ENGINEER' });
        const onlineEngineers = await User.countDocuments({ role: 'ENGINEER', isOnline: true });

        const totalTickets = await Ticket.countDocuments();
        const openTickets = await Ticket.countDocuments({ status: 'OPEN' });
        const assignedTickets = await Ticket.countDocuments({ status: 'ASSIGNED' });
        const inProgressTickets = await Ticket.countDocuments({ status: 'IN_PROGRESS' });
        const resolvedTickets = await Ticket.countDocuments({ status: { $in: ['RESOLVED', 'CLOSED'] } });
        const criticalTickets = await Ticket.countDocuments({ priority: 'CRITICAL', status: { $nin: ['RESOLVED', 'CLOSED'] } });
        const breachedTickets = await Ticket.countDocuments({ breached: true });

        // Get tickets by priority
        const ticketsByPriority = await Ticket.aggregate([
            { $match: { status: { $nin: ['RESOLVED', 'CLOSED'] } } },
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]);

        // Get tickets by department (via reporter)
        const ticketsByDepartment = await Ticket.aggregate([
            { $lookup: { from: 'users', localField: 'reporter', foreignField: '_id', as: 'reporterInfo' } },
            { $unwind: '$reporterInfo' },
            { $group: { _id: '$reporterInfo.department', count: { $sum: 1 } } }
        ]);

        return res.status(200).json({
            stats: {
                totalUsers,
                totalEngineers,
                onlineEngineers,
                totalTickets,
                openTickets,
                assignedTickets,
                inProgressTickets,
                resolvedTickets,
                criticalTickets,
                breachedTickets,
                ticketsByPriority,
                ticketsByDepartment
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        return res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
};

// Sync all engineer workload scores based on actual assigned tickets
const syncEngineerWorkloads = async (req, res) => {
    try {
        const engineers = await User.find({ role: 'ENGINEER' });

        // Get actual workload counts from tickets (active statuses only)
        const workloadCounts = await Ticket.aggregate([
            {
                $match: {
                    status: { $in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_PARTS'] }
                }
            },
            {
                $group: {
                    _id: '$assignee',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Create a map for quick lookup
        const workloadMap = {};
        workloadCounts.forEach(w => {
            if (w._id) {
                workloadMap[w._id.toString()] = w.count;
            }
        });

        // Update each engineer's workload score
        const updates = [];
        for (const engineer of engineers) {
            const actualWorkload = workloadMap[engineer._id.toString()] || 0;
            if (engineer.workloadScore !== actualWorkload) {
                updates.push({
                    engineerId: engineer._id,
                    name: engineer.name,
                    oldWorkload: engineer.workloadScore,
                    newWorkload: actualWorkload
                });
                engineer.workloadScore = actualWorkload;
                await engineer.save();
            }
        }

        return res.status(200).json({
            message: 'Workload scores synced successfully',
            updatedEngineers: updates.length,
            updates
        });
    } catch (error) {
        console.error('Sync workloads error:', error);
        return res.status(500).json({ message: 'Failed to sync workload scores' });
    }
};

export { signup, login, refresh, logout, getAllEngineers, getAllUsers, updateEngineerWorkload, getDashboardStats, syncEngineerWorkloads };