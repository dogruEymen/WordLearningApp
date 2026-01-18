import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi, userApi, getToken, getCachedUser, removeToken } from '../services/ApiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Uygulama başlatıldığında token kontrolü
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await getToken();
      
      if (token) {
        // Önce cache'den kullanıcı bilgisini al
        const cachedUser = await getCachedUser();
        if (cachedUser) {
          setUser(cachedUser);
          setIsAuthenticated(true);
        }

        // Backend'den güncel profil bilgisini al
        try {
          const profile = await userApi.getProfile();
          setUser(profile);
          setIsAuthenticated(true);
        } catch (error) {
          // Token geçersiz olabilir
          if (error.status === 401 || error.status === 403) {
            await removeToken();
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      }
    } catch (error) {
      console.error('Auth kontrol hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password);
      
      if (response?.token) {
        // Profil bilgisini al
        const profile = await userApi.getProfile();
        setUser(profile);
        setIsAuthenticated(true);
        return { success: true };
      }
      
      return { success: false, error: 'Giriş başarısız' };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Giriş yapılırken bir hata oluştu',
      };
    }
  };

  const register = async (email, password, name) => {
    try {
      const response = await authApi.register(email, password, name);
      
      if (response?.token) {
        // Profil bilgisini al
        const profile = await userApi.getProfile();
        setUser(profile);
        setIsAuthenticated(true);
        return { success: true };
      }
      
      return { success: false, error: 'Kayıt başarısız' };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Kayıt yapılırken bir hata oluştu',
      };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser: checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
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

export default AuthContext;
