import * as _ from 'lodash';

export const getApiRoot = ({ env }) => env ? env.api_root : null;

export const getTokenName = ({ env }) => env ? env.token_name : null;
export const getTokenType = ({ env }) => _.get(env, 'token_type') ? env.token_type : 'Token';
