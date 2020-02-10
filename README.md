# react-core

> Contains core react functionality developed by Apax Software LLC

## Install

Add the following to your `package.json` under `dependencies`:

```bash
"dependencies": {
  ...
  "react-core": "ssh://git@bitbucket.org:apaxsoftware/react-core.git#<version>",
  ...
}
```

then run:

```bash
yarn install
```

## Usage

```jsx
import React, { Component } from 'react'

import MyComponent from 'react-core'

class Example extends Component {
  render () {
    return (
      <MyComponent />
    )
  }
}
```

## License

This library is intended for the sole use of Apax Software LLC

© [apaxsoftware](https://bitbucket.org/apaxsoftware/react-core/)
