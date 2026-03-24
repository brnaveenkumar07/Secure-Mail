const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Public routes
router.post('/register', upload.single('image'), authController.register);
router.post('/login', upload.single('image'), authController.login);

// Protected routes
router.get('/users', authenticateToken, authController.getAllUsers);
router.get('/users/:id', authenticateToken, authController.getUserById);

module.exports = router;

