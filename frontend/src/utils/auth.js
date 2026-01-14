// utils/auth.js
import { jwtDecode } from "jwt-decode";

// Helper to find the token in either storage
export const getToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

export const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  window.location.href = "/";
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  // Optional: Check expiry here
  return true;
};
