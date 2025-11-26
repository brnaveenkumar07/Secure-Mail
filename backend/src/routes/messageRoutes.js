const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.use(authenticateToken);

router.post('/send', upload.single('image'), messageController.sendMessage);
router.get('/inbox', messageController.getInboxMessages);
router.get('/sent', messageController.getSentMessages);
router.get('/all', messageController.getAllMessages); // Admin/Debug

module.exports = router;
