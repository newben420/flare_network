"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogPersistence = void 0;
const path_1 = __importDefault(require("path"));
const site_1 = require("../site");
const fs_1 = require("fs");
const Log_1 = require("./Log");
class LogPersistence {
}
exports.LogPersistence = LogPersistence;
LogPersistence.logDir = path_1.default.join((0, site_1.BASE_DIR)(), "app_logs");
LogPersistence.entry = (obj) => {
    Object.keys(obj).forEach(key => {
        (0, fs_1.appendFile)(path_1.default.join(LogPersistence.logDir, `${key}.txt`), obj[key].join("\n") + "\n", (err) => {
            if (err) {
                Log_1.Log.dev(err);
            }
        });
    });
};
LogPersistence.init = () => {
    return new Promise((resolve, reject) => {
        if (!(0, fs_1.existsSync)(LogPersistence.logDir)) {
            (0, fs_1.mkdir)(LogPersistence.logDir, (err) => {
                if (err) {
                    Log_1.Log.dev(err);
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            });
        }
        else {
            resolve(true);
        }
    });
};
