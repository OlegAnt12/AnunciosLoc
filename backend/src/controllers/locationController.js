const Location = require('../models/Location');

const locationController = {
  async createLocation(req, res) {
    try {
      const { name, type, latitude, longitude, radius, wifi_ssid } = req.body;
      const created_by = req.userId;

      const locationData = {
        name,
        type,
        latitude,
        longitude,
        radius,
        wifi_ssid,
        created_by
      };

      const locationId = await Location.create(locationData);

      res.status(201).json({
        success: true,
        message: 'Local criado com sucesso',
        data: { locationId }
      });
    } catch (error) {
      console.error('Erro ao criar local:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  async getAllLocations(req, res) {
    try {
      const locations = await Location.findAll();

      res.json({
        success: true,
        data: locations
      });
    } catch (error) {
      console.error('Erro ao obter locais:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  async getLocation(req, res) {
    try {
      const { id } = req.params;
      const location = await Location.findById(id);

      if (!location) {
        return res.status(404).json({
          success: false,
          message: 'Local não encontrado'
        });
      }

      res.json({
        success: true,
        data: location
      });
    } catch (error) {
      console.error('Erro ao obter local:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  async deleteLocation(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Location.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Local não encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Local removido com sucesso'
      });
    } catch (error) {
      console.error('Erro ao remover local:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  async findNearbyLocations(req, res) {
    try {
      const { latitude, longitude, radius = 100 } = req.body;
      
      const locations = await Location.findByCoordinates(latitude, longitude, radius);

      res.json({
        success: true,
        data: locations
      });
    } catch (error) {
      console.error('Erro ao encontrar locais próximos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
};

module.exports = locationController;