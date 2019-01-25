import React from "react";
import { Link } from "react-router-dom";
import AppRouter from "./AppRouter/AppRouter.jsx"

import './App.css';

const App = () => (
    <div className="App">
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
              <Link to="/map">Carte</Link>
            </li>
          </ul>
        </nav>
      </AppRouter>
    </div>
);

export default App;
