import React from "react";
import { Route, Redirect } from "react-router-dom";
import { restoreIdentifier } from "../storage.js";

function isAuthenticated() {
  return !!restoreIdentifier();
}

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    isAuthenticated() === true
      ? <Component {...props} />
      : <Redirect to='/login' />
  )} />
);

export default PrivateRoute;
