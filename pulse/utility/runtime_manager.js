"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeManager = void 0;
const persistence_driver_1 = require("../persistence/persistence_driver");
const child_process_1 = require("child_process");
const site_1 = require("../site");
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const dotenv_1 = require("dotenv");
const Log_1 = require("./Log");
class SystemL {
}
class RuntimeManager {
}
exports.RuntimeManager = RuntimeManager;
RuntimeManager.running = [];
RuntimeManager.logCache = [];
RuntimeManager.getLogs = () => {
    let obj = {};
    RuntimeManager.running.forEach(x => {
        obj[x.id] = x.logs;
    });
    return obj;
};
RuntimeManager.getCache = () => {
    if (RuntimeManager.logCache.length == 0) {
        return null;
    }
    else {
        let obj = {};
        RuntimeManager.logCache.forEach(x => {
            if (!obj[x.id]) {
                obj[x.id] = [];
            }
            obj[x.id].push(x.log);
        });
        RuntimeManager.logCache = [];
        return obj;
    }
};
RuntimeManager.sysSub = persistence_driver_1.PersistenceDriver.dbEvent.subscribe(x => {
    if (x.systems) {
        let toCloseIDs = [];
        let toOpenIDs = [];
        let systemIDsOpen = x.systems.filter(x => x.isRunning).map(x => { var _a; return (_a = x.id) !== null && _a !== void 0 ? _a : ""; });
        let systemIDsClose = x.systems.filter(x => !x.isRunning).map(x => { var _a; return (_a = x.id) !== null && _a !== void 0 ? _a : ""; });
        let runningIDs = RuntimeManager.running.map(x => { var _a; return (_a = x.id) !== null && _a !== void 0 ? _a : ""; });
        runningIDs.forEach(x => {
            if (systemIDsOpen.indexOf(x) == -1) {
                toCloseIDs.push(x);
            }
        });
        systemIDsOpen.forEach(x => {
            if (runningIDs.indexOf(x) == -1) {
                toOpenIDs.push(x);
            }
        });
        if (toCloseIDs.length > 0) {
            RuntimeManager.deactivateRunTimes(toCloseIDs);
            RuntimeManager.running = RuntimeManager.running.filter(x => toCloseIDs.indexOf(x.id) == -1);
        }
        if (toOpenIDs.length > 0) {
            toOpenIDs.forEach(x => {
                RuntimeManager.running.push({ id: x, logs: [], process: null });
            });
            RuntimeManager.activateRunTimes();
        }
    }
});
RuntimeManager.deactivateRunTimes = (ids) => {
    RuntimeManager.running.forEach((x, i) => {
        var _a;
        if (ids.indexOf(x.id) != -1) {
            (_a = RuntimeManager.running[i].process) === null || _a === void 0 ? void 0 : _a.kill("SIGTERM");
            RuntimeManager.running[i].process = null;
            RuntimeManager.running[i].logs = [];
        }
    });
};
RuntimeManager.deactivateAll = () => {
    RuntimeManager.running.forEach((x, i) => {
        var _a;
        (_a = RuntimeManager.running[i].process) === null || _a === void 0 ? void 0 : _a.kill("SIGTERM");
        RuntimeManager.running[i].process = null;
        RuntimeManager.running[i].logs = [];
    });
    RuntimeManager.running = [];
};
RuntimeManager.activateRunTimes = () => {
    RuntimeManager.running.forEach((x, i) => {
        if (x.process === null) {
            persistence_driver_1.PersistenceDriver.getSystemByID(x.id, r => {
                var _a;
                if (r.succ) {
                    // const script = path.resolve(BASE_DIR(), r.message.)
                    let script = path_1.default.resolve((0, site_1.BASE_DIR)(), r.message.base, r.message.script);
                    let envFile = path_1.default.resolve((0, site_1.BASE_DIR)(), r.message.base, (_a = r.message.env) !== null && _a !== void 0 ? _a : ".env");
                    let env = {};
                    if ((0, fs_1.existsSync)(envFile)) {
                        env = (0, dotenv_1.parse)((0, fs_1.readFileSync)(envFile));
                    }
                    if ((0, fs_1.existsSync)(script)) {
                        RuntimeManager.running[i].process = (0, child_process_1.spawn)(site_1.Site.nodePath || "node", [script], { env, cwd: path_1.default.resolve((0, site_1.BASE_DIR)(), r.message.base) });
                        RuntimeManager.running[i].process.stdout.on('data', (data) => {
                            if (RuntimeManager.running[i]) {
                                let log = data.toString().replace(/[\n\s]+$/g, '');
                                RuntimeManager.running[i].logs.push(log);
                                RuntimeManager.logCache.push({ id: r.message.id, log });
                                if (RuntimeManager.running[i].logs.length > site_1.Site.maxLogsPerSystem) {
                                    RuntimeManager.running[i].logs = RuntimeManager.running[i].logs.slice(RuntimeManager.running[i].logs.length - site_1.Site.maxLogsPerSystem);
                                }
                            }
                        });
                        RuntimeManager.running[i].process.stderr.on('data', (data) => {
                            if (RuntimeManager.running[i]) {
                                let log = data.toString().replace(/[\n\s]+$/g, '');
                                RuntimeManager.running[i].logs.push(log);
                                RuntimeManager.logCache.push({ id: r.message.id, log });
                                if (RuntimeManager.running[i].logs.length > site_1.Site.maxLogsPerSystem) {
                                    RuntimeManager.running[i].logs = RuntimeManager.running[i].logs.slice(RuntimeManager.running[i].logs.length - site_1.Site.maxLogsPerSystem);
                                }
                            }
                        });
                        RuntimeManager.running[i].process.on('error', (data) => {
                            if (RuntimeManager.running[i]) {
                                let log = data.toString().replace(/[\n\s]+$/g, '');
                                RuntimeManager.running[i].logs.push(log);
                                RuntimeManager.logCache.push({ id: r.message.id, log });
                                if (RuntimeManager.running[i].logs.length > site_1.Site.maxLogsPerSystem) {
                                    RuntimeManager.running[i].logs = RuntimeManager.running[i].logs.slice(RuntimeManager.running[i].logs.length - site_1.Site.maxLogsPerSystem);
                                }
                            }
                        });
                        RuntimeManager.running[i].process.on('close', (data) => {
                            persistence_driver_1.PersistenceDriver.updateSystem(Object.assign(Object.assign({}, r.message), { isRunning: false }));
                        });
                    }
                    else {
                        persistence_driver_1.PersistenceDriver.updateSystem(Object.assign(Object.assign({}, r.message), { isRunning: false }));
                    }
                }
            });
        }
    });
};
RuntimeManager.init = () => {
    Log_1.Log.dev("Runtime manager initiated.");
};
