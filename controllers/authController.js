require('../config/db');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
    const { name, email, password, phoneNumber } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if(userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password, phoneNumber });
        // send ticket email
        try {
            const { createMailer } = require('../config/mailer');
            const transporter = createMailer();
            await transporter.sendMail({
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to: user.email,
                subject: 'Your Evently account is ready',
                text: `Hi ${user.name},\n\nWelcome to Evently! You can now book events.`,
            });
        } catch (e) {
            // log and continue without failing registration
            console.error('Ticket email failed:', e.message);
        }
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            token: generateToken(user._id)
        });
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if(user && await user.matchPassword(password)) {
            res.json({message: "login sucessful",
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};
