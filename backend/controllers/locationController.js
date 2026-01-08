const { Location } = require('../models/Location');

const locationController = {
  async createLocation(req, res) {
    try {
      const { name, type, latitude, longitude, radius, wifi_ssid } = req.body;
      
      const location = await Location.create({
        name,
        type,
        latitude,
        longitude,
        radius,
        wifi_ssid,
        created_by: req.userId
      });

      res.status(201).json({
        success: true,
        message: 'Localização criada com sucesso',
        data: location
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao criar localização'
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
      res.status(500).json({
        success: false,
        message: 'Erro ao obter localizações'
      });
    }
  },

  async getLocation(req, res) {
    try {
      const location = await Location.findByPk(req.params.id);
      if (!location) {
        return res.status(404).json({
          success: false,
          message: 'Localização não encontrada'
        });
      }
      res.json({
        success: true,
        data: location
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao obter localização'
      });
    }
  },

  async updateLocation(req, res) {
    try {
      const location = await Location.findByPk(req.params.id);
      if (!location) {
        return res.status(404).json({
          success: false,
          message: 'Localização não encontrada'
        });
      }
      await location.update(req.body);
      res.json({
        success: true,
        message: 'Localização atualizada com sucesso',
        data: location
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar localização'
      });
    }
  },

  async deleteLocation(req, res) {
    try {
      const location = await Location.findByPk(req.params.id);
      if (!location) {
        return res.status(404).json({
          success: false,
          message: 'Localização não encontrada'
        });
      }
      await location.destroy();
      res.json({
        success: true,
        message: 'Localização eliminada com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao eliminar localização'
      });
    }
  },

  async findNearbyLocations(req, res) {
    try {
      const { latitude, longitude, radius = 10 } = req.body;
      
      // Implementação básica - em produção usar cálculo de distância real
      const locations = await Location.findAll();
      const nearbyLocations = locations.filter(loc => {
        if (!loc.latitude || !loc.longitude) return false;
        return true; // Simplificado para demo
      });

      res.json({
        success: true,
        data: nearbyLocations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao encontrar localizações próximas'
      });
    }
  }
};

module.exports = locationController;