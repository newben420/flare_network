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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rapid = void 0;
const res_1 = require("../model/res");
const persistence_driver_1 = require("../persistence/persistence_driver");
const site_1 = require("../site");
const exchange_1 = require("./exchange");
const Log_1 = require("./Log");
const socket_1 = require("./socket");
const uuid_1 = require("./uuid");
class Rapid {
}
exports.Rapid = Rapid;
_a = Rapid;
Rapid.isActive = false;
Rapid.TOO = null;
Rapid.token = "";
Rapid.amt = 0;
Rapid.amtBase = 0;
Rapid.ts = 0;
Rapid.tp = 0;
Rapid.id = "";
Rapid.sub = persistence_driver_1.PersistenceDriver.dbEvent.subscribe((db) => __awaiter(void 0, void 0, void 0, function* () {
    const latestTradeCheck = () => {
        return new Promise((resolve, reject) => {
            persistence_driver_1.PersistenceDriver.getLatestTrade(r => {
                if (r.succ) {
                    if (r.message.tk != site_1.Site.baseToken) {
                        _a.token = r.message.tk;
                        _a.amt = r.message.amt;
                        _a.amtBase = r.message.amtBs;
                        _a.tp = r.message.tp;
                        _a.ts = r.message.ts;
                    }
                    resolve(r.message.tk != site_1.Site.baseToken);
                }
                else {
                    resolve(false);
                }
            });
        });
    };
    const valid = db.rapid && (!_a.isActive) && (yield latestTradeCheck()) && (_a.TOO == null);
    if (valid) {
        _a.id = uuid_1.UUIDHelper.short();
        Log_1.Log.flow(`Rapid > ${_a.id} > Convert ${_a.token} ${_a.amt} to ${site_1.Site.baseToken}.`, 1);
        _a.isActive = true;
        _a.TOO = setInterval(() => {
            _a.runRapid();
        }, site_1.Site.rapidInterval);
    }
}));
Rapid.resetSub = persistence_driver_1.PersistenceDriver.resetEvent.subscribe(x => {
    if (x) {
        _a.isActive = false;
        if (_a.TOO !== null) {
            clearInterval(_a.TOO);
            _a.TOO = null;
        }
    }
});
Rapid.data = null;
Rapid.closing = false;
Rapid.close = (fx) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    if (_a.data && persistence_driver_1.PersistenceDriver.getDB().rapid) {
        _a.closing = true;
        const toSize = parseFloat(_a.data.toCoinSize);
        Log_1.Log.flow(`Rapid > ${_a.id} > Close ${_a.token} ${_a.amt} to ${site_1.Site.baseToken} ${toSize}.`, 1);
        const live = (_b = persistence_driver_1.PersistenceDriver.getDB().live) !== null && _b !== void 0 ? _b : false;
        const finalizeTrade = () => __awaiter(void 0, void 0, void 0, function* () {
            Log_1.Log.flow(`Rapid > ${_a.id} > Closed ${_a.token} ${_a.amt} to ${site_1.Site.baseToken} ${toSize}.`, 1);
            let trade = {
                amt: toSize,
                amtBs: toSize,
                tk: site_1.Site.baseToken,
                ts: Date.now(),
                tp: site_1.Site.risky ? 0 : 0,
            };
            const finalx = () => {
                return new Promise((resolve, reject) => {
                    persistence_driver_1.PersistenceDriver.addTrade(trade, r1 => {
                        persistence_driver_1.PersistenceDriver.toggleRapid(false, r2 => {
                            resolve(r1.succ && r2.succ);
                        });
                    });
                });
            };
            let fin = yield finalx();
            if (fin) {
                Log_1.Log.flow(`Rapid > ${_a.id} > Trade finalized.`, 1);
            }
            else {
                Log_1.Log.flow(`Rapid > ${_a.id} > Trade not finalized.`, 1);
            }
            // TRADE DONE
            _a.isActive = false;
            if (_a.TOO !== null) {
                clearInterval(_a.TOO);
                _a.TOO = null;
            }
        });
        if (live) {
            const convert = yield exchange_1.Exchange.convert(_a.data);
            if (convert.succ) {
                yield finalizeTrade();
            }
            else {
                Log_1.Log.flow(`Rapid > ${_a.id} > Close failed "${convert.message}".`, 1);
            }
        }
        else {
            yield finalizeTrade();
        }
    }
    _a.closing = false;
    fx(res_1.GRes.err("CLOSING"));
});
Rapid.isRunning = false;
Rapid.runRapid = () => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    if (!_a.isRunning && persistence_driver_1.PersistenceDriver.getDB().trader && !_a.closing) {
        _a.isRunning = true;
        const live = (_b = persistence_driver_1.PersistenceDriver.getDB().live) !== null && _b !== void 0 ? _b : false;
        const quote = yield exchange_1.Exchange.getQuote(_a.token, _a.amt, site_1.Site.baseToken);
        if (quote.succ) {
            const data = quote.message;
            _a.data = data;
            const toSize = parseFloat(data.toCoinSize);
            socket_1.MySocket.broadcastRapidValuation(toSize);
            const spread = (toSize - _a.amtBase) / _a.amtBase * 100;
            const continueTrade = () => __awaiter(void 0, void 0, void 0, function* () {
                const finalizeTrade = () => __awaiter(void 0, void 0, void 0, function* () {
                    Log_1.Log.flow(`Rapid > ${_a.id} > Converted ${_a.token} ${_a.amt} to ${site_1.Site.baseToken} ${toSize}.`, 1);
                    let trade = {
                        amt: toSize,
                        amtBs: toSize,
                        tk: site_1.Site.baseToken,
                        ts: Date.now(),
                        tp: site_1.Site.risky ? 0 : 0,
                    };
                    const finalx = () => {
                        return new Promise((resolve, reject) => {
                            persistence_driver_1.PersistenceDriver.addTrade(trade, r1 => {
                                persistence_driver_1.PersistenceDriver.toggleRapid(false, r2 => {
                                    resolve(r1.succ && r2.succ);
                                });
                            });
                        });
                    };
                    let fin = yield finalx();
                    if (fin) {
                        Log_1.Log.flow(`Rapid > ${_a.id} > Trade finalized.`, 1);
                    }
                    else {
                        Log_1.Log.flow(`Rapid > ${_a.id} > Trade not finalized.`, 1);
                    }
                    // TRADE DONE
                    _a.isActive = false;
                    if (_a.TOO !== null) {
                        clearInterval(_a.TOO);
                        _a.TOO = null;
                    }
                });
                if (live) {
                    const convert = yield exchange_1.Exchange.convert(data);
                    if (convert.succ) {
                        yield finalizeTrade();
                    }
                    else {
                        Log_1.Log.flow(`Rapid > ${_a.id} > Conversion failed "${convert.message}".`, 1);
                    }
                }
                else {
                    yield finalizeTrade();
                }
            });
            if (spread >= 0) {
                if (spread >= _a.tp) {
                    // TAKE PROFIT
                    Log_1.Log.flow(`Rapid > ${_a.id} > Take ${spread.toFixed(2)}% profit.`, 1);
                    yield continueTrade();
                }
                else if (Date.now() > (_a.ts + site_1.Site.rapidProfitTimeout)) {
                    // CLOSE WITHOUT PROFIT
                    Log_1.Log.flow(`Rapid > ${_a.id} > Close at ${spread.toFixed(2)}%.`, 1);
                    yield continueTrade();
                }
                else {
                    // No action
                }
            }
            else if (spread <= 0 && (Math.abs(spread) > site_1.Site.stopLossPerc)) {
                // STOP LOSS
                Log_1.Log.flow(`Rapid > ${_a.id} > Stop ${spread.toFixed(2)}% loss.`, 1);
                yield continueTrade();
            }
            else {
                // No action
            }
        }
        else {
            Log_1.Log.flow(`Rapid > ${_a.id} > Could not get quote "${quote.message}".`, 1);
        }
        _a.isRunning = false;
    }
});
Rapid.init = () => {
    /**
     * This is just here so this class gets registered during runtime.
     * It is to be called from the index file.
     */
    Log_1.Log.flow(`Rapid > Initialized.`, 1);
    return true;
};
