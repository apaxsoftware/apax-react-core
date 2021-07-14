import { testSaga } from 'redux-saga-test-plan';
import * as axios from 'axios';

import {
  validateStatus,
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

import * as _ from 'lodash';

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
  'Content-Type': 'application/json',
};

const mockHeadersWithAuth = {
  'Content-Type': 'application/json',
  'Authorization': `${mockTokenType} ${mockToken}`,
};

const mockCustomHeaders = {
  'Test-Value': 'Test_Value',
};

jest.mock('axios');

it('Test get headers without authentication', async () => {
  testSaga(getHeaders, { 'authenticationRequired': false })
    .next()
    .returns(mockHeadersWithoutAuth)
    .next()
    .isDone();
});

it('Test get headers with authentication', async () => {
  testSaga(getHeaders, { 'authenticationRequired': true })
    .next()
    .select(getToken)
    .next(mockToken)
    .select(getTokenType)
    .next(mockTokenType)
    .returns(mockHeadersWithAuth)
    .next()
    .isDone();
});

it('Test get headers with custom headers', async () => {
  testSaga(getHeaders, { 'authenticationRequired': false, 'customHeaders': mockCustomHeaders })
    .next()
    .returns(_.merge({}, mockHeadersWithoutAuth, mockCustomHeaders))
    .next()
    .isDone();
});

it('Test api.login', async () => {

  axios.post.mockImplementation(() => Promise.resolve({ data: 'success'}));

  testSaga(api.login, mockLogin)
    .next()
    .call(getHeaders, { 'authenticationRequired': false, 'customHeaders': undefined })
    .next(mockHeadersWithoutAuth)
    .select(getApiRoot)
    .next(mockApiRoot);

  expect(axios.post).toHaveBeenCalledWith(
    `${mockApiRoot}/api/login/`,
    mockLogin,
    {
      'headers': mockHeadersWithoutAuth,
      validateStatus,
    }
  );
});

it('Test api.signup', async () => {

  axios.post.mockImplementation(() => Promise.resolve({ data: 'success'}));

  testSaga(api.signup, mockSignup)
    .next()
    .call(getHeaders, { 'authenticationRequired': false, 'customHeaders': undefined })
    .next(mockHeadersWithoutAuth)
    .select(getApiRoot)
    .next(mockApiRoot);

  expect(axios.post).toHaveBeenCalledWith(
    `${mockApiRoot}/api/signup/`,
    mockSignup,
    {
      'headers': mockHeadersWithoutAuth,
      validateStatus,
    }
  );
});

it('Test api.patchUser', async () => {

  axios.patch.mockImplementation(() => Promise.resolve({ data: 'success'}));

  testSaga(api.patchUser, mockPatchUser)
    .next()
    .call(getHeaders, { 'authenticationRequired': true, 'customHeaders': undefined })
    .next(mockHeadersWithAuth)
    .select(getApiRoot)
    .next(mockApiRoot);

  expect(axios.patch).toHaveBeenCalledWith(
    `${mockApiRoot}/api/user/`,
    mockPatchUser,
    {
      'headers': mockHeadersWithAuth,
      validateStatus,
    }
  );
});

it('Test api.loadUser', async () => {
  axios.get.mockImplementation(() => Promise.resolve({ data: 'success'}));

  testSaga(api.loadUser)
    .next()
    .call(getHeaders, { 'authenticationRequired': true, 'customHeaders': undefined })
    .next(mockHeadersWithAuth)
    .select(getApiRoot)
    .next(mockApiRoot);

  expect(axios.get).toHaveBeenCalledWith(
    `${mockApiRoot}/api/user/`,
    {
      'headers': mockHeadersWithAuth,
      validateStatus,
    }
  );
});

