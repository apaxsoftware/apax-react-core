# apax-react-core
[![Build Status](https://travis-ci.org/apaxsoftware/apax-react-core.svg?branch=master)](https://travis-ci.org/apaxsoftware/apax-react-core)

Contains core react functionality developed by Apax Software LLC

Available functionality includes handling user account signup and login to DRF backends.


## Usage

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

}

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

}


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
