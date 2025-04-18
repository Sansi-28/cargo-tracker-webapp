import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store'; // Import the Redux store
import App from './App';
import './index.css'; // Global CSS

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}> {/* Wrap App with Redux Provider */}
      <App />
    </Provider>
  </React.StrictMode>
);