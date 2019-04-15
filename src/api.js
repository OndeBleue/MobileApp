import axios from 'axios';
import moment from 'moment';
import { API_URL } from './config';
import { makeCancelable, Stackable } from './utils';
import Storage from './storage';

const storage = new Storage();



// =====     USER     =====

export function createUser(name) {
  return axios.post(`${API_URL}/users`, { name });
}

export function login(identifier) {
  if (parseInt(identifier, 10).length > 0) throw new Error(`L'identifiant fourni (${identifier}) est invalide.`);
  const b64 = btoa(`${identifier}:password`);

  return axios.get(`${API_URL}/users/${identifier}`, {
    headers: {'Authorization': `Basic ${b64}`},
  });
}

export function getCurrentUser() {
  const identifier = storage.identifier;
  const b64 = btoa(`${identifier}:password`);

  return axios.get(`${API_URL}/users/${identifier}`, {
    headers: {'Authorization': `Basic ${b64}`},
  });
}

export function updateUser(id, etag, name) {
  const identifier = storage.identifier;
  const b64 = btoa(`${identifier}:password`);

  return axios.patch(`${API_URL}/users/${id}`, {
    name
  }, {
    headers: {
      'Authorization': `Basic ${b64}`,
      'If-Match': etag,
      'Content-Type': 'application/json',
    },
  });
}

export function deleteUser(id, etag) {
  const identifier = storage.identifier;
  const b64 = btoa(`${identifier}:password`);

  return axios.delete(`${API_URL}/users/${id}`, {
    headers: {
      'Authorization': `Basic ${b64}`,
      'If-Match': etag,
    },
  });
}

// =====     ERROR     =====

export function saveError(error) {
  const ua = window.navigator.userAgent;
  return axios.post(`${API_URL}/errors`, { user: storage.id, data: JSON.stringify(error), 'user-agent': ua });
}


// =====     LOCATION     =====

const createLocationStack = new Stackable();

export function createLocation(coordinates, datetime) {
  const user = storage.id;
  const token = storage.token;
  createLocationStack.add(() =>
    axios.post(`${API_URL}/locations`, {
      user,
      coordinates: {
        type: 'Point',
        coordinates: coordinates
      },
      datetime: datetime.toUTCString()
    }, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
    })
  );
  return new Promise((resolve, reject) => {
    createLocationStack.successCallback = resolve;
    createLocationStack.failCallback = reject;
  });
}

const fetchPositionsStack = new Stackable();

export function fetchPositions(coordinates, distance) {
  const startDate = moment().utc().startOf('day').toDate();
  const endDate = moment(startDate).utc().add(1, 'day').toDate();
  const token = storage.token;
  fetchPositionsStack.add(() =>
    axios.get(`${API_URL}/people-around?aggregate={"$center": [${coordinates}], "$distance": ${distance}, ` +
      `"$startdate": "${startDate.toUTCString()}", "$enddate": "${endDate.toUTCString()}"}`, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    })
  );
  return makeCancelable(new Promise((resolve, reject) => {
    fetchPositionsStack.successCallback = resolve;
    fetchPositionsStack.failCallback = reject;
  }));
}

const countConnectedStack = new Stackable();

export function countConnectedUsers() {
  const startDate = moment().utc().startOf('day').toDate();
  const endDate = moment(startDate).utc().add(1, 'day').toDate();
  const token = storage.token;
  countConnectedStack.add(() =>
    axios.get(`${API_URL}/count?aggregate={"$startdate": "${startDate.toUTCString()}", ` +
      `"$enddate": "${endDate.toUTCString()}"}`, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    })
  );
  return makeCancelable(new Promise((resolve, reject) => {
    countConnectedStack.successCallback = resolve;
    countConnectedStack.failCallback = reject;
  }));
}
