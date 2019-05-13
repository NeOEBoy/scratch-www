const defaults = require('lodash.defaults');
const xhr = require('xhr');

const jar = require('./jar');
const log = require('./log');
const urlParams = require('./url-params');
const md5 = require('md5')

const KAppid = 'scratch-www';
const KAppsecret = 'scratch-www-secret'

/**
 * Helper method that constructs requests to the scratch api.
 * Custom arguments:
 *     - useCsrf [boolean] – handles unique csrf token retrieval for POST requests. This prevents
 *       CSRF forgeries (see: https://www.squarefree.com/securitytips/web-developers.html#CSRF)
 *
 * It also takes in other arguments specified in the xhr library spec.
 *
 * @param  {object}   opts     optional xhr args (see above)
 * @param  {Function} callback [description]
 */
module.exports = (opts, callback) => {
  defaults(opts, {
    host: process.env.API_HOST,
    headers: {},
    responseType: 'json',
    useCsrf: false
  });

  if (opts.host === '') {
    defaults(opts.headers, {
      'X-Requested-With': 'XMLHttpRequest'
    });
  }

  opts.uri = opts.host + opts.uri;

  if (!opts.params) opts.params = {};
  opts.params._timestamp = new Date().getTime();
  opts.params._appid = KAppid;

  // console.log('opts.method = ' + opts.method);
  let methodUpper = opts.method ? opts.method.toUpperCase() : 'GET';
  if (methodUpper === 'POST' ||
    methodUpper === 'PUT' ||
    methodUpper === 'DELETE') {
    let tsString = opts.params._timestamp + '';
    let rdString = Math.floor(Math.random() * 1000) + '';// 0-999
    opts.params._nonce = md5(tsString + rdString);
    // 根据属性排序
    var paramsKeys = Object.keys(opts.params).sort();
    var sortedParams = {};
    for (var i = 0; i < paramsKeys.length; i++) {
      sortedParams[paramsKeys[i]] = opts.params[paramsKeys[i]];
    }
    const rawSign = urlParams(sortedParams)
    // console.log('rawSign = ' + rawSign);
    const rawSignWithSecret = rawSign + KAppsecret;
    // console.log('rawSignWithSecret = ' + rawSignWithSecret)
    const md5SignWithSecret = md5(rawSignWithSecret)
    // console.log('md5SignWithSecret = ' + md5SignWithSecret)
    opts.params._sign = md5SignWithSecret;
  }

  if (opts.params) {
    opts.uri = [opts.uri, urlParams(opts.params)]
      .join(opts.uri.indexOf('?') === -1 ? '?' : '&');
  }

  if (opts.formData) {
    opts.body = urlParams(opts.formData);
    opts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  const apiRequest = options => {
    if (options.host !== '') {
      if ('withCredentials' in new XMLHttpRequest()) {
        options.useXDR = false;
      } else {
        // For IE < 10, we must use XDR for cross-domain requests. XDR does not support
        // custom headers.
        options.useXDR = true;
        delete options.headers;
        if (options.authentication) {
          const authenticationParams = [`x-token=${options.authentication}`];
          const parts = options.uri.split('?');
          const qs = (parts[1] || '')
            .split('&')
            .concat(authenticationParams)
            .join('&');
          options.uri = `${parts[0]}?${qs}`;
        }
      }
    }
    xhr(options, (err, res, body) => {
      if (err) log.error(err);
      if (options.responseType === 'json' && typeof body === 'string') {
        // IE doesn't parse responses as JSON without the json attribute,
        // even with responseType: 'json'.
        // See https://github.com/Raynos/xhr/issues/123
        try {
          body = JSON.parse(body);
        } catch (e) {
          // Not parseable anyway, don't worry about it
        }
      }
      // Legacy API responses come as lists, and indicate to redirect the client like
      // [{success: true, redirect: "/location/to/redirect"}]
      try {
        if ('redirect' in body[0]) window.location = body[0].redirect;
      } catch (e) {
        // do nothing
      }
      callback(err, body, res);
    });
  };

  if (typeof jar.get('scratchlanguage') !== 'undefined') {
    opts.headers['Accept-Language'] = `${jar.get('scratchlanguage')}, en;q=0.8`;
  }
  if (opts.authentication) {
    opts.headers['X-Token'] = opts.authentication;
  }
  if (opts.useCsrf) {
    /// 暂时去掉，后台没有csrf -neo
    // jar.use('scratchcsrftoken', '/csrf_token/', (err, csrftoken) => {
    //     if (err) return log.error('Error while retrieving CSRF token', err);
    //     opts.headers['X-CSRFToken'] = csrftoken;
    apiRequest(opts);
    // });
  } else {
    apiRequest(opts);
  }
};
