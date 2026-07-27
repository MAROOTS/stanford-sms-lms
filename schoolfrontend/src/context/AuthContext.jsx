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
    const { data } = await axiosClient.post('/auth/login', { username, password });
    const userData = { userId: data.userId,
      firstName: data.firstName,
      email: data.email,
      role: data.role,
      mustChangePassword: data.mustChangePassword,
    };
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('accessToken', data.accessToken);
    storage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
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

  return (
      <AuthContext.Provider value={{ user, isLoading, login, logout, clearMustChangePassword }}>
        {children}
      </AuthContext.Provider>
  );
}