import { configureStore } from '@reduxjs/toolkit';
import shipmentsReducer from '../features/shipments/shipmentsSlice';

export const store = configureStore({
  reducer: {
    shipments: shipmentsReducer,
    // Add other reducers here if needed
  },
   // Middleware configuration for handling non-serializable data like Dates (optional but good practice)
   middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            // Ignore these action types
            // ignoredActions: ['your/action/type'],
            // Ignore these field paths in all actions
            ignoredActionPaths: ['meta.arg', 'payload.createdAt', 'payload.updatedAt', 'payload.estimatedETA', 'payload.actualDeliveryDate', 'payload.route.timestamp', 'payload.origin.timestamp', 'payload.destination.timestamp', 'payload.currentLocation.timestamp'],
            // Ignore these paths in the state
            ignoredPaths: ['shipments.list', 'shipments.selectedShipment'],
        },
    }),
});