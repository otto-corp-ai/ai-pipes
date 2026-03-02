import { create } from 'zustand';
import { api } from './api';

interface AuthState {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  login: async (email, password) => {
    const { token, user } = await api.login({ email, password });
    localStorage.setItem('token', token);
    set({ token, user, isLoading: false });
  },
  register: async (email, password, name) => {
    const { token, user } = await api.register({ email, password, name });
    localStorage.setItem('token', token);
    set({ token, user, isLoading: false });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },
  loadUser: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { set({ isLoading: false }); return; }
      const user = await api.getMe();
      set({ user, token, isLoading: false });
    } catch {
      localStorage.removeItem('token');
      set({ token: null, user: null, isLoading: false });
    }
  },
}));
