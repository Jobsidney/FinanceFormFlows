import api from '@/lib/api';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  date_joined: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  email?: string;
}

class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'admin_user';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/api/auth/login/', credentials);
    const { access, refresh, user } = response.data;
    
  if (typeof window !== 'undefined') {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, access);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refresh);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
    
    return { access, refresh, user };
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post('/api/auth/register/', credentials);
    const { access, refresh, user } = response.data;
    
  if (typeof window !== 'undefined') {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, access);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refresh);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
    
    return { access, refresh, user };
  }

  async refreshToken(): Promise<string> {
    if (typeof window === 'undefined') {
      throw new Error('No refresh token available');
    }
    
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('/api/auth/refresh/', {
      refresh: refreshToken
    });
    
    const { access } = response.data;
    localStorage.setItem(this.ACCESS_TOKEN_KEY, access);
    
    return access;
  }

  async logout(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    
    if (refreshToken) {
      try {
        await api.post('/api/auth/logout/', {
          refresh: refreshToken
        });
      } catch (error) {
      console.warn('Logout request failed:', error);
      }
    }
    
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  async getProfile(): Promise<User> {
    const response = await api.get('/api/auth/profile/');
    return response.data;
  }

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = this.getAccessToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  isTokenExpired(): boolean {
    if (typeof window === 'undefined') return true;
    const token = this.getAccessToken();
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }
}

export const authService = new AuthService();
export default authService;
