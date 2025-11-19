const mongoose = require('mongoose');

const locationSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Apartamento',
        'Casa',
        'Quarto',
        'Escritório',
        'Loja',
        'Galpão',
        'Terreno',
        'Outro'
      ]
    },
    location: {
      type: String,
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    images: [{
      type: String
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    views: {
      type: Number,
      default: 0
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

locationSchema.index({ user: 1, createdAt: -1 });
locationSchema.index({ location: 'text', title: 'text', description: 'text' });
locationSchema.index({ category: 1 });
locationSchema.index({ price: 1 });
locationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Location', locationSchema);