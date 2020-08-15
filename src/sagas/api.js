import axios from 'axios';
import { call, select } from 'redux-saga/effects';

import { getToken } from '../selectors/account';
import { getApiRoot, getTokenType } from '../selectors/env';

import * as _ from 'lodash';

const parseOptions = (options) => {
  let data = null;
  let customHeaders = undefined;

  if (_.has(options, 'data')) {
    data = _.get(options, 'data');

    if (_.has(options, 'headers')) {
      customHeaders = _.get(options, 'headers');
    }

  } else {
    data = options;
  }

  return { data, customHeaders };
};

export function* getHeaders (options) {
  const headers = {
    'Content-Type': 'application/json',
  };

  const authenticationRequired = _.get(options, 'authenticationRequired', false);
  const customHeaders = _.get(options, 'customHeaders', {});

  if (authenticationRequired) {
    const token = yield select(getToken);
    const token_type = yield select(getTokenType);

    if (token) {
      headers['Authorization'] = `${token_type} ${token}`;
    }
  }

  return _.merge({}, headers, customHeaders);
}

export function* apiPost (path, options, authenticationRequired = true) {

  const { data, customHeaders } = parseOptions(options);

  const headers = yield call(getHeaders, {authenticationRequired, customHeaders});
  const apiRoot = yield select(getApiRoot);

  return yield axios.post(
    `${apiRoot}/${path}`,
    {
      data,
      headers,
    }
  ).then((res) => res.data);
}

export function* apiGet (path, options = {}, authenticationRequired = true) {

  const { data, customHeaders } = parseOptions(options);

  const headers = yield call(getHeaders, { authenticationRequired, customHeaders });
  const apiRoot = yield select(getApiRoot);

  let url = `${apiRoot}/${path}`;

  if (!_.isEmpty(data)) {
    let queryString = Object.keys(data).map( (key) => key + '=' + data[key]).join('&');
    url = `${url}?${queryString}`;
  }

  return yield axios.get(
    url,
    {
      headers,
    }
  ).then((res) => res.data);
}

export function* apiPut (path, options, authenticationRequired = true) {
  const { data, customHeaders } = parseOptions(options);

  const headers = yield call(getHeaders, { authenticationRequired, customHeaders });
  const apiRoot = yield select(getApiRoot);

  let url = `${apiRoot}/${path}`;

  return yield axios.put(
    url,
    {
      data,
      headers,
    }
  ).then((res) => res.data);
}

export function* apiPatch (path, options, authenticationRequired = true) {
  const { data, customHeaders } = parseOptions(options);

  const headers = yield call(getHeaders, { authenticationRequired, customHeaders });
  const apiRoot = yield select(getApiRoot);

  let url = `${apiRoot}/${path}`;

  return yield axios.patch(
    url,
    {
      data,
      headers,
    }
  ).then((res) => res.data);
}

export function* apiDelete (path, authenticationRequired = true) {
  const headers = yield call(getHeaders, authenticationRequired);
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
  patchUser: (data, path = 'api/user/') => apiPatch(path, data),
  loadUser: () => apiGet('api/user/'),
};

export default api;
