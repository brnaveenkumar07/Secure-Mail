const prisma = require('../config/database');

/**
 * Send a message
 */
const sendMessage = async (req, res) => {
  try {
    const { receiverId, subject, message, isFaceVerified, isDigitallyVerified } = req.body;
    const senderId = req.user.id;

    // Validation
    if (!receiverId || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: parseInt(receiverId) },
    });

    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Check if sender and receiver are different
    if (senderId === parseInt(receiverId)) {
      return res.status(400).json({ error: 'Cannot send message to yourself' });
    }

    // Get sender info to determine verification type
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
    });

    // Create message
    const newMessage = await prisma.message.create({
      data: {
        subject,
        message,
        isFaceVerified: isFaceVerified || sender.type === 'INDIVIDUAL',
        isDigitallyVerified: isDigitallyVerified || sender.type === 'ORGANIZATION',
        timestamp: new Date(),
        senderId,
        receiverId: parseInt(receiverId),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            type: true,
            signature: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    // Format response to match frontend expectations
    const formattedMessage = {
      id: newMessage.id,
      from: {
        id: newMessage.sender.id,
        name: newMessage.sender.name,
        type: newMessage.sender.type,
        ...(newMessage.sender.signature && { signature: newMessage.sender.signature }),
      },
      to: {
        id: newMessage.receiver.id,
        name: newMessage.receiver.name,
        type: newMessage.receiver.type,
      },
      subject: newMessage.subject,
      message: newMessage.message,
      isFaceVerified: newMessage.isFaceVerified,
      isDigitallyVerified: newMessage.isDigitallyVerified,
      timestamp: newMessage.timestamp.toISOString(),
    };

    res.status(201).json({
      message: 'Message sent successfully',
      data: formattedMessage,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get inbox messages (received)
 */
const getInboxMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await prisma.message.findMany({
      where: { receiverId: userId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            type: true,
            signature: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    // Format messages to match frontend expectations
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      from: {
        id: msg.sender.id,
        name: msg.sender.name,
        type: msg.sender.type,
        ...(msg.sender.signature && { signature: msg.sender.signature }),
      },
      to: {
        id: msg.receiver.id,
        name: msg.receiver.name,
        type: msg.receiver.type,
      },
      subject: msg.subject,
      message: msg.message,
      isFaceVerified: msg.isFaceVerified,
      isDigitallyVerified: msg.isDigitallyVerified,
      timestamp: msg.timestamp.toISOString(),
    }));

    res.status(200).json(formattedMessages);
  } catch (error) {
    console.error('Get inbox messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get sent messages
 */
const getSentMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await prisma.message.findMany({
      where: { senderId: userId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            type: true,
            signature: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    // Format messages to match frontend expectations
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      from: {
        id: msg.sender.id,
        name: msg.sender.name,
        type: msg.sender.type,
        ...(msg.sender.signature && { signature: msg.sender.signature }),
      },
      to: {
        id: msg.receiver.id,
        name: msg.receiver.name,
        type: msg.receiver.type,
      },
      subject: msg.subject,
      message: msg.message,
      isFaceVerified: msg.isFaceVerified,
      isDigitallyVerified: msg.isDigitallyVerified,
      timestamp: msg.timestamp.toISOString(),
    }));

    res.status(200).json(formattedMessages);
  } catch (error) {
    console.error('Get sent messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all messages (for admin/debugging)
 */
const getAllMessages = async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            type: true,
            signature: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    // Format messages to match frontend expectations
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      from: {
        id: msg.sender.id,
        name: msg.sender.name,
        type: msg.sender.type,
        ...(msg.sender.signature && { signature: msg.sender.signature }),
      },
      to: {
        id: msg.receiver.id,
        name: msg.receiver.name,
        type: msg.receiver.type,
      },
      subject: msg.subject,
      message: msg.message,
      isFaceVerified: msg.isFaceVerified,
      isDigitallyVerified: msg.isDigitallyVerified,
      timestamp: msg.timestamp.toISOString(),
    }));

    res.status(200).json(formattedMessages);
  } catch (error) {
    console.error('Get all messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  sendMessage,
  getInboxMessages,
  getSentMessages,
  getAllMessages,
};

