import User from '../models/user.model.js';

/**
 * Middleware to check if user has one of the allowed roles
 * @param  {...string} allowedRoles - Roles that are allowed (e.g., 'ADMIN', 'ENGINEER', 'RANGER')
 */
export const authorize = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    message: 'User not authenticated',
                    success: false,
                });
            }

            const user = await User.findById(req.user.id).select('role name email');
            if (!user) {
                return res.status(404).json({
                    message: 'User not found',
                    success: false,
                });
            }

            // Attach full user info to request
            req.user = {
                id: user._id,
                role: user.role,
                name: user.name,
                email: user.email,
            };

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${user.role}`,
                    success: false,
                });
            }

            return next();
        } catch (error) {
            console.error('Authorization error:', error);
            return res.status(500).json({
                message: 'Authorization error',
                success: false,
                error: error.message,
            });
        }
    };
};

/**
 * Middleware to attach user role to request (without restricting access)
 * Use this when you need role info but want to handle access in controller
 */
export const attachUserRole = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: 'User not authenticated',
                success: false,
            });
        }

        const user = await User.findById(req.user.id).select('role name email department');
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false,
            });
        }

        // Attach full user info to request
        req.user = {
            id: user._id,
            role: user.role,
            name: user.name,
            email: user.email,
            department: user.department,
        };

        return next();
    } catch (error) {
        console.error('Attach user role error:', error);
        return res.status(500).json({
            message: 'Server error',
            success: false,
            error: error.message,
        });
    }
};

// Convenience middleware for common role checks
export const isAdmin = authorize('ADMIN');
export const isEngineer = authorize('ENGINEER');
export const isRanger = authorize('RANGER');
export const isAdminOrEngineer = authorize('ADMIN', 'ENGINEER');
