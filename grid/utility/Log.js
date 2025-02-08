"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
const env_config_1 = require("../env_config");
(0, env_config_1.ENVCONFIG)();
const dotenv_1 = __importDefault(require("dotenv"));
const site_1 = require("../site");
const date_time_1 = require("../model/date_time");
dotenv_1.default.config();
class Log {
}
exports.Log = Log;
Log.dev = (message) => {
    if (!site_1.Site.isProd) {
        console.log(message);
    }
};
Log.flow = (message, weight = 3) => {
    if (site_1.Site.maxFlowLogWeight >= weight) {
        const ts = Date.now();
        console.log((0, date_time_1.getDateTime)(ts) + " FLOW: " + message);
    }
};
