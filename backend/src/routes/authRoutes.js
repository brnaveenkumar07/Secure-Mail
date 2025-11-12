const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/users', authenticateToken, authController.getAllUsers);
router.get('/users/:id', authenticateToken, authController.getUserById);

module.exports = router;

