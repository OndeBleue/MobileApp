import React from "react";
import { BrowserRouter as Router, Route, Redirect, Switch } from "react-router-dom";

import Login from '../Login/Login.jsx';
import Propagate from '../Propagate/Propagate.jsx';
import Settings from '../Settings/Settings.jsx';
import Welcome from '../Welcome/Welcome.jsx';
import Page404 from '../Page404/Page404.jsx';
import PrivateRoute from './PrivateRoute.jsx';

const AppRouter = (props) => (
  <Router basename={DIRECTORY_BASENAME}>
    <div>
      {props.children}
      <Switch>
        <Route path="/login" exact component={Login} />
        <PrivateRoute path="/welcome" component={Welcome} />
        <PrivateRoute path="/settings" component={Settings} />
        <PrivateRoute path="/propagate" component={Propagate} />
        <Redirect from="/" exact to="/login" />
        <Route component={Page404} />
      </Switch>
    </div>
  </Router>
);

export default AppRouter;
