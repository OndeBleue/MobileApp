import React, { Component } from "react";
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import { withAlert } from "react-alert";
import L from 'leaflet'
import Location from '../location';
import { uiLogger } from '../logger';

import settings from './settings.png';
import me from './me.png';
import gpsFixed from './gps_fixed.png';
import gpsNotFixed from './gps_not_fixed.png';
import gpsOff from './gps_off.png';

import 'leaflet/dist/leaflet.css';
import "./Propagate.css";

export const meIcon = new L.Icon({
  iconUrl: me,
  iconAnchor: [12, 27],
  iconSize: [25, 27],
  popupAnchor: [0, -27]
});

const FIND_POSITION = 1000;
const REFRESH_POSITION = 10000;

class Propagate extends Component {
  constructor(props) {
    super(props);

    const location = new Location();
    const last = location.last;
    const mapCenter = last ? [last.location.coords.latitude, last.location.coords.longitude]: [46.76, 2,64];
    const zoomLevel = last ? 14 : 5;
    
    this.state = {
      mapCenter,
      zoomLevel,
      marker: undefined,
      isPropagating: false,
      hasZoomed: false,
      location,
      positionUpdater: undefined,
      positionFinder: undefined,
      gpsStatus: this.gpsStatus(last, location.error),
    };
  }

  componentDidMount() {
    this.state.location.watchLocation();
    this.setState({
      positionFinder: setInterval(this.initMapPosition, FIND_POSITION),
    });
  }

  componentWillUnmount() {
    this.state.location.stopWatching();
    if (this.state.positionFinder) {
      clearInterval(this.state.positionFinder);
    }
    if (this.state.positionUpdater) {
      clearInterval(this.state.positionUpdater);
    }
  }

  handleIAmHere = async () => {
    this.setState({
      isPropagating: true,
    });
  };

  handleZoomEnd = (event) => {
    this.setState({
      zoomLevel: event.target.zoom,
      hasZoomed: true,
    });
  };

  navigateToSettings = () => {
    this.props.history.push('/settings');
  };

  showGpsStatusMessage = ()=> {
    const error = this.state.location.error;
    if (error) {
      uiLogger.error(error);
      return this.props.alert.error(Location.handleLocationError(error));
    }
  };

  gpsStatus = (position, error) => {
    if (!position && !error) return gpsNotFixed;
    if (position && !error) return gpsFixed;
    if (!position && error) return gpsOff;
  };

  initMapPosition = () => {
    this.updatePosition(() => {
      clearInterval(this.state.positionFinder);
      this.setState({
        positionFinder: undefined,
        positionUpdater: setInterval(this.updatePosition, REFRESH_POSITION),
      })
    });
  };

  updatePosition = (callback) => {
    const position = this.state.location.last;
    if (position) {
      const zoomLevel = this.state.hasZoomed ? this.state.zoomLevel : 14;
      this.setState({
        marker: [position.location.coords.latitude, position.location.coords.longitude],
        mapCenter: [position.location.coords.latitude, position.location.coords.longitude],
        gpsStatus: this.gpsStatus(position, this.state.location.error),
        zoomLevel,
      }, callback);
    }
  };

  render() {
    const { isPropagating } = this.state;
    return(
      <div className="propagate">
        <div className="toolbar">
          <img src={this.state.gpsStatus} alt="GPS status" onClick={this.showGpsStatusMessage}/>
          <img src={settings} alt="settings" onClick={this.navigateToSettings} />
        </div>
        {!isPropagating &&
          <div className="buttons-bar">
            <button onClick={this.handleIAmHere}>Je suis là !</button>
          </div>
        }
        <div className="map-container">
          <Map center={this.state.mapCenter} zoom={this.state.zoomLevel} className="leafletmap" >
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {this.state.marker && isPropagating &&
              <Marker position={this.state.marker} icon={meIcon} onZoomend={this.handleZoomEnd}>
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
