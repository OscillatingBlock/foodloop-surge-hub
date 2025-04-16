
import { fetchFromAPI, objectToUrlParams } from './base';
import { authApi } from './auth';
import { dataApi } from './data';
import { requestsApi } from './requests';
import { surplusApi } from './surplus';

// Re-export all types
export type { LoginCredentials, SignupData } from './auth';
export type { RequestData, RequestResponse } from './requests';
export type UserRole = 'Farmer' | 'NGO' | 'Retailer';

// Combine all API functions into a single object
export const api = {
  auth: authApi,
  requests: requestsApi,  // Change from spreading to using as named property
  surplus: surplusApi,    // Change from spreading to using as named property
  ...dataApi,             // Keep dataApi spread for now as it might be used directly
};

// Export utility functions
export { fetchFromAPI, objectToUrlParams };
