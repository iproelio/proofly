
import { User, Business } from '../types';
import { userStore, businessStore } from './storage';

const AUTH_KEY = 'proofly_session_v4';

export const login = (user: User) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
};

export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
};

export const getCurrentUser = (): User | null => {
  try {
    const session = localStorage.getItem(AUTH_KEY);
    return session ? JSON.parse(session) : null;
  } catch (e) {
    console.error("Auth session parse error:", e);
    return null;
  }
};

export const getSessionBusiness = (): Business | null => {
  const user = getCurrentUser();
  if (!user) return null;
  return businessStore.getById(user.businessId) || null;
};
