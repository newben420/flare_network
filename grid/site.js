"use strict";
var _a, _b, _c, _d;
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
Site.maxFlowLogWeight = parseInt(process.env.MAX_FLOW_LOG_WWEIGHT || "5");
Site.isProd = process.env.MODE == "PROD";
Site.mode = Site.isProd ? "PROD" : "DEV";
Site.persistenceDirectory = `storage_${process.env.PERSISTENCE_DIRECTORY || "persistence"}`;
Site.backupInterval = parseInt(process.env.BACKUP_INTERVAL_MS || "60000");
Site.rapidInterval = parseInt(process.env.RAPID_INTERVAL_MS || "2000");
Site.rapidCloseInterval = parseInt(process.env.RAPID_CLOSE_INTERVAL_MS || "50");
Site.rapidProfitTimeout = parseInt(process.env.RAPID_PROFIT_TIMEOUT_MS || "120000");
Site.useProxy = process.env.USE_PROXY == "true";
Site.proxyDetails = (process.env.PROXY_DETAILS || "").split(" ").filter((x) => x.length > 0);
Site.title = (_a = process.env.TITLE) !== null && _a !== void 0 ? _a : "";
Site.directionLength = parseInt(process.env.DIRECTION_LENGTH || "5");
Site.maxGrids = parseInt(process.env.MAX_GRIDS || "5");
Site.gnomePort = parseInt(process.env.GNOME_PORT || "64000");
Site.baseToken = (_b = process.env.BASE_TOKEN) !== null && _b !== void 0 ? _b : "USDT";
Site.tradeToken = (_c = process.env.TRADE_TOKEN) !== null && _c !== void 0 ? _c : "";
Site.stopLossPerc = parseFloat(process.env.STOP_LOSS_PERC || "50");
Site.maxEntrySpread = (_d = process.env.MAX_ENTRY_SPREAD_PERC) !== null && _d !== void 0 ? _d : "VOL";
Site.exchangeKeys = (process.env.EXCHANGE_KEYS || "").split(" ").filter((x) => x.length > 0);
Site.risky = process.env.RISKY == "true";
Site.takeProfit = parseFloat(process.env.STATIC_TP || "0");
