'use client';

import { useState, useEffect } from 'react';
import { authService, User, LoginCredentials, RegisterCredentials } from '@/services/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser();
    if (currentUser && !authService.isTokenExpired()) {
      setUser(currentUser);
      setIsLoading(false);
    } else if (authService.isTokenExpired()) {
      // Try to refresh token
      authService.refreshToken()
        .then(() => {
          const refreshedUser = authService.getCurrentUser();
          if (refreshedUser) {
            setUser(refreshedUser);
          }
        })
        .catch(() => {
          // Refresh failed, clear auth data
          authService.logout();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setError('');
      setIsLoading(true);
      
      const response = await authService.login(credentials);
      setUser(response.user);
      return true;
    } catch (error: any) {
      setError(error.response?.data?.error || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    try {
      setError('');
      setIsLoading(true);
      
      const response = await authService.register(credentials);
      setUser(response.user);
      return true;
    } catch (error: any) {
      setError(error.response?.data?.error || 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      setUser(null);
      setError('');
    }
  };

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    clearError: () => setError('')
  };
}
