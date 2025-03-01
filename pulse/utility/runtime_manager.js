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
const log_persistence_1 = require("./log_persistence");
class SystemL {
}
class RuntimeManager {
}
exports.RuntimeManager = RuntimeManager;
// private static running: SystemL[] = [];
RuntimeManager.running = {};
RuntimeManager.logCache = [];
RuntimeManager.getLogs = () => {
    let obj = {};
    Object.keys(RuntimeManager.running).forEach(key => {
        obj[key] = RuntimeManager.running[key].logs;
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
        log_persistence_1.LogPersistence.entry(obj);
        return obj;
    }
};
RuntimeManager.sysSub = persistence_driver_1.PersistenceDriver.dbEvent.subscribe(x => {
    if (x.systems) {
        let toCloseIDs = [];
        let toOpenIDs = [];
        let systemIDsOpen = x.systems.filter(x => x.isRunning).map(x => { var _a; return (_a = x.id) !== null && _a !== void 0 ? _a : ""; });
        let systemIDsClose = x.systems.filter(x => !x.isRunning).map(x => { var _a; return (_a = x.id) !== null && _a !== void 0 ? _a : ""; });
        let runningIDs = Object.keys(RuntimeManager.running);
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
            toCloseIDs.forEach(x => {
                delete RuntimeManager.running[x];
            });
        }
        if (toOpenIDs.length > 0) {
            toOpenIDs.forEach(x => {
                RuntimeManager.running[x] = { logs: [], process: null };
            });
            RuntimeManager.activateRunTimes();
        }
    }
});
RuntimeManager.deactivateRunTimes = (ids) => {
    Object.keys(RuntimeManager.running).forEach(x => {
        var _a;
        if (ids.indexOf(x) != -1) {
            (_a = RuntimeManager.running[x].process) === null || _a === void 0 ? void 0 : _a.kill("SIGTERM");
            RuntimeManager.running[x].process = null;
            RuntimeManager.running[x].logs = [];
        }
    });
};
RuntimeManager.deactivateAll = () => {
    Object.keys(RuntimeManager.running).forEach(x => {
        var _a;
        (_a = RuntimeManager.running[x].process) === null || _a === void 0 ? void 0 : _a.kill("SIGTERM");
        RuntimeManager.running[x].process = null;
        RuntimeManager.running[x].logs = [];
    });
    RuntimeManager.running = {};
};
RuntimeManager.activateRunTimes = () => {
    Object.keys(RuntimeManager.running).forEach(x => {
        if (RuntimeManager.running[x].process === null) {
            persistence_driver_1.PersistenceDriver.getSystemByID(x, r => {
                var _a;
                if (r.succ) {
                    let script = path_1.default.resolve((0, site_1.BASE_DIR)(), r.message.base, r.message.script);
                    let envFile = path_1.default.resolve((0, site_1.BASE_DIR)(), r.message.base, (_a = r.message.env) !== null && _a !== void 0 ? _a : ".env");
                    let env = {};
                    if ((0, fs_1.existsSync)(envFile)) {
                        env = (0, dotenv_1.parse)((0, fs_1.readFileSync)(envFile));
                    }
                    if ((0, fs_1.existsSync)(script)) {
                        RuntimeManager.running[x].process = (0, child_process_1.spawn)(site_1.Site.nodePath || "node", [script], { env, cwd: path_1.default.resolve((0, site_1.BASE_DIR)(), r.message.base) });
                        RuntimeManager.running[x].process.stdout.on('data', (data) => {
                            if (RuntimeManager.running[x]) {
                                let log = data.toString().replace(/[\n\s]+$/g, '');
                                RuntimeManager.running[x].logs.push(log);
                                RuntimeManager.logCache.push({ id: r.message.id, log });
                                if (RuntimeManager.running[x].logs.length > site_1.Site.maxLogsPerSystem) {
                                    RuntimeManager.running[x].logs = RuntimeManager.running[x].logs.slice(RuntimeManager.running[x].logs.length - site_1.Site.maxLogsPerSystem);
                                }
                            }
                        });
                        RuntimeManager.running[x].process.stderr.on('data', (data) => {
                            if (RuntimeManager.running[x]) {
                                let log = data.toString().replace(/[\n\s]+$/g, '');
                                RuntimeManager.running[x].logs.push(log);
                                RuntimeManager.logCache.push({ id: r.message.id, log });
                                if (RuntimeManager.running[x].logs.length > site_1.Site.maxLogsPerSystem) {
                                    RuntimeManager.running[x].logs = RuntimeManager.running[x].logs.slice(RuntimeManager.running[x].
                                        logs.length - site_1.Site.maxLogsPerSystem);
                                }
                            }
                        });
                        RuntimeManager.running[x].process.on('error', (data) => {
                            if (RuntimeManager.running[x]) {
                                let log = data.toString().replace(/[\n\s]+$/g, '');
                                RuntimeManager.running[x].logs.push(log);
                                RuntimeManager.logCache.push({ id: r.message.id, log });
                                if (RuntimeManager.running[x].logs.length > site_1.Site.maxLogsPerSystem) {
                                    RuntimeManager.running[x].logs = RuntimeManager.running[x].logs.slice(RuntimeManager.running[x].logs.length - site_1.Site.maxLogsPerSystem);
                                }
                            }
                        });
                        RuntimeManager.running[x].process.on('close', (data) => {
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
