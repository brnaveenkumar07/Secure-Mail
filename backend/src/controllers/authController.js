const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_ROUNDS } = require('../config/auth');
const { generateEmbedding } = require('../services/faceAuthService');
const fs = require('fs');

/**
 * Register a new user (individual or organization)
 */
const register = async (req, res) => {
  try {
    const { username, password, name, type, signature } = req.body;
    const imageFile = req.file;

    // Validation
    if (!username || !password || !name || !type) {
      if (imageFile) fs.unlinkSync(imageFile.path); // Cleanup
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate user type
    if (!['INDIVIDUAL', 'ORGANIZATION'].includes(type)) {
      if (imageFile) fs.unlinkSync(imageFile.path); // Cleanup
      return res.status(400).json({ error: 'Invalid user type' });
    }

    // Organizations should have signature
    if (type === 'ORGANIZATION' && !signature) {
      if (imageFile) fs.unlinkSync(imageFile.path); // Cleanup
      return res.status(400).json({ error: 'Organizations must provide a digital signature' });
    }

    // Individuals must have face image
    if (type === 'INDIVIDUAL' && !imageFile) {
      return res.status(400).json({ error: 'Individuals must provide a face image' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      if (imageFile) fs.unlinkSync(imageFile.path); // Cleanup
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Generate embedding if individual
    let embeddingVector = null;
    if (type === 'INDIVIDUAL' && imageFile) {
      try {
        embeddingVector = await generateEmbedding(imageFile.path);
        // Cleanup image after generating embedding
        fs.unlinkSync(imageFile.path);
      } catch (err) {
        if (imageFile && fs.existsSync(imageFile.path)) fs.unlinkSync(imageFile.path);
        console.error('Face embedding error:', err);
        return res.status(400).json({ error: 'Failed to process face image. Please try again with a clear face image.' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create user and embedding in transaction
    const result = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          name,
          type,
          signature: type === 'ORGANIZATION' ? signature : null,
        },
      });

      if (embeddingVector) {
        await prisma.embedding.create({
          data: {
            userId: user.id,
            vector: embeddingVector,
          },
        });
      }

      return user;
    });

    const user = result;

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
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
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

    // Face Authentication for INDIVIDUAL users
    if (user.type === 'INDIVIDUAL') {
      const imageFile = req.file;

      if (!imageFile) {
        // If no image provided, check if we need to request one
        // We return a specific status code (e.g., 428 Precondition Required) 
        // or a specific flag in the response to tell frontend to prompt for face
        return res.status(200).json({
          requireFaceAuth: true,
          message: 'Face verification required'
        });
      }

      // Verify face
      try {
        const embedding = await prisma.embedding.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
        });

        if (!embedding) {
          // Fallback if no embedding exists (shouldn't happen for valid individuals)
          console.warn(`No embedding found for user ${user.id}`);
          // Optional: Allow login or block? For security, maybe block or allow with warning.
          // For now, let's allow but log it, or we can enforce it.
          // stricter: return res.status(403).json({ error: 'Face registration missing' });
        } else {
          const isVerified = await verifyFace(imageFile.path, embedding.vector);

          // Cleanup uploaded file
          fs.unlinkSync(imageFile.path);

          if (!isVerified) {
            return res.status(401).json({ error: 'Face verification failed' });
          }
        }
      } catch (err) {
        console.error('Face verification error during login:', err);
        if (imageFile && fs.existsSync(imageFile.path)) fs.unlinkSync(imageFile.path);
        return res.status(500).json({ error: 'Face verification error' });
      }
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

