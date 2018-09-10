const requestIp = require("request-ip");
const consola = require("consola");

module.exports = function() {
  const HTTP_LOG = !!String(process.env["HTTP_LOG"]).match(/^true|1|on$/i);
  if (HTTP_LOG)
    this.addServerMiddleware(function(req, res, next) {
      const res_end = res.end;
      res.end = function() {
        const ret = res_end.apply(this, arguments);
        log(req, res);
        return ret;
      };
      next();
    });

  function log(req, res) {
    try {
      const ip = requestIp.getClientIp(req);
      const cflDate = new Date().toISOString();
      const authHeader = String(req.headers["authorization"] || "").split(
        /\s+/
      );
      const authType = authHeader
        .concat()
        .shift()
        .toUpperCase();

      const userID =
        (authType == "BASIC"
          ? Buffer.from(authHeader.pop(), "base64")
              .toString("utf8")
              .split(":")
              .shift()
          : "-") || "-";
      consola
        .withScope("http")
        .info(
          `${ip} - ${userID} [${cflDate}] "${req.method} ${req.url} ${
            req.connection.encrypted ? "HTTPS" : "HTTP"
          }/${req.httpVersion}" ${res.statusCode} ${res.getHeader(
            "content-length"
          ) || "-"} "${req.headers["referer"] || "-"}" "${req.headers[
            "user-agent"
          ] || "-"}"`
        );
    } catch (e) {
      console.error(e);
    }
  }
};
