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
  const query = {
    coordinates: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: coordinates
        },
        $maxDistance: distance,
      }
    }
  };
  return axios.get(`${API_URL}/locations?where=${JSON.stringify(query)}`, {
    headers: {
      'Authorization': `Token ${token}`,
    },
  });
}
