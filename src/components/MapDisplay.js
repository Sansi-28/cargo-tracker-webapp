import React, { useEffect, useRef } from 'react';
// Import necessary components from react-leaflet
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    GeoJSON // Import GeoJSON for rendering detailed routes
} from 'react-leaflet';
import L from 'leaflet'; // Import Leaflet library itself
import 'leaflet/dist/leaflet.css'; // Import Leaflet's CSS
import { getLocationCoords } from '../utils/helpers'; // Utility to get coordinates

// --- Fix for default Leaflet marker icons ---
// Addresses potential issues with icon paths in bundlers like Webpack
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Reset default icon paths
delete L.Icon.Default.prototype._getIconUrl;

// Merge options with correct paths
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
});
// --- End of icon fix ---

// --- Custom Icon for Current Location (Optional) ---
// You can customize this further
const currentLocationIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png', // Using standard marker for demo
    iconSize: [25, 41],
    iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
    popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41],
    className: 'current-location-marker' // Optional class for styling
});
// --- End Custom Icon ---


// --- MapDisplay Component ---
const MapDisplay = ({ shipment }) => {
    const mapRef = useRef(); // Reference to the map instance

    // Effect to fit map bounds when the shipment changes or map is created
    useEffect(() => {
        // Ensure shipment data and map instance exist
        if (!shipment || !mapRef.current) {
            return; // Exit if no shipment or map not ready
        }

        const origin = shipment.origin;
        const destination = shipment.destination;
        const currentLocation = shipment.currentLocation;
        let pointsForBounds = []; // Array to hold coordinates for bounds calculation

        // Prioritize detailed route for fitting bounds if available and valid
        if (shipment.detailedRouteGeometry?.type === 'LineString' &&
            Array.isArray(shipment.detailedRouteGeometry.coordinates) &&
            shipment.detailedRouteGeometry.coordinates.length > 0)
        {
            // GeoJSON coordinates are [longitude, latitude]
            // Leaflet bounds need [latitude, longitude]
            pointsForBounds = shipment.detailedRouteGeometry.coordinates.map(coord => [coord[1], coord[0]]);
            console.log("Fitting bounds based on detailed route geometry.");
        }
        else {
            // Fallback: Use key points (origin, destination, current, basic route)
            console.log("Fitting bounds based on key points (fallback).");
            const originCoords = getLocationCoords(origin);
            const destinationCoords = getLocationCoords(destination);
            const currentLocationCoords = currentLocation ? getLocationCoords(currentLocation) : null;

            if (originCoords && originCoords.join() !== '0,0') pointsForBounds.push(originCoords); // Avoid default [0,0] if possible
            if (destinationCoords && destinationCoords.join() !== '0,0') pointsForBounds.push(destinationCoords);
            if (currentLocationCoords && currentLocationCoords.join() !== '0,0') pointsForBounds.push(currentLocationCoords);

            // Add basic route waypoints if no detailed route
            (shipment.route || []).forEach(loc => {
                const coords = getLocationCoords(loc);
                // Check if coords are valid and not the default [0,0] before adding
                if (coords && coords.join() !== '0,0') {
                     // Check if it's already added (e.g., origin/dest might be in basic route too)
                     if (!pointsForBounds.some(p => p[0] === coords[0] && p[1] === coords[1])) {
                          pointsForBounds.push(coords);
                     }
                }
            });
        }

        // Only fit bounds if we have valid points
        if (pointsForBounds.length > 0) {
            const bounds = L.latLngBounds(pointsForBounds);
            if (bounds.isValid()) {
                 // Fit map view to the calculated bounds with padding
                 mapRef.current.fitBounds(bounds, { padding: [50, 50] }); // 50px padding
            } else if (pointsForBounds.length === 1) {
                // If only one point, center view on it
                 mapRef.current.setView(pointsForBounds[0], 10); // Zoom level 10
            }
        }
        // No else needed - MapContainer's initial center/zoom handles the initial state

    }, [shipment]); // Re-run this effect when the shipment prop changes


    // --- Render Logic ---

    // Display placeholder if no shipment is selected
    if (!shipment) {
        return (
            <div style={{ height: '500px', width: '100%', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', border: '1px dashed #ced4da', borderRadius: '4px', textAlign: 'center', padding: '20px' }}>
                <p style={{ color: '#6c757d', margin: 0 }}>Select a shipment from the table to view its location and route on the map.</p>
            </div>
        );
    }

    // Prepare coordinates for markers (origin, destination, current)
    const originCoords = getLocationCoords(shipment.origin);
    const destinationCoords = getLocationCoords(shipment.destination);
    const currentLocationCoords = shipment.currentLocation ? getLocationCoords(shipment.currentLocation) : null;

    // Prepare fallback coordinates for the straight polyline
    const routePathCoordsFallback = (shipment.route || [])
        .map(loc => getLocationCoords(loc))
        // Filter out null/invalid coordinates and potentially the default [0,0]
        .filter(coords => coords && coords.join() !== '0,0');

    // Check if the detailed route geometry from the backend is valid
    const hasDetailedRoute = shipment.detailedRouteGeometry &&
                             shipment.detailedRouteGeometry.type === 'LineString' &&
                             Array.isArray(shipment.detailedRouteGeometry.coordinates) &&
                             shipment.detailedRouteGeometry.coordinates.length > 0;

    // Determine map center and initial zoom (used if bounds fitting fails or on initial load)
    const mapCenter = originCoords && originCoords.join() !== '0,0' ? originCoords :
                     currentLocationCoords && currentLocationCoords.join() !== '0,0' ? currentLocationCoords :
                     [20, 0]; // Default latitude/longitude if no valid points
    const initialZoom = (originCoords && originCoords.join() !== '0,0') || (currentLocationCoords && currentLocationCoords.join() !== '0,0') ? 5 : 2;

    // --- Define Styles for the Routes ---
    const detailedRouteStyle = {
        color: '#0d6efd', // Bootstrap primary blue
        weight: 5,
        opacity: 0.8,
    };
    const fallbackRouteStyle = {
        color: '#6c757d', // Bootstrap secondary grey
        weight: 3,
        opacity: 0.65,
        dashArray: '8, 8' // Dashed line style
    };

    // --- Render the Map ---
    return (
        // Container div must have a defined height for the map to render
        <div style={{ height: '500px', width: '100%', marginTop: '20px', border: '1px solid #dee2e6', borderRadius: '4px', overflow: 'hidden' }}>
            <MapContainer
                center={mapCenter}
                zoom={initialZoom}
                style={{ height: '100%', width: '100%' }}
                // Store the map instance in the ref when it's created
                whenCreated={mapInstance => { mapRef.current = mapInstance; }}
                scrollWheelZoom={true} // Allow zooming with scroll wheel
            >
                {/* Base Tile Layer (OpenStreetMap) */}
                <TileLayer
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & Routing by <a href="http://project-osrm.org/">OSRM</a>' // Add OSRM attribution
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* --- Markers --- */}
                {/* Origin Marker */}
                {originCoords && originCoords.join() !== '0,0' && (
                    <Marker position={originCoords}>
                        <Popup>Origin: {shipment.origin?.name || 'Unknown'}</Popup>
                    </Marker>
                )}
                {/* Destination Marker */}
                {destinationCoords && destinationCoords.join() !== '0,0' && (
                    <Marker position={destinationCoords}>
                        <Popup>Destination: {shipment.destination?.name || 'Unknown'}</Popup>
                    </Marker>
                )}
                {/* Current Location Marker */}
                {currentLocationCoords && currentLocationCoords.join() !== '0,0' && (
                    <Marker position={currentLocationCoords} icon={currentLocationIcon}>
                        <Popup>
                            Current Location: {shipment.currentLocation?.name || 'Unknown'} <br />
                            {shipment.currentLocation?.timestamp ? `Reported: ${new Date(shipment.currentLocation.timestamp).toLocaleString()}` : ''}
                        </Popup>
                    </Marker>
                )}
                {/* Optional: Markers for basic route waypoints (can be hidden if detailed route exists) */}
                {/* {!hasDetailedRoute && (shipment.route || []).map((loc, index) => {
                     // ... (existing waypoint marker logic if needed) ...
                })} */}


                {/* --- Conditional Route Rendering --- */}
                {hasDetailedRoute ? (
                    // Render the detailed route using GeoJSON
                    <GeoJSON
                        // Use shipment ID in key to force re-render when shipment changes
                        key={shipment._id + '-detailed-route'}
                        data={shipment.detailedRouteGeometry} // Pass the GeoJSON object
                        style={detailedRouteStyle} // Apply specific style
                    />
                ) : (
                    // Fallback: Render straight dashed lines if no detailed route
                    routePathCoordsFallback.length > 1 && (
                        <Polyline
                             key={shipment._id + '-fallback-route'}
                            positions={routePathCoordsFallback} // Array of [lat, lng]
                            pathOptions={fallbackRouteStyle} // Apply fallback style
                        />
                    )
                )}
                 {/* --- End Conditional Route Rendering --- */}

            </MapContainer>
        </div>
    );
};

export default MapDisplay;