const express = require('express');
const router = express.Router();
const { bookEvent, getUserBookings, sendBookingTicket } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, bookEvent);
router.get('/mybookings', protect, getUserBookings);
router.post('/:bookingId/send-ticket', protect, sendBookingTicket);
module.exports = router;
