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
        console.log('=== SEND TICKET DEBUG ===');
        console.log('Booking ID:', bookingId);
        console.log('User ID:', req.user?._id);
        
        const booking = await Booking.findById(bookingId).populate('event').populate('user');
        console.log('Booking found:', !!booking);
        console.log('Event found:', !!booking?.event);
        console.log('User found:', !!booking?.user);
        
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { createMailer } = require('../config/mailer');
        console.log('Creating mailer...');
        const transporter = createMailer();
        console.log('Mailer created successfully');
        
        const event = booking.event;
        const user = booking.user;
        console.log('Sending to:', user.email);
        console.log('Event title:', event.title);

        
        const result = await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: user.email,
            subject: `Your Event Ticket - ${event.title}`,
            html: `
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:24px 0;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background:#0b1220;border-radius:16px;color:#e2e8f0;font-family:Arial,Helvetica,sans-serif;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.3)">
                      <tr>
                        <td style="padding:24px;border-bottom:1px solid rgba(255,255,255,0.08)">
                          <div style="display:flex;align-items:center;gap:12px">
                            <div style="width:36px;height:36px;border-radius:999px;background:#10b981;color:#0b1220;display:inline-flex;align-items:center;justify-content:center;font-weight:700">E</div>
                            <div style="font-size:18px;font-weight:700;letter-spacing:.3px">Evently</div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:24px">
                          <h2 style="margin:0 0 8px 0;font-size:22px;color:#22d3ee">Your Ticket is Ready</h2>
                          <p style="margin:0 0 16px 0;color:#cbd5e1">Thank you for booking with Evently! Below is your event ticket.</p>

                          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden">
                            <tr>
                              <td style="padding:16px 16px 0 16px">
                                <h3 style="margin:0 0 8px 0;font-size:18px;color:#e2e8f0">${event.title}</h3>
                              </td>
                            </tr>
                            ${event.image ? `
                            <tr>
                              <td>
                                <img src="${event.image}" alt="${event.title}" style="width:100%;height:240px;object-fit:cover;display:block"/>
                              </td>
                            </tr>` : ''}
                            <tr>
                              <td style="padding:12px 16px 16px 16px;color:#cbd5e1;font-size:14px">
                                <div><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</div>
                                <div><strong>Location:</strong> ${event.location}</div>
                                <div><strong>Seats:</strong> ${booking.seatsBooked}</div>
                                <div><strong>Booking ID:</strong> ${booking._id}</div>
                              </td>
                            </tr>
                          </table>

                          <p style="margin:16px 0 0 0;color:#94a3b8;font-size:13px">Keep this email as your proof of purchase. See you at the event!</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:16px 24px;color:#94a3b8;font-size:12px;border-top:1px solid rgba(255,255,255,0.08)">
                          © ${new Date().getFullYear()} Evently. All rights reserved.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            `
        });

        console.log("Email sending result: ", result);

        
        res.json({ message: 'Ticket sent to your email' });
    } catch (err) {
        console.error('=== SEND TICKET ERROR ===');
        console.error('Error:', err.message);
        console.error('Stack:', err.stack);
        res.status(500).json({ message: err.message });
    }
};
