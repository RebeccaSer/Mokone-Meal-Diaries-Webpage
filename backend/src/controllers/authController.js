const bycrypt = require('bcrypt');
const db = require('../config/db');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async(req, res) => {
    const {email,phone, password, fullName} = req.body;

    if (!email|| !password || !fullName || !phone) {
        return res.status(400).json({message: 'Please fill in all fields'});
    }
    try {
        const existingUser = await db.query("SELECT id FROM users WHERE email = $1 OR phone = $2", [email, phone]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({message: 'User with this email or phone already exists'});
        }

        const salt = await bycrypt.genSalt(15);
        const hashedPassword = await bycrypt.hash(password, salt);

        const result = await db.query(
            "INSERT INTO users (email, phone, password_hash, full_name, role) VALUES ($1, $2, $3, $4, 'user') RETURNING id, email, phone, full_name, role, created_at",
            [email, phone , hashedPassword, fullName]
        );

        const user = result.rows[0];
        const token = generateToken(user.id);

        res.status(201).json({
            id: user.id,
            email: user.email,
            phone: user.phone,
            fullName: user.full_name,
            role: user.role,
            createdAt: user.created_at,
            token,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

const loginUser = async(req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).json({message: 'Please fill in all fields'});
    }

    try {const result = await db.query("SELECT id, email, phone, password_hash, full_name, role FROM users WHERE email = $1",
        [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({message: 'Invalid email or password'});
        }
        const user = result.rows[0];
        const isMatch = await bycrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({message: 'Invalid email or password'});
        }
        const token = generateToken(user.id);
        res.json({
            id: user.id,
            email: user.email,
            phone: user.phone,
            fullName: user.full_name,
            role: user.role,
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

const getMe = async(req, res) => {
    const user = await db.query("SELECT id, email, phone, full_name, role, created_at FROM users WHERE id = $1", [req.user.id]);
    res.json(user.rows[0]);
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
};