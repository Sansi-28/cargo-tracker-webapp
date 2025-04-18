import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectFilteredShipments, selectShipmentStatus, selectShipmentError, selectShipment, setFilterStatus, selectFilterStatus } from '../features/shipments/shipmentsSlice';
import { formatDateTime, formatLocation } from '../utils/helpers';
import './ShipmentTable.css'; // Create basic CSS for styling

const ShipmentTable = ({ onRowClick }) => {
  const dispatch = useDispatch();
  const shipments = useSelector(selectFilteredShipments);
  const status = useSelector(selectShipmentStatus);
  const error = useSelector(selectShipmentError);
  const currentFilter = useSelector(selectFilterStatus);

  const handleFilterChange = (e) => {
      dispatch(setFilterStatus(e.target.value));
  }

  const shipmentStatuses = ['all', 'Pending', 'In Transit', 'Delivered', 'Delayed', 'Cancelled']; // Match backend Enum

  if (status === 'loading') {
    return <p>Loading shipments...</p>;
  }

  if (status === 'failed') {
    return <p>Error loading shipments: {error}</p>;
  }

  return (
    <div className="shipment-table-container">
       <h2>Shipment Overview</h2>
       <div className="filter-container">
            <label htmlFor="status-filter">Filter by Status: </label>
            <select id="status-filter" value={currentFilter} onChange={handleFilterChange}>
                {shipmentStatuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>)}
            </select>
       </div>
      <table>
        <thead>
          <tr>
            <th>Tracking ID</th>
            <th>Container ID</th>
            <th>Origin</th>
            <th>Destination</th>
            <th>Current Location</th>
            <th>Status</th>
            <th>Est. ETA</th>
            {/* Add more columns like Created At if needed */}
          </tr>
        </thead>
        <tbody>
          {shipments.length === 0 ? (
            <tr>
              <td colSpan="7">No shipments found{currentFilter !== 'all' ? ` with status '${currentFilter}'` : ''}.</td>
            </tr>
          ) : (
            shipments.map((shipment) => (
              <tr key={shipment._id} onClick={() => onRowClick(shipment._id)} className="clickable-row">
                <td>{shipment.trackingId}</td>
                <td>{shipment.containerId}</td>
                <td>{formatLocation(shipment.origin)}</td>
                <td>{formatLocation(shipment.destination)}</td>
                <td>{formatLocation(shipment.currentLocation)}</td>
                <td><span className={`status-badge status-${shipment.status?.toLowerCase().replace(' ', '-')}`}>{shipment.status}</span></td>
                <td>{formatDateTime(shipment.estimatedETA)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ShipmentTable;