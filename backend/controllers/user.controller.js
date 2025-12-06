import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { generateAccess, generateRefresh } from '../utils/generateToken.js';

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const isProduction = process.env.NODE_ENV === 'production';

const buildCookieOptions = (maxAge) => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
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

        const user = new User({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash: hashedPassword,
            role: role || 'RANGER',
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

export { signup, login, refresh, logout };