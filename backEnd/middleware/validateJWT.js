const jwt = require('jsonwebtoken');

const validateJWT = (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    // El formato esperado es: "Bearer TOKEN"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no válido'
      });
    }

    // Verificar token (para este sprint, usamos validación simple base64)
    // En producción, usar JWT real con SECRET_KEY
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [userId, timestamp] = decoded.split(':');
      
      if (!userId || !timestamp) {
        return res.status(401).json({
          success: false,
          message: 'Token corrupto'
        });
      }

      // Agregar userId al request para usarlo en controllers
      req.userId = userId;
      
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al validar token'
    });
  }
};

module.exports = validateJWT;
