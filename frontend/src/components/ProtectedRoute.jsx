import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // If no token, redirect to home page
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If token exists, render the protected component
  return children;
}
