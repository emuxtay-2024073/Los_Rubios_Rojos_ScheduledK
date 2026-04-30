const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
        // Validación de seguridad por si req.user no existe aún
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: "Usuario no autenticado o sin rol" });
        }

        // Comparación flexible (insensible a mayúsculas)
        if (req.user.role.toLowerCase() !== requiredRole.toLowerCase()) {
            return res.status(403).json({ message: "Acceso denegado: se requiere rol " + requiredRole });
        }
        next();
    };
};

export default roleMiddleware; // <--- ESTO ES LO QUE ESTABA FALLANDO