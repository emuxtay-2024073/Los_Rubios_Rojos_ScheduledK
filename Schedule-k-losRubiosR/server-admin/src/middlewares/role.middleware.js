const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
        // Validación de seguridad por si req.user no existe aún
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: "Usuario no autenticado o sin rol" });
        }

        // Normalizar roles: convertir a mayúsculas y remover espacios
        const userRole = (req.user.role || '').toString().trim().toUpperCase();
        const required = (requiredRole || '').toString().trim().toUpperCase();

        // Administrador: permitir sólo operaciones de lectura (GET) en rutas protegidas.
        if (userRole.includes('ADMIN')) {
            if (req.method === 'GET') return next();
            return res.status(403).json({ message: 'Acceso denegado: ADMIN sólo puede realizar operaciones de lectura en esta ruta' });
        }

        if (userRole !== required) {
            return res.status(403).json({ message: "Acceso denegado: se requiere rol " + requiredRole });
        }
        next();
    };
};

export default roleMiddleware;