require('../config/db');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

exports.bookEvent = async (req, res) => {
    const { eventId, seatsBooked } = req.body;
    try {
        const event = await Event.findById(eventId);
        if(!event) return res.status(404).json({ message: 'Event not found' });
        if(event.availableSeats < seatsBooked) return res.status(400).json({ message: 'Not enough seats' });

        // Try to find an existing booking for this user and event
        let booking = await Booking.findOne({ user: req.user._id, event: eventId });
        if (booking) {
            booking.seatsBooked += seatsBooked;
            event.availableSeats -= seatsBooked;
            await Promise.all([booking.save(), event.save()]);
            return res.status(200).json(booking);
        } else {
            event.availableSeats -= seatsBooked;
            await event.save();
            booking = await Booking.create({
                user: req.user._id,
                event: eventId,
                seatsBooked
            });
            return res.status(201).json(booking);
        }
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getUserBookings = async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id }).populate('event');
    res.json(bookings);
};

exports.sendBookingTicket = async (req, res) => {
    const { bookingId } = req.params;
    try {
        const booking = await Booking.findById(bookingId).populate('event').populate('user');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { createMailer } = require('../config/mailer');
        const transporter = createMailer();
        
        const event = booking.event;
        const user = booking.user;
        
        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: user.email,
            subject: `Your Event Ticket - ${event.title}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #10b981;">Evently - Your Event Ticket</h2>
                    <div style="border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">${event.title}</h3>
                        <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                        <p><strong>Location:</strong> ${event.location}</p>
                        <p><strong>Seats Booked:</strong> ${booking.seatsBooked}</p>
                        <p><strong>Booking ID:</strong> ${booking._id}</p>
                    </div>
                    <p>Thank you for booking with Evently!</p>
                </div>
            `
        });
        
        res.json({ message: 'Ticket sent to your email' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
