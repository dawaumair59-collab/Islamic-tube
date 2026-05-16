const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

const http = require("http");

const _server = config.server ?? {};
config.server = {
  ..._server,
  enhanceMiddleware: (metroMiddleware, server) => {
    return function islamicTubeMiddleware(req, res, next) {
      // Only proxy /api/* — let Metro handle everything else
      if (typeof req.url === "string" && req.url.startsWith("/api/")) {
        const opts = {
          hostname: "127.0.0.1",
          port: 8000,
          path: req.url,
          method: req.method || "GET",
          headers: Object.assign({}, req.headers, { host: "localhost:8000" }),
        };

        var proxyReq = http.request(opts, function (proxyRes) {
          try {
            res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
            proxyRes.pipe(res);
          } catch (e) {
            // ignore if headers already sent
          }
        });

        proxyReq.on("error", function () {
          try {
            if (!res.headersSent) {
              res.writeHead(502, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "api_proxy_error" }));
            }
          } catch (e) {}
        });

        if (req.method !== "GET" && req.method !== "HEAD") {
          req.pipe(proxyReq);
        } else {
          proxyReq.end();
        }
        return;
      }

      // All other requests: pass to Metro normally
      metroMiddleware(req, res, next);
    };
  },
};

module.exports = config;
