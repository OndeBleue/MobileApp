import React, { Component } from 'react';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import { withAlert } from 'react-alert';
import L from 'leaflet'
import geolib from 'geolib';
import moment from 'moment';
import * as Nominatim from 'nominatim-browser';
import Location from '../location';
import { uiLogger, apiLogger } from '../logger';
import Storage from '../storage';
import Memory from '../memory';
import { isRunning, previousOccurrenceEnd } from '../schedule';
import { getCurrentUser, createLocation, fetchPositions, countConnectedUsers, saveError } from '../api';

import settings from './settings.png';
import me from './me.png';
import people from './people.png';
import gpsFixed from './gps_fixed.png';
import gpsNotFixed from './gps_not_fixed.png';
import gpsOff from './gps_off.png';
import loader from './loader.svg';
import arrow from './arrow.png';
import search from './search.png';

import 'leaflet/dist/leaflet.css';
import './Propagate.css';

export const peopleIcon = new L.Icon({
  iconUrl: people,
  iconAnchor: [8, 18],
  iconSize: [16, 18],
  popupAnchor: [0, -18]
});

export const meIcon = new L.Icon({
  iconUrl: me,
  iconAnchor: [8, 8],
  iconSize: [16, 16],
  popupAnchor: [1, -8]
});

// when the component is mounted first, we will refresh every seconds until a first position is found
const FIND_POSITION = 1000;
const POSITION_FINDER = 'POSITION_FINDER'; // setInterval
const POSITION_FETCHER = 'POSITION_FETCHER'; // API call
// refresh people around the current view, every 61 seconds
const FIND_NEAR_ME = 61000;
const NEAR_ME_UPDATER = 'NEAR_ME_UPDATER'; // setInterval
// send my position to the server every 60 seconds
const REFRESH_POSITION = 60000;
const POSITION_UPDATER = 'POSITION_UPDATER'; // setInterval
// refresh how many people are connected in the whole app, every 10 seconds
const REFRESH_COUNT = 10000;
const COUNT_UPDATER = 'COUNT_UPDATER'; // setInterval
const COUNT_FETCHER = 'COUNT_FETCHER'; // API call
// will persist the current status of the user during the session (is sending position or not)
const IS_PROPAGATING = 'IS_PROPAGATING';
// will navigate to the pending screen after the end of the propagation
const END_PROPAGATION_TRIGGER = 'END_PROPAGATION_TRIGGER';

// GPS statuses
const GPS_SEARCHING = 'GPS_SEARCHING';
const GPS_OK = 'GPS_OK';
const GPS_OFF = 'GPS_OFF';

const location = new Location();
const storage = new Storage();
const memory = new Memory();

moment.locale('fr');

class Propagate extends Component {
  constructor(props) {
    super(props);

    const last = location.last;
    const mapCenter = last ? [last.location.coords.latitude, last.location.coords.longitude]: [46.76, 2,64];
    const zoomLevel = last ? 14 : 5;

    const userId = storage.id;

    this.state = {
      mapCenter,
      zoomLevel,
      isPropagating: memory.get(IS_PROPAGATING) || false,
      hasZoomed: false,
      hasMoved: false,
      gpsStatus: this.gpsStatus(last, location.error),
      people: [],
      userId,
      loading: false,
      count: 0,
      address: '',
      locationSearchResults: null,
    };

    this.mapRef = React.createRef();
  }

  componentDidMount() {
    getCurrentUser().then(() => {
      if (!isRunning()) {
        return this.props.history.push('/pending');
      }
      location.watchLocation();
      this.updateConnectedUsers();
      memory.set(POSITION_FINDER, setInterval(this.initMapPosition, FIND_POSITION));
      memory.set(COUNT_UPDATER, setInterval(this.updateConnectedUsers, REFRESH_COUNT));
      memory.set(END_PROPAGATION_TRIGGER, setTimeout(this.endPropagation, previousOccurrenceEnd().diff(moment())));
    }).catch(()=> {
      storage.disconnect();
      this.props.history.push('/login');
    });
  }

