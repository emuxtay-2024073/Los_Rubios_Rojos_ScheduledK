const normalizeRole = (role) => (role || '').toString().trim().toUpperCase();

export const getRoleHomePath = (role) => {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === 'PADRE') return '/padre';
  if (normalizedRole === 'COORDINADOR') return '/coordinador';
  if (['ADMIN', 'SUPER_ADMIN', 'ADMIN_ROLE'].includes(normalizedRole)) return '/dashboard';
  return '/login';
};

export const getRoleLabel = (role) => {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === 'PADRE') return 'Padre de familia';
  if (normalizedRole === 'COORDINADOR') return 'Coordinador';
  if (['ADMIN', 'SUPER_ADMIN', 'ADMIN_ROLE'].includes(normalizedRole)) return 'Administrador';
  return 'Usuario';
};
