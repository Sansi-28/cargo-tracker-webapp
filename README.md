# Cargo Tracker Web Application (Frontend)

This is the React frontend for the MERN Cargo Shipment Tracker application. It displays shipment data, allows adding new shipments, and visualizes shipment routes and locations on a map.

## Features

*   Dashboard displaying all shipments in a filterable table.
*   Interactive map (`react-leaflet`) showing shipment route, origin, destination, and current location.
*   Display of shipment details including status, ETA, and location history.
*   Modal form to add new shipments.
*   Ability to manually update a shipment's location (primarily for demo purposes).
*   State management using Redux Toolkit.

## Prerequisites

*   Node.js (v14 or later recommended)
*   npm or yarn
*   The backend server (`cargo-tracker-backend`) must be running and accessible.

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-frontend-repo-url> cargo-tracker-webapp
    cd cargo-tracker-webapp
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Create Environment File:**
    Create a `.env` file in the root directory and specify the backend API URL:
    ```dotenv
    # URL of the running backend API service
    REACT_APP_API_URL=http://localhost:5001/api
    ```
    *(Adjust the URL and port if your backend runs elsewhere)*

## Running the Application

*   **Development Mode:**
    ```bash
    npm start
    # or
    # yarn start
    ```
    This will usually open the application in your default browser at `http://localhost:3000`.

*   **Production Build:**
    ```bash
    npm run build
    # or
    # yarn build
    ```
    This creates an optimized static build in the `build/` folder, which can then be served by a static web server (like Nginx, Netlify, Vercel, etc.).

## Key Libraries Used

*   React
*   Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) for state management.
*   React Router (`react-router-dom`) for navigation (currently basic).
*   Axios for making API requests.
*   Leaflet & React Leaflet (`leaflet`, `react-leaflet`) for map integration.

## Assumptions & Notes

*   **Map Coordinates:** The map relies on having latitude and longitude for locations. The `getLocationCoords` utility function currently uses **predefined coordinates** for common cities as a fallback if coordinates are missing in the data from the backend. **In a real application, ensure coordinates are always captured and stored, or implement a robust geocoding service.**
*   **Map Markers:** Default Leaflet markers are used. You might want to customize icons for origin, destination, and current location.
*   **Styling:** Basic CSS is provided for layout and component styling. You can replace or enhance this with CSS frameworks (like Material UI, Tailwind CSS, Bootstrap) or more detailed custom CSS.
*   **Error Handling:** Basic error handling is implemented (displaying messages from Redux state). More user-friendly error notifications could be added.
*   **Filtering/Sorting:** Only filtering by status is implemented in the table. Sorting functionality could be added.
*   **Route Input:** The "Add Shipment" form uses a simple comma-separated text input for route waypoints. A more user-friendly interface (e.g., adding/removing location inputs with coordinate fields or a map picker) would be better for production.
*   **Location Update:** The manual location update feature is mainly for demonstration. In a real system, location updates would typically come from automated sources (GPS trackers, shipping line APIs).

## Future Enhancements and Improvements

This application provides a solid foundation for cargo shipment tracking. However, several features could be added to enhance its realism, efficiency, and usefulness in a production environment. Here are some potential areas for future development:

**1. Realistic Map Routing & ETA Calculation:**

*   **Enhancement:** Integrate with a real routing engine (e.g., OSRM, Mapbox, Google Maps Directions) to display actual road/sea routes instead of straight lines. Use the distance/duration data from the routing service, potentially combined with traffic or other factors, to calculate much more accurate ETAs.
*   **Benefit:** Provides visually accurate routes and significantly more reliable delivery predictions.
*   **Challenge:** Adds API integration complexity, potential API costs, and requires choosing between backend vs. frontend route calculation.

**2. Real-Time Updates & Automation:**

*   **Enhancement:** Replace manual location updates with real-time data streams from IoT GPS devices or Carrier APIs. Implement WebSockets for live frontend updates. Use Geofencing to automate status changes based on location.
*   **Benefit:** Provides up-to-the-minute tracking, reduces manual work, enables automated workflows.
*   **Challenge:** Significant integration effort with external systems/protocols, requires robust backend infrastructure, potential data costs.

**3. Authentication & Authorization:**

*   **Enhancement:** Implement user login/registration (e.g., using JWT) and role-based access control to secure shipment data and restrict actions based on user roles (admin, shipper, etc.).
*   **Benefit:** Essential security for protecting sensitive data in any real-world deployment.
*   **Challenge:** Adds significant development effort across the stack, requires careful security implementation.

**4. Advanced Data Handling & Display:**

*   **Enhancement:** Add advanced filtering (date ranges, location), sorting, and full-text search capabilities to the shipment list. Implement backend pagination to efficiently handle large numbers of shipments.
*   **Benefit:** Improves usability and performance, especially as the dataset grows.
*   **Challenge:** Requires backend API and database query optimization, adds frontend UI/state complexity.

**5. Richer Data Model & Event Logging:**

*   **Enhancement:** Expand the `Shipment` model with more details (cargo type, carrier, vessel). Add a detailed, timestamped `eventLog` array to track the history of each shipment. Potentially allow associating documents.
*   **Benefit:** Provides a more complete shipment record and a valuable audit trail.
*   **Challenge:** Increases schema/database complexity. Document handling adds file storage requirements.

**6. Geocoding:**

*   **Enhancement:** Allow users to enter addresses for origin/destination instead of coordinates, using a geocoding service to automatically find the latitude/longitude.
*   **Benefit:** Improves the user experience when creating shipments.
*   **Challenge:** Adds external API dependency and potential costs.

**7. Notifications:**

*   **Enhancement:** Implement automated in-app, email, or SMS notifications for key events like delays, arrivals, or delivery confirmations.
*   **Benefit:** Keeps users proactively informed.
*   **Challenge:** Requires backend logic for triggering notifications and integration with notification services (potential costs).

These enhancements represent potential directions for evolving the application into a more comprehensive and robust logistics tool. Contributions or further development could focus on these areas based on specific requirements.

## (Optional) Dockerization

Instructions for Docker would go here if implemented.