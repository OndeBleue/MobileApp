import React, { Component } from "react";
import { withAlert } from 'react-alert';
import { uiLogger } from "../logger.js";
import { saveError } from './actions';

import warning from './warning.png';

import './ErrorBoundary.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }


  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    uiLogger.error(error);
    uiLogger.trace(info.componentStack);

    saveError({ error, info });
  }

  handleClickError = () => {
    this.props.alert.error(<div className="error-user-info">Quelque chose d'inattendu s'est produit. <a onClick={this.reloadApp}>Cliquez ici</a> pour recharger l'application.</div>);
  };

  reloadApp = () => {
    window.location.reload(true);
  };

  render() {
    return (
      <div>
        {this.state.hasError && <img className="error-icon" src={warning} alt="error" onClick={this.handleClickError} />}
        {this.props.children}
      </div>
    );
  }
}

export default withAlert(ErrorBoundary);
