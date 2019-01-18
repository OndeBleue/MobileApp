import React, { Component } from "react";
import "./Login.css";

class Login extends Component {
  render() {
    return(
      <div className="login">
        <img src="logo.png" alt="logo" />
		<form className="login-form">
			<label htmlFor="name">Je me connecte pour la première fois</label>
			<input id="name" placeholder="Mon nom" type="text" />
			<button>OK</button>
		</form>
      </div>
    );
  }
}

export default Login;
