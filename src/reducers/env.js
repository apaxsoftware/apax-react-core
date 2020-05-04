import * as Actions from '../actions/env';

const initialState = {
  api_domain: '',
  api_root: '',
  token_name: '',
  token_type: '',
};

export default (state = initialState, action) => {
  switch (action.type) {
    case Actions.SET_ENV:
      return {
        ...state,

        api_domain: action.api_domain,
        api_root: action.api_root,
        token_name: action.token_name,
        token_type: action.token_type,
      };

    default:
      return state;
  }
};
