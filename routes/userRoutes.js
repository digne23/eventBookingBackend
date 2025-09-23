const express = require('express');
const router = express.Router();
const { getAllUsers, updateMe } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/', protect, adminOnly, getAllUsers);
router.put('/me', protect, updateMe);

module.exports = router;


