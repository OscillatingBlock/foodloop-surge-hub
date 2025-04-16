
import { fetchFromAPI } from './base';

export interface RequestData {
  quantity?: string;
  notes?: string;
  pickup_date?: string;
  request_date?: string;
  ngo_name?: string;
  ngo_id?: number;
}

export interface RequestResponse {
  request_id: number;
  response: 'accept' | 'decline';
  pickup_date?: string;
  notes?: string;
}

export const requestsApi = {
  // New endpoints for request management
  getRequests: (filterType?: string) => {
    let endpoint = '/api/requests';
    if (filterType) {
      endpoint += `?type=${filterType}`;
    }
    return fetchFromAPI<any>(endpoint);
  },
  
  respondToRequest: (requestId: number, responseData: RequestResponse) => 
    fetchFromAPI<any>(`/api/requests/${requestId}/respond`, {
      method: 'POST',
      body: JSON.stringify(responseData),
    }),
    
  getRequestDetails: (requestId: number) => 
    fetchFromAPI<any>(`/api/requests/${requestId}`),
};
