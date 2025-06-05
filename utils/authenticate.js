const jwt = require('jsonwebtoken');

module.exports = function authenticate(req, res, next) {
  // 🍪 SOPORTE PARA COOKIES SEGURAS
  // Buscar token en Authorization header O en cookies
  const authHeader = req.headers['authorization'];
  const headerToken = authHeader && authHeader.split(' ')[1];
  const cookieToken = req.cookies && req.cookies.auth_token;
  
  const token = headerToken || cookieToken;
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Token requerido',
      details: 'Debe proporcionar un token de autenticación en el header Authorization o en cookies'
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Token inválido',
        details: 'El token proporcionado no es válido o ha expirado'
      });
    }
    
    req.userId = decoded.userId;
    req.tokenSource = headerToken ? 'header' : 'cookie'; // Para logging
    next();
  });
};
