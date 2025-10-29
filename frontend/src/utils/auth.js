// Check if user is authenticated
export function isAuthenticated() {
  return !!localStorage.getItem("token");
}

// Get the current token
export function getToken() {
  return localStorage.getItem("token");
}

// Logout user
export function logout() {
  localStorage.removeItem("token");
  window.location.href = "/";
}

// Decode JWT token to get user info (optional)
export function getUserFromToken() {
  const token = getToken();
  if (!token) return null;

  try {
    // JWT tokens have 3 parts separated by dots
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}
