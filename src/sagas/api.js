import axios from 'axios';
import { call, select } from 'redux-saga/effects';

import { getApiRoot, getTokenType } from '../selectors/env';

export function* getHeaders (authenticationRequired, token) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (authenticationRequired) {
    const token_type = yield select(getTokenType);

    if (token) {
      headers.Authorization = `${token_type} ${token}`;
    }
  }

  return { headers };
}

export function* apiPost (path, data, authenticationRequired = true, token = null) {
  const headers = yield call(getHeaders, authenticationRequired, token);
  const apiRoot = yield select(getApiRoot);

  return yield axios.post(
    `${apiRoot}/${path}`,
    data,
    headers,
  ).then((res) => res.data);
}

export function* apiGet (path, data, authenticationRequired = true, token = null) {
  const headers = yield call(getHeaders, authenticationRequired, token);
  const apiRoot = yield select(getApiRoot);

  let url = `${apiRoot}/${path}`;

  if (data) {
    let queryString = Object.keys(data).map( (key) => key + '=' + data[key]).join('&');
    url = `${url}?${queryString}`;
  }

  return yield axios.get(
    url,
    headers,
  ).then((res) => res.data);
}

export function* apiPut (path, data, authenticationRequired = true, token = null) {
  const headers = yield call(getHeaders, authenticationRequired, token);
  const apiRoot = yield select(getApiRoot);

  let url = `${apiRoot}/${path}`;

  return yield axios.put(
    url,
    data,
    headers,
  ).then((res) => res.data);
}

export function* apiPatch (path, data, authenticationRequired = true, token = null) {
  const headers = yield call(getHeaders, authenticationRequired, token);
  const apiRoot = yield select(getApiRoot);

  let url = `${apiRoot}/${path}`;

  return yield axios.patch(
    url,
    data,
    headers,
  ).then((res) => res.data);
}

export function* apiDelete (path, authenticationRequired = true, token = null) {
  const headers = yield call(getHeaders, authenticationRequired, token);
  const apiRoot = yield select(getApiRoot);

  let url = `${apiRoot}/${path}`;

  return yield axios.delete(
    url,
    headers,
  ).then((res) => res.data);
}

const api = {
  login: (data) => apiPost('api/login/', data, false),
  signup: (data) => apiPost('api/signup/', data, false),
  loadUser: () => apiGet('api/user/'),
};

export default api;
