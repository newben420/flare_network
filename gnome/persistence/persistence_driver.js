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
const data_source_1 = require("../utility/data_source");
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
PersistenceDriver.updatePair = (pair, f) => {
    var _b, _c, _d;
    if (!_a.db.value.pairs) {
        _a.db.next(Object.assign(Object.assign({}, _a.db.value), { pairs: [] }));
    }
    let pairIndex = _a.db.value.pairs.findIndex(x => x.base == pair.base && x.quote == pair.quote);
    if (pairIndex >= 0) {
        // pair is added
        let perPair = _a.db.value.pairs[pairIndex];
        perPair = Object.assign(Object.assign({}, perPair), { buy: (_b = pair.buy) !== null && _b !== void 0 ? _b : perPair.buy, sell: (_c = pair.sell) !== null && _c !== void 0 ? _c : perPair.sell, status: (_d = pair.status) !== null && _d !== void 0 ? _d : perPair.status, lu: Date.now() });
        let pairs = structuredClone(_a.db.value.pairs);
        pairs.splice(pairIndex, 1, perPair);
        _a.db.next(Object.assign(Object.assign({}, _a.db.value), { pairs }));
        _a.registerChanges();
        f(res_1.GRes.succ("SUCCESS"));
    }
    else {
        // pair is not yet added
        data_source_1.DataSource.checkAvailabablePair(`${pair.base}${pair.quote}`, r => {
            var _b;
            if (!r.succ) {
                f(r);
            }
            else {
                pair = Object.assign(Object.assign({}, pair), { status: (_b = pair.status) !== null && _b !== void 0 ? _b : false, buy: false, sell: false, lu: Date.now() });
                _a.db.next(Object.assign(Object.assign({}, _a.db.value), { pairs: _a.db.value.pairs.concat([pair]) }));
                _a.registerChanges();
                f(res_1.GRes.succ("SUCCESS"));
            }
        });
    }
};
PersistenceDriver.deletePair = (pair, f = r => { }) => {
    if (!_a.db.value.pairs) {
        _a.db.next(Object.assign(Object.assign({}, _a.db.value), { pairs: [] }));
    }
    let pairIndex = _a.db.value.pairs.findIndex(x => x.base == pair.base && x.quote == pair.quote);
    if (pairIndex >= 0) {
        // pair is added
        let pairs = structuredClone(_a.db.value.pairs);
        pairs.splice(pairIndex, 1);
        _a.db.next(Object.assign(Object.assign({}, _a.db.value), { pairs }));
        _a.registerChanges();
        f(res_1.GRes.succ("SUCCESS"));
    }
    else {
        // pair is not yet added
        f(res_1.GRes.succ("SUCCESS"));
    }
};
PersistenceDriver.getPair = (base, quote, f) => {
    if (!_a.db.value.pairs) {
        _a.db.next(Object.assign(Object.assign({}, _a.db.value), { pairs: [] }));
    }
    let pairIndex = _a.db.value.pairs.findIndex(x => x.base == base && x.quote == quote);
    if (pairIndex >= 0) {
        // pair is added
        f(res_1.GRes.succ(_a.db.value.pairs[pairIndex]));
    }
    else {
        // pair is not yet added
        f(res_1.GRes.err("WRONG_REQUEST"));
    }
};
PersistenceDriver.getAllPairs = (f) => {
    if (!_a.db.value.pairs) {
        _a.db.next(Object.assign(Object.assign({}, _a.db.value), { pairs: [] }));
    }
    f(_a.db.value.pairs.filter(x => x.status));
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
