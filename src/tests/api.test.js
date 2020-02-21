import { testSaga } from 'redux-saga-test-plan';
import * as axios from 'axios';

import {
  getHeaders,
  default as api,
} from '../sagas/api';

import { getToken } from '../selectors/account';
import { getApiRoot } from '../selectors/env';

const mockToken = 'mock_token';
const mockApiRoot = 'http://testserver.com';

const mockLogin = { email: 'test@test.com', password: 'password' };

const mockHeadersWithoutAuth = {
  headers: {
    'Content-Type': 'application/json',
  },
};

const mockHeadersWithAuth = {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Token ${mockToken}`,
  },
};

jest.mock('axios');

it('Test get headers without authentication', async () => {
  testSaga(getHeaders, false)
    .next()
    .returns(mockHeadersWithoutAuth)
    .next()
    .isDone();
});

it('Test get headers with authentication', async () => {
  testSaga(getHeaders, true)
    .next()
    .select(getToken)
    .next(mockToken)
    .returns(mockHeadersWithAuth)
    .next()
    .isDone();
});

it('Test api.login', async () => {

  axios.post.mockImplementation(() => Promise.resolve({ data: 'success'}));

  testSaga(api.login, mockLogin)
    .next()
    .call(getHeaders, false)
    .next(mockHeadersWithoutAuth)
    .select(getApiRoot)
    .next(mockApiRoot);

  expect(axios.post).toHaveBeenCalledWith(
    `${mockApiRoot}/api/login/`,
    mockLogin,
    mockHeadersWithoutAuth
  );
});

it('Test api.loadUser', async () => {
  axios.get.mockImplementation(() => Promise.resolve({ data: 'success'}));

  testSaga(api.loadUser)
    .next()
    .call(getHeaders, true)
    .next(mockHeadersWithAuth)
    .select(getApiRoot)
    .next(mockApiRoot);

  expect(axios.get).toHaveBeenCalledWith(
    `${mockApiRoot}/api/user/`,
    mockHeadersWithAuth
  );
});
