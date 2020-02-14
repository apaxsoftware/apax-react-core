import { expectSaga, testSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import { throwError } from 'redux-saga-test-plan/providers';
import Cookies from 'universal-cookie';
import * as _ from 'lodash';
import { mockHistory } from './helpers';
import { action } from '../../redux/helpers';
import { loginFlow, login, loadUser, TOKEN_COOKIE } from '../account/sagas';
import { initialState } from '../account/reducer';
import { accountReducer } from '../account';
import { getUser, getToken } from '../account/selectors';
import {
  login as loginAction,
  logout as logoutAction,
  LOGIN,
  LOGIN_SUCCESS,
  LOGIN_ERROR,
  LOGOUT,
  LOAD_USER,
  LOAD_USER_ERROR,
  LOAD_USER_SUCCESS,
} from '../account/actions';

const mockUser = {
  id: 1,
  name: 'Mock User',
  email: 'mock.user@test.com',
  password: 'mockPa$$word'
};

// Mock the entire cookies module (Cookies.*)
jest.mock('universal-cookie', () => {
  const mCookie = {
    get: jest.fn(),
    remove: jest.fn()
  };
  return jest.fn(() => mCookie);
});

const mockToken = 'mock_token';

it('Test loginFlow saga', async () => {
  testSaga(loginFlow)
    .next()
    // Saga attempts to load user
    .select(getUser)
    .next()
    // No user found, Saga waits for login
    .take(LOGIN)
    // Trigger login action
    .next(loginAction(mockUser, 0))
    // Saga calls login
    .call(login, mockUser.email, mockUser.password, 0)
    .next()
    .select(getUser)
    .next(mockUser)
    // Saga select new token
    .select(getToken)
    .next()
    // Saga settles and waits for LOGOUT
    .take(LOGOUT)
});

it('Test loginFlow saga with existing token', async () => {

  (new Cookies()).get.mockReturnValue(mockToken);

  testSaga(loginFlow)
    .next()
    // Load user
    .call(loadUser, mockToken)
    .next()
    // Grab user from store
    .select(getUser)
    .next(mockUser)
    // User found, skip over login
    .select(getUser)
    .next(mockUser)
    // Saga selects token for user
    .select(getToken)
    .next()
    // Saga settles in waiting for LOGOUT
    .take(LOGOUT)
});

it('Test login saga with logout', async () => {
  (new Cookies()).get.mockReturnValue(mockToken);

  testSaga(loginFlow)
    .next()
    // Load user
    .call(loadUser, mockToken)
    .next()
    // Grab user from store
    .select(getUser)
    .next(mockUser)
    // User found, skip over login
    .select(getUser)
    .next(mockUser)
    // Saga selects token for user
    .select(getToken)
    .next()
    // Saga settles in waiting for LOGOUT
    .take(LOGOUT)
    // Trigger logout action
    .next(logoutAction)

    // Assert that user token was cleared
    expect((new Cookies()).remove).toHaveBeenCalled();
});

it('Test login saga with error', async () => {

  const fakeError = new Error();
  fakeError.response = {
    data: "Some error happend"
  };

  testSaga(login)
    .next()
    .throw(fakeError)
    .put({ type: LOGIN_ERROR, error: fakeError.response.data})
});

it('Test load user', async () => {
  testSaga(loadUser, mockToken)
    .next()
    // Saga triggers LOAD_USER
    .put({ type: LOAD_USER })
    // Skip delay call
    .next()
    // Mock user returned
    .next(mockUser)
    // Saga triggers LOAD_USER_SUCCESS
    .put({ type: LOAD_USER_SUCCESS, user: {...mockUser}, token: mockToken})
    .next()
    .isDone()
})

it('Test load user with error', async () => {

  const mockError = new Error()

  testSaga(loadUser, mockToken)
    .next()
    // Saga triggers LOAD_USER
    .put({ type: LOAD_USER })
    .next()
    // Trigger error
    .throw(mockError)
    // Saga triggers LOAD_USER_ERROR
    .put({ type: LOAD_USER_ERROR })
    .next()
    .isDone()

    // Verify current token was cleared
    expect((new Cookies()).remove).toHaveBeenCalled();
})

