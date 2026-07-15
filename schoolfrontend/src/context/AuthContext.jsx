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

  const login = async (email, password, remember = false) => {
    const { data } = await axiosClient.post('/auth/login', { email, password });
    const userData = { userId: data.userId, firstName: data.firstName, email: data.email, role: data.role };
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

  return (
      <AuthContext.Provider value={{ user, isLoading, login, logout }}>
        {children}
      </AuthContext.Provider>
  );
}