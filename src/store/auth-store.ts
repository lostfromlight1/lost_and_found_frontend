import { create } from "zustand";

interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  setUser: (user: UserInfo | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  
  setUser: (user) => 
    set({ 
      user, 
      isAuthenticated: !!user 
    }),
    
  logout: () => 
    set({ 
      user: null, 
      isAuthenticated: false 
    }),
}));