  componentWillUnmount() {
    // stop gps sensor
    location.stopWatching();
    // cancel any currently running API call
    if (memory.get(POSITION_FETCHER)) {
      memory.get(POSITION_FETCHER).cancel();
      memory.remove(POSITION_FETCHER);
    }
    if (memory.get(COUNT_FETCHER)) {
      memory.get(COUNT_FETCHER).cancel();
      memory.remove(COUNT_FETCHER);
    }
    // stop setInterval updaters
    if (memory.get(POSITION_FINDER)) {
      clearInterval(memory.get(POSITION_FINDER));
      memory.remove(POSITION_FINDER);
    }
    if (memory.get(POSITION_UPDATER)) {
      clearInterval(memory.get(POSITION_UPDATER));
      memory.remove(POSITION_UPDATER);
    }
    if (memory.get(NEAR_ME_UPDATER)) {
      clearInterval(memory.get(NEAR_ME_UPDATER));
      memory.remove(NEAR_ME_UPDATER);
    }
    if (memory.get(COUNT_UPDATER)) {
      clearInterval(memory.get(COUNT_UPDATER));
      memory.remove(COUNT_UPDATER);
    }
    if (memory.get(END_PROPAGATION_TRIGGER)) {
      clearTimeout(memory.get(END_PROPAGATION_TRIGGER));
      memory.remove(END_PROPAGATION_TRIGGER);
    }
  }

  handleIAmHere = async () => {
    memory.set(IS_PROPAGATING, true);
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

  handleAddressChange = (event) => {
    event.preventDefault();
    this.setState({ address: event.target.value });
  };

  handleManualPositioning = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const map = this.mapRef.current;
    if (map != null) {
      const bounds = map.leafletElement.getBounds();
      const viewbox = `${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()},${bounds.getSouth()}`;
      Nominatim.geocode({
        q: this.state.address,
        viewbox,
        addressdetails: true,
      }).then((results) => {
        this.setState({ locationSearchResults: results });
      })
    }
  };

  handleClearAddress = () => {
    this.setState({ address: '' });
  };

  navigateToSettings = () => {
    this.props.history.push('/settings');
  };

  handleClickGPS = () => {
    if (this.state.gpsStatus === GPS_OK) {
      const position = location.last;
      if (position) {
        this.setState({
          mapCenter: [position.location.coords.latitude, position.location.coords.longitude]
        });
      }
    }
    else if (this.state.gpsStatus === GPS_SEARCHING) {
      this.props.alert.info('Recherche de la position ...');
    } else {
      this.showGpsStatusMessage();
    }
  };

  handleLocationSelected = (location) => {
    return () => {
      console.log(location);
      // TODO this.updatePosition()
    };
  };

  showGpsStatusMessage = () => {
    const error = location.error;
    if (error) {
      uiLogger.error(error);
      return this.props.alert.error(Location.handleLocationError(error));
    }
  };

  gpsStatusIcon = (status) => {
    if (status === GPS_SEARCHING) return gpsNotFixed;
    if (status === GPS_OK) return gpsFixed;
    if (status === GPS_OFF) return gpsOff;
  };

  gpsStatus = (position, error) => {
    if (!position && !error) return GPS_SEARCHING;
    if (position && !error) return GPS_OK;
    if (!position && error) return GPS_OFF;
  };


  mapRadius = () => {
    const map = this.mapRef.current;
    if (map != null) {
      const bounds = map.leafletElement.getBounds();
      return parseInt(geolib.getDistanceSimple(
        { latitude: this.state.mapCenter[0], longitude: this.state.mapCenter[1] },
        { latitude: bounds.getNorthEast().lat, longitude: bounds.getNorthEast().lng }
      ) * 1.1, 10);
    }
    return 100;
  };

  initMapPosition = () => {
    this.updatePosition(() => {
      clearInterval(memory.get(POSITION_FINDER));
      memory.remove(POSITION_FINDER);
      this.updateNearMe();
      memory.set(POSITION_UPDATER, setInterval(this.updatePosition, REFRESH_POSITION));
      memory.set(NEAR_ME_UPDATER, setInterval(this.updateNearMe, FIND_NEAR_ME));
    });
  };

  pushPosition = () => {
    const position = location.last;
    if (position) {
      const coordinates = [position.location.coords.latitude, position.location.coords.longitude];
      if (this.state.isPropagating) {
        createLocation(coordinates, position.datetime).then(res => {
          apiLogger.info(res);
          this.updateNearMe();
        }).catch((error) => {
          apiLogger.error(error);
          saveError({ from:'push position', error });
        })
      }
    }
  };

