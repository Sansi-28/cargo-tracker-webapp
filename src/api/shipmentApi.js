import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api'; // Fallback URL

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- API Functions ---

export const fetchShipments = () => apiClient.get('/shipments');

export const fetchShipmentById = (id) => apiClient.get(`/shipments/${id}`);

export const createShipment = (shipmentData) => apiClient.post('/shipments', shipmentData);

export const updateShipmentLocation = (id, locationData) => apiClient.post(`/shipments/${id}/update-location`, locationData);

export const getShipmentETA = (id) => apiClient.get(`/shipments/${id}/eta`);

// Add other API calls as needed

export default apiClient; // Optional: Export configured client if needed elsewhere