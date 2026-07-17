import jwt from "jsonwebtoken";

const JWTMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Token no proporcionado o mal formado." });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT secret no configurado en server-admin");
      return res.status(500).json({ success: false, message: "Error de configuración: falta JWT_SECRET" });
    }

    // USAR ESTA CONFIGURACIÓN PARA ACEPTAR EL TOKEN DE .NET
    const decoded = jwt.verify(token, secret, {
        algorithms: ["HS256"],
        ignoreIssuer: true,
        ignoreAudience: true
    });

    req.user = {
        id: decoded.id || decoded.userId || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        username:
          decoded.unique_name ||
          decoded.username ||
          decoded.name ||
          decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
          null,
        role: decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
        email: decoded.email || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
    };

    next();
  } catch (error) {
    // ... tu lógica de errores actual está bien
    console.error("JWT Error:", error.message);
    return res.status(401).json({ success: false, message: "Token inválido." });
  }
};

export default JWTMiddleware;