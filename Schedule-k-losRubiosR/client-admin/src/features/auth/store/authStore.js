import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as loginRequest, register as registerRequest } from '../../../shared/apis';

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    const parsed = JSON.parse(jsonPayload);
    
    // Buscar el rol en la primera ubicación donde aparezca
    let role = parsed.role || parsed.Role || 'USER';
    
    // Limpiar: remover espacios, convertir a mayúsculas
    role = String(role).trim().toUpperCase();
    
    // Reemplazar el rol parseado en el objeto
    parsed.role = role;
    
    console.log('JWT Parsed - Role:', role, 'Full Claims:', parsed);
    
    return parsed;
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      expiresAt: null,
      loading: false,
      error: null,
      isLoadingAuth: true,
      isAuthenticated: false,

      checkAuth: () => {
        const state = get();
        set({
          isLoadingAuth: false,
          isAuthenticated: Boolean(state.token),
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          expiresAt: null,
          isAuthenticated: false,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      login: async ({ email, password }) => {
        try {
          set({ loading: true, error: null });

          const { data } = await loginRequest({ email, password });
          const token = data?.token;

          if (!token) {
            const message = data?.message || 'Error al iniciar sesion';
            set({ error: message, loading: false });
            return {
              success: false,
              error: message,
              verificationUrl: data?.verificationUrl,
            };
          }

          const claims = parseJwt(token) || {};
          const role = String(claims?.role || 'USER');

          set({
            user: {
              id:
                claims?.sub ||
                claims?.id ||
                claims?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
              username:
                claims?.unique_name ||
                claims?.username ||
                claims?.name ||
                claims?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
                null,
              email:
                claims?.email ||
                claims?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
                null,
              role,
            },
            token,
            refreshToken: null,
            expiresAt: claims?.exp ? new Date(claims.exp * 1000).toISOString() : null,
            isAuthenticated: true,
            isLoadingAuth: false,
            loading: false,
          });

          return { success: true, role };
        } catch (err) {
          const responseData = err?.response?.data;
          const isBadCredentials = err?.response?.status === 401 && !responseData?.verificationUrl;
          const message = isBadCredentials
            ? 'Correo o contrasena incorrectos.'
            : responseData?.message || err?.message || 'Error al iniciar sesion';
          set({ error: message, loading: false, isLoadingAuth: false });
          return {
            success: false,
            error: message,
            verificationUrl: responseData?.verificationUrl,
          };
        }
      },

      register: async (formData) => {
        try {
          set({ loading: true, error: null });
          const { data } = await registerRequest(formData);
          set({ loading: false });
          return {
            success: true,
            message: data?.message || data?.Message || 'Usuario registrado correctamente.',
            verificationUrl: data?.verificationUrl || data?.VerificationUrl,
            emailVerificationRequired: data?.emailVerificationRequired,
            data,
          };
        } catch (err) {
          const message = err.response?.data?.message || 'Error al registrar usuario';
          set({ error: message, loading: false });
          return { success: false, error: message };
        }
      },
    }),
    {
      name: 'auth-KS-IN6AM',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.loading = false;
          state.error = null;
          state.isLoadingAuth = false;
          state.isAuthenticated = Boolean(state.token && state.user);
        }
      },
    },
  ),
);
