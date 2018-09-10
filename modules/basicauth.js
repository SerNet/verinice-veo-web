const auth = require("basic-auth");
const consola = require("consola");

module.exports = (function() {
  const USERNAME = process.env["AUTH_USERNAME"];
  const PASSWORD = process.env["AUTH_PASSWORD"];
  const REALM = process.env["AUTH_REALM"];

  if (!USERNAME || !PASSWORD || !REALM) {
    consola.warn(
      'BasicAuth Module requires "AUTH_USERNAME", "AUTH_PASSWORD" and "AUTH_REALM" to be specified!'
    );
    return function(req, res, next) {
      next();
    };
  }

  return function(req, res, next) {
    const credentials = auth(req);

    if (
      !credentials ||
      !(credentials.name === USERNAME && credentials.pass === PASSWORD)
    ) {
      res.statusCode = 401;
      res.setHeader("WWW-Authenticate", `Basic realm="${this.realm}"`);
      res.end("Access denied");
    } else {
      next();
    }
  };
})();
