import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('loginaft_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('loginaft_token'));
  const [loading, setLoading] = useState(true);

  // Verify and fetch current user on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data?.success && res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('loginaft_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.warn('Auth check failed:', err.message);
        localStorage.removeItem('loginaft_token');
        localStorage.removeItem('loginaft_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const { accessToken, user: loggedUser } = res.data;
      setToken(accessToken);
      setUser(loggedUser);
      localStorage.setItem('loginaft_token', accessToken);
      localStorage.setItem('loginaft_user', JSON.stringify(loggedUser));
      return loggedUser;
    }
    throw new Error(res.data?.message?.ar || 'فشل تسجيل الدخول');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Logout error', e);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('loginaft_token');
      localStorage.removeItem('loginaft_user');
      window.location.href = '/login';
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('loginaft_user', JSON.stringify(updatedUser));
  };

  // Granular Permission Checker
  const hasPermission = (requiredPermission) => {
    if (!user) return false;
    const role = user.role;
    if (!role) return false;

    // Super Admin or General Manager bypass
    if (role.name === 'ADMIN' || role.name === 'GENERAL_MANAGER') return true;

    const permissions = role.permissions || [];
    if (permissions.includes('*')) return true;
    if (permissions.includes(requiredPermission)) return true;

    // Check module wildcard, e.g. "inventory:*"
    const [module] = requiredPermission.split(':');
    if (permissions.includes(`${module}:*`)) return true;

    return false;
  };

  // Role Checker
  const hasRole = (...roles) => {
    if (!user) return false;
    const roleName = user.role?.name || user.role;
    if (roleName === 'ADMIN') return true;
    return roles.includes(roleName);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        updateUser,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
