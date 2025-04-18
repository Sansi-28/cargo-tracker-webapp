import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { formatDateTime, formatLocation } from '../utils/helpers';
import { updateLocation } from '../features/shipments/shipmentsSlice';
import './ShipmentDetails.css';

const ShipmentDetails = ({ shipment }) => {
    const dispatch = useDispatch();
    const [newLocationName, setNewLocationName] = useState('');
    const [newLatitude, setNewLatitude] = useState('');
    const [newLongitude, setNewLongitude] = useState('');
    const [isUpdating, setIsUpdating] = useState(false); // For showing update form
    const [updateError, setUpdateError] = useState('');

    if (!shipment) {
        return <div className="shipment-details-placeholder">Select a shipment from the table to see details.</div>;
    }

    const handleUpdateLocationSubmit = (e) => {
        e.preventDefault();
         setUpdateError(''); // Clear previous errors
        if (!newLocationName.trim()) {
            setUpdateError('New location name cannot be empty.');
            return;
        }

        const locationData = {
            locationName: newLocationName.trim(),
            // Only include lat/lon if they are valid numbers
            ...(newLatitude !== '' && !isNaN(parseFloat(newLatitude)) && { latitude: parseFloat(newLatitude) }),
            ...(newLongitude !== '' && !isNaN(parseFloat(newLongitude)) && { longitude: parseFloat(newLongitude) })
        };


        // Dispatch the update action
         dispatch(updateLocation({ id: shipment._id, locationData }))
            .unwrap() // Use unwrap to handle promise result directly
            .then(() => {
                // Success: Clear form and hide it
                setNewLocationName('');
                setNewLatitude('');
                setNewLongitude('');
                setIsUpdating(false);
                setUpdateError('');
                alert('Location updated successfully!'); // Simple feedback
            })
            .catch((err) => {
                 // Error: Display error message
                 setUpdateError(err || 'Failed to update location. Please try again.');
                  console.error("Update location failed:", err);
            });

    };


    return (
        <div className="shipment-details">
            <h3>Details for Shipment: {shipment.trackingId}</h3>
            <div className="details-grid">
                <p><strong>Container ID:</strong> {shipment.containerId}</p>
                <p><strong>Status:</strong> <span className={`status-badge status-${shipment.status?.toLowerCase().replace(' ', '-')}`}>{shipment.status}</span></p>
                <p><strong>Origin:</strong> {formatLocation(shipment.origin)}</p>
                <p><strong>Destination:</strong> {formatLocation(shipment.destination)}</p>
                <p><strong>Current Location:</strong> {formatLocation(shipment.currentLocation)}</p>
                <p><strong>Last Update:</strong> {formatDateTime(shipment.currentLocation?.timestamp)}</p>
                <p><strong>Estimated ETA:</strong> {formatDateTime(shipment.estimatedETA)}</p>
                <p><strong>Created:</strong> {formatDateTime(shipment.createdAt)}</p>
                {shipment.actualDeliveryDate && <p><strong>Delivered On:</strong> {formatDateTime(shipment.actualDeliveryDate)}</p>}
                 {shipment.notes && <p><strong>Notes:</strong> {shipment.notes}</p>}
            </div>

            {/* Location Update Section */}
            <div className="location-update-section">
                <button onClick={() => setIsUpdating(!isUpdating)} disabled={shipment.status === 'Delivered'}>
                    {isUpdating ? 'Cancel Update' : 'Update Location Manually'}
                </button>

                {isUpdating && shipment.status !== 'Delivered' && (
                    <form onSubmit={handleUpdateLocationSubmit} className="update-form">
                        <h4>Enter New Location:</h4>
                        <div className="form-group">
                            <label htmlFor="newLocationName">Location Name*:</label>
                            <input
                                type="text"
                                id="newLocationName"
                                value={newLocationName}
                                onChange={(e) => setNewLocationName(e.target.value)}
                                required
                            />
                        </div>
                         <div className="form-group">
                            <label htmlFor="newLatitude">Latitude (Optional):</label>
                            <input
                                type="number"
                                step="any" // Allows decimals
                                id="newLatitude"
                                value={newLatitude}
                                onChange={(e) => setNewLatitude(e.target.value)}
                            />
                        </div>
                         <div className="form-group">
                            <label htmlFor="newLongitude">Longitude (Optional):</label>
                            <input
                                 type="number"
                                 step="any"
                                 id="newLongitude"
                                 value={newLongitude}
                                 onChange={(e) => setNewLongitude(e.target.value)}
                            />
                        </div>
                         {updateError && <p className="error-message">{updateError}</p>}
                        <button type="submit">Submit Update</button>
                    </form>
                )}
                 {shipment.status === 'Delivered' && <p><em>Cannot update location for delivered shipments.</em></p>}
            </div>
        </div>
    );
};

export default ShipmentDetails;