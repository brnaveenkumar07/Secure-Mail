const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_ROUNDS } = require('../config/auth');

/**
 * Register a new user (individual or organization)
 */
const register = async (req, res) => {
  try {
    const { username, password, name, type, signature } = req.body;

    // Validation
    if (!username || !password || !name || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate user type
    if (!['INDIVIDUAL', 'ORGANIZATION'].includes(type)) {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    // Organizations should have signature
    if (type === 'ORGANIZATION' && !signature) {
      return res.status(400).json({ error: 'Organizations must provide a digital signature' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        type,
        signature: type === 'ORGANIZATION' ? signature : null,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        type: user.type,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user without password
    const userResponse = {
      id: user.id,
      username: user.username,
      name: user.name,
      type: user.type,
      signature: user.signature,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        type: user.type,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user without password
    const userResponse = {
      id: user.id,
      username: user.username,
      name: user.name,
      type: user.type,
      signature: user.signature,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      message: 'Login successful',
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all users (for recipient selection)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        type: true,
        signature: true,
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        name: true,
        type: true,
        signature: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  getAllUsers,
  getUserById,
};

