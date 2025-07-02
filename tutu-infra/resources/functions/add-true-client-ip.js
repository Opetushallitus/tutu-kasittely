async function handler(event) {
  var request = event.request;
  var clientIP = event.viewer.ip;

  //Add the true-client-ip header to the incoming request
  request.headers['True-Client-IP'] = {value: clientIP};

  return request;
}