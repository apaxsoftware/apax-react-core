export const getUser = ({ account }) =>  account ? account.user : null;

export const getToken = ({ account }) => account ? account.token : null;
