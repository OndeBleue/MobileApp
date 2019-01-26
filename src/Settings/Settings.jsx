import React, { Component } from "react";
import { Link } from "react-router-dom";
import { disconnect } from "../storage";

import logo from "./logo.png";

import "./Settings.css";

class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
    }
  }

  handleDisconnect = () => {
    disconnect();
    this.props.history.push('/login');
  };

  handleProfileUpdate = (event) => {
    event.preventDefault();
  };

  handleNameChange = (event) => {
    this.setState({ name: event.target.value });
  };

  render() {
    return(
      <div className="settings">
        <img src={logo} alt="logo" className="logo" />
        <form className="form profile-form" onSubmit={this.handleProfileUpdate}>
          <label htmlFor="name">Mon nom :</label>
          <input id="name" type="text" value={this.state.name} onChange={this.handleNameChange} required />
          <button type="submit">OK</button>
        </form>

        <button className="button disconnect-button" onClick={this.handleDisconnect}>Se déconnecter</button>

        <div className="links">
        <Link to="/propagate">Retourner à la carte</Link>
        </div>
      </div>
    );
  }
}

export default Settings;
