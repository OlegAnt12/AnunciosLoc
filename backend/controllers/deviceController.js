const deviceService = require('../services/deviceService');

const deviceController = {
  async registerDevice(req, res) {
    try {
      const deviceId = await deviceService.registerDevice(req.userId, req.body);
      res.status(201).json({ success: true, message: 'Dispositivo registado', data: { id: deviceId } });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message || 'Erro ao registar dispositivo' });
    }
  },

  async getUserDevices(req, res) {
    try {
      const devices = await deviceService.getUserDevices(req.userId);
      res.json({ success: true, data: devices });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao obter dispositivos' });
    }
  },

  async updateConnectivity(req, res) {
    try {
      const deviceId = parseInt(req.params.id, 10);
      await deviceService.updateDeviceConnectivity(deviceId, req.body);
      res.json({ success: true, message: 'Conectividade atualizada' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message || 'Erro ao atualizar conectividade' });
    }
  },

  async unregisterDevice(req, res) {
    try {
      await deviceService.deactivateDevice(parseInt(req.params.id, 10), req.userId);
      res.json({ success: true, message: 'Dispositivo desativado' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message || 'Erro ao remover dispositivo' });
    }
  }
};

module.exports = deviceController;