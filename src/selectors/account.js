export const getUser = ({ account }) =>  account ? account.user : null;

export const getToken = ({ account }) => {
  if (!!account.token) {
    return account.token;
  } else if (!!env.token_name) {
    return new Cookies().get(env.token_name);
  } else {
    return null;
  }
};

export const getTokenType = ({ account }) => account ? account.token_type : 'Token';
