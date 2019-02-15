import axios from 'axios';
import moment from 'moment';
import { API_URL } from '../config.js';
import Storage from '../storage';
import { makeCancelable } from '../utils';

const storage = new Storage();

export function createLocation(coordinates, datetime) {
  const user = storage.id;
  const token = storage.token;
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
  const token = storage.token;
  return makeCancelable(axios.get(`${API_URL}/people-around?aggregate={"$center": [${coordinates}], "$distance": ${distance}, ` +
                   `"$startdate": "${startDate.toUTCString()}", "$enddate": "${endDate.toUTCString()}"}`, {
    headers: {
      'Authorization': `Token ${token}`,
    },
  }));
}
