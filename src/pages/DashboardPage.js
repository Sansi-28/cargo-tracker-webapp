import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchShipments, selectSelectedShipment, selectShipment, clearSelectedShipment } from '../features/shipments/shipmentsSlice';
import ShipmentTable from '../components/ShipmentTable';
import MapDisplay from '../components/MapDisplay';
import ShipmentDetails from '../components/ShipmentDetails';
import AddShipmentModal from '../components/AddShipmentModal'; // Import the modal
import './DashboardPage.css'; // Optional: Add CSS for layout

const DashboardPage = () => {
  const dispatch = useDispatch();
  const selectedShipment = useSelector(selectSelectedShipment);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  // Fetch shipments when the component mounts
  useEffect(() => {
    dispatch(fetchShipments());
  }, [dispatch]);

  // Handle clicking on a table row
  const handleRowClick = (shipmentId) => {
      if (selectedShipment?._id === shipmentId) {
          // If clicking the already selected row, deselect it
          dispatch(clearSelectedShipment());
      } else {
          dispatch(selectShipment(shipmentId)); // Dispatch action to select the shipment
      }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
         <h1>Cargo Shipment Tracker</h1>
         <button onClick={openModal} className="add-shipment-btn">Add New Shipment</button>
      </header>

      {/* Main content area */}
      <div className="content-area">
        {/* Left side: Table */}
        <div className="table-section">
           <ShipmentTable onRowClick={handleRowClick} />
        </div>

        {/* Right side: Map and Details */}
        <div className="details-section">
           <MapDisplay shipment={selectedShipment} />
           <ShipmentDetails shipment={selectedShipment} />
        </div>
      </div>


      {/* Add Shipment Modal */}
      <AddShipmentModal isOpen={isModalOpen} onClose={closeModal} />

    </div>
  );
};

export default DashboardPage;