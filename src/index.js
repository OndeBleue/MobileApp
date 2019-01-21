import React from "react";
import ReactDOM from "react-dom";
import AppRouter from "./AppRouter.js";

ReactDOM.render(<AppRouter />, document.getElementById("root"));

if (module.hot) {
  module.hot.accept('./AppRouter', () => {
    ReactDOM.render(<AppRouter />, document.getElementById("root"));
  });
}

// polyfill of location.origin for IE 
if (!window.location.origin) {
  window.location.origin = window.location.protocol + '//'
  + window.location.hostname
  + (window.location.port ? ':' + window.location.port : '');
}
