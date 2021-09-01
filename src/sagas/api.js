import axios from 'axios';
import { call, put, select } from 'redux-saga/effects';

import { getToken } from '../selectors/account';
import { getApiRoot, getTokenType } from '../selectors/env';

import * as _ from 'lodash';
import { GREATER_THAN_299_RESPONSE } from '../actions/general';

const parseOptions = (options) => {
  let data = null;
  let customHeaders = undefined;
  let authenticationRequired = true;

  const hasData = _.has(options, 'data');
  const hasHeaders = _.has(options, 'headers');
  const hasAuthRequired = _.has(options, 'authenticationRequired');

  if (hasData || hasHeaders || hasAuthRequired ) {

    if (hasData) {
      data = _.get(options, 'data');
    }

    if (hasHeaders) {
      customHeaders = _.get(options, 'headers');
    }

    if (hasAuthRequired) {
      authenticationRequired = _.get(options, 'authenticationRequired');
    }

  } else {
    data = options;
  }

  return { data, customHeaders, authenticationRequired };
};

export const validateStatus = () => true;

export function* getHeaders (options) {
  const headers = {
    'Content-Type': 'application/json',
  };

  const authenticationRequired = _.get(options, 'authenticationRequired', true);
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

export function* apiPost (path, options) {

  const { data, customHeaders, authenticationRequired } = parseOptions(options);

  const headers = yield call(getHeaders, {authenticationRequired, customHeaders});
  const apiRoot = yield select(getApiRoot);

  // allow usage outside of yield axios function
  let apiResponse = null;
  let shouldReturnError = false;

  yield axios.post(
    `${apiRoot}/${path}`,
    data,
    {
      headers,
      // Always return true so error status 4xx promises aren't rejected.
      validateStatus,
    }
  ).then((res) => {
    // If the status is not a success, return all of the response
    if (res.status > 299) {
      apiResponse = res;
      shouldReturnError = true;
    }

    apiResponse = _.get(res, 'data', res);
  });

  // If the response status was greater than 299, put GREATER_THAN_299_RESPONSE action
  if (shouldReturnError) {
    yield put({
      type: GREATER_THAN_299_RESPONSE,
      response: apiResponse,
    });
  }

  return apiResponse;
}

export function* apiGet (path, options = {}) {

  const { data, customHeaders, authenticationRequired } = parseOptions(options);

  const headers = yield call(getHeaders, { authenticationRequired, customHeaders });
  const apiRoot = yield select(getApiRoot);

  let url = `${apiRoot}/${path}`;

  if (!_.isEmpty(data)) {
    let queryString = Object.keys(data).map( (key) => key + '=' + data[key]).join('&');
    url = `${url}?${queryString}`;
  }

  // allow usage outside of yield axios function
  let apiResponse = null;
  let shouldReturnError = false;

  yield axios.get(
    url,
    {
      headers,
      // Always return true so error status 4xx promises aren't rejected.
      validateStatus,
    }
  ).then((res) => {
    // If the status is not a success, return all of the response
    if (res.status > 299) {
      apiResponse = res;
      shouldReturnError = true;
    }

    apiResponse = _.get(res, 'data', res);
  });

  // If the response status was greater than 299, put GREATER_THAN_299_RESPONSE action
  if (shouldReturnError) {
    yield put({
      type: GREATER_THAN_299_RESPONSE,
      response: apiResponse,
    });
  }

  return apiResponse;
}

export function* apiPut (path, options) {
  const { data, customHeaders, authenticationRequired } = parseOptions(options);

  const headers = yield call(getHeaders, { authenticationRequired, customHeaders });
  const apiRoot = yield select(getApiRoot);

  let url = `${apiRoot}/${path}`;

  // allow usage outside of yield axios function
  let apiResponse = null;
  let shouldReturnError = false;

  yield axios.put(
    url,
    data,
    {
      headers,
      // Always return true so error status 4xx promises aren't rejected.
      validateStatus,
    }
  ).then((res) => {
    // If the status is not a success, return all of the response
    if (res.status > 299) {
      apiResponse = res;
      shouldReturnError = true;
    }
    
    apiResponse = _.get(res, 'data', res);
  });

  // If the response status was greater than 299, put GREATER_THAN_299_RESPONSE action
  if (shouldReturnError) {
    yield put({
      type: GREATER_THAN_299_RESPONSE,
      response: apiResponse,
    });
  }

  return apiResponse;
}

export function* apiPatch (path, options) {
  const { data, customHeaders, authenticationRequired } = parseOptions(options);

  const headers = yield call(getHeaders, { authenticationRequired, customHeaders });
  const apiRoot = yield select(getApiRoot);

  let url = `${apiRoot}/${path}`;

  // allow usage outside of yield axios function
  let apiResponse = null;
  let shouldReturnError = false;

  yield axios.patch(
    url,
    data,
    {
      headers,
      // Always return true so error status 4xx promises aren't rejected.
      validateStatus,
    }
  ).then((res) => {
    // If the status is not a success, return all of the response
    if (res.status > 299) {
      apiResponse = res;
      shouldReturnError = true;
    }

    apiResponse = _.get(res, 'data', res);
  });

  // If the response status was greater than 299, put GREATER_THAN_299_RESPONSE action
  if (shouldReturnError) {
    yield put({
      type: GREATER_THAN_299_RESPONSE,
      response: apiResponse,
    });
  }

  return apiResponse;
}

export function* apiDelete (path, authenticationRequired = true) {
  const headers = yield call(getHeaders, { authenticationRequired });
  const apiRoot = yield select(getApiRoot);

  let url = `${apiRoot}/${path}`;

  // allow usage outside of yield axios function
  let apiResponse = null;
  let shouldReturnError = false;

  yield axios.delete(
    url,
    headers,
  ).then((res) => {
    // If the status is not a success, return all of the response
    if (res.status > 299) {
      apiResponse = res;
      shouldReturnError = true;
    }

    apiResponse = _.get(res, 'data', res);
  });

  // If the response status was greater than 299, put GREATER_THAN_299_RESPONSE action
  if (shouldReturnError) {
    yield put({
      type: GREATER_THAN_299_RESPONSE,
      response: apiResponse,
    });
  }

  return apiResponse;
}

const api = {
  login: (data) => apiPost('api/login/', { data, authenticationRequired: false }),
  signup: (data) => apiPost('api/signup/', { data, authenticationRequired: false }),
  patchUser: (data, path = 'api/user/') => apiPatch(path, { data }),
  loadUser: () => apiGet('api/user/'),
};

export default api;
