"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Site = exports.PORT = exports.BASE_DIR = void 0;
const env_config_1 = require("./env_config");
(0, env_config_1.ENVCONFIG)();
const BASE_DIR = () => process.cwd() || __dirname;
exports.BASE_DIR = BASE_DIR;
exports.PORT = parseInt(process.env.PORT || "5000");
class Site {
}
exports.Site = Site;
Site.isProd = process.env.MODE == "PROD";
Site.mode = Site.isProd ? "PROD" : "DEV";
Site.persistenceDirectory = `storage_${process.env.PERSISTENCE_DIRECTORY || "persistence"}`;
Site.siteURL = (_b = process.env[`SITE_URL_${(_a = process.env.MODE) !== null && _a !== void 0 ? _a : "DEV"}`]) !== null && _b !== void 0 ? _b : "";
Site.backupInterval = parseInt(process.env.BACKUP_INTERVAL_MS || "60000");
Site.title = (_c = process.env.TITLE) !== null && _c !== void 0 ? _c : "";
Site.nodePath = (_d = process.env.NODE_PATH) !== null && _d !== void 0 ? _d : "node";
Site.maxLogsPerSystem = parseInt(process.env.MAX_LOGS_PER_SYSTEM || "100");
Site.uiLogINterval = parseInt(process.env.UI_LOGS_UPDATE_INTERVAL_MS || "1000");
Site.auth = process.env.AUTH == "true";
Site.authUser = (_e = process.env.AUTH_USER) !== null && _e !== void 0 ? _e : "";
Site.authTitle = (_f = process.env.AUTH_TITLE) !== null && _f !== void 0 ? _f : "AUTHENTICATION";
Site.authPass = (_g = process.env.AUTH_PASS) !== null && _g !== void 0 ? _g : "";
Site.authMaxAttempts = parseInt(process.env.AUTH_MAX_ATTEMPTS || "4");
Site.sessionSecret = (_h = process.env.EXPRESS_SESSION_SECRET) !== null && _h !== void 0 ? _h : "efnryvjfikoplevwrr3";
