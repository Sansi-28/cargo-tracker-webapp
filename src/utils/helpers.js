// Simple Date Formatter
export const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleString(); // Adjust format as needed (e.g., using Intl.DateTimeFormat)
    } catch (error) {
        return 'Invalid Date';
    }
};

// Simple Location Formatter
export const formatLocation = (location) => {
    if (!location) return 'N/A';
    return location.name || 'Unknown Location';
};

// Function to get coordinates (latitude, longitude) from a location object
// Provides default coordinates if missing - REPLACE WITH ACTUAL GEOCODING IN REAL APP
export const getLocationCoords = (location) => {
    // --- VERY BASIC PLACEHOLDER ---
    // In a real app, you'd use a geocoding service if coords are missing,
    // or ensure coords are always saved in the backend.
    const predefinedCoords = {
        "New York": [40.7128, -74.0060],
        "Los Angeles": [34.0522, -118.2437],
        "London": [51.5074, -0.1278],
        "Shanghai": [31.2304, 121.4737],
        "Rotterdam": [51.9244, 4.4777],
        "Singapore": [1.3521, 103.8198],
        "Default": [0, 0] // Default if not found
    };
    if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
        return [location.latitude, location.longitude];
    }
    if (location && location.name && predefinedCoords[location.name]) {
         console.warn(`Using predefined coordinates for ${location.name}. Consider saving actual coordinates.`);
        return predefinedCoords[location.name];
    }
     console.warn(`Coordinates not found for location: ${location?.name}. Using default [0,0].`);
    return predefinedCoords["Default"];
};