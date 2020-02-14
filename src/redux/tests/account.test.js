import { testSaga } from 'redux-saga-test-plan';
import Cookies from 'universal-cookie';
import { mockHistory } from './helpers';
import {
  loginFlow,
  login as loginSaga,
  signup as signupSaga,
  loadUser,
  TOKEN_COOKIE,
} from '../account/sagas';
import { getUser, getToken } from '../account/selectors';
import {
  login as loginAction,
  logout as logoutAction,
  signup as signupAction,
  LOGIN,
  SIGNUP,
  SIGNUP_SUCCESS,
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

it('Test loginFlow saga', async () => {
  testSaga(loginFlow)
    .next()
    // Saga attempts to load user
    .select(getUser)
    .next()
    // No user found, Saga waits for login or signup
    .take([LOGIN, SIGNUP])
    // Trigger login action
    .next(loginAction({
      email: mockUser.email,
      password: mockUser.password,
    }, mockHistory,))
    // Saga calls login
    .call(loginSaga, loginAction(
      {
        email: mockUser.email,
        password: mockUser.password,
      },
      mockHistory)
    )
    .next()
    .select(getUser)
    .next(mockUser)
    // Saga select new token
    .select(getToken)
    .next()
    // Saga settles and waits for LOGOUT
    .take(LOGOUT);
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
    .take(LOGOUT);
});

it('Test loginFlow saga with logout', async () => {
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
    .next(logoutAction);

  // Assert that user token was cleared
  expect((new Cookies()).remove).toHaveBeenCalled();
});

it('Test loginFlow with signup', async () => {

  (new Cookies()).get.mockReturnValue(null);

  testSaga(loginFlow)
    .next()
    // Saga attempts to load user
    .select(getUser)
    .next()
    // No user found, Saga waits for login or signup
    .take([LOGIN, SIGNUP])
    // Trigger login action
    .next(signupAction({...mockSignupUser}, mockHistory))
    // Saga calls login
    .call(signupSaga, signupAction(
      {...mockSignupUser},
      mockHistory)
    )
    .next()
    .select(getUser)
    .next(mockUser)
    // Saga select new token
    .select(getToken)
    .next()
    // Saga settles and waits for LOGOUT
    .take(LOGOUT);

});

it('Test signup saga', async () => {
  testSaga(signupSaga, signupAction(
    {
      ...mockSignupUser,
    }, mockHistory))
    .next()
    .next({...mockSignupUser, key: mockToken})
    .put({ type: SIGNUP_SUCCESS, ...mockSignupUser, key: mockToken })
    .next()
    .isDone();

  expect(mockHistory.replace).toHaveBeenCalledWith('/');
  expect((new Cookies().set)).toHaveBeenCalledWith(
    TOKEN_COOKIE,
    mockToken,
    { path: '/' }
  );
});

it('Test login saga', async () => {
  testSaga(loginSaga, loginAction(
    {
      ...mockUser,
    }, mockHistory))
    .next()
    .next({...mockUser, key: mockToken})
    .put({ type: LOGIN_SUCCESS, ...mockUser, key: mockToken })
    .next()
    .isDone();

  expect(mockHistory.replace).toHaveBeenCalledWith('/');
  expect((new Cookies().set)).toHaveBeenCalledWith(
    TOKEN_COOKIE,
    mockToken,
    { path: '/' }
  );
});

it('Test login saga with error', async () => {

  const fakeError = new Error();
  fakeError.response = {
    data: 'Some error happend',
  };

  testSaga(loginSaga, loginAction({
    email: mockUser.email,
    password: mockUser.password,
  }, mockHistory))
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
    // Mock user returned
    .next(mockUser)
    // Saga triggers LOAD_USER_SUCCESS
    .put({ type: LOAD_USER_SUCCESS, user: {...mockUser}, token: mockToken})
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
    .put({ type: LOAD_USER_ERROR })
    .next()
    .isDone();

  // Verify current token was cleared
  expect((new Cookies()).remove).toHaveBeenCalled();
});
