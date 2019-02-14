import React, { Component } from "react";
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import { withAlert } from "react-alert";
import L from 'leaflet'
import geolib from 'geolib';
import Location from '../location';
import { uiLogger, apiLogger } from '../logger';
import Storage from '../storage';
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
    const storage = new Storage();
    const last = location.last;
    const mapCenter = last ? [last.location.coords.latitude, last.location.coords.longitude]: [46.76, 2,64];
    const zoomLevel = last ? 14 : 5;

    const userId = storage.id;
    
    this.state = {
      mapCenter,
      zoomLevel,
      isPropagating: storage.isPropagating,
      hasZoomed: false,
      hasMoved: false,
      location,
      storage,
      positionUpdater: undefined,
      positionFinder: undefined,
      nearMeUpdater: undefined,
      gpsStatus: this.gpsStatus(last, location.error),
      people: [],
      userId,
    };

    this.mapRef = React.createRef();
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
    this.state.storage.isPropagating = true;
    this.setState({
      isPropagating: true,
    }, this.pushPosition);
  };

  handleZoomEnd = () => {
    const map = this.mapRef.current;
    if (map != null) {
      const zoomLevel = map.leafletElement.getZoom();
      this.setState({ zoomLevel, hasZoomed: true }, () => {
        this.updateNearMe();
      });
    }
  };

  handleMoveEnd = () => {
    const map = this.mapRef.current;
    if (map != null) {
      const center = map.leafletElement.getCenter();
      const mapCenter = [center.lat, center.lng];
      this.setState({ mapCenter, hasMoved: true }, () => {
        this.updateNearMe();
      });
    }
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


  mapRadius = () => {
    const map = this.mapRef.current;
    if (map != null) {
      const bounds = map.leafletElement.getBounds();
      return geolib.getDistanceSimple(
        { latitude: this.state.mapCenter[0], longitude: this.state.mapCenter[1] },
        { latitude: bounds._northEast.lat, longitude: bounds._northEast.lng }
      );
    }
    return 100;
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
      const mapCenter = this.state.hasMoved ? this.state.mapCenter : [position.location.coords.latitude, position.location.coords.longitude];
      const zoomLevel = this.state.hasZoomed ? this.state.zoomLevel : 14;
      this.setState({
        mapCenter,
        gpsStatus: this.gpsStatus(position, this.state.location.error),
        zoomLevel,
      }, callback);
      this.pushPosition();
    }
  };

  updateNearMe = () => {
    fetchPositions(this.state.mapCenter, this.mapRadius()).then((positions) => {
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
          <Map center={mapCenter}
               zoom={zoomLevel}
               className="leafletmap"
               onZoomend={this.handleZoomEnd}
               onMoveend={this.handleMoveEnd}
               maxZoom={18}
               minZoom={5}
               ref={this.mapRef}>
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
