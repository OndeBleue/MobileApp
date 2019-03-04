import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import { confirmAlert } from 'react-confirm-alert';
import { getCurrentUser, updateUser, deleteUser } from './actions';
import Storage from '../storage';
import { apiLogger } from '../logger.js';

import logo from './logo.png';
import signOut from './sign-out.png';
import arrowBack from './arrow_back.png';

import './Settings.css';
import 'react-confirm-alert/src/react-confirm-alert.css'

const storage = new Storage();

class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userId: undefined,
      etag: undefined,
      name: '',
    }
  }

  componentDidMount() {
    getCurrentUser().then((response) => {
      const user = response.data;
      if (user._id === storage.id) {
        this.setState({
          userId: user._id,
          etag: user._etag,
          name: user.name
        });
      }
    });
  }

  handleDisconnect = () => {
    confirmAlert({
      title: 'Se déconnecter',
      message: 'Êtes-vous sur de vouloir vous déconnecter ? Avez-vous bien noté votre identifiant avant ?',
      buttons: [
        {
          label: 'Oui',
          onClick: () => {
            storage.disconnect();
            this.props.history.push('/login');
          }
        },
        {
          label: 'Non',
        }
      ]
    });
  };

  handleDeleteAccount = () => {
    confirmAlert({
      title: 'Supprimer mon compte',
      message: "Êtes-vous sur de vouloir vous supprimer votre compte ? Cela supprimera tout l'historique de vos positions. Cette action est irréversible !",
      buttons: [
        {
          label: 'Oui',
          onClick: async () => {
            try {
              await deleteUser(this.state.userId, this.state.etag);
              storage.disconnect();
              this.props.history.push('/login');
              this.props.alert.success(`Au revoir ${this.state.name}. Vous allez nous manquer !`);
            } catch (e) {
              apiLogger.error(e);
              this.props.alert.error('Impossible de supprimer votre compte');
            }
          }
        },
        {
          label: 'Non',
        }
      ]
    });
  };

  handleBackToMap = () => {
    this.props.history.push('/propagate');
  };

  handleProfileUpdate = async (event) => {
    event.preventDefault();
    try {
      const response = await updateUser(this.state.userId, this.state.etag, this.state.name);
      apiLogger.info(response);
      this.setState({ etag: response.data._etag });
      this.props.alert.success(`Votre nom a été mis à jour !`);
    } catch(error) {
      apiLogger.error(error);
      this.props.alert.error(`Impossible de mettre à jour votre nom`);
    }
  };

  handleNameChange = (event) => {
    this.setState({ name: event.target.value });
  };

  render() {
    return(
      <div className="settings">
        <div className="toolbar">
          <img src={arrowBack} alt="back to map" className="back-button" onClick={this.handleBackToMap} />
          <img src={signOut} alt="settings" className="sign-out-button" onClick={this.handleDisconnect} />
        </div>
        <img src={logo} alt="logo" className="logo" />
        <form className="form profile-form" onSubmit={this.handleProfileUpdate}>
          <label htmlFor="name">Mon nom :</label>
          <input id="name" type="text" value={this.state.name} onChange={this.handleNameChange} required />
          <button type="submit">OK</button>
        </form>
        <form className="form profile-form">
          <label htmlFor="identifier">Mon identifiant :</label>
          <input value={storage.identifier} readOnly />
        </form>
        <div onClick={this.handleDeleteAccount} className="delete-account">
          Supprimer mon compte
        </div>
      </div>
    );
  }
}

export default withAlert(Settings);
