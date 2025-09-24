require('../config/db');
const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
    const events = await Event.find();
    res.json(events);
};

exports.createEvent = async (req, res) => {
    const { title, description, date, location, availableSeats, image } = req.body;
    try {
        const event = await Event.create({ title, description, date, location, availableSeats, image });
        res.status(201).json(event);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if(event) res.json(event);
        else res.status(404).json({ message: 'Event not found' });
    } catch (e) {
        return res.status(400).json({ message: 'Invalid event id' });
    }
};

exports.updateEvent = async (req, res) => {
    const event = await Event.findById(req.params.id);
    if(event) {
        Object.assign(event, req.body);
        await event.save();
        res.json(event);
    } else res.status(404).json({ message: 'Event not found' });
};

exports.deleteEvent = async (req, res) => {
    const event = await Event.findById(req.params.id);
    if(event) {
        await event.remove();
        res.json({ message: 'Event removed' });
    } else res.status(404).json({ message: 'Event not found' });
};
