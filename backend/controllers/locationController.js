const locationService = require('../services/locationService');
const db = require('../config/database');
const pushNotificationService = require('../services/pushNotificationService');

const locationController = {
  async createLocation(req, res) {
    try {
      const id = await locationService.createLocation(req.body, req.userId);
      
      // Send notification to user about successful location creation
      setTimeout(async () => {
        try {
          await pushNotificationService.notifyUserAction(
            req.userId,
            'Local Criado',
            'Seu local foi adicionado com sucesso!'
          );
        } catch (error) {
          console.error('Error sending location creation notification:', error);
        }
      }, 1000);
      
      res.status(201).json({ success: true, message: 'Local criado', data: { id } });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message || 'Erro ao criar local' });
    }
  },

  async getAllLocations(req, res) {
    try {
      const filters = req.query || {};
      const locations = await locationService.getLocations(filters);
      res.json({ success: true, data: locations });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao obter localizações' });
    }
  },

  async getLocation(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const [rows] = await db.query('SELECT l.*, tc.nome as tipo_coordenada FROM locais l JOIN tipos_coordenada tc ON l.tipo_coordenada_id = tc.id WHERE l.id = ?', [id]);
      const location = rows[0] || null;
      if (!location) return res.status(404).json({ success: false, message: 'Localização não encontrada' });

      // Obter coordenadas
      if (location.tipo_coordenada === 'GPS') {
        const [gps] = await db.query('SELECT latitude, longitude, raio_metros FROM coordenadas_gps WHERE local_id = ?', [id]);
        location.coordenadas = gps[0] || null;
      } else if (location.tipo_coordenada === 'WIFI') {
        const [wifi] = await db.query('SELECT ssid, descricao FROM ssids_wifi WHERE local_id = ?', [id]);
        location.coordenadas = wifi;
      }

      res.json({ success: true, data: location });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao obter localização' });
    }
  },

  async updateLocation(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const data = req.body;
      // note: service signature is updateLocation(locationId, updateData, userId)
      await locationService.updateLocation(id, data, req.userId);
      res.json({ success: true, message: 'Localização atualizada' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message || 'Erro ao atualizar localização' });
    }
  },


  async deleteLocation(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      await locationService.deleteLocation(id, req.userId);
      res.json({ success: true, message: 'Local removido' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message || 'Erro ao remover local' });
    }
  },

  async findNearbyLocations(req, res) {
    try {
      const matched = await locationService.checkUserLocation(req.userId, req.body);
      res.json({ success: true, data: matched });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao encontrar localizações próximas' });
    }
  }
};

module.exports = locationController;