  updatePosition = (callback) => {
    const position = location.last;
    if (position) {
      const mapCenter = this.state.hasMoved ? this.state.mapCenter : [position.location.coords.latitude, position.location.coords.longitude];
      const zoomLevel = this.state.hasZoomed ? this.state.zoomLevel : 14;
      this.setState({
        mapCenter,
        gpsStatus: this.gpsStatus(position, location.error),
        zoomLevel,
      }, callback);
      this.pushPosition();
    }
  };

  updateNearMe = () => {
    this.setState({
      loading: true,
    }, () => {
      if (memory.get(POSITION_FETCHER)) memory.get(POSITION_FETCHER).cancel();

      memory.set(POSITION_FETCHER, fetchPositions(this.state.mapCenter, this.mapRadius()));
      memory.get(POSITION_FETCHER).promise.then((positions) => {
        this.setState({
          loading: false,
          people: positions.data._items,
        });
        apiLogger.info(positions);
      }).catch((reason) => {
        if (!reason.isCanceled) {
          apiLogger.error(reason);
          saveError({ from:'update near me', reason });
        }
        this.setState({ loading: false });
      });
    });
  };

  updateConnectedUsers = () => {
    if (memory.get(COUNT_FETCHER)) memory.get(COUNT_FETCHER).cancel();

    memory.set(COUNT_FETCHER, countConnectedUsers());
    memory.get(COUNT_FETCHER).promise.then((res) => {
      if (Array.isArray(res.data._items) && res.data._items.length > 0) {
        this.setState({ count: res.data._items[0].connected_users });
      }
    }).catch((reason) => {
      if (!reason.isCanceled) {
        apiLogger.error(reason);
        saveError({ from:'update connected users', reason });
      }
    })
  };

  endPropagation = () => {
    this.props.history.push('/pending');
  };

  showTutorial = () => {
    const params = new URLSearchParams(new URL(window.location).search);
    return params.has('tutorial') && !this.state.isPropagating;
  };

  isGeolocated = () => {
    return !!location.last;
  };

  renderLocationSearchResults() {
    if (!this.state.locationSearchResults) return null;
    return (
      <ul className="search-results">
        {this.state.locationSearchResults.map((loc) => {
          return <li key={loc.place_id} onClick={this.handleLocationSelected(loc)}>{loc.display_name}</li>
        })}
      </ul>
    );
  }

  renderMarkers() {
    return this.state.people.map(p => {
      const itsMe = (p.user === this.state.userId);
      const icon = itsMe ? meIcon : peopleIcon;
      return (
        <Marker key={p._id} position={p.coordinates.coordinates} icon={icon}>
          <Popup>
            {itsMe && <span>Je suis là !</span>}
            {!itsMe && <span>{p.userName}, à {moment(p.datetime).format('LT')}</span>}
          </Popup>}
        </Marker>
      )
    });
  }

  render() {
    const { isPropagating, gpsStatus, mapCenter, zoomLevel, positionFinder, loading, count, address } = this.state;
    return (
      <div className="propagate">
        <div className="toolbar">
          <img src={this.gpsStatusIcon(gpsStatus)} className={`gps-${gpsStatus}`} alt="GPS status" onClick={this.handleClickGPS}/>
          <img src={settings} alt="settings" onClick={this.navigateToSettings} />
        </div>
        {!isPropagating && !positionFinder &&
          <div className="buttons-bar">
            <button onClick={this.handleIAmHere}>Je suis là !</button>
            {this.showTutorial() &&
              <div className="tutorial">
                <img src={arrow} alt="arrow" />
                <span>Cliquez ici pour participer à l'onde bleue</span>
              </div>
            }
          </div>
        }
        {isPropagating && !this.isGeolocated() &&
          <div className="buttons-bar">
            <form onSubmit={this.handleManualPositioning}>
              <input type="text"
                     className="manual-location"
                     placeholder="Votre adresse"
                     value={address}
                     onChange={this.handleAddressChange} />
              <i className="clear-input" onClick={this.handleClearAddress}>x</i>
              <button type="submit" className="manual-location"><img src={search} alt="&#128269;" /></button>
              {this.renderLocationSearchResults()}
            </form>
          </div>
        }
        {loading && <img src={loader} alt="loading" className="loader" />}
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
        <div className="connected-users">Connectés : {count}</div>
      </div>
    );
  }
}

export default withAlert(Propagate);
