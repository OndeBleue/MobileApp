import 'typeface-news-cycle';
import 'typeface-alegreya';

import React from "react";
import ReactDOM from "react-dom";
import App from "./App.jsx";


ReactDOM.render(<App />, document.getElementById("root"));

if (module.hot) {
  module.hot.accept('./App', () => {
    ReactDOM.render(<App />, document.getElementById("root"));
  });
}

// polyfill of location.origin for IE 
if (!window.location.origin) {
  window.location.origin = window.location.protocol + '//'
  + window.location.hostname
  + (window.location.port ? ':' + window.location.port : '');
}
