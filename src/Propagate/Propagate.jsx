import React, { Component } from "react";
import { Map, TileLayer } from 'react-leaflet';

import faCog from './cog-solid.png';

import 'leaflet/dist/leaflet.css';
import "./Propagate.css";

class Propagate extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
     lat: 45.1326, 
     lng: 5.7266,
     zoom: 13
    };
  }

  navigateToSettings = () => {
    this.props.history.push('/settings');
  };

  render() {
    const position = [this.state.lat, this.state.lng];
    return(
      <div className="propagate">
        <div className="toolbar">
          <img src={faCog} alt="settings" onClick={this.navigateToSettings} />
        </div>
        <Map center={position} zoom={this.state.zoom} className="leafletmap" >
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </Map>
      </div>
    );
  }
}

export default Propagate;
