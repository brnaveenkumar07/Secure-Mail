const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth');

// All message routes require authentication
router.post('/send', authenticateToken, messageController.sendMessage);
router.get('/inbox', authenticateToken, messageController.getInboxMessages);
router.get('/sent', authenticateToken, messageController.getSentMessages);
router.get('/all', authenticateToken, messageController.getAllMessages);

module.exports = router;

