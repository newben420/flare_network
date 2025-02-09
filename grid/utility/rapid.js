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
const rxjs_1 = require("rxjs");
const persistence_driver_1 = require("../persistence/persistence_driver");
const site_1 = require("../site");
const exchange_1 = require("./exchange");
const Log_1 = require("./Log");
const res_1 = require("../model/res");
class Rapid {
}
exports.Rapid = Rapid;
_a = Rapid;
Rapid.closing = false;
Rapid.close = (trade, valuation, fx) => __awaiter(void 0, void 0, void 0, function* () {
    _a.closing = true;
    if (_a.dataA.length > 0) {
        let index = _a.dataA.findIndex(x => parseFloat(x.fromCoinSize) == trade.amt && parseFloat(x.toCoinSize) == valuation);
        if (index >= 0) {
            const data = _a.dataA[index];
            const toSize = parseFloat(data.toCoinSize);
            const live = persistence_driver_1.PersistenceDriver.getDB().live;
            const spread = (toSize - trade.amtBs) / trade.amtBs * 100;
            let proceedToTrade = () => {
                return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
                    const finalize = () => __awaiter(void 0, void 0, void 0, function* () {
                        Log_1.Log.flow(`Rapid > Close > Converted ${site_1.Site.tradeToken} ${trade.amt} to ${site_1.Site.baseToken} ${data.toCoinSize} at PNL ${spread.toFixed(2)}%.`, 1);
                        const finalx = () => {
                            return new Promise((reso, reje) => {
                                persistence_driver_1.PersistenceDriver.closeTrade(trade, spread, r1 => {
                                    persistence_driver_1.PersistenceDriver.updateBalance(((persistence_driver_1.PersistenceDriver.getDB().balance || 0) + toSize), r2 => {
                                        reso(r1.succ && r2.succ);
                                    });
                                });
                            });
                        };
                        let fin = yield finalx();
                        return fin;
                    });
                    if (live) {
                        const convert = yield exchange_1.Exchange.convert(data);
                        if (convert.succ) {
                            resolve(yield finalize());
                        }
                        else {
                            Log_1.Log.flow(`Rapid > Close > Conversion Failed "${convert.message}".`, 1);
                            resolve(false);
                        }
                    }
                    else {
                        resolve(yield finalize());
                    }
                }));
            };
            let closed = yield proceedToTrade();
            if (closed) {
                _a.dataA.splice(index, 1);
                _a.closing = false;
                fx(res_1.GRes.succ("SUCCESS"));
            }
            else {
                _a.closing = false;
                fx(res_1.GRes.err("FAILED"));
            }
        }
        else {
            _a.closing = false;
            fx(res_1.GRes.err("NO_ROW"));
        }
    }
    else {
        _a.closing = false;
        fx(res_1.GRes.err("NO_DATA"));
    }
});
Rapid.valuation = new rxjs_1.BehaviorSubject([]);
Rapid.valEvent = _a.valuation.asObservable();
Rapid.delay = (ms) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
};
Rapid.dataA = [];
Rapid.isRunning = false;
Rapid.run = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!_a.isRunning && !_a.closing) {
        _a.isRunning = true;
        let trades = persistence_driver_1.PersistenceDriver.getTrades();
        let valuation = [];
        let dataArr = [];
        const live = persistence_driver_1.PersistenceDriver.getDB().live;
        while (trades.length > 0) {
            let trade = trades.shift();
            let startTS = Date.now();
            let tradeTS = trade.ts;
            const quote = yield exchange_1.Exchange.getQuote(site_1.Site.tradeToken, trade.amt, site_1.Site.baseToken);
            if (quote.succ) {
                const data = quote.message;
                const toSize = parseFloat(data.toCoinSize);
                const spread = (toSize - trade.amtBs) / trade.amtBs * 100;
                let proceedToTrade = () => {
                    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
                        const finalize = () => __awaiter(void 0, void 0, void 0, function* () {
                            Log_1.Log.flow(`Rapid > Converted ${site_1.Site.tradeToken} ${trade.amt} to ${site_1.Site.baseToken} ${data.toCoinSize} at PNL ${spread.toFixed(2)}%.`, 1);
                            const finalx = () => {
                                return new Promise((reso, reje) => {
                                    persistence_driver_1.PersistenceDriver.closeTrade(trade, spread, r1 => {
                                        persistence_driver_1.PersistenceDriver.updateBalance(((persistence_driver_1.PersistenceDriver.getDB().balance || 0) + toSize), r2 => {
                                            reso(r1.succ && r2.succ);
                                        });
                                    });
                                });
                            };
                            let fin = yield finalx();
                            return fin;
                        });
                        if (live) {
                            const convert = yield exchange_1.Exchange.convert(data);
                            if (convert.succ) {
                                resolve(yield finalize());
                            }
                            else {
                                Log_1.Log.flow(`Rapid > Conversion Failed "${convert.message}".`, 1);
                                resolve(false);
                            }
                        }
                        else {
                            resolve(yield finalize());
                        }
                    }));
                };
                if (spread >= 0) {
                    if (spread >= trade.tp) {
                        // TAKE PROFIT
                        let closed = yield proceedToTrade();
                        if (!closed) {
                            valuation.push(toSize);
                            dataArr.push(data);
                        }
                        let waitTime = site_1.Site.rapidCloseInterval - (Date.now() - startTS);
                        yield _a.delay(waitTime >= 0 ? waitTime : 0);
                    }
                    else if (Date.now() > (tradeTS + site_1.Site.rapidProfitTimeout)) {
                        // PROFIT WINDOW HAS PASSED
                        // CLOSE AT ANY SPREAD
                        let closed = yield proceedToTrade();
                        if (!closed) {
                            valuation.push(toSize);
                            dataArr.push(data);
                        }
                        let waitTime = site_1.Site.rapidCloseInterval - (Date.now() - startTS);
                        yield _a.delay(waitTime >= 0 ? waitTime : 0);
                    }
                    else {
                        // NO ACTION HERE
                        let waitTime = site_1.Site.rapidCloseInterval - (Date.now() - startTS);
                        valuation.push(toSize);
                        dataArr.push(data);
                        yield _a.delay(waitTime >= 0 ? waitTime : 0);
                    }
                }
                else if (spread <= 0 && (Math.abs(spread) > site_1.Site.stopLossPerc)) {
                    // STOP LOSS
                    let closed = yield proceedToTrade();
                    if (!closed) {
                        valuation.push(toSize);
                        dataArr.push(data);
                    }
                    let waitTime = site_1.Site.rapidCloseInterval - (Date.now() - startTS);
                    yield _a.delay(waitTime >= 0 ? waitTime : 0);
                }
                else {
                    // NO ACTION HERE
                    let waitTime = site_1.Site.rapidCloseInterval - (Date.now() - startTS);
                    valuation.push(toSize);
                    dataArr.push(data);
                    yield _a.delay(waitTime >= 0 ? waitTime : 0);
                }
            }
            else {
                Log_1.Log.flow(`Rapid > Could not get quote "${quote.message}".`, 1);
                let waitTime = site_1.Site.rapidCloseInterval - (Date.now() - startTS);
                valuation.push(0);
                dataArr.push({});
                yield _a.delay(waitTime >= 0 ? waitTime : 0);
            }
        }
        _a.dataA = dataArr;
        _a.valuation.next(valuation);
        _a.isRunning = false;
        _a.TOO = setTimeout(() => {
            _a.run();
        }, site_1.Site.rapidInterval);
    }
});
Rapid.TOO = null;
Rapid.init = () => {
    Log_1.Log.flow(`Rapid > Initialized.`, 1);
    _a.run();
    return true;
};
