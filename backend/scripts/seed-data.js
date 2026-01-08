require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Location = require('../models/Location');
const { CATEGORIES } = require('../utils/constants');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Clear existing data
    await User.deleteMany({});
    await Location.deleteMany({});
    console.log('Existing data cleared');

    // Create test users
    const users = await User.create([
      {
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456',
        phone: '+5511999999999',
        isVerified: true
      },
      {
        name: 'Maria Santos',
        email: 'maria@example.com',
        password: '123456',
        phone: '+5511888888888',
        isVerified: true
      },
      {
        name: 'Pedro Oliveira',
        email: 'pedro@example.com',
        password: '123456',
        phone: '+5511777777777',
        isVerified: true
      }
    ]);

    console.log('Test users created');

    // Create sample locations
    const locations = [
      {
        title: 'Apartamento Compacto no Centro',
        description: 'Apartamento bem localizado, próximo ao metrô e comércio. Pronto para morar.',
        price: 1200,
        category: 'Apartamento',
        location: 'Centro, São Paulo - SP',
        latitude: -23.5505,
        longitude: -46.6333,
        user: users[0]._id,
        images: ['apt1.jpg', 'apt2.jpg']
      },
      {
        title: 'Casa com Jardim',
        description: 'Casa espaçosa com jardim, ideal para famílias. 3 quartos, 2 banheiros.',
        price: 2000,
        category: 'Casa',
        location: 'Jardins, São Paulo - SP',
        latitude: -23.5675,
        longitude: -46.6733,
        user: users[1]._id,
        images: ['casa1.jpg', 'casa2.jpg']
      },
      {
        title: 'Sala Comercial',
        description: 'Sala comercial bem localizada, perfeita para escritório ou consultório.',
        price: 800,
        category: 'Escritório',
        location: 'Moema, São Paulo - SP',
        latitude: -23.6045,
        longitude: -46.6633,
        user: users[2]._id,
        images: ['sala1.jpg']
      },
      {
        title: 'Quarto em República',
        description: 'Quarto mobiliado em república estudantil. Inclui todas as despesas.',
        price: 500,
        category: 'Quarto',
        location: 'Butantã, São Paulo - SP',
        latitude: -23.5715,
        longitude: -46.7233,
        user: users[0]._id,
        images: ['quarto1.jpg']
      }
    ];

    await Location.create(locations);
    console.log('Sample locations created');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();