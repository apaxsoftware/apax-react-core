import * as Actions from './actions';

export const initialState = {
  user: null,
  token: null,
  userLoading: false,
  loginPending: false,
  loginError: null,
};

export default (state=initialState, action) => {
  console.log("action: " + action.type + action.error);
  switch (action.type) {
    case Actions.LOGIN:
      return {
        ...state,
        loginPending: true,
      };
    case Actions.LOGIN_SUCCESS:
      return {
        ...state,
        loginPending: false,
        user: action.user,
        token: action.key,
      };
    case Actions.LOGIN_ERROR:
      return {
        ...state,
        loginPending: false,
        loginError: action.error,
      };
    case Actions.LOAD_USER:
      return {
        ...state,
        userLoading: true,
      };
    case Actions.LOAD_USER_SUCCESS:
      return {
        ...state,
        userLoading: false,
        user: action.user,
        token: action.token,
      };
    case Actions.LOAD_USER_ERROR:
      return {
        ...state,
        userLoading: false,
      };
    case Actions.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
      };
    default:
      return state;
  }
};
