import { jwtDecode } from "jwt-decode";

export function getAuthTokenFromStorage() {
  return localStorage.getItem('authToken');
}

export function saveAuthTokenToStorage(token) {
  localStorage.setItem('authToken', token);
}

export function removeAuthTokenFromStorage() {
  localStorage.removeItem('authToken');
}

export function isTokenExpired(token) {
  if (!token) {
    return true; // No token means it's effectively expired/invalid
  }
  try {
    const decodedToken = jwtDecode(token);
    // JWT exp is in seconds, Date.now() is in milliseconds
    if (decodedToken.exp * 1000 < Date.now()) {
      console.log('Token expired');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true; // Invalid token format also considered expired
  }
}

export function getUserDetailsFromDecodedToken(decodedToken) {
  if (!decodedToken) return null;
  // Assuming your token has these claims. Adjust if claim names are different.
  const userId = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decodedToken.id || decodedToken.sub;
  const userRole = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decodedToken.role;
  
  if (userId && userRole) {
    return {
      userId,
      userRole,
    };
  }
  console.warn('User ID or Role not found in token', decodedToken);
  return null;
}

export function isUserAuthenticated() {
  const token = getAuthTokenFromStorage();
  return token !== null && !isTokenExpired(token);
}

// This function can be used to get user details if needed elsewhere
export function getUserDetailsFromToken() {
  const token = getAuthTokenFromStorage();
  if (token && !isTokenExpired(token)) {
    try {
      const decodedToken = jwtDecode(token);
      // Assuming 'id' and 'Role' are in the token payload
      return {
        userId: decodedToken.id,
        userRole: decodedToken.Role,
      };
    } catch (error) {
      console.error('Error decoding token for details:', error);
      return null;
    }
  }
  return null;
} 