import { useState } from "react";
import axiosClient from "../api/axiosClient";
import AuthContext from "./authContext";

function getStoredUser() {
  try {
    const stored = localStorage.getItem("user") || sessionStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [isLoading] = useState(false);

  const login = async (username, password, remember = false) => {
    const { data } = await axiosClient.post('/auth/login', { username, password, remember });
    const userData = { userId: data.userId,
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      role: data.role,
      mustChangePassword: data.mustChangePassword,
    };
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('accessToken', data.accessToken);
    storage.setItem('refreshToken', data.refreshToken);
    storage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    const storage = localStorage.getItem('refreshToken') ? localStorage : sessionStorage;
    const refreshToken = storage.getItem('refreshToken');
    try {
      if (refreshToken) await axiosClient.post('/auth/logout', { refreshToken });
    } catch {
      // ignore — clearing local state regardless of whether the server call succeeded
    }
    ['accessToken', 'refreshToken', 'user'].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    setUser(null);
  };

  const clearMustChangePassword = () => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, mustChangePassword: false };
      const storage = localStorage.getItem('user') ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const updateUserProfile = (updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      const storage = localStorage.getItem('user') ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
      <AuthContext.Provider value={{ user, isLoading, login, logout, clearMustChangePassword,updateUserProfile }}>
        {children}
      </AuthContext.Provider>
  );
}