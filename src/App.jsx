import React from "react";
import { Link } from "react-router-dom";
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
          <AppRouter>
            <nav>
              <ul>
                <li>
                  <Link to="/login">Connexion</Link>
                </li>
                <li>
                  <Link to="/settings">Paramètres</Link>
                </li>
                <li>
                  <Link to="/propagate">Carte</Link>
                </li>
              </ul>
            </nav>
          </AppRouter>
        </ErrorBoundary>
      </div>
    </AlertProvider>
);

export default App;
