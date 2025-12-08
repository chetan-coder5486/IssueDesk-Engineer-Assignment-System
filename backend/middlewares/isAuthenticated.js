import jwt from 'jsonwebtoken';

const isAuthenticated = (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken;
        if (!accessToken) {
            return res.status(401).json({
                message: 'User not authenticated',
                success: false,
            });
        }

        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        req.user = { id: decoded.id };
        return next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            message: 'Invalid or expired access token',
            success: false,
        });
    }
};

export default isAuthenticated;