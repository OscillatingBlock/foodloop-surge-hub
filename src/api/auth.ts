
import { fetchFromAPI, broadcastAuthChange } from './base';

// Define proper types for our API functions
export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  role: string;
}

export const authApi = {
  // Check current authentication status
  checkAuth: async () => {
    try {
      // First try to get status from the backend
      const response = await fetchFromAPI<{ authenticated: boolean; user?: any }>('/api/auth/status');
      return response;
    } catch (error) {
      console.error("Auth check error:", error);
      
      // If backend check fails but we have a token, try to use that
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Parse the token to get user info
          const tokenParts = token.split('.');
          if (tokenParts.length >= 2) {
            const payload = JSON.parse(atob(tokenParts[1]));
            
            // Check if token is expired
            const currentTime = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < currentTime) {
              console.log("Token expired, logging out");
              localStorage.removeItem('authToken');
              localStorage.removeItem('userRole');
              broadcastAuthChange();
              return { authenticated: false };
            }
            
            // If token is valid, use it
            const userRole = localStorage.getItem('userRole') || payload.role || 'Farmer';
            
            return { 
              authenticated: true, 
              user: { 
                id: payload.user_id,
                email: payload.email,
                role: userRole
              } 
            };
          }
        } catch (e) {
          console.error("Failed to parse token:", e);
        }
      }
      
      return { authenticated: false };
    }
  },
  
  // Login with credentials
  login: async (credentials: LoginCredentials) => {
    const result = await fetchFromAPI<{ message: string; token?: string }>('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (result.token) {
      localStorage.setItem('authToken', result.token);
      
      try {
        const tokenParts = result.token.split('.');
        if (tokenParts.length >= 2) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log("Token payload:", payload);
          
          if (payload.role) {
            localStorage.setItem('userRole', payload.role);
          }
        }
      } catch (e) {
        console.error("Failed to parse token:", e);
      }
      
      // Broadcast auth change to other tabs
      broadcastAuthChange();
    }
    
    return result;
  },
  
  // Signup with user data
  signup: (userData: SignupData) => 
    fetchFromAPI<{ message: string }>('/api/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
  
  // Redirect to login/signup pages (kept for backwards compatibility)
  redirectToLogin: () => {
    window.location.href = '/login';
    return Promise.resolve({ redirected: true });
  },
  
  redirectToSignup: () => {
    window.location.href = '/signup';
    return Promise.resolve({ redirected: true });
  },
  
  // Logout - this will clear the session on the backend
  logout: async () => {
    try {
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      
      // Broadcast the change to other tabs
      broadcastAuthChange();
      
      // Call the backend to clear server-side session if available
      return await fetchFromAPI<{ success: boolean }>('/api/logout', { 
        method: 'POST',
        credentials: 'include' 
      });
    } catch (error) {
      console.error("Logout error:", error);
      
      // Even if the API call fails, we should still clear local data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      broadcastAuthChange();
      
      // Re-throw the error so the component can handle it
      throw error;
    }
  },
};
