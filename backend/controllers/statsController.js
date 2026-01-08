const { User } = require('../models/User');
const { Location } = require('../models/Location');
const { Message } = require('../models/Message');
const { Notification } = require('../models/Notification');
const { Device } = require('../models/Device');

const statsController = {
  async getStats(req, res) {
    try {
      const [
        userCount,
        locationCount,
        messageCount,
        notificationCount,
        deviceCount
      ] = await Promise.all([
        User.count(),
        Location.count(),
        Message.count(),
        Notification.count(),
        Device.count({ where: { active: true } })
      ]);

      res.json({
        success: true,
        data: {
          users: userCount,
          locations: locationCount,
          messages: messageCount,
          notifications: notificationCount,
          devices: deviceCount
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao obter estatísticas'
      });
    }
  }
};

module.exports = statsController;