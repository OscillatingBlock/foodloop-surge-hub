
import { fetchFromAPI, objectToUrlParams } from './base';
import { RequestData } from './requests';

export const surplusApi = {
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
  
  requestSurplusFood: (id: string, requestData?: RequestData) => fetchFromAPI<any>(`/api/surplus/${id}/request`, {
    method: 'POST',
    body: requestData ? JSON.stringify(requestData) : undefined,
  }),
};
