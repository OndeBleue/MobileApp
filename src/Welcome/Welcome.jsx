import React, { Component } from 'react';
import Storage from '../storage';

import settings from './settings.png';
import arrowForward from './arrow_forward.png';

import './Welcome.css';

const storage = new Storage();

class Welcome extends Component {
  handleContinue = () => {
    this.props.history.push('/propagate');
  };

  render() {
    return(
      <div className="welcome">
        <div className="overlay">
          <h1>Bienvenue dans l'onde bleue</h1>
          <p>
            Cette application va vous permettre partager votre position avec les autres manifestants.
            Vous pourrez également voir, sur la carte, où sont les autres et ainsi vous rapprocher de vos voisins.
          </p>
          <p>
            Votre identifiant est le : <span className="identifier">{storage.identifier}</span>.
          </p>
          <p>
            Notez-le car il vous servira à vous reconnecter sur un autre téléphone ou ordinateur.
            Vous pourrez le retrouver en cliquant sur le bouton
            <img className="settings-icon" src={settings} alt={settings} />, en haut à droite de l'application.
          </p>
          <div className="continue" onClick={this.handleContinue}>
            Continuer vers l'application <img src={arrowForward} alt="forward" />
          </div>
        </div>
      </div>
    );
  }
}

export default Welcome;
