import React, { Component } from "react";
import { withAlert } from 'react-alert';
import { uiLogger } from "../logger.js";

class ErrorBoundary extends Component {
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    uiLogger.error(error);
    uiLogger.trace(info.componentStack);

    this.props.alert.error(`Une erreur est survenu : ${error}`);
  }

  render() {
    return this.props.children; 
  }
}

export default withAlert(ErrorBoundary);
