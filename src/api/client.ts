
/**
 * API client for connecting to the Flask backend
 */

// Base URL for the Flask backend - update this to your actual backend URL when deployed
const API_BASE_URL = 'http://localhost:5000';

/**
 * Generic fetch function to make API requests to the Flask backend
 */
export const fetchFromAPI = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Include credentials to handle cookies for session-based auth
  const fetchOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || error.error || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // Handle network errors specifically
    if (error instanceof TypeError && error.message.includes('NetworkError')) {
      throw new Error(
        `Cannot connect to the backend server at ${API_BASE_URL}. ` +
        'Please make sure your backend server is running and accessible.'
      );
    }
    throw error;
  }
};

// Define proper types for our API functions
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
}

/**
 * API functions for specific endpoints
 */
export const api = {
  // Authentication
  auth: {
    // Check current authentication status
    checkAuth: () => fetchFromAPI<{ authenticated: boolean; user?: any }>('/api/auth/status'),
    
    // Login with credentials
    login: (credentials: LoginCredentials) => 
      fetchFromAPI<{ message: string }>('/api/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }),
    
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
    logout: () => fetchFromAPI<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),
  },
  
  // Data endpoints
  getStats: () => fetchFromAPI<any>('/api/stats'),
  getFoodItems: () => fetchFromAPI<any>('/api/food-items'),
  submitDonation: (data: any) => fetchFromAPI<any>('/api/donations', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getOrganizations: () => fetchFromAPI<any>('/api/organizations'),
  getData: () => fetchFromAPI<any>('/api/data'),
};
