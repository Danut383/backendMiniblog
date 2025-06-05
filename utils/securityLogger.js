// 🛡️ SECURITY LOGGER
// Middleware para logging de eventos de seguridad

const securityLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  
  // Log de intentos de autenticación
  if (req.path.includes('/auth/login')) {
    console.log(`🔐 [SECURITY] ${timestamp} - Login attempt from IP: ${ip}`);
    console.log(`📱 [SECURITY] User-Agent: ${userAgent}`);
  }
  
  // Log de creación de usuarios
  if (req.path.includes('/auth/register')) {
    console.log(`👤 [SECURITY] ${timestamp} - Registration attempt from IP: ${ip}`);
  }
  
  // Log de accesos a endpoints protegidos
  if (req.headers.authorization) {
    console.log(`🔒 [SECURITY] ${timestamp} - Authenticated request to ${req.method} ${req.path} from IP: ${ip}`);
  }
  
  // Log de requests sospechosos (sin token en endpoints protegidos)
  const protectedPaths = ['/reviews', '/comments', '/favorites'];
  const isProtectedPath = protectedPaths.some(path => req.path.includes(path));
  const isPost = req.method === 'POST';
  const hasToken = req.headers.authorization;
  
  if (isProtectedPath && isPost && !hasToken) {
    console.warn(`⚠️ [SECURITY] ${timestamp} - Unauthorized access attempt to ${req.path} from IP: ${ip}`);
  }
  
  next();
};

module.exports = securityLogger;
