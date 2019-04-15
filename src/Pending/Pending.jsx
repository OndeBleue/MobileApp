import React, { Component } from 'react';
import moment from 'moment';
import Countdown from 'react-countdown-now';
import { isRunning, nextOccurrence, previousOccurrence } from '../schedule';

import settings from './settings.png';

import './Pending.css';

class Pending extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (isRunning()) {
      return this.props.history.push('/propagate');
    }
  }

  updateRemaining = () => {
    if (isRunning()) {
      return this.props.history.push('/propagate');
    }

    const next = nextOccurrence();
    console.log(previousOccurrence(), next);
    const delay = moment().diff(next);
    this.setState({ remaining: moment.duration(delay).humanize() });
  };

  navigateToSettings = () => {
    this.props.history.push('/settings');
  };

  countdownRenderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      return this.props.history.push('/propagate');
    }
    if (days) {
      return <span>{days} jours {hours} heures et {minutes} minutes</span>;
    }
    if (hours) {
      return <span>{hours} heures et {minutes} minutes</span>;
    }
    if (minutes) {
      return <span>{minutes} minutes et {seconds} secondes</span>;
    }
    return <span>{seconds} secondes</span>;
  };

  render() {
    const next = nextOccurrence();
    return (
      <div className="pending">
        <div className="toolbar">
          <img src={settings} alt="settings" onClick={this.navigateToSettings} />
        </div>
        <div className="remaining">
          Propagation de l'Onde bleue dans&nbsp;
          <Countdown date={next} renderer={this.countdownRenderer} />
        </div>
        <div className="clock">
          <div className="top"/>
          <div className="right"/>
          <div className="bottom"/>
          <div className="left"/>
          <div className="center"/>
          <div className="shadow"/>
          <div className="hour"/>
          <div className="minute"/>
          <div className="second"/>
        </div>
      </div>
    );
  }
}

export default Pending;
