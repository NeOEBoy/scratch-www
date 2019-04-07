

export function makeFullUrlWithParams(url, params) {
  let paramsArray = [];
  params && Object.keys(params).forEach(
    key => paramsArray.push(key + '=' + params[key])
  )

  if(paramsArray.length > 0) {
    if (url.search(/\?/) === -1) {
      url += '?' + paramsArray.join('&')
    } else {
      url += '&' + paramsArray.join('&')
    }
  }

  return url;
}
