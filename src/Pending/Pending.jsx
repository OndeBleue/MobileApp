import React, { Component } from 'react';
import moment from 'moment';
import Countdown from 'react-countdown-now';
import { isRunning, nextOccurrence, previousOccurrence } from '../schedule';
import { numberFormat } from '../utils';

import settings from './settings.png';

import './Pending.css';
import { countConnectedUsers, saveError } from "../api";
import { apiLogger } from "../logger";

class Pending extends Component {
  constructor(props) {
    super(props);

    this.state = {
      count: null,
    };
  }

  componentDidMount() {
    if (isRunning()) {
      return this.props.history.push('/propagate');
    }

    if (moment().isSame(previousOccurrence(), 'day')) {
      countConnectedUsers().promise.then((res) => {
        if (Array.isArray(res.data._items) && res.data._items.length > 0) {
          this.setState({ count: res.data._items[0].connected_users });
        }
      }).catch((reason) => {
        if (!reason.isCanceled) {
          apiLogger.error(reason);
          saveError({ from:'connected users today', reason });
        }
      })
    }
  }

  navigateToSettings = () => {
    this.props.history.push('/settings');
  };

  countdownRenderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      this.props.history.push('/propagate');
      return null;
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

  renderParticipation = () => {
    return <div className="users-today">Merci pour votre participation. Aujourd'hui, nous étions {numberFormat(this.state.count)} connectés.</div>
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
        {this.state.count && this.renderParticipation()}
      </div>
    );
  }
}

export default Pending;
