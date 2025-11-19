const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Location'
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

messageSchema.index({ from: 1, to: 1, location: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);