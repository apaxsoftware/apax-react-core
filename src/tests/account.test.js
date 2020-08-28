import { testSaga } from 'redux-saga-test-plan';
import Cookies from 'universal-cookie';
import {
  loginFlow,
  doLogin,
  doSignup,
  loadUser,
  doPatchUser,
} from '../sagas/account';
import { getUser, getToken } from '../selectors/account';
import { getTokenName } from '../selectors/env';
import {
  login as loginAction,
  logout as logoutAction,
  signup as signupAction,
  patchUser as patchUserAction,
  setUserToken,
  LOGIN,
  SIGNUP,
  SIGNUP_SUCCESS,
  SIGNUP_ERROR,
  LOGIN_SUCCESS,
  LOGIN_ERROR,
  LOGOUT,
  LOAD_USER,
  LOAD_USER_ERROR,
  LOAD_USER_SUCCESS,
  PATCH_USER_SUCCESS,
  PATCH_USER_ERROR,
  SET_USER_TOKEN,
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

const mockPatchUser = {
  name: 'Test2',
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
    .take([LOGIN, SIGNUP, SET_USER_TOKEN])
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
    .take([LOGIN, SIGNUP, SET_USER_TOKEN])
    // Trigger login action
    .next(signupAction({...mockSignupUser}))
    // Saga calls signup
    .call(doSignup, signupAction(
      {...mockSignupUser})
    )
    .next()
    .select(getUser)
    .next(mockUser)
    // Saga settles and waits for LOGOUT
    .take(LOGOUT);

});

it('Test loginFlow with set token', async () => {

  (new Cookies()).get.mockReturnValue(null);

  testSaga(loginFlow)
    .next()
    .select(getTokenName)
    .next(mockToken)
    // Saga attempts to load user
    .select(getUser)
    .next()
    // No user found, Saga waits for login or signup
    .take([LOGIN, SIGNUP, SET_USER_TOKEN])
    // Trigger login action
    .next(setUserToken(mockToken))
    // Saga calls login
    .call(loadUser)
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
    .put({ type: SIGNUP_SUCCESS, ...mockSignupUser, key: mockToken, nextRoute: undefined })
    .next()
    .isDone();

  expect((new Cookies().set)).toHaveBeenCalledWith(
    mockTokenName,
    mockToken,
    { path: '/' }
  );
});

it('Test signup saga with error', async () => {
  const fakeError = new Error();
  fakeError.response = {
    data: 'Some error happend',
  };

  testSaga(doSignup, signupAction(mockSignupUser))
    .next()
    .throw(fakeError)
    .put({ type: SIGNUP_ERROR, error: fakeError.response.data})
    .next()
    .isDone();
});

it('Test signup saga with nextRoute', async () => {
  testSaga(doSignup, signupAction(
    {
      ...mockSignupUser,
      nextRoute: {path: '/'},
    }))
    .next()
    .next({...mockSignupUser, key: mockToken})
    .select(getTokenName)
    .next(mockTokenName)
    .put({ type: SIGNUP_SUCCESS, ...mockSignupUser, key: mockToken, nextRoute: {path: '/'} })
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
    .put({ type: LOGIN_SUCCESS, ...mockUser, key: mockToken, nextRoute: undefined })
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
      nextRoute: {path: '/'},
    }))
    .next()
    .next({...mockUser, key: mockToken})
    .select(getTokenName)
    .next(mockTokenName)
    .put({ type: LOGIN_SUCCESS, ...mockUser, key: mockToken, nextRoute: {path: '/'} })
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
    .select(getToken)
    .next(mockToken)
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

it('Test doPatchUser saga', async () => {
  testSaga(doPatchUser, mockPatchUser)
    // Call patch user action
    .next(patchUserAction(mockPatchUser))
    .next(mockPatchUser)
    // Saga triggers PATCH_USER_SUCCESS
    .put({ type: PATCH_USER_SUCCESS, response: mockPatchUser })
    .next()
    .isDone();
});

it('Test patch user saga with error', async () => {
  const fakeError = new Error();
  fakeError.response = {
    data: 'Some error happend',
  };

  testSaga(doPatchUser, patchUserAction(mockPatchUser))
    .next()
    .throw(fakeError)
    .put({ type: PATCH_USER_ERROR, error: fakeError.response.data})
    .next()
    .isDone();
});
