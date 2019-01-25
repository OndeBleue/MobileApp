import React, { Component } from "react";
import { withAlert } from 'react-alert';
import { Redirect } from "react-router-dom";
import { createUser, login } from './actions.js';
import { apiLogger } from "../logger.js";
import { storeUser, restoreIdentifier } from "../storage.js";

import "./Login.css";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      identifier: '',
    };
  }
  
  componentDidMount() {
    if (this.isAuthenticated()) {
      this.props.history.push('/propagate');
    }
  }
  
  isAuthenticated() {
    return !!restoreIdentifier();
  }

  handleLogon = async (event) => {
    event.preventDefault();
    try {
      const response = await createUser(this.state.name);
      apiLogger.info(response);
      storeUser(response.data);

      this.props.alert.success(`Bienvenue ${this.state.name} !`);
      this.props.history.push('/propagate');
    } catch (error) {
      apiLogger.error(error);
      this.props.alert.error(`Impossible de créer le compte.`);
    }
  }
  
  handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await login(this.state.identifier);
      apiLogger.info(response);
      storeUser(response.data);
      
      this.props.alert.success(`De retour, ${response.data.name} !`);
      this.props.history.push('/propagate');
    } catch (error) {
      apiLogger.error(error);
      this.props.alert.error(`Connexion impossible, vérifiez votre identifiant.`);
    }
  }
  
  handleNameChange = (event) => {
    this.setState({ name: event.target.value });
  }
  
  handleIdentifierChange = (event) => {
    this.setState({ identifier: event.target.value });
  }
  
  render() {
    return(
      <div className="login">
        <img src="logo.png" alt="logo" />
        <h3>L'Onde Bleue</h3>
        <form className="login-form" onSubmit={this.handleLogon}>
          <label htmlFor="name">Je me connecte pour la première fois</label>
          <input id="name" placeholder="Mon nom" type="text" value={this.state.name} onChange={this.handleNameChange} />
          <button type="submit">OK</button>
        </form>
        <form className="login-form" onSubmit={this.handleLogin}>
          <label htmlFor="identifier">Je suis déjà enregistré(e)</label>
          <input id="identifier" placeholder="Mon numéro" type="number" value={this.state.identifier} onChange={this.handleIdentifierChange} />
          <button type="submit">OK</button>
        </form>
      </div>
    );
  }
}

export default withAlert(Login);
