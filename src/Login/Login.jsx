import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import { createUser, login, saveError } from '../api';
import { apiLogger } from '../logger';
import Storage from '../storage';

import logo from './logo.png';

import './Login.css';

const storage = new Storage();

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      identifier: '',
      tries: 0,
    };
  }

  componentDidMount() {
    if (storage.isAuthenticated()) {
      const identifier = storage.identifier;
      login(identifier).then(() => {
        this.props.history.push('/propagate');
      }).catch(()=> {
        storage.disconnect();
      });
    }
  }

  handleLogon = async (event) => {
    event.preventDefault();
    try {
      const response = await createUser(this.state.name);
      apiLogger.info(response);
      storage.storeUser(response.data);

      this.props.alert.success(`Bienvenue ${this.state.name} !`);
      this.props.history.push('/welcome');
    } catch (error) {
      apiLogger.error(error);
      saveError({ from:'logon', error });
      this.props.alert.error(`Impossible de créer le compte.`);
    }
  };

  handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await login(this.state.identifier);
      apiLogger.info(response);
      storage.storeUser(response.data);

      this.props.alert.success(`De retour, ${response.data.name} !`);
      this.props.history.push('/propagate');
    } catch (error) {
      apiLogger.error(error);
      saveError({ from:'login', error });
      this.setState({ tries: this.state.tries + 1}, () => {
        if (error.message === 'Network Error' && this.state.tries >= 5) {
          this.props.alert.error(`Trop de tentatives infructueuses, vous pourrez réessayer dans 10 minutes.`);
        } else {
          this.props.alert.error('Connexion impossible, vérifiez votre identifiant.');
        }
      });
    }
  };

  handleNameChange = (event) => {
    this.setState({ name: event.target.value });
  };

  handleIdentifierChange = (event) => {
    this.setState({ identifier: event.target.value });
  };

  render() {
    return(
      <div className="login">
        <img src={logo} alt="logo" className="logo" />
        <h3>L'Onde Bleue</h3>
        <form className="login-form" onSubmit={this.handleLogon}>
          <label htmlFor="name">Je me connecte pour la première fois</label>
          <input id="name" placeholder="Mon nom" type="text" value={this.state.name} onChange={this.handleNameChange} required />
          <button type="submit">OK</button>
        </form>
        <form className="login-form" onSubmit={this.handleLogin}>
          <label htmlFor="identifier">Je suis déjà enregistré(e)</label>
          <input id="identifier" placeholder="Mon numéro" type="number" value={this.state.identifier} onChange={this.handleIdentifierChange} required />
          <button type="submit">OK</button>
        </form>
      </div>
    );
  }
}

export default withAlert(Login);
