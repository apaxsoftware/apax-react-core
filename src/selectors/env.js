export const getApiRoot = ({ env }) => env ? env.api_root : null;

export const getTokenName = ({ env }) => env ? env.token_name : null;

export const getTokenType = ({ env }) => env ? env.token_type : 'Token';
