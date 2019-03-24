import 'typeface-news-cycle';
import 'typeface-alegreya';

import React from "react";
import ReactDOM from "react-dom";
import App from "./App.jsx";
import { uiLogger } from "./logger";
import { saveError } from "./ErrorBoundary/actions";


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

// webpack plugin for service worker generation
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('dist/service-worker.js', { scope: '/' })
             .then(registration => uiLogger.info('Registered service worker', registration))
             .catch(error => {
               uiLogger.error('Failed to register service worker', error);
               saveError(error);
             });
  });
} else {
  uiLogger.error('Web browser does not support service workers');
}
