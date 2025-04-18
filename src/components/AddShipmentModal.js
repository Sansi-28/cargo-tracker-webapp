import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createNewShipment } from '../features/shipments/shipmentsSlice';
import './AddShipmentModal.css'; // Create CSS for modal styling

const AddShipmentModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [containerId, setContainerId] = useState('');
  const [originName, setOriginName] = useState('');
  const [originLat, setOriginLat] = useState('');
  const [originLon, setOriginLon] = useState('');
  const [destName, setDestName] = useState('');
  const [destLat, setDestLat] = useState('');
  const [destLon, setDestLon] = useState('');
  const [routeText, setRouteText] = useState(''); // Simple text input for route for now
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic Validation
    if (!containerId || !originName || !destName) {
        setError('Container ID, Origin Name, and Destination Name are required.');
        setIsLoading(false);
        return;
    }

    // --- Prepare Data ---
    const origin = {
        name: originName.trim(),
        ...(originLat !== '' && !isNaN(parseFloat(originLat)) && { latitude: parseFloat(originLat) }),
        ...(originLon !== '' && !isNaN(parseFloat(originLon)) && { longitude: parseFloat(originLon) })
    };

    const destination = {
        name: destName.trim(),
        ...(destLat !== '' && !isNaN(parseFloat(destLat)) && { latitude: parseFloat(destLat) }),
        ...(destLon !== '' && !isNaN(parseFloat(destLon)) && { longitude: parseFloat(destLon) })
    };

    // Parse route (simple comma-separated names for this example)
    // Production: Needs better UI (add/remove locations with coords)
    const route = routeText.split(',')
                        .map(name => name.trim())
                        .filter(name => name !== '')
                        .map(name => ({ name })); // Create basic location objects

     const shipmentData = {
        containerId: containerId.trim(),
        origin,
        destination,
        route, // Pass the parsed route array
        notes: notes.trim() || undefined // Don't send empty notes
     };

    dispatch(createNewShipment(shipmentData))
        .unwrap()
        .then(() => {
            // Success
            handleClose(); // Close modal on success
            alert('Shipment created successfully!'); // Simple feedback
        })
        .catch((err) => {
             setError(err || 'Failed to create shipment. Please check inputs.');
             console.error("Create shipment failed:", err);
        })
        .finally(() => {
            setIsLoading(false);
        });
  };

  const handleClose = () => {
      // Reset form state when closing
      setContainerId('');
      setOriginName('');
      setOriginLat('');
      setOriginLon('');
      setDestName('');
      setDestLat('');
      setDestLon('');
      setRouteText('');
      setNotes('');
      setError('');
      setIsLoading(false);
      onClose(); // Call the parent's close handler
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Shipment</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          {/* Container ID */}
          <div className="form-group">
            <label htmlFor="containerId">Container ID*:</label>
            <input type="text" id="containerId" value={containerId} onChange={(e) => setContainerId(e.target.value)} required />
          </div>

          {/* Origin */}
          <fieldset>
              <legend>Origin*</legend>
               <div className="form-group">
                    <label htmlFor="originName">Name:</label>
                    <input type="text" id="originName" value={originName} onChange={(e) => setOriginName(e.target.value)} required />
                </div>
                 <div className="coords-group">
                    <div className="form-group">
                        <label htmlFor="originLat">Latitude:</label>
                        <input type="number" step="any" id="originLat" value={originLat} onChange={(e) => setOriginLat(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="originLon">Longitude:</label>
                        <input type="number" step="any" id="originLon" value={originLon} onChange={(e) => setOriginLon(e.target.value)} />
                    </div>
                </div>
          </fieldset>

          {/* Destination */}
           <fieldset>
              <legend>Destination*</legend>
               <div className="form-group">
                    <label htmlFor="destName">Name:</label>
                    <input type="text" id="destName" value={destName} onChange={(e) => setDestName(e.target.value)} required />
                </div>
                 <div className="coords-group">
                    <div className="form-group">
                        <label htmlFor="destLat">Latitude:</label>
                        <input type="number" step="any" id="destLat" value={destLat} onChange={(e) => setDestLat(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="destLon">Longitude:</label>
                        <input type="number" step="any" id="destLon" value={destLon} onChange={(e) => setDestLon(e.target.value)} />
                    </div>
                </div>
          </fieldset>

            {/* Route */}
           <div className="form-group">
               <label htmlFor="routeText">Route Waypoints (Optional, comma-separated names):</label>
               <input type="text" id="routeText" value={routeText} onChange={(e) => setRouteText(e.target.value)} placeholder="e.g., Rotterdam, Singapore" />
                <small>Origin & Destination are added automatically.</small>
           </div>

           {/* Notes */}
           <div className="form-group">
               <label htmlFor="notes">Notes (Optional):</label>
               <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows="3"></textarea>
           </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Shipment'}
            </button>
            <button type="button" onClick={handleClose} disabled={isLoading}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddShipmentModal;