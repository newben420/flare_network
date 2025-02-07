"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersistenceDriver = void 0;
const env_config_1 = require("../env_config");
const path_1 = __importDefault(require("path"));
const site_1 = require("../site");
const fs_1 = require("fs");
const Log_1 = require("../utility/Log");
const rxjs_1 = require("rxjs");
const safe_json_parse_1 = require("../model/safe_json_parse");
const res_1 = require("../model/res");
const uuid_1 = require("../utility/uuid");
(0, env_config_1.ENVCONFIG)();
class PersistenceDriver {
}
exports.PersistenceDriver = PersistenceDriver;
_a = PersistenceDriver;
PersistenceDriver.db = new rxjs_1.BehaviorSubject({});
PersistenceDriver.dbEvent = _a.db.asObservable();
PersistenceDriver.dir = path_1.default.resolve((0, site_1.BASE_DIR)(), site_1.Site.persistenceDirectory);
PersistenceDriver.dbPath = path_1.default.resolve(_a.dir, 'db.json');
PersistenceDriver.changes = false;
PersistenceDriver.backupInterval = null;
PersistenceDriver.updateSystem = (system_1, ...args_1) => __awaiter(void 0, [system_1, ...args_1], void 0, function* (system, f = r => { }) {
    var _b, _c, _d, _e, _f, _g, _h;
    if (!_a.db.value.systems) {
        _a.db.next(Object.assign(Object.assign({}, _a.db.value), { systems: [] }));
    }
    let sysIndex = _a.db.value.systems.findIndex(x => x.id == system.id);
    if (sysIndex >= 0) {
        // pair is added
        let perSys = _a.db.value.systems[sysIndex];
        perSys = Object.assign(Object.assign({}, perSys), { base: (_b = system.base) !== null && _b !== void 0 ? _b : perSys.base, env: (_c = system.env) !== null && _c !== void 0 ? _c : perSys.env, port: (_d = system.port) !== null && _d !== void 0 ? _d : perSys.port, script: (_e = system.script) !== null && _e !== void 0 ? _e : perSys.script, title: (_f = system.title) !== null && _f !== void 0 ? _f : perSys.title, autoStart: (_g = system.autoStart) !== null && _g !== void 0 ? _g : perSys.autoStart, isRunning: (_h = system.isRunning) !== null && _h !== void 0 ? _h : perSys.isRunning });
        let systems = structuredClone(_a.db.value.systems);
        systems.splice(sysIndex, 1, perSys);
        _a.db.next(Object.assign(Object.assign({}, _a.db.value), { systems }));
        _a.registerChanges();
        f(res_1.GRes.succ("SUCCESS"));
    }
    else {
        // pair is not yet added
        const generateid = () => {
            return new Promise((resolve, reject) => {
                let notFound = true;
                let id = uuid_1.UUIDHelper.short();
                let countDown = 100;
                while (notFound && countDown > 0) {
                    if (_a.db.value.systems.findIndex(x => x.id == id) < 0) {
                        notFound = false;
                    }
                    id = uuid_1.UUIDHelper.short();
                    countDown--;
                }
                resolve(id);
            });
        };
        system = Object.assign(Object.assign({}, system), { id: yield generateid() });
        _a.db.next(Object.assign(Object.assign({}, _a.db.value), { systems: _a.db.value.systems.concat([system]) }));
        _a.registerChanges();
        f(res_1.GRes.succ("SUCCESS"));
    }
});
PersistenceDriver.deleteSystem = (system, f = r => { }) => {
    if (!_a.db.value.systems) {
        _a.db.next(Object.assign(Object.assign({}, _a.db.value), { systems: [] }));
    }
    let sysIndex = _a.db.value.systems.findIndex(x => x.id == system.id);
    if (sysIndex >= 0) {
        // pair is added
        if (_a.db.value.systems[sysIndex].isRunning) {
            f(res_1.GRes.err("RUNNING"));
        }
        else {
            let systems = structuredClone(_a.db.value.systems);
            systems.splice(sysIndex, 1);
            _a.db.next(Object.assign(Object.assign({}, _a.db.value), { systems }));
            _a.registerChanges();
            f(res_1.GRes.succ("SUCCESS"));
        }
    }
    else {
        // pair is not yet added
        f(res_1.GRes.succ("SUCCESS"));
    }
};
PersistenceDriver.getSystemByID = (id, f) => {
    if (!_a.db.value.systems) {
        _a.db.next(Object.assign(Object.assign({}, _a.db.value), { systems: [] }));
    }
    let sysIndex = _a.db.value.systems.findIndex(x => x.id == id);
    if (sysIndex >= 0) {
        f(res_1.GRes.succ(_a.db.value.systems[sysIndex]));
    }
    else {
        f(res_1.GRes.err("NOT_FOUND"));
    }
};
PersistenceDriver.getAllSystems = (f) => {
    if (!_a.db.value.systems) {
        _a.db.next(Object.assign(Object.assign({}, _a.db.value), { systems: [] }));
    }
    f(_a.db.value.systems);
};
PersistenceDriver.registerChanges = () => {
    _a.changes = true;
};
PersistenceDriver.getDB = () => {
    return _a.db.value;
};
PersistenceDriver.takeBackup = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (fx = taken => { }) {
    const takeDBBackup = () => {
        return new Promise((f, reject) => {
            if (_a.changes) {
                (0, fs_1.writeFile)(_a.dbPath, JSON.stringify(_a.db.value), "utf8", err => {
                    if (err) {
                        Log_1.Log.dev(err);
                        f(false);
                    }
                    else {
                        f(true);
                    }
                });
            }
            else {
                f(true);
            }
        });
    };
    const db = yield takeDBBackup();
    if (db) {
        _a.changes = false;
    }
    fx(db);
});
PersistenceDriver.startBackup = (now = false) => {
    if (now) {
        (0, fs_1.writeFileSync)(_a.dbPath, JSON.stringify(_a.db.value), "utf8");
    }
    else {
        if (_a.backupInterval !== null) {
            clearInterval(_a.backupInterval);
        }
        _a.backupInterval = setInterval(() => {
            _a.takeBackup();
        }, site_1.Site.backupInterval);
    }
};
PersistenceDriver.init = (fx) => {
    const ensureDir = (f) => {
        if ((0, fs_1.existsSync)(_a.dir)) {
            f();
        }
        else {
            (0, fs_1.mkdir)(_a.dir, {
                recursive: false,
            }, err => {
                if (err) {
                    Log_1.Log.dev(err);
                    fx(false);
                }
                else {
                    f();
                }
            });
        }
    };
    const ensureDB = (f) => {
        if ((0, fs_1.existsSync)(_a.dbPath)) {
            (0, fs_1.readFile)(_a.dbPath, "utf8", (err, data) => {
                if (err) {
                    Log_1.Log.dev(err);
                    fx(false);
                }
                else {
                    _a.db.next((0, safe_json_parse_1.safeJSONParse)(data));
                    f();
                }
            });
        }
        else {
            (0, fs_1.writeFile)(_a.dbPath, JSON.stringify(_a.db.value), "utf8", err => {
                if (err) {
                    Log_1.Log.dev(err);
                    fx(false);
                }
                else {
                    f();
                }
            });
        }
    };
    // flow
    ensureDir(() => {
        ensureDB(() => {
            _a.startBackup();
            fx(true);
        });
    });
};
