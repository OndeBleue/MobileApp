import React, { Component } from "react";
import { withAlert } from "react-alert";
import Storage from "../storage";
import { getCurrentUser, updateUser } from './actions';
import { apiLogger } from "../logger.js";

import logo from "./logo.png";
import signOut from "./sign-out.png";
import arrowBack from './arrow_back.png';

import "./Settings.css";

class Settings extends Component {
  constructor(props) {
    super(props);

    const storage = new Storage();

    this.state = {
      userId: undefined,
      etag: undefined,
      name: '',
      storage,
    }
  }

  componentDidMount() {
    getCurrentUser().then((response) => {
      const user = response.data;
      this.setState( {
        userId: user._id,
        etag: user._etag,
        name: user.name
      });
    });
  }

  handleDisconnect = () => {
    this.state.storage.disconnect();
    this.props.history.push('/login');
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
      </div>
    );
  }
}

export default withAlert(Settings);
