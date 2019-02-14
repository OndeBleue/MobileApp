import React from "react";
import { Route, Redirect } from "react-router-dom";
import Storage from "../storage.js";

const storage = new Storage();

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    storage.isAuthenticated() === true
      ? <Component {...props} />
      : <Redirect to='/login' />
  )} />
);

export default PrivateRoute;
