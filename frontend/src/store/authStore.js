import { create } from 'zustand';
import { 
  removeAuthTokenFromStorage, 
  saveAuthTokenToStorage 
} from '../utils/authUtils';

const useAuthStore = create((set) => ({
  token: null,
  userId: null,
  userRole: null,
  loginUsername: null,
  isAuthenticated: false,

  setAuth: (token, userId, userRole, loginUsername) => {
    set({ token, userId, userRole, loginUsername, isAuthenticated: true });
    saveAuthTokenToStorage(token);
  },

  clearAuth: () => {
    set({ token: null, userId: null, userRole: null, loginUsername: null, isAuthenticated: false });
    removeAuthTokenFromStorage();
  },
}));

export default useAuthStore; 