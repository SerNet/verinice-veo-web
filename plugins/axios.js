const url = require("url");
const tunnel = require("tunnel");
const os = require("os");
var HttpsProxyAgent = require("https-proxy-agent");

const interfaces = os.networkInterfaces();
const addresses = ["localhost"];
for (var k in interfaces) {
  for (var k2 in interfaces[k]) {
    var address = interfaces[k][k2];

    addresses.push(address.address);
  }
}

function useProxy(config) {
  const parsed = url.parse(config.url);
  if (parsed.hostname === null) return false;
  return addresses.indexOf(parsed.hostname) === -1;
}

export default (context, inject) => {
  const { $axios, store } = context;

  $axios.setHeader("Content-Type", "application/json", ["post"]);

  $axios.onRequest(config => {
    if (process.server || process.isServer) {
      console.debug(
        config.method.toUpperCase() + " " + config.baseURL + config.url
      );
    }

    if (!useProxy(config)) {
      config.proxy = false;
    }

    config.retry = false;

    //Authorization:
    const authorizationHeader = store.getters["auth/authorizationHeader"];
    if (authorizationHeader) {
      config.headers.common["Authorization"] = authorizationHeader;
    } else {
      delete config.headers.common["Authorization"];
    }
  });
  /*
  $axios.onError(err => {
    err.message = `Error while requesting '${err.config.url}': ` + err.message;
  });*/
};
