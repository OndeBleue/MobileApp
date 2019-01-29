import React, { Component } from "react";
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import { withAlert } from "react-alert";
import L from 'leaflet'
import { watchLocation, handleLocationError } from '../location';
import { uiLogger } from '../logger';

import settings from './settings.png';
import me from './me.png';

import 'leaflet/dist/leaflet.css';
import "./Propagate.css";

export const meIcon = new L.Icon({
  iconUrl: me,
  iconAnchor: [12, 27],
  iconSize: [25, 27],
  popupAnchor: [0, -27]
});

class Propagate extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      mapCenter: [46.76, 2,64],
      zoomLevel: 5,
      marker: undefined,
      isPropagating: false,
    };
  }

  componentDidMount() {
    watchLocation((error, location) => {
      if (error && error.name === 'PositionError') {
        uiLogger.error(error);
        return this.props.alert.error(handleLocationError(error));
      }
      this.setState({
        marker: [location.coords.latitude, location.coords.longitude],
        mapCenter: [location.coords.latitude, location.coords.longitude],
        zoomLevel: 13,
      });
    });
  }

  handleLocate = async () => {
    this.setState({
      isPropagating: true,
    });
  };

  navigateToSettings = () => {
    this.props.history.push('/settings');
  };

  render() {
    const { isPropagating } = this.state;
    return(
      <div className="propagate">
        <div className="toolbar">
          <img src={settings} alt="settings" onClick={this.navigateToSettings} />
        </div>
        {!isPropagating &&
          <div className="buttons-bar">
            <button onClick={this.handleLocate}>Je suis là !</button>
          </div>
        }
        <div className={`map-container ${isPropagating ? 'enlarge-map' : ''}`}>
          <Map center={this.state.mapCenter} zoom={this.state.zoomLevel} className="leafletmap" >
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {this.state.marker && isPropagating &&
              <Marker position={this.state.marker} icon={meIcon}>
                <Popup>
                  Je suis là !
                </Popup>
              </Marker>
            }
          </Map>
        </div>
      </div>
    );
  }
}

export default withAlert(Propagate);
