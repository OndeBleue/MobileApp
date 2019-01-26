import React from "react";
import { Route, Redirect } from "react-router-dom";
import { isAuthenticated } from "../storage.js";

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    isAuthenticated() === true
      ? <Component {...props} />
      : <Redirect to='/login' />
  )} />
);

export default PrivateRoute;
