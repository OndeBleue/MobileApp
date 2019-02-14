import axios from 'axios';
import moment from 'moment';
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

export function fetchPositions(coordinates, distance) {
  const startDate = moment().utc().startOf('day').toDate();
  const endDate = moment(startDate).utc().add(1, 'day').toDate();
  const token = restoreToken();
  return axios.get(`${API_URL}/people-around?aggregate={"$center": [${coordinates}], "$distance": ${distance}, ` +
                   `"$startdate": "${startDate.toUTCString()}", "$enddate": "${endDate.toUTCString()}"}`, {
    headers: {
      'Authorization': `Token ${token}`,
    },
  });
}
