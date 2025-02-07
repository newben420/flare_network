"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KILLSERVER = void 0;
const env_config_1 = require("./env_config");
(0, env_config_1.ENVCONFIG)();
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const api_1 = require("./routes/api");
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const socket_1 = require("./utility/socket");
const site_1 = require("./site");
const persistence_driver_1 = require("./persistence/persistence_driver");
const runtime_manager_1 = require("./utility/runtime_manager");
const express_session_1 = __importDefault(require("express-session"));
const auth_1 = require("./utility/auth");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const stream_1 = require("stream");
stream_1.EventEmitter.setMaxListeners(1000);
const sessMid = (0, express_session_1.default)({
    secret: site_1.Site.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false
    }
});
const app = (0, express_1.default)();
const port = site_1.PORT;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*"
    }
});
// app settings
app.disable("x-powered-by");
app.disable('etag');
app.use(body_parser_1.default.json({ limit: "35mb" }));
app.use(body_parser_1.default.urlencoded({
    extended: true,
    limit: "35mb",
    parameterLimit: 50000,
}));
app.use(sessMid);
io.engine.use(sessMid);
app.use(auth_1.authEntry);
app.use((req, res, next) => {
    if (req.headers.referer) {
        if (/\/(\d{4,5})/.test(req.headers.referer) && !/^\/(\d{4,5})/.test(req.path)) {
            let ref = req.headers.referer;
            if (ref.endsWith("/")) {
                ref = ref.replace(/\/$/, "");
            }
            res.redirect(`${ref}${req.path}`);
        }
        else {
            next();
        }
    }
    else {
        next();
    }
});
app.use(express_1.default.static(path_1.default.resolve(__dirname, "public"), {
    maxAge: '1y',
}));
app.use("/api", api_1.apiRoute);
app.use(/^\/(\d{4,5})/, (req, res, next) => {
    const portMatch = req.originalUrl.match(/(\d{4,5})/);
    if (portMatch) {
        const port = portMatch[1];
        (0, http_proxy_middleware_1.createProxyMiddleware)({
            target: `http://localhost:${port}`,
            changeOrigin: true,
            pathRewrite: {
                [`^/${port}`]: '',
            },
            on: {
                proxyRes: (proxyRes, req, res) => {
                    var _a, _b, _c, _d, _e;
                    delete proxyRes.headers['set-cookie'];
                    if (/^40([\d]{2})$/.test(port) && (((_a = req.url) === null || _a === void 0 ? void 0 : _a.includes("control/tokens")) || ((_b = req.url) === null || _b === void 0 ? void 0 : _b.includes("control/meta")))) {
                        proxyRes.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0';
                    }
                    else if (((_c = req.url) === null || _c === void 0 ? void 0 : _c.includes("/clear")) || ((_d = req.url) === null || _d === void 0 ? void 0 : _d.includes("/view")) || ((_e = req.url) === null || _e === void 0 ? void 0 : _e.includes("/relay"))) {
                        proxyRes.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0';
                    }
                    else {
                        proxyRes.headers['Cache-Control'] = 'public, max-age=31536000';
                    }
                },
                proxyReq: (proxyReq, req, res) => {
                }
            }
        })(req, res, next);
    }
    else {
        next();
    }
});
app.use((req, res, next) => {
    res.status(404).send("Requested resource not found.");
});
app.use((err, req, res, next) => {
    res.status(500).send("Something went wrong.");
});
const ENDER = (code) => {
    persistence_driver_1.PersistenceDriver.startBackup(true);
    runtime_manager_1.RuntimeManager.deactivateAll();
};
const KILLSERVER = () => {
    process.exit(1);
};
exports.KILLSERVER = KILLSERVER;
process.on('exit', (code) => {
    ENDER(code);
});
process.on('SIGINT', () => {
    console.log('Process received SIGINT (Ctrl+C). Cleaning up...');
    process.exit(0); // Exit gracefully
});
process.on('SIGTERM', () => {
    console.log('Process received SIGTERM. Cleaning up...');
    process.exit(0); // Exit gracefully
});
process.on('uncaughtException', (err) => {
    console.error('Unhandled exception caught:', err);
    process.exit(1); // Exit with error code
});
server.listen(port, () => {
    runtime_manager_1.RuntimeManager.init();
    persistence_driver_1.PersistenceDriver.init(succ => {
        if (!succ) {
            console.log(`Failed to initialize persistence.`);
            (0, exports.KILLSERVER)();
        }
        else {
            socket_1.MySocket.initialize(io);
            console.log(`Process running at http://localhost:${port}`);
        }
    });
});
