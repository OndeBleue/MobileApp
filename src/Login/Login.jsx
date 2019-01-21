import React, { Component } from "react";
import "./Login.css";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      identifier: '',
    };
  }

  handleLogon = (event) => {
    event.preventDefault();
    console.log("logon: ", this.state.name);
  }
  
  handleLogin = (event) => {
    event.preventDefault();
    console.log("login: ", this.state.identifier);
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

export default Login;
