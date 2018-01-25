import { getCSRF } from 'helpers';

/**
 * Parses the JSON returned by a network request
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          The parsed JSON from the request
 */
function parseJSON(response) {
  if (response.status !== 204) { // do not try to parse empty response
    return response.json();
  }
  return true;
}

/**
 * Checks if a network request came back fine, and throws an error if not
 *
 * @param  {objct} response   A response from a network request
 *
 * @return {object|undefined} Returns either the response, or throws an error
 */

function checkStatus(response) {
  if (response.ok) { // response.status >= 200 && response.status < 300
    return response;
  }
  const error = new Error();
  error.error_description = response.statusText;
  error.code = response.status;

  return response.json()
    .then(json => {
      if (json.error_description) {
        throw json.error_description;
      }
      if (json.error) {
        if (json.error.error_description) {
          throw json.error;
        } else if (json.error.message) {
          error.error_description = json.error.message;
        }
      }
      throw error;
    }, () => {
      throw error;
    });
}

function checkRequestError(err) {
  return Promise.reject({
    error_description: err.message,
    error_native: err,
  });
}

function serializeParams(obj) {
  const str = [];
  Object.keys(obj).forEach(p => {
    if (p.indexOf('[]') > -1) {
      for (const value of obj[p]) {
        str.push(`${encodeURIComponent(p)}=${encodeURIComponent(value)}`);
      }
    } else if (Object.prototype.hasOwnProperty.call(obj, p) &&
      obj[p] !== undefined && obj[p] !== null
    ) {
      // we need to pass 0 and empty string
      str.push(`${encodeURIComponent(p)}=${encodeURIComponent(obj[p])}`);
    }
  });
  return str.join('&');
}

/**
 * Requests a URL, returning a promise
 *
 * @param url       The URL we want to request
 * @param options   The options we want to pass to "fetch"
 * @param server    The base server url to make requests to
 *
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options = {}) {
  let requestUrl = url;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (!options.method || options.method === 'GET') {
    if (options.query) {
      const queryString = serializeParams(options.query);
      requestUrl = `${requestUrl}?${queryString}`;
    }
  } else {
    headers['X-CSRF-TOKEN'] = getCSRF();
  }

  /* eslint no-param-reassign: 0 */
  options.headers = {
    ...headers,
    ...options.headers,
  };
  options.credentials = 'include';
  return fetch(requestUrl, options)
    .then(checkStatus, checkRequestError)
    .then(parseJSON);
}
