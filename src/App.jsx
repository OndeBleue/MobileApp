import React from "react";
import { Provider as AlertProvider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import AppRouter from "./AppRouter/AppRouter.jsx"
import ErrorBoundary from "./ErrorBoundary/ErrorBoundary.jsx"

import './App.css';

// react-alert options
const options = {
  position: 'bottom center',
  timeout: 5000,
  offset: '30px',
  transition: 'scale',
  zIndex: 400
};

const App = () => (
    <AlertProvider template={AlertTemplate} {...options}>
      <div className="App">
        <ErrorBoundary>
          <AppRouter />
        </ErrorBoundary>
      </div>
    </AlertProvider>
);

export default App;
