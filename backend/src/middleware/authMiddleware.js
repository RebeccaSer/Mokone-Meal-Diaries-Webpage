const jwt =require('jsonwebtoken');
const db = require('../config/db');

const protect = async (req, res, next) => {
    let token; 
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await db.query("SELECT id, email, phone, full_name, role FROM users WHERE id = $1", [decoded.id]);
            if (user.rows.length === 0) {
                return res.status(401).json({message: 'Not authorized'});
            }
            req.user = user.rows[0];
            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({message: 'Not authorized, token failed'});
        }
    }
    if (!token) {
        return res.status(401).json({message: 'Not authorized, no token'});
    }
};

module.exports = { protect };