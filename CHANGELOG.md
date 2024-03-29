## Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.7] - 2021-07-19

### Changed

- Check for status code existence before checking status value. Related to axios issues.

## [1.1.6] - 2021-07-15

### Changed

- Add fix for axios.
- Update tests

## [1.1.2] - 2021-05-21

### Changed

- Updated all axios.then() to use lodash _.get().

## [1.1.1] - 2021-05-03

### Changed

- Updated error responses in account sagas.

### Added

- Dependabot update of websocket-extensions
- Dependabot update of http-proxy, debug, eventemitter3, and follow-redirects

## [1.1.0] - 2020-08-28

### Added

- SET_USER_TOKEN action now triggers a call to load user.
- Changes to support persistent login for non-web apps

## [1.0.0] - 2020-08-18

### Added

- Now supports custom headers for requests
- Updated lodash to 4.17.19

### Breaking Change

- `authenticationRequired` flag moved into `options` parameter (see README for more information)

## 0.3.0

- Added apiGet, apiPost, apiPut, apiPatch and apiDelete to api sagas

## beta

### Changed

- Initial release of library
