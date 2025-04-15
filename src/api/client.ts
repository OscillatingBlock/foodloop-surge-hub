
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

  // Add JWT token to Authorization header if available
  const token = localStorage.getItem('authToken');
  if (token && !options.headers?.['Authorization']) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      'Authorization': `Bearer ${token}`
    };
  }

  try {
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || error.error || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // Check specifically for CORS-related errors
    if (error instanceof TypeError && 
        (error.message.includes('NetworkError') || 
         error.message.includes('Failed to fetch') || 
         error.message.includes('Network request failed'))) {
      
      throw new Error(
        `Cannot connect to the backend server at ${API_BASE_URL}. ` +
        'This may be due to CORS restrictions. Please make sure your backend server is running, ' +
        'accessible, and has CORS enabled for this origin. ' +
        'Make sure your Flask app has: ' +
        'CORS(app, supports_credentials=True, origins=["*"])'
      );
    }
    throw error;
  }
};

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
  role: string; // Added role field
}

export type UserRole = 'Farmer' | 'NGO' | 'Retailer';

export interface RequestData {
  quantity?: string;
  notes?: string;
  pickup_date?: string;
}

export interface RequestResponse {
  request_id: number;
  response: 'accept' | 'decline';
  pickup_date?: string;
  notes?: string;
}

/**
 * Helper function to convert an object to URL parameters
 */
const objectToUrlParams = (data: Record<string, any>): string => {
  return Object.entries(data)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
};

/**
 * API functions for specific endpoints
 */
export const api = {
  // Authentication
  auth: {
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
    login: (credentials: LoginCredentials) => 
      fetchFromAPI<{ message: string; token?: string }>('/api/login', {
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
    logout: () => {
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      
      return fetchFromAPI<{ success: boolean }>('/api/logout', { method: 'POST' });
    },
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
  
  // Surplus food endpoints
  addSurplusFood: (data: any) => fetchFromAPI<any>('/api/surplus', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getSurplusFood: (filters?: any) => {
    let endpoint = '/api/surplus';
    if (filters) {
      endpoint += `?${objectToUrlParams(filters)}`;
    }
    return fetchFromAPI<any>(endpoint);
  },
  
  // New endpoint for NGOs to view all surplus food (not just their own)
  getAllSurplusFood: (filters?: any) => {
    let endpoint = '/api/all-surplus';
    if (filters) {
      endpoint += `?${objectToUrlParams(filters)}`;
    }
    return fetchFromAPI<any>(endpoint);
  },
  
  // Enhanced request endpoints
  requestSurplusFood: (id: string, requestData?: RequestData) => fetchFromAPI<any>(`/api/surplus/${id}/request`, {
    method: 'POST',
    body: requestData ? JSON.stringify(requestData) : undefined,
  }),
  
  // New endpoints for request management
  getRequests: () => fetchFromAPI<any>('/api/requests'),
  
  respondToRequest: (requestId: number, responseData: RequestResponse) => 
    fetchFromAPI<any>(`/api/requests/${requestId}/respond`, {
      method: 'POST',
      body: JSON.stringify(responseData),
    }),
    
  getRequestDetails: (requestId: number) => 
    fetchFromAPI<any>(`/api/requests/${requestId}`),
};
