const Message = require('../models/Message');
const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Send message
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { to, location, content } = req.body;

  const message = await Message.create({
    from: req.user._id,
    to,
    location,
    content
  });

  const populatedMessage = await Message.findById(message._id)
    .populate('from', 'name')
    .populate('to', 'name')
    .populate('location', 'title');

  // Create notification for recipient
  await Notification.create({
    user: to,
    type: 'message',
    title: 'Nova mensagem',
    message: `Você recebeu uma nova mensagem sobre: ${populatedMessage.location.title}`,
    relatedId: populatedMessage._id
  });

  res.status(201).json(populatedMessage);
});

// @desc    Get conversation
// @route   GET /api/messages/conversation/:userId/:locationId
// @access  Private
const getConversation = asyncHandler(async (req, res) => {
  const { userId, locationId } = req.params;

  const messages = await Message.find({
    $or: [
      {
        from: req.user._id,
        to: userId,
        location: locationId
      },
      {
        from: userId,
        to: req.user._id,
        location: locationId
      }
    ]
  })
    .populate('from', 'name')
    .populate('to', 'name')
    .populate('location', 'title')
    .sort({ createdAt: 1 });

  res.json(messages);
});

// @desc    Get user conversations list
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [
          { from: req.user._id },
          { to: req.user._id }
        ]
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: {
          location: '$location',
          participants: { $setUnion: [['$from'], ['$to']] }
        },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$to', req.user._id] }, { $eq: ['$read', false] }] },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'locations',
        localField: 'lastMessage.location',
        foreignField: '_id',
        as: 'location'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'lastMessage.from',
        foreignField: '_id',
        as: 'fromUser'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'lastMessage.to',
        foreignField: '_id',
        as: 'toUser'
      }
    }
  ]);

  res.json(conversations);
});

// @desc    Mark messages as read
// @route   PUT /api/messages/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const { messageIds } = req.body;

  await Message.updateMany(
    {
      _id: { $in: messageIds },
      to: req.user._id
    },
    { $set: { read: true } }
  );

  res.json({ message: 'Messages marked as read' });
});

module.exports = {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead,
};