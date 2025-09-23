require('../config/db');
const User = require('../models/User');
const Booking = require('../models/Booking');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        const userIds = users.map(u => u._id);
        const bookings = await Booking.find({ user: { $in: userIds } }).populate('event').lean();
        const userIdToBookings = bookings.reduce((acc, b) => {
            const id = String(b.user);
            acc[id] = acc[id] || [];
            acc[id].push(b);
            return acc;
        }, {});
        const result = users.map(u => ({
            _id: u._id,
            name: u.name,
            email: u.email,
            phoneNumber: u.phoneNumber,
            isAdmin: u.isAdmin,
            bookings: userIdToBookings[String(u._id)] || [],
        }));
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateMe = async (req, res) => {
    try {
        const updates = {};
        if (req.body.name !== undefined) updates.name = req.body.name;
        if (req.body.phoneNumber !== undefined) updates.phoneNumber = req.body.phoneNumber;
        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


