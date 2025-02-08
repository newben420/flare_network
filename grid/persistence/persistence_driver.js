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
const deep_equal_1 = require("../model/deep_equal");
(0, env_config_1.ENVCONFIG)();
class PersistenceDriver {
}
exports.PersistenceDriver = PersistenceDriver;
_a = PersistenceDriver;
PersistenceDriver.db = new rxjs_1.BehaviorSubject({});
PersistenceDriver.dbEvent = _a.db.asObservable();
PersistenceDriver.trades = [];
PersistenceDriver.newTrade = new rxjs_1.BehaviorSubject(null);
PersistenceDriver.newTradeEvent = _a.newTrade.asObservable();
PersistenceDriver.dir = path_1.default.resolve((0, site_1.BASE_DIR)(), site_1.Site.persistenceDirectory);
PersistenceDriver.dbPath = path_1.default.resolve(_a.dir, 'db.json');
PersistenceDriver.tradesPath = path_1.default.resolve(_a.dir, 'trades.json');
PersistenceDriver.changes = false;
PersistenceDriver.backupInterval = null;
PersistenceDriver.resetEve = new rxjs_1.BehaviorSubject(null);
PersistenceDriver.resetEvent = _a.resetEve.asObservable();
PersistenceDriver.persistTrades = (fx = r => { }) => {
    (0, fs_1.writeFile)(_a.tradesPath, JSON.stringify(_a.trades), "utf8", err => {
        if (err) {
            Log_1.Log.dev(err);
            fx(res_1.GRes.err("SERVER"));
        }
        else {
            fx(res_1.GRes.succ("SUCCESS"));
        }
    });
};
PersistenceDriver.addTrade = (trade, fx = r => { }) => {
    _a.trades.push(trade);
    _a.persistTrades(r => {
        if (r.succ) {
            _a.newTrade.next({ trade, open: true });
            fx(res_1.GRes.succ("SUCCESS"));
        }
        else {
            fx(res_1.GRes.err("SERVER"));
        }
    });
};
PersistenceDriver.closeTrade = (trade, pnl, fx = r => { }) => {
    let id = _a.trades.findIndex(x => (0, deep_equal_1.deepEqual)(x, trade));
    if (id >= 0) {
        _a.trades.splice(id, 1);
        _a.persistTrades(r => {
            if (r.succ) {
                _a.newTrade.next({ trade, open: false });
                _a.addClosePNL(pnl);
                fx(res_1.GRes.succ("SUCCESS"));
            }
            else {
                fx(res_1.GRes.err("SERVER"));
            }
        });
    }
    else {
        fx(res_1.GRes.err("NO_TRADE"));
    }
};
PersistenceDriver.toggleTrader = (value, fx) => {
    var _b;
    if (value === void 0) { value = !((_b = _a.db.value.trader) !== null && _b !== void 0 ? _b : false); }
    if (fx === void 0) { fx = r => { }; }
    _a.db.next(Object.assign(Object.assign({}, _a.db.value), { trader: value }));
    _a.registerChanges();
    fx(res_1.GRes.succ("SUCCESS"));
};
PersistenceDriver.toggleLive = (value, fx) => {
    var _b;
    if (value === void 0) { value = !((_b = _a.db.value.live) !== null && _b !== void 0 ? _b : false); }
    if (fx === void 0) { fx = r => { }; }
    _a.db.next(Object.assign(Object.assign({}, _a.db.value), { live: value }));
    _a.registerChanges();
    fx(res_1.GRes.succ("SUCCESS"));
};
PersistenceDriver.updateBalance = (value, fx = r => { }) => {
    _a.db.next(Object.assign(Object.assign({}, _a.db.value), { balance: parseFloat(value) }));
    _a.registerChanges();
    fx(res_1.GRes.succ("SUCCESS"));
};
PersistenceDriver.updateEntryAmt = (value, fx = r => { }) => {
    _a.db.next(Object.assign(Object.assign({}, _a.db.value), { entryAmt: parseFloat(value) }));
    _a.registerChanges();
    fx(res_1.GRes.succ("SUCCESS"));
};
PersistenceDriver.addClosePNL = (value, fx = r => { }) => {
    if (!_a.db.value.closedPnls) {
        _a.db.next(Object.assign(Object.assign({}, _a.db.value), { closedPnls: [] }));
    }
    _a.db.next(Object.assign(Object.assign({}, _a.db.value), { closedPnls: _a.db.value.closedPnls.concat([parseFloat(value)]) }));
    _a.registerChanges();
    fx(res_1.GRes.succ("SUCCESS"));
};
PersistenceDriver.toggleConnected = (value, fx) => {
    var _b;
    if (value === void 0) { value = !((_b = _a.db.value.connected) !== null && _b !== void 0 ? _b : false); }
    if (fx === void 0) { fx = r => { }; }
    _a.db.next(Object.assign(Object.assign({}, _a.db.value), { connected: value }));
    _a.registerChanges();
    fx(res_1.GRes.succ("SUCCESS"));
};
PersistenceDriver.registerChanges = () => {
    _a.changes = true;
};
PersistenceDriver.getDB = () => {
    return _a.db.value;
};
PersistenceDriver.reset = (fx) => {
    _a.db.next({ connected: _a.db.value.connected });
    _a.trades = [];
    _a.persistTrades(r => {
        _a.resetEve.next(Date.now());
        fx(res_1.GRes.succ("SUCCESS"));
    });
};
PersistenceDriver.getTrades = () => {
    return _a.trades.map(x => x);
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
                    _a.db.next(Object.assign(Object.assign({}, (0, safe_json_parse_1.safeJSONParse)(data)), { connected: false }));
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
    const ensureTrades = (f) => {
        if ((0, fs_1.existsSync)(_a.tradesPath)) {
            (0, fs_1.readFile)(_a.tradesPath, "utf8", (err, data) => {
                if (err) {
                    Log_1.Log.dev(err);
                    fx(false);
                }
                else {
                    _a.trades = (0, safe_json_parse_1.safeJSONParse)(data, true);
                    f();
                }
            });
        }
        else {
            (0, fs_1.writeFile)(_a.tradesPath, JSON.stringify(_a.trades), "utf8", err => {
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
            ensureTrades(() => {
                _a.startBackup();
                fx(true);
            });
        });
    });
};
