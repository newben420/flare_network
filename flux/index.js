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
const Log_1 = require("./utility/Log");
const site_1 = require("./site");
const persistence_driver_1 = require("./persistence/persistence_driver");
const socket_io_client_1 = require("socket.io-client");
const client_1 = require("./utility/client");
const rapid_1 = require("./utility/rapid");
const app = (0, express_1.default)();
const port = site_1.PORT;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*"
    }
});
const client = (0, socket_io_client_1.io)(`http://localhost:${site_1.Site.gnomePort}`);
// app settings
app.disable("x-powered-by");
app.disable('etag');
app.use(body_parser_1.default.json({ limit: "35mb" }));
app.use(body_parser_1.default.urlencoded({
    extended: true,
    limit: "35mb",
    parameterLimit: 50000,
}));
app.use(express_1.default.static(path_1.default.resolve(__dirname, "public"), {
    maxAge: '1y',
}));
app.use("/api", api_1.apiRoute);
app.use((req, res, next) => {
    res.status(404).send("Requested resource not found.");
});
app.use((err, req, res, next) => {
    res.status(500).send("Something went wrong.");
});
const ENDER = (code) => {
    persistence_driver_1.PersistenceDriver.startBackup(true);
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
    persistence_driver_1.PersistenceDriver.init(succ => {
        if (!succ) {
            Log_1.Log.flow(`Init > Failed to initialize persistence.`, 0);
            (0, exports.KILLSERVER)();
        }
        else {
            socket_1.MySocket.initialize(io);
            Log_1.Log.flow(`Init > Initialized peristence.`, 0);
            Log_1.Log.flow(`Init > process running at http://localhost:${port}`, 0);
            client_1.GnomeClient.init(client);
            rapid_1.Rapid.init();
        }
    });
});
