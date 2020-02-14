import axios from 'axios';

export default {
  login: (email, password) => axios.post(
    '/api/login/',
    { email, password },
  ).then((res) => res.data),

  loadUser: (token) => axios.get(
    '/api/user/',
    { headers: { Authorization: `Token ${token}` } },
  ).then((res) => res.data),
};