const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    availableSeats: { type: Number, required: true },
    image: { type: String },
});

module.exports = mongoose.model('Event', eventSchema);