it('Test apiPost', async () => {

  axios.post.mockImplementation(() => Promise.resolve({ data: 'success'}));

  const testUrl = 'test/post/';
  const testData = {'test': 'value'};

  testSaga(apiPost, testUrl, testData, true)
    .next()
    .call(getHeaders, { 'authenticationRequired': true, 'customHeaders': undefined })
    .next(mockHeadersWithAuth)
    .select(getApiRoot)
    .next(mockApiRoot);

  expect(axios.post).toHaveBeenCalledWith(
    `${mockApiRoot}/${testUrl}`,
    testData,
    {
      'headers': mockHeadersWithAuth,
      validateStatus,
    }
  );
});

it('Test apiGet', async () => {

  axios.get.mockImplementation(() => Promise.resolve({ data: 'success'}));

  const testUrl = 'test/get/';
  const testData = {'test': 'value'};

  const testUrlWithParams = `${testUrl}?test=value`;

  testSaga(apiGet, testUrl, testData, true)
    .next()
    .call(getHeaders, { 'authenticationRequired': true, 'customHeaders': undefined })
    .next(mockHeadersWithAuth)
    .select(getApiRoot)
    .next(mockApiRoot);

  expect(axios.get).toHaveBeenCalledWith(
    `${mockApiRoot}/${testUrlWithParams}`,
    {
      'headers': mockHeadersWithAuth,
      validateStatus,
    }
  );
});

it('Test apiGet with custom headers', async () => {

  axios.get.mockImplementation(() => Promise.resolve({ data: 'success'}));

  const testUrl = 'test/get/';
  const testData = {'test': 'value'};

  const testUrlWithParams = `${testUrl}?test=value`;

  testSaga(apiGet, testUrl, { 'data': testData, 'headers': mockCustomHeaders }, true)
    .next()
    .call(getHeaders, { 'authenticationRequired': true, 'customHeaders': mockCustomHeaders })
    .next(mockHeadersWithAuth)
    .select(getApiRoot)
    .next(mockApiRoot);

  expect(axios.get).toHaveBeenCalledWith(
    `${mockApiRoot}/${testUrlWithParams}`,
    {
      'headers': mockHeadersWithAuth,
      validateStatus,
    }
  );
});

it('Test apiPut', async () => {

  axios.put.mockImplementation(() => Promise.resolve({ data: 'success'}));

  const testUrl = 'test/put/';
  const testData = {'test': 'value'};

  testSaga(apiPut, testUrl, testData, true)
    .next()
    .call(getHeaders, { 'authenticationRequired': true, 'customHeaders': undefined })
    .next(mockHeadersWithAuth)
    .select(getApiRoot)
    .next(mockApiRoot);

  expect(axios.put).toHaveBeenCalledWith(
    `${mockApiRoot}/${testUrl}`,
    testData,
    {
      'headers': mockHeadersWithAuth,
      validateStatus,
    }
  );
});

it('Test apiPatch', async () => {

  axios.patch.mockImplementation(() => Promise.resolve({ data: 'success'}));

  const testUrl = 'test/patch/';
  const testData = {'test': 'value'};

  testSaga(apiPatch, testUrl, testData, true)
    .next()
    .call(getHeaders, { 'authenticationRequired': true, 'customHeaders': undefined })
    .next(mockHeadersWithAuth)
    .select(getApiRoot)
    .next(mockApiRoot);

  expect(axios.patch).toHaveBeenCalledWith(
    `${mockApiRoot}/${testUrl}`,
    testData,
    {
      'headers': mockHeadersWithAuth,
      validateStatus,
    }
  );
});

it('Test apiDelete', async () => {

  axios.delete.mockImplementation(() => Promise.resolve({ data: 'success'}));

  const testUrl = 'test/delete/1';

  testSaga(apiDelete, testUrl, true)
    .next()
    .call(getHeaders, { authenticationRequired: true })
    .next(mockHeadersWithAuth)
    .select(getApiRoot)
    .next(mockApiRoot);

  expect(axios.delete).toHaveBeenCalledWith(
    `${mockApiRoot}/${testUrl}`,
    mockHeadersWithAuth
  );
});
