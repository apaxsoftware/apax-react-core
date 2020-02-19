import * as Actions from '../actions/env';

const initialState = {
  API_DOMAIN: '',
  API_ROOT: '',
};

export default (state = initialState, action) => {
  switch (action.type) {
    case Actions.SET_ENV:
      return {
        ...state,

        API_DOMAIN: action.env.api_domain,
        API_ROOT: action.env.api_root,
      };

    default:
      return state;
  }
};
