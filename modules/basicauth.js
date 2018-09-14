const auth = require("basic-auth");
const consola = require("consola");
const requestIp = require("request-ip");
const publicIp = require("public-ip");
const ip = require("ip");

module.exports = async function() {
  const pubIp = await publicIp.v4();

  const USERNAME = process.env["AUTH_USERNAME"];
  const PASSWORD = process.env["AUTH_PASSWORD"];
  const REALM = process.env["AUTH_REALM"];
  const AUTH_LOCAL = !!String(process.env["AUTH_LOCAL"] || "").match(
    /true|1|on/i
  );

  if (!USERNAME || !PASSWORD || !REALM) {
    consola.warn(
      'BasicAuth Module requires "AUTH_USERNAME", "AUTH_PASSWORD" and "AUTH_REALM" to be specified!'
    );
    return function(req, res, next) {
      next();
    };
  }

  this.addServerMiddleware(function(req, res, next) {
    const credentials = auth(req);
    const clientIp = requestIp.getClientIp(req);
    if (!AUTH_LOCAL && (ip.isPrivate(clientIp) || clientIp == pubIp))
      return next();

    if (
      !credentials ||
      !(credentials.name === USERNAME && credentials.pass === PASSWORD)
    ) {
      res.statusCode = 401;
      res.setHeader("WWW-Authenticate", `Basic realm="${REALM}"`);
      res.end("Access denied");
    } else {
      next();
    }
  });
};
