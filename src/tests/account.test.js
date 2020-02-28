import { testSaga } from 'redux-saga-test-plan';
import Cookies from 'universal-cookie';
import {
  loginFlow,
  doLogin,
  doSignup,
  loadUser,
} from '../sagas/account';
import { getUser } from '../selectors/account';
import { getTokenName } from '../selectors/env';
import {
  login as loginAction,
  logout as logoutAction,
  signup as signupAction,
  setUserToken,
  LOGIN,
  SIGNUP,
  SIGNUP_SUCCESS,
  LOGIN_SUCCESS,
  LOGIN_ERROR,
  LOGOUT,
  LOAD_USER,
  LOAD_USER_ERROR,
  LOAD_USER_SUCCESS,
} from '../actions/account';

const mockUser = {
  id: 1,
  name: 'Mock User',
  email: 'mock.user@test.com',
  password: 'mockPa$$word',
};

const mockSignupUser = {
  id: 2,
  name: 'Test1',
  email: 'test1@test.com',
  password1: 'password',
  password2: 'password',
};

// Mock the entire cookies module (Cookies.*)
jest.mock('universal-cookie', () => {
  const mCookie = {
    get: jest.fn(),
    remove: jest.fn(),
    set: jest.fn(),
  };

  return jest.fn(() => mCookie);
});

const mockToken = 'mock_token';
const mockTokenName = 'account_tests';

it('Test loginFlow saga', async () => {
  testSaga(loginFlow)
    .next()
    .select(getTokenName)
    .next(mockToken)
    // Saga attempts to load user
    .select(getUser)
    .next()
    // No user found, Saga waits for login or signup
    .take([LOGIN, SIGNUP])
    // Trigger login action
    .next(loginAction({
      email: mockUser.email,
      password: mockUser.password,
    }))
    // Saga calls login
    .call(doLogin, loginAction(
      {
        email: mockUser.email,
        password: mockUser.password,
      })
    )
    .next()
    .select(getUser)
    .next(mockUser)
    // Saga settles and waits for LOGOUT
    .take(LOGOUT);
});

it('Test loginFlow saga with existing token', async () => {

  (new Cookies()).get.mockReturnValue(mockToken);

  testSaga(loginFlow)
    .next()
    .select(getTokenName)
    .next(mockTokenName)
    // Load user
    .call(loadUser, mockToken)
    .next()
    // Grab user from store
    .select(getUser)
    .next(mockUser)
    // User found, skip over login
    .select(getUser)
    .next(mockUser)
    // Saga settles in waiting for LOGOUT
    .take(LOGOUT);
});

it('Test loginFlow saga with logout', async () => {
  (new Cookies()).get.mockReturnValue(mockToken);

  testSaga(loginFlow)
    .next()
    .select(getTokenName)
    .next(mockTokenName)
    // Load user
    .call(loadUser, mockToken)
    .next()
    // Grab user from store
    .select(getUser)
    .next(mockUser)
    // User found, skip over login
    .select(getUser)
    .next(mockUser)
    // Saga settles in waiting for LOGOUT
    .take(LOGOUT)
    // Trigger logout action
    .next(logoutAction)
    .select(getTokenName)
    .next(getTokenName);

  // Assert that user token was cleared
  expect((new Cookies()).remove).toHaveBeenCalled();
});

it('Test loginFlow with signup', async () => {

  (new Cookies()).get.mockReturnValue(null);

  testSaga(loginFlow)
    .next()
    .select(getTokenName)
    .next(mockToken)
    // Saga attempts to load user
    .select(getUser)
    .next()
    // No user found, Saga waits for login or signup
    .take([LOGIN, SIGNUP])
    // Trigger login action
    .next(signupAction({...mockSignupUser}))
    // Saga calls login
    .call(doSignup, signupAction(
      {...mockSignupUser})
    )
    .next()
    .select(getUser)
    .next(mockUser)
    // Saga settles and waits for LOGOUT
    .take(LOGOUT);

});

it('Test signup saga', async () => {
  testSaga(doSignup, signupAction(
    {
      ...mockSignupUser,
    }))
    .next()
    .next({...mockSignupUser, key: mockToken})
    .select(getTokenName)
    .next(mockTokenName)
    .put({ type: SIGNUP_SUCCESS, ...mockSignupUser, key: mockToken })
    .next()
    .isDone();

  expect((new Cookies().set)).toHaveBeenCalledWith(
    mockTokenName,
    mockToken,
    { path: '/' }
  );
});

it('Test login saga', async () => {
  testSaga(doLogin, loginAction(
    {
      ...mockUser,
    }))
    .next()
    .next({...mockUser, key: mockToken})
    .select(getTokenName)
    .next(mockTokenName)
    .put({ type: LOGIN_SUCCESS, ...mockUser, key: mockToken })
    .next()
    .isDone();

  expect((new Cookies().set)).toHaveBeenCalledWith(
    mockTokenName,
    mockToken,
    { path: '/' }
  );
});

it('Test login saga with error', async () => {

  const fakeError = new Error();
  fakeError.response = {
    data: 'Some error happend',
  };

  testSaga(doLogin, loginAction({
    email: mockUser.email,
    password: mockUser.password,
  }))
    .next()
    .throw(fakeError)
    .put({ type: LOGIN_ERROR, error: fakeError.response.data})
    .next()
    .isDone();
});

it('Test load user', async () => {
  testSaga(loadUser, mockToken)
    .next()
    // Saga triggers LOAD_USER
    .put({ type: LOAD_USER })
    // Skip delay call
    .next()
    .put(setUserToken(mockToken))
    .next()
    // Mock user returned
    .next(mockUser)
    // Saga triggers LOAD_USER_SUCCESS
    .put({ type: LOAD_USER_SUCCESS, user: {...mockUser}})
    .next()
    .isDone();
});

it('Test load user with error', async () => {

  const mockError = new Error();

  testSaga(loadUser, mockToken)
    .next()
    // Saga triggers LOAD_USER
    .put({ type: LOAD_USER })
    .next()
    // Trigger error
    .throw(mockError)
    // Saga triggers LOAD_USER_ERROR
    .select(getTokenName)
    .next(mockTokenName)
    .put({ type: LOAD_USER_ERROR })
    .next()
    .isDone();

  // Verify current token was cleared
  expect((new Cookies()).remove).toHaveBeenCalled();
});
