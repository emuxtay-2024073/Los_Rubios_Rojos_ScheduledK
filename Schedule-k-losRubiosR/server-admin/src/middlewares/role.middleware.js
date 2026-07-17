const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
        // Validación de seguridad por si req.user no existe aún
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: "Usuario no autenticado o sin rol" });
        }

        // Comparación flexible (insensible a mayúsculas)
        const userRole = req.user.role.toLowerCase();

        // Administrador: permitir sólo operaciones de lectura (GET) en rutas protegidas.
        // Esto garantiza que un ADMIN pueda listar recursos pero no modificar citas.
        if (userRole.includes('admin') || userRole === 'administrador') {
            if (req.method === 'GET') return next();
            return res.status(403).json({ message: 'Acceso denegado: ADMIN sólo puede realizar operaciones de lectura en esta ruta' });
        }

        if (userRole !== requiredRole.toLowerCase()) {
                return res.status(403).json({ message: "Acceso denegado: se requiere rol " + requiredRole });
            }
        next();
    };
};

export default roleMiddleware;