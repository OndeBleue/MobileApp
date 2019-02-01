import _ from 'lodash';

const REFRESH_TIMEOUT = 30000;
const MAXIMUM_POSITION_AGE = 60000;

// based on https://developer.mozilla.org/en-US/docs/Web/API/PositionError
const UNKNOWN_ERROR = 0;
const PERMISSION_DENIED = 1;
const POSITION_UNAVAILABLE = 2;
const TIMEOUT = 3;
const GEOLOCATION_UNAVAILABLE = 4;

// Singleton class, will keep locations history in memory
export default class Location {

  static instance;

  constructor() {
    if (Location.instance) {
      return Location.instance;
    }
    this.highAccuracyWatchId = null;
    this.lowAccuracyWatchId = null;
    this.positions = [];

    Location.instance = this;
  }

  get last() {
    // we search for the last position
    for (let i = this.positions.length - 1; i >= 0; i--) {
      const position = this.positions[i];
      if (position.location) {
        // when found, we check the nearest and most accurate position
        const nearest = this.positions.filter(p => position.datetime.getTime() - p.datetime.getTime() < MAXIMUM_POSITION_AGE);
        const min = _.min(nearest.map(p => p.location.coords.accuracy));
        const mostAccurates = nearest.filter(p => p.location.coords.accuracy === min);
        // finally return the nearest position (in time), possibly undefined
        return _.orderBy(mostAccurates, [p => p.datetime.getTime()], ['desc'])[0];
      }
    }
    return undefined;
  }

  get error() {
    const last = this.positions[this.positions.length - 1];
    if (last instanceof Error) return last;

    return undefined;
  }

  watchLocation() {
    if (!navigator.geolocation) {
      return this.positions.push(Object.assign(new Error("navigator.geolocation is not available"), {
        name: "PositionError",
        code: GEOLOCATION_UNAVAILABLE ,
        datetime: new Date(),
      }));
    }

    const errorCallback = ({ code, message }) => {
      this.positions.push(Object.assign(new Error(message), {
        name: "PositionError",
        code,
        datetime: new Date(),
      }));
    };

    // we run geolocation with high accuracy enabled ans disabled
    this.highAccuracyWatchId = Location.runWatcher(true, (location) => {
      this.positions.push({
        location,
        datetime: new Date,
        highAccuracy: true
      });
    }, errorCallback);
    this.lowAccuracyWatchId = Location.runWatcher(false, (location) => {
      this.positions.push({
        location,
        datetime: new Date,
        highAccuracy: false
      });
    }, errorCallback);
  }

  stopWatching() {
    if (this.highAccuracyWatchId) {
      navigator.geolocation.clearWatch(this.highAccuracyWatchId);
    }
    if (this.lowAccuracyWatchId) {
      navigator.geolocation.clearWatch(this.lowAccuracyWatchId);
    }
  }

  static runWatcher(highAccuracy, successCallback, errorCallback) {
    return navigator.geolocation.watchPosition(
      successCallback,
      errorCallback,
      {
        enableHighAccuracy: highAccuracy,
        timeout: highAccuracy ? REFRESH_TIMEOUT * 2 : REFRESH_TIMEOUT,
        maximumAge: MAXIMUM_POSITION_AGE
      });
  }

  static handleLocationError(error) {
    switch(error.code) {
      case PERMISSION_DENIED:
        return "Vous devez autoriser la localisation.";
      case POSITION_UNAVAILABLE:
        return "Votre position n'est pas disponible.";
      case TIMEOUT:
        return "Impossible d'obtenir votre position dans un délai raisonnable.";
      case GEOLOCATION_UNAVAILABLE:
        return "Votre navigateur ne supporte pas la géo-localisation.";
      case UNKNOWN_ERROR:
      default:
        return "Une erreur inconnue est survenue.";
    }
  }
}
