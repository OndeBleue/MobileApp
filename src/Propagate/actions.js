const axios = require('axios');
import { API_URL } from '../config.js';
import { restoreId, restoreToken } from '../storage';

export function createLocation(coordinates, datetime) {
  const user = restoreId();
  const token = restoreToken();
  return axios.post(`${API_URL}/locations`, {
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
  });
}

export function fetchNearMe(coordinates, distance) {
  const token = restoreToken();
  return axios.get(`${API_URL}/locations?where={"coordinates": {"$near": {"$geometry": {"type":"Point", "coordinates": ${coordinates}, "$maxDistance": ${distance}}}`, {
    headers: {
      'Authorization': `Token ${token}`,
    },
  });
}
