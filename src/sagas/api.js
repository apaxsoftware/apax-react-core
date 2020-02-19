import axios from 'axios';
import { select } from 'redux-saga/effects';

import { getToken } from '../selectors/account';

export function* getHeaders (authenticationRequired) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (authenticationRequired) {
    const token = yield select(getToken);

    if (token) {
      headers.Authorization = `Token ${token}`;
    }

    return { headers };
  }

  return null;

}

//export const getApiRoot = state => state.env.API_ROOT;
export const getApiRoot = 'http://localhost:8000';

function* apiPost (path, data, authenticationRequired = true) {
  const headers = yield getHeaders(authenticationRequired);
  const apiRoot = getApiRoot;

  return yield axios.post(
    `${apiRoot}${path}`,
    data,
    headers,
  ).then((res) => res.data);
}

function* apiGet (path, data, authenticationRequired = true) {
  const headers = yield getHeaders(authenticationRequired);

  const apiRoot = getApiRoot;

  let url = `${apiRoot}${path}`;

  if (data) {
    let queryString = Object.keys(data).map( (key) => key + '=' + data[key]).join('&');
    url = `${url}?${queryString}`;
  }

  return yield axios.get(
    url,
    headers,
  ).then((res) => res.data);
}

const api = {
  login: (data) => apiPost('/api/login/', data, false),
  loadUser: () => apiGet('/api/user/'),
};

export default api;
