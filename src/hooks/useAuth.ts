import { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthResponse } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const useAuthProvider = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');

      console.log('=== LOADING STORED AUTH ===');
      console.log('Token exists:', !!token);
      console.log('User data exists:', !!userData);

      if (token && userData) {
        const parsedUser: User = JSON.parse(userData);
        console.log('Parsed user:', parsedUser);
        apiService.setToken(token);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('=== STARTING LOGIN ===');
      console.log('Username:', username);
      
      const response: AuthResponse = await apiService.login(username, password);
      console.log('Login response user:', response.user);
      
      // Guardar en AsyncStorage
      await AsyncStorage.setItem('auth_token', response.token);
      await AsyncStorage.setItem('user_data', JSON.stringify(response.user));
      
      // Configurar el token en el servicio API
      apiService.setToken(response.token);
      
      // Actualizar el estado
      setUser(response.user);
      console.log('User set in state:', response.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Limpiar AsyncStorage
      await AsyncStorage.multiRemove(['auth_token', 'user_data']);
      
      // Limpiar el token del servicio API
      apiService.setToken('');
      
      // Limpiar el estado
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
};

export { AuthContext };
