import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store.js';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

import './i18n.js'; // Import the i18n configuration
import Banner from './components/HomePage/Banner.jsx';
import Footer from './components/HomePage/Footer.jsx';

const PAYPAL_CLIENT_ID = import.meta.env.REACT_APP_PAYPAL_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID }}>
      <BrowserRouter>
        <Provider store={store}>
          <Banner/>
            <App />
          <Footer/>
        </Provider>
      </BrowserRouter>
    </PayPalScriptProvider>
  </React.StrictMode>,
);
