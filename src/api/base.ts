
/**
 * Base API client with common functionality
 */

// Base URL for the Flask backend - update this to your actual backend URL when deployed
export const API_BASE_URL = 'http://localhost:5000';

// Add event for cross-tab communication
export const AUTH_CHANGE_EVENT = 'foodloop-auth-change';

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

/**
 * Helper function to convert an object to URL parameters
 */
export const objectToUrlParams = (data: Record<string, any>): string => {
  return Object.entries(data)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
};

// Helper function to broadcast auth changes to other tabs
export const broadcastAuthChange = () => {
  const event = new StorageEvent('storage', {
    key: 'authToken',
    newValue: localStorage.getItem('authToken'),
  });
  window.dispatchEvent(event);
};

// Listen for auth changes from other tabs
window.addEventListener('storage', (event) => {
  if (event.key === 'authToken') {
    // Force reload the page to apply new auth state
    window.location.reload();
  }
});
