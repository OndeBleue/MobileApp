import React, { Component } from "react";
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import { withAlert } from "react-alert";
import L from 'leaflet'
import Location from '../location';
import { uiLogger, apiLogger } from '../logger';
import { restoreId } from '../storage';
import { createLocation, fetchPositions } from './actions';

import settings from './settings.png';
import me from './me.png';
import people from './people.png';
import gpsFixed from './gps_fixed.png';
import gpsNotFixed from './gps_not_fixed.png';
import gpsOff from './gps_off.png';

import 'leaflet/dist/leaflet.css';
import "./Propagate.css";

export const peopleIcon = new L.Icon({
  iconUrl: people,
  iconAnchor: [12, 27],
  iconSize: [25, 27],
  popupAnchor: [0, -27]
});

export const meIcon = new L.Icon({
  iconUrl: me,
  iconAnchor: [12, 12],
  iconSize: [25, 25],
  popupAnchor: [1, -12]
});

const FIND_POSITION = 1000;
const FIND_NEAR_ME = 61000;
const REFRESH_POSITION = 60000;

class Propagate extends Component {
  constructor(props) {
    super(props);

    const location = new Location();
    const last = location.last;
    const mapCenter = last ? [last.location.coords.latitude, last.location.coords.longitude]: [46.76, 2,64];
    const zoomLevel = last ? 14 : 5;

    const userId = restoreId();
    
    this.state = {
      mapCenter,
      zoomLevel,
      isPropagating: false,
      hasZoomed: false,
      location,
      positionUpdater: undefined,
      positionFinder: undefined,
      nearMeUpdater: undefined,
      gpsStatus: this.gpsStatus(last, location.error),
      people: [],
      userId,
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
    if (this.state.nearMeUpdater) {
      clearInterval(this.state.nearMeUpdater);
    }
  }

  handleIAmHere = async () => {
    this.setState({
      isPropagating: true,
    }, this.pushPosition);
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
      this.updateNearMe();
      this.setState({
        positionFinder: undefined,
        positionUpdater: setInterval(this.updatePosition, REFRESH_POSITION),
        nearMeUpdater: setInterval(this.updateNearMe, FIND_NEAR_ME),
      })
    });
  };

  pushPosition = () => {
    const position = this.state.location.last;
    if (position) {
      const coordinates = [position.location.coords.latitude, position.location.coords.longitude];
      if (this.state.isPropagating) {
        createLocation(coordinates, position.datetime).then(res => {
          apiLogger.info(res);
          this.updateNearMe();
        }).catch((e) => {
          apiLogger.error(e);
        })
      }
    }
  };

  updatePosition = (callback) => {
    const position = this.state.location.last;
    if (position) {
      const coordinates = [position.location.coords.latitude, position.location.coords.longitude];
      const zoomLevel = this.state.hasZoomed ? this.state.zoomLevel : 14;
      this.setState({
        mapCenter: coordinates,
        gpsStatus: this.gpsStatus(position, this.state.location.error),
        zoomLevel,
      }, callback);
      this.pushPosition();
    }
  };

  updateNearMe = () => {
    fetchPositions(this.state.mapCenter, 25).then((positions) => {
      this.setState({
        people: positions.data._items,
      });
      apiLogger.info(positions);
    }).catch((error) => {
      apiLogger.error(error);
    });
  };

  renderMarkers() {
    return this.state.people.map(p => {
      const itsMe = (p.user === this.state.userId);
      const icon = itsMe ? meIcon : peopleIcon;
      return (
        <Marker key={p._id} position={p.coordinates.coordinates} icon={icon}>
          {itsMe && <Popup>
            Je suis là !
          </Popup>}
        </Marker>
      )
    });
  }

  render() {
    const { isPropagating, gpsStatus, mapCenter, zoomLevel, positionFinder } = this.state;
    return (
      <div className="propagate">
        <div className="toolbar">
          <img src={gpsStatus} alt="GPS status" onClick={this.showGpsStatusMessage}/>
          <img src={settings} alt="settings" onClick={this.navigateToSettings} />
        </div>
        {!isPropagating && !positionFinder &&
          <div className="buttons-bar">
            <button onClick={this.handleIAmHere}>Je suis là !</button>
          </div>
        }
        <div className="map-container">
          <Map center={mapCenter} zoom={zoomLevel} className="leafletmap" onZoomend={this.handleZoomEnd}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {this.renderMarkers()}
          </Map>
        </div>
      </div>
    );
  }
}

export default withAlert(Propagate);
