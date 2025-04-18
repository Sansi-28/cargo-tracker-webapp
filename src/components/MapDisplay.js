import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getLocationCoords } from '../utils/helpers';

// --- Icon Fix (remains the same) ---
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
});

const currentLocationIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41],
    className: 'current-location-marker'
});
// --- End of icon fix ---


const MapDisplay = ({ shipment }) => {
    const mapRef = useRef(); // Hook 1: Called unconditionally

    // Hook 2: Called unconditionally *before* any early returns
    useEffect(() => {
        // --- Logic inside the effect now handles the 'no shipment' case ---
        if (!shipment || !mapRef.current) {
            // Do nothing if there's no shipment or the map isn't ready yet
            return;
        }

        // --- Calculate bounds and coordinates based on the current shipment ---
        // (This logic is now inside the effect or relies on data derived from shipment)
        const origin = shipment.origin;
        const destination = shipment.destination;
        const currentLocation = shipment.currentLocation;
        const routePoints = shipment.route || [];

        const originCoords = getLocationCoords(origin);
        const destinationCoords = getLocationCoords(destination);
        const currentLocationCoords = currentLocation ? getLocationCoords(currentLocation) : null;
        const routePathCoords = routePoints
            .map(loc => getLocationCoords(loc))
            .filter(coords => coords !== null); // Filter out any invalid coordinates

        const bounds = L.latLngBounds();
        if (originCoords) bounds.extend(originCoords);
        if (destinationCoords) bounds.extend(destinationCoords);
        if (currentLocationCoords) bounds.extend(currentLocationCoords);
        routePathCoords.forEach(coord => bounds.extend(coord));

        // --- Perform map actions ---
        if (bounds.isValid()) {
             // Fit bounds with padding if bounds are valid (multiple points)
             mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        } else if (currentLocationCoords) {
             // If only current location exists, center on it
             mapRef.current.setView(currentLocationCoords, 10); // Adjust zoom level as needed
        } else if (originCoords) {
             // If only origin exists, center on it
             mapRef.current.setView(originCoords, 10);
        }
        // No need for an 'else' for mapRef.current.setView with default coords,
        // MapContainer's initial center/zoom handles the initial state.

    }, [shipment]); // Effect depends only on shipment now

    // --- Conditional Rendering Logic (AFTER all hooks) ---
    if (!shipment) {
        // Return placeholder if no shipment is selected
        return (
            <div style={{ height: '500px', width: '100%', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eee', border: '1px dashed #ccc', borderRadius: '4px' }}>
                <p>Select a shipment from the table to view its location on the map.</p>
            </div>
        );
    }

    // --- Prepare coordinates for rendering (can be recalculated or reused) ---
    // Recalculating here for clarity in the JSX return block
    const originCoords = getLocationCoords(shipment.origin);
    const destinationCoords = getLocationCoords(shipment.destination);
    const currentLocationCoords = shipment.currentLocation ? getLocationCoords(shipment.currentLocation) : null;
    const routePathCoords = (shipment.route || [])
        .map(loc => getLocationCoords(loc))
        .filter(coords => coords !== null);

    // Determine a sensible default center if origin/current are missing
    const mapCenter = originCoords || currentLocationCoords || [20, 0]; // Default to a general world view if no coords
    const initialZoom = (originCoords || currentLocationCoords) ? 5 : 2; // Lower zoom if defaulting

    console.log("Shipment data for map:", shipment);
    // See the raw route array received from backend
    console.log("Raw shipment route:", shipment?.route);
    // See the coordinates calculated for the polyline
    console.log("Calculated routePathCoords:", routePathCoords);
    console.log("Number of points for Polyline:", routePathCoords.length);

    // --- Actual Map Rendering ---
    return (
        <div style={{ height: '500px', width: '100%', marginTop: '20px', border: '1px solid #ccc' }}>
            <MapContainer
                center={mapCenter}
                zoom={initialZoom}
                style={{ height: '100%', width: '100%' }}
                whenCreated={mapInstance => { mapRef.current = mapInstance; }} // Store map instance
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Origin Marker */}
                {originCoords && (
                    <Marker position={originCoords}>
                        <Popup>Origin: {shipment.origin?.name || 'Unknown'}</Popup>
                    </Marker>
                )}

                {/* Destination Marker */}
                {destinationCoords && (
                    <Marker position={destinationCoords}>
                        <Popup>Destination: {shipment.destination?.name || 'Unknown'}</Popup>
                    </Marker>
                )}

                 {/* Route Waypoint Markers */}
                {(shipment.route || []).map((loc, index) => {
                    // Avoid duplicating origin/destination markers if they are part of the route array
                    if (loc.name === shipment.origin?.name || loc.name === shipment.destination?.name) return null;
                    const coords = getLocationCoords(loc);
                    return coords ? (
                        <Marker key={`route-${index}`} position={coords} opacity={0.7}>
                            <Popup>Waypoint: {loc.name}</Popup>
                        </Marker>
                    ) : null;
                })}

                {/* Current Location Marker */}
                {currentLocationCoords && (
                    <Marker position={currentLocationCoords} icon={currentLocationIcon}>
                        <Popup>
                            Current Location: {shipment.currentLocation?.name || 'Unknown'} <br />
                            {shipment.currentLocation?.timestamp ? `Reported: ${new Date(shipment.currentLocation.timestamp).toLocaleString()}` : ''}
                        </Popup>
                    </Marker>
                )}

                {/* Route Polyline */}
                {routePathCoords.length > 1 && (
                    <Polyline positions={routePathCoords} color="blue" weight={3} opacity={0.7} />
                )}

            </MapContainer>
        </div>
    );
};

export default MapDisplay;

