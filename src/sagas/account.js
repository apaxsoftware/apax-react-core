import {
  all,
  call,
  put,
  take,
  takeEvery,
  select,
} from 'redux-saga/effects';
import Cookies from 'universal-cookie';

import {
  LOGIN,
  LOGIN_SUCCESS,
  LOGIN_ERROR,
  SIGNUP,
  SIGNUP_SUCCESS,
  SIGNUP_ERROR,
  LOAD_USER,
  LOAD_USER_SUCCESS,
  LOAD_USER_ERROR,
  LOGOUT,
  PATCH_USER,
  PATCH_USER_SUCCESS,
  PATCH_USER_ERROR,
  setUserToken,
  SET_USER_TOKEN,
} from '../actions/account';

import api from './api';
import { getUser, getToken } from '../selectors/account';
import { getTokenName } from '../selectors/env';
import { minDelayCall } from './helpers';

export function * doSignup (action) {
  const { formData } = action;

  try {
    const response = yield minDelayCall(api.signup, formData);
    response['nextRoute'] = formData.nextRoute;

    // Persist token for future page loads
    const tokenName = yield select(getTokenName);
    new Cookies().set(tokenName, response.key, { path: '/' });

    yield put({ type: SIGNUP_SUCCESS, ...response });
  } catch (error) {
    yield put({ type: SIGNUP_ERROR, error: error.response.data });
  }
}

export function* doLogin (action) {
  const { formData } = action;

  try {
    const response = yield minDelayCall(api.login, formData);
    response['nextRoute'] = formData.nextRoute;

    // Persist token for future page loads
    const tokenName = yield select(getTokenName);
    new Cookies().set(tokenName, response.key, { path: '/' });

    yield put({ type: LOGIN_SUCCESS, ...response });
  } catch (error) {
    yield put({ type: LOGIN_ERROR, error: error.response.data });
  }
}

export function* loadUser ( token = null ) {
  // Set user loading
  yield put({ type: LOAD_USER });

  try {

    if(token) {
      yield put(setUserToken(token));
    }

    if (yield select(getToken)) {
      const user = yield minDelayCall(api.loadUser);

      yield put({ type: LOAD_USER_SUCCESS, user});
    } else {
      yield put({ type: LOAD_USER_ERROR });
    }

  } catch (error) {
    // Token is bogus. Remove it.
    const tokenName = yield select(getTokenName);
    new Cookies().remove(tokenName, { path: '/' });

    yield put({ type: LOAD_USER_ERROR });
  }
}

export function* doPatchUser (action) {
  const { formData } = action;

  try {
    const response = yield call(api.patchUser, formData);

    yield put({ type: PATCH_USER_SUCCESS, response });
  } catch (error) {
    yield put({ type: PATCH_USER_ERROR, error: error.response.data });
  }
}

// Finite state machine for user session
export function* loginFlow () {
  while(true) {
    // Check for existing token
    const tokenName = yield select(getTokenName);
    const token = new Cookies().get(tokenName);

    if (token) {
      // Load the user if we found a token
      yield call(loadUser, token);
    }

    if (!(yield select(getUser))) {
      // Wait for login / signup if we don't have a user
      const action = yield take([LOGIN, SIGNUP, SET_USER_TOKEN]);

      switch (action.type) {
        case LOGIN:
          yield call(doLogin, action);
          break;
        case SIGNUP:
          yield call(doSignup, action);
          break;
        case SET_USER_TOKEN:
          yield call(loadUser);

      }
    }

    if (yield select(getUser)) {
      // Wait for logout
      yield take(LOGOUT);

      const tokenName = yield select(getTokenName);
      new Cookies().remove(tokenName, { path: '/' });
    }
  }
}

export default function* () {
  yield all([
    loginFlow(),
    takeEvery(PATCH_USER, doPatchUser),
  ]);
}
