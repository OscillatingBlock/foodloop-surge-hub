
import { fetchFromAPI } from './base';

export const dataApi = {
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
