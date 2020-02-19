export const SET_ENV = 'ENV/SET_ENV';

export const setEnv = (envData) => {
  return {
    type: SET_ENV,
    ...envData,
  };
};
