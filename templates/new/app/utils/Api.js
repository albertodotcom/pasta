const API_URL_PREFIX = '/api/';

export default {
  get(url, base = API_URL_PREFIX) {
    return fetch(base + url, {
      method: 'get',
      mode: 'no-cors',
      credentials: 'include',
    }).then((response) => {
      return response.json();
    }).catch((err) => {
      console.error(status, err.toString());
    });
  },

  post(url, payload) {
    console.log(url, payload);
  },
};
