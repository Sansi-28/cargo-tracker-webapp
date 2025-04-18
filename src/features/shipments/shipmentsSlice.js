import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/shipmentApi'; // Adjust path as needed

// --- Async Thunks ---
export const fetchShipments = createAsyncThunk('shipments/fetchShipments', async (_, { rejectWithValue }) => {
  try {
    const response = await api.fetchShipments();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to fetch shipments');
  }
});

export const fetchShipmentById = createAsyncThunk('shipments/fetchShipmentById', async (id, { rejectWithValue }) => {
  try {
      const response = await api.fetchShipmentById(id);
      return response.data;
  } catch (error) {
      return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to fetch shipment details');
  }
});


export const createNewShipment = createAsyncThunk('shipments/createShipment', async (shipmentData, { rejectWithValue }) => {
    try {
        const response = await api.createShipment(shipmentData);
        return response.data; // Return the newly created shipment
    } catch (error) {
         console.error("Create Shipment Error:", error.response?.data || error.message);
        return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to create shipment');
    }
});

 export const updateLocation = createAsyncThunk('shipments/updateLocation', async ({ id, locationData }, { rejectWithValue }) => {
    try {
        const response = await api.updateShipmentLocation(id, locationData);
        return response.data; // Return the updated shipment
    } catch (error) {
         console.error("Update Location Error:", error.response?.data || error.message);
        return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to update location');
    }
});

// --- Slice Definition ---
const initialState = {
  list: [],
  selectedShipment: null, // To store details of a single shipment for map/detail view
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  selectedStatus: 'all', // For filtering
};

const shipmentsSlice = createSlice({
  name: 'shipments',
  initialState,
  reducers: {
    // Reducer to select a shipment (e.g., when clicking on a table row)
    selectShipment: (state, action) => {
        const shipmentId = action.payload;
        state.selectedShipment = state.list.find(s => s._id === shipmentId || s.trackingId === shipmentId) || null;
    },
    clearSelectedShipment: (state) => {
        state.selectedShipment = null;
    },
     // Reducer for setting filter status
    setFilterStatus: (state, action) => {
        state.selectedStatus = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Shipments
      .addCase(fetchShipments.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchShipments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
         // If a shipment was selected, update its details from the new list
        if (state.selectedShipment) {
            const updatedSelected = state.list.find(s => s._id === state.selectedShipment._id);
            state.selectedShipment = updatedSelected || null;
        }
      })
      .addCase(fetchShipments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
       // Fetch Single Shipment
      .addCase(fetchShipmentById.pending, (state) => {
          state.status = 'loading'; // Consider a different status like 'loading_single' if needed
      })
      .addCase(fetchShipmentById.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.selectedShipment = action.payload;
          // Optional: update the list if the fetched shipment is different
          const index = state.list.findIndex(s => s._id === action.payload._id);
          if (index !== -1) {
              state.list[index] = action.payload;
          } else {
               // If not in list (e.g., direct link access), add it? Or handle separately.
              // state.list.push(action.payload); // Decide if this is desired behavior
          }
      })
      .addCase(fetchShipmentById.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload; // Error specific to fetching single shipment
      })
      // Create Shipment
       .addCase(createNewShipment.pending, (state) => {
            state.status = 'loading'; // Or a specific 'creating' status
       })
      .addCase(createNewShipment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list.unshift(action.payload); // Add new shipment to the beginning of the list
        state.error = null;
      })
      .addCase(createNewShipment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
        // Update Location
       .addCase(updateLocation.pending, (state) => {
            // Optionally indicate loading state for the specific shipment being updated
            state.status = 'loading';
       })
       .addCase(updateLocation.fulfilled, (state, action) => {
            state.status = 'succeeded';
            const updatedShipment = action.payload;
            // Update the shipment in the main list
            const index = state.list.findIndex(s => s._id === updatedShipment._id);
            if (index !== -1) {
                state.list[index] = updatedShipment;
            }
             // Update the selected shipment if it's the one being modified
            if (state.selectedShipment?._id === updatedShipment._id) {
                state.selectedShipment = updatedShipment;
            }
            state.error = null;
        })
        .addCase(updateLocation.rejected, (state, action) => {
             state.status = 'failed';
             // Store error, maybe specific to update action
             state.error = action.payload;
        });
  },
});

export const { selectShipment, clearSelectedShipment, setFilterStatus } = shipmentsSlice.actions;

// --- Selectors ---
export const selectAllShipments = (state) => state.shipments.list;
export const selectShipmentStatus = (state) => state.shipments.status;
export const selectShipmentError = (state) => state.shipments.error;
export const selectSelectedShipment = (state) => state.shipments.selectedShipment;
export const selectFilterStatus = (state) => state.shipments.selectedStatus;

// Selector with filtering applied
export const selectFilteredShipments = (state) => {
    const allShipments = state.shipments.list;
    const filter = state.shipments.selectedStatus;
    if (filter === 'all') {
        return allShipments;
    }
    return allShipments.filter(shipment => shipment.status === filter);
};


export default shipmentsSlice.reducer;