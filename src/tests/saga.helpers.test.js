import { put } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';

import { delay, minDelayCall } from '../sagas/helpers';

function elapsedTime(start, end) {
  return end - start;
}

function compareWithThreshold(num1, num2, threshold) {
  return Math.abs(num2 - num1) <= threshold;
}

function* testingSaga(delayMs) {
  yield delay(delayMs);

  yield put({payload: 'I am done!'});
}

it('Test delay function', done => {

  const delayMs = 500;
  const start = (new Date().getTime());

  delay(delayMs).then(() =>  {
    const end = (new Date()).getTime();

    const elapsed = elapsedTime(start, end);

    expect(compareWithThreshold(elapsed, delayMs, 10)).toBe(true);

    done();
  })

});

it('Test minDelay waits for at least the min wait time (500ms)', async () => {

  const start = (new Date()).getTime();
  const shortDelay = 250;

  expectSaga(minDelayCall, testingSaga, shortDelay)
    .put({payload: "I am done!"})

    // Increase timeout
    .run(1000)
    .then(() => {
      const end = (new Date()).getTime();

      const elapsed = elapsedTime(start, end);

      expect(compareWithThreshold(elapsed, 500, 10)).toBe(true);
    });
});

it('Test minDelay waits for longer running task', async () => {

  const start = (new Date()).getTime();
  const longDelay = 750;

  expectSaga(minDelayCall, testingSaga, longDelay)
    .put({payload: "I am done!"})

    // Increase timeout
    .run(1000)
    .then(() => {
      const end = (new Date()).getTime();

      const elapsed = elapsedTime(start, end);

      expect(compareWithThreshold(elapsed, longDelay, 10)).toBe(true);
    });
});