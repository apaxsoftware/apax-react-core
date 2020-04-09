import * as Actions from '../actions/account';

export const initialState = {
  user: null,
  token: null,
  userLoading: false,
  loadUserError: null,
  loginPending: false,
  loginError: null,
  signupPending: false,
  signupError: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case Actions.SET_USER_TOKEN:
      return {
        ...state,
        token: action.token,
      };
    case Actions.SIGNUP:
      return {
        ...state,
        signupPending: true,
      };
    case Actions.SIGNUP_SUCCESS:
      return {
        ...state,
        signupPending: false,
        signupError: null,
        user: action.user,
        token: action.key,
      };
    case Actions.SIGNUP_ERROR:
      return {
        ...state,
        signupPending: false,
        signupError: action.error,
      };
    case Actions.LOGIN:
      return {
        ...state,
        loginPending: true,
      };
    case Actions.LOGIN_SUCCESS:
      return {
        ...state,
        loginPending: false,
        loginError: null,
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
    case Actions.CLEAR_ERRORS:
      return {
        ...state,
        signupError: null,
        loginError: null,
        loadUserError: null,
      };
    default:
      return state;
  }
};
