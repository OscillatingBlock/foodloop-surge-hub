
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
  ...dataApi,
  ...requestsApi,
  ...surplusApi,
};

// Export utility functions
export { fetchFromAPI, objectToUrlParams };
