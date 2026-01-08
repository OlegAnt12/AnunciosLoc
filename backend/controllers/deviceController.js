const { Device } = require('../models/Device');

const deviceController = {
  async registerDevice(req, res) {
    try {
      const { device_token, platform, model, os_version } = req.body;

      // Verificar se o dispositivo já está registado
      const existingDevice = await Device.findOne({
        where: { device_token, user_id: req.userId }
      });

      if (existingDevice) {
        await existingDevice.update({ active: true });
        return res.json({
          success: true,
          message: 'Dispositivo atualizado com sucesso',
          data: existingDevice
        });
      }

      const device = await Device.create({
        user_id: req.userId,
        device_token,
        platform,
        model,
        os_version
      });

      res.status(201).json({
        success: true,
        message: 'Dispositivo registado com sucesso',
        data: device
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao registar dispositivo'
      });
    }
  },

  async getUserDevices(req, res) {
    try {
      const devices = await Device.findAll({
        where: { user_id: req.userId, active: true }
      });

      res.json({
        success: true,
        data: devices
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao obter dispositivos'
      });
    }
  },

  async unregisterDevice(req, res) {
    try {
      const device = await Device.findByPk(req.params.id);

      if (!device) {
        return res.status(404).json({
          success: false,
          message: 'Dispositivo não encontrado'
        });
      }

      if (device.user_id !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Não tem permissão para este dispositivo'
        });
      }

      await device.update({ active: false });

      res.json({
        success: true,
        message: 'Dispositivo removido com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao remover dispositivo'
      });
    }
  }
};

module.exports = deviceController;