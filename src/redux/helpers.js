import { all, call } from 'redux-saga/effects';

export const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Take at least 500ms.
export function* minDelayCall (...callArgs) {
  const [ result ] = yield all([
    yield call(...callArgs),
    yield call(delay, 500),
  ]);

  return result;
}

export const action = (type) => ({ type });
