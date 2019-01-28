import React, { Component } from "react";
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import { withAlert } from "react-alert";
import L from 'leaflet'
import { getCurrentLocation, handleLocationError } from '../location';
import { uiLogger } from '../logger';

import settings from './settings.png';
import me from './me.png';

import 'leaflet/dist/leaflet.css';
import "./Propagate.css";

export const meIcon = new L.Icon({
  iconUrl: me,
  iconAnchor: [5, 25],
  iconSize: [25, 25],
});

class Propagate extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
     lat: 45.1326, 
     lng: 5.7266,
     zoom: 13
    };
  }

  handleLocate = async () => {
    try {
      const location = await getCurrentLocation();
      this.setState({
        lat: location.coords.latitude,
        lon: location.coords.longitude,
      });
    } catch (e) {
      if (e.name === 'PositionError') {
        uiLogger.error(e);
        this.props.alert.error(handleLocationError(e));
      }
    }
  };

  navigateToSettings = () => {
    this.props.history.push('/settings');
  };

  render() {
    const position = [this.state.lat, this.state.lng];
    return(
      <div className="propagate">
        <div className="toolbar">
          <img src={settings} alt="settings" onClick={this.navigateToSettings} />
        </div>
        <div className="buttons-bar">
          <button onClick={this.handleLocate}>Je suis là !</button>
        </div>
        <div className="map-container">
          <Map center={position} zoom={this.state.zoom} className="leafletmap" >
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} icon={meIcon}>
              <Popup>
                Je suis là !
              </Popup>
            </Marker>
          </Map>
        </div>
      </div>
    );
  }
}

export default withAlert(Propagate);
