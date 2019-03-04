import React, { Component } from 'react';
import './Page404.css';

import logo from './logo.png';

class Page404 extends Component {
  handleRedirect = () => {
    this.props.history.push('/login');
  };

  render() {
    return(
      <div className="page404">
        <h1> Page non trouvée </h1>
        <p>Essayez de vous propager ailleurs ...</p>
        <img src={logo} alt="logo" onClick={this.handleRedirect}/>
      </div>
    );
  }
}

export default Page404;
