import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Login from '../Login/Login.jsx';
import Map from '../Map/Map.jsx';
import Settings from '../Settings/Settings.jsx';
import Page404 from '../Page404/Page404.jsx';

const AppRouter = (props) => (
  <Router>
    <div>
      {props.children}
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
