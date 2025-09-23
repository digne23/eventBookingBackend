const express = require('express');
const router = express.Router();
const { getEvents, createEvent, getEventById, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/', getEvents);
router.post('/', protect, adminOnly, createEvent);
router.get('/:id', getEventById);
router.put('/:id', protect, adminOnly, updateEvent);
router.delete('/:id', protect, adminOnly, deleteEvent);

module.exports = router;
