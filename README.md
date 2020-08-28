# apax-react-core

[![Build Status](https://travis-ci.org/apaxsoftware/apax-react-core.svg?branch=master)](https://travis-ci.org/apaxsoftware/apax-react-core)

Contains core react functionality developed by Apax Software LLC

Available functionality includes handling user account signup and login to DRF backends.

## Usage

### Connecting Locally

To connect to this repository locally, go to the root directory for apax-react-core:

```
yarn link
```

Then go to the project you want to connect (at the root level) and enter:

```
yarn link apax-react-core
```

To separate the projects again:

```
yarn unlink
```

inside apax-react-core level terminal.

### Initialize Environment

This library requires a bit of configuration before it can be used. To do this, dispatch the following
action early on in your application startup:

`setEnv({app_evironment})`

#### Example:

```
./redux/sagas.js

import { put } from 'react-saga/effects';
import { setEnv } from 'apax-react-core';

function* rootSaga () {
  ...

  yield put(setEnv({
    api_domain: process.env.REACT_APP_API_DOMAIN,
    api_root: process.env.REACT_APP_API_ROOT,
    token_name: process.env.REACT_APP_TOKEN_NAME,
  }));

  ...
}

./redux/index.js

...
import { envReducer as env } from 'apax-react-core';

...

export const rootReducer = combineReducers({
  env,
  ...
})
```

#### Environment Options

```
{
  // Domain name of backing server
  api_domain: 'localhost:8000',

  // Root URL of the api (do not include the '/api')
  api_root: 'http://localhost:8000',

  // Name to give the cookie when storing the user token
  token_name: 'react_core_app'
}
```

### User Account

This library provides signup and login functionality for DRF backends. To use this functionality
add the `account` sagas and reducers to you application:

```
./redux/index.js

import { accountReducer as account } from 'apax-react-core';

export const rootReducer = combineReducer({
  account,
  ...
});


./redux/sagas.js

import { accountSagas } from 'apax-react-core';

function* rootSaga () {
  ...
  yield call(accountSagas);
}

export default rootSaga;
```

### Signup User

```
./pages/auth/Signup.js

import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { signup } from 'apax-react-core';

...

export default function Signup() {
  const history = useHistory();
  const dispatch = useDispatch();

  ...

  const onFormSubmit = (formData) => {
    dispatch(signup(formData, history));
  }
  ...
}
```

### Login User

```
./pages/auth/Login.js

import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { login } from 'apax-react-core';

...

export default function Signup() {
  const history = useHistory();
  const dispatch = useDispatch();

  ...

  const onFormSubmit = (creds) => {
    dispatch(login(creds, history));
  }
  ...
}
```

### Persistent Login

By default `apax-react-core` will store the users token as a cookie after login. However, there may be some cases where
cookie storage is unavailable (such as React-Native environments) and so users logged in state will not persist between app loads.

This can be solved by storing the user token in the app (returned as `key` from `LOGIN_SUCCESS` or `SIGNUP_SUCCESS`) and then
triggering a `SET_USER_TOKEN` action when the app first loads. This action will set the user token and trigger a call to `LOAD_USER`,
effectively logging in the user.

#### Example

```
function* persistLogin() {
  const user = yield select(getUser);

  if (!user) {
    const token = yield AsyncStorage.getItem(USER_TOKEN_KEY);

    if (token) {
      yield put(setUserToken(token));
    } else {
      // Wait for login or signup and store the token in local storage
      const { key } = yield take([LOGIN_SUCCESS, SIGNUP_SUCCESS]);

      yield AsyncStorage.setItem(USER_TOKEN_KEY, key);
    }
  }
}
```

### API

The following API methods are available:

`apiGet(path, data|options)`

`apiPost(path, data|options)`

`apiPut(path, data|options)`

`apiPatch(path, data|options)`

`apiDelete(path, authenticationRequired = true)`

#### Options

Default options for the `apiGet`, `apiPost`, `apiPut`, and `apiPatch` methods can be overridden using
the format below (all fields are optional):

**Note:** When overriding options, request `data` must be passed along inside of `options`.

```
{
  /*
    Request data

    default: null
  */
  data: object,

  /*
    Extra headers to include with the request (key/value pairs)

    default: undefined
  */
  headers: object,

  /*
   Should request include authentication headers

   default: true
  */
  authenticationRequired: boolean,
}
```

#### Usage

```

import {
apiGet
} from 'apax-react-core';

...

const response = yield apiGet('api/mypath/');

```

## License

MIT License

Copyright (c) 2020 [Apax Software LLC](https://bitbucket.org/apaxsoftware/react-core/)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
