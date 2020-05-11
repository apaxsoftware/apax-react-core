import { testSaga } from 'redux-saga-test-plan';
import * as axios from 'axios';

import {
  getHeaders,
  default as api,
  apiPost,
  apiGet,
  apiPut,
  apiPatch,
  apiDelete,
} from '../sagas/api';

import { getToken } from '../selectors/account';
import { getApiRoot, getTokenType } from '../selectors/env';

const mockToken = 'mock_token';
const mockTokenType = 'Token';
const mockApiRoot = 'http://testserver.com';

const mockLogin = { email: 'test@test.com', password: 'password' };
const mockSignup = {
  name: 'Test1',
  email: 'test1@test.com',
  password1: 'password',
  password2: 'password',
};
const mockPatchUser = { name: 'Test2' };

const mockHeadersWithoutAuth = {
  headers: {
    'Content-Type': 'application/json',
  },
};

const mockHeadersWithAuth = {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `${mockTokenType} ${mockToken}`,
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
    .select(getTokenType)
    .next(mockTokenType)
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

it('Test api.signup', async () => {

  axios.post.mockImplementation(() => Promise.resolve({ data: 'success'}));

  testSaga(api.signup, mockSignup)
    .next()
    .call(getHeaders, false)
    .next(mockHeadersWithoutAuth)
    .select(getApiRoot)
    .next(mockApiRoot);

  expect(axios.post).toHaveBeenCalledWith(
    `${mockApiRoot}/api/signup/`,
    mockSignup,
    mockHeadersWithoutAuth
  );
});

it('Test api.patchUser', async () => {

  axios.patch.mockImplementation(() => Promise.resolve({ data: 'success'}));

  testSaga(api.patchUser, mockPatchUser)
    .next()
    .call(getHeaders, true)
    .next(mockHeadersWithAuth)
    .select(getApiRoot)
    .next(mockApiRoot);

  expect(axios.patch).toHaveBeenCalledWith(
    `${mockApiRoot}/api/user/`,
    mockPatchUser,
    mockHeadersWithAuth
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

it('Test apiPost', async () => {

  axios.post.mockImplementation(() => Promise.resolve({ data: 'success'}));

  const testUrl = 'test/post/';
  const testData = {'test': 'value'};

  testSaga(apiPost, testUrl, testData, true)
    .next()
    .call(getHeaders, true)
    .next(mockHeadersWithAuth)
    .select(getApiRoot)
    .next(mockApiRoot);

  expect(axios.post).toHaveBeenCalledWith(
    `${mockApiRoot}/${testUrl}`,
    testData,
    mockHeadersWithAuth
  );
});

it('Test apiGet', async () => {

  axios.get.mockImplementation(() => Promise.resolve({ data: 'success'}));

  const testUrl = 'test/get/';
  const testData = {'test': 'value'};

  const testUrlWithParams = `${testUrl}?test=value`;

  testSaga(apiGet, testUrl, testData, true)
    .next()
    .call(getHeaders, true)
    .next(mockHeadersWithAuth)
    .select(getApiRoot)
    .next(mockApiRoot);

  expect(axios.get).toHaveBeenCalledWith(
    `${mockApiRoot}/${testUrlWithParams}`,
    mockHeadersWithAuth
  );
});

it('Test apiPut', async () => {

  axios.put.mockImplementation(() => Promise.resolve({ data: 'success'}));

  const testUrl = 'test/put/';
  const testData = {'test': 'value'};

  testSaga(apiPut, testUrl, testData, true)
    .next()
    .call(getHeaders, true)
    .next(mockHeadersWithAuth)
    .select(getApiRoot)
    .next(mockApiRoot);

  expect(axios.put).toHaveBeenCalledWith(
    `${mockApiRoot}/${testUrl}`,
    testData,
    mockHeadersWithAuth
  );
});

it('Test apiPatch', async () => {

  axios.patch.mockImplementation(() => Promise.resolve({ data: 'success'}));

  const testUrl = 'test/patch/';
  const testData = {'test': 'value'};

  testSaga(apiPatch, testUrl, testData, true)
    .next()
    .call(getHeaders, true)
    .next(mockHeadersWithAuth)
    .select(getApiRoot)
    .next(mockApiRoot);

  expect(axios.patch).toHaveBeenCalledWith(
    `${mockApiRoot}/${testUrl}`,
    testData,
    mockHeadersWithAuth
  );
});

it('Test apiDelete', async () => {

  axios.delete.mockImplementation(() => Promise.resolve({ data: 'success'}));

  const testUrl = 'test/delete/1';

  testSaga(apiDelete, testUrl, true)
    .next()
    .call(getHeaders, true)
    .next(mockHeadersWithAuth)
    .select(getApiRoot)
    .next(mockApiRoot);

  expect(axios.delete).toHaveBeenCalledWith(
    `${mockApiRoot}/${testUrl}`,
    mockHeadersWithAuth
  );
});
