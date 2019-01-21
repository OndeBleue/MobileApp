import React from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";

import Login from './Login/Login.jsx';
import Map from './Map/Map.jsx';
import Settings from './Settings/Settings.jsx';
import Page404 from './Page404/Page404.jsx';
import './AppRouter.css';

const AppRouter = () => (
  <Router>
    <div className="App">
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
      <Switch>
      <Route path="/login" exact component={Login} />
      <Route path="/settings" component={Settings} />
      <Route path="/map" component={Map} />
      <Route component={Page404} />
      </Switch>
    </div>
  </Router>
);

export default AppRouter;
