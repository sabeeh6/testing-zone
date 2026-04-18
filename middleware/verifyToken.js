// middleware/verifyToken.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = (req, res, next) => {
    try {
        // Read token from cookie or Authorization header
        let token = req.cookies?.authToken;
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res
                .status(401)
                .json({ success: false, message: "Access denied. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_123);
        // Attach minimal user info so downstream middleware/controllers can use req.user._id
        req.user = { _id: decoded.userId, role: decoded.role, email: decoded.email };
        next();
    } catch (error) {
        return res
            .status(401)
            .json({ success: false, message: "Invalid or expired token." });
    }
};
