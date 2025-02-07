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
exports.Trader = void 0;
const persistence_driver_1 = require("../persistence/persistence_driver");
const site_1 = require("../site");
const exchange_1 = require("./exchange");
const Log_1 = require("./Log");
const uuid_1 = require("./uuid");
class Trader {
}
exports.Trader = Trader;
_a = Trader;
Trader.buyStack = [];
Trader.addToBuy = (details) => {
    _a.buyStack.push(details);
};
Trader.isRunning = false;
Trader.run = () => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    if ((!_a.isRunning) && persistence_driver_1.PersistenceDriver.getDB().trader) {
        _a.isRunning = true;
        let traded = false;
        let baseValuation = 0;
        const okToTrade = () => {
            return new Promise((resolve, reject) => {
                persistence_driver_1.PersistenceDriver.getLatestTrade(r => {
                    if (r.succ) {
                        if (r.message.tk == site_1.Site.baseToken) {
                            baseValuation = r.message.amtBs;
                        }
                        resolve(r.message.tk == site_1.Site.baseToken);
                    }
                    else {
                        baseValuation = site_1.Site.startBalance;
                        resolve(true);
                    }
                });
            });
        };
        const itsOkay = (yield okToTrade()) && (!(persistence_driver_1.PersistenceDriver.getDB().rapid));
        const live = (_b = persistence_driver_1.PersistenceDriver.getDB().live) !== null && _b !== void 0 ? _b : false;
        if (!itsOkay || baseValuation === 0) {
            traded = true;
            Log_1.Log.flow(`Trader > Buy signals ignored.`, 1);
            yield _a.delay(100);
        }
        while (_a.buyStack.length > 0 && !traded) {
            const det = _a.buyStack.pop();
            const { base, vol, tpsl } = det;
            const id = uuid_1.UUIDHelper.short();
            Log_1.Log.flow(`Trader > ${id} > Convert ${site_1.Site.baseToken} ${baseValuation} to ${base}.`, 1);
            const quote = yield exchange_1.Exchange.getQuote(site_1.Site.baseToken, baseValuation, base);
            if (quote.succ) {
                const spreadQuote = yield exchange_1.Exchange.getQuote(base, parseFloat(quote.message.toCoinSize), site_1.Site.baseToken);
                if (spreadQuote.succ) {
                    const spread = (parseFloat(spreadQuote.message.toCoinSize) - baseValuation) / baseValuation * 100;
                    let maxSpread = parseFloat((site_1.Site.maxEntrySpread == "TP") ? tpsl : ((site_1.Site.maxEntrySpread == "VOL") ? vol : (parseFloat(site_1.Site.maxEntrySpread))));
                    if (Number.isNaN(maxSpread)) {
                        maxSpread = parseFloat(vol);
                    }
                    const proceed = spread >= 0 ? true : (Math.abs(spread) <= maxSpread);
                    if (proceed) {
                        let data = quote.message;
                        const finalizeTrade = () => __awaiter(void 0, void 0, void 0, function* () {
                            Log_1.Log.flow(`Trader > ${id} > Converted ${site_1.Site.baseToken} ${baseValuation} to ${base} ${data.toCoinSize}.`, 1);
                            let trade = {
                                amt: parseFloat(data.toCoinSize),
                                amtBs: baseValuation,
                                tk: base,
                                ts: Date.now(),
                                tp: (site_1.Site.takeProfit > 0) ? (Math.min(tpsl, vol) < site_1.Site.takeProfit ? Math.min(tpsl, vol) : site_1.Site.takeProfit) : (site_1.Site.risky ? tpsl : vol),
                            };
                            const finalx = () => {
                                return new Promise((resolve, reject) => {
                                    persistence_driver_1.PersistenceDriver.addTrade(trade, r1 => {
                                        persistence_driver_1.PersistenceDriver.toggleRapid(true, r2 => {
                                            resolve(r1.succ && r2.succ);
                                        });
                                    });
                                });
                            };
                            let fin = yield finalx();
                            if (fin) {
                                Log_1.Log.flow(`Trader > ${id} > Trade finalized.`, 1);
                            }
                            else {
                                Log_1.Log.flow(`Trader > ${id} > Trade not finalized.`, 1);
                            }
                            traded = true;
                        });
                        if (live) {
                            const convert = yield exchange_1.Exchange.convert(data);
                            if (convert.succ) {
                                yield finalizeTrade();
                            }
                            else {
                                Log_1.Log.flow(`Trader > ${id} > Conversion failed "${convert.message}".`, 1);
                            }
                        }
                        else {
                            yield finalizeTrade();
                        }
                    }
                    else {
                        Log_1.Log.flow(`Trader > ${id} > Negative spread of ${Math.abs(spread).toFixed(2)} exceeds a max of ${maxSpread.toFixed(2)}.`, 1);
                    }
                }
                else {
                    Log_1.Log.flow(`Trader > ${id} > Could not get spread quote "${quote.message}".`, 1);
                }
            }
            else {
                Log_1.Log.flow(`Trader > ${id} > Could not get quote "${quote.message}".`, 1);
            }
        }
        if (traded) {
            _a.buyStack = [];
        }
        _a.isRunning = false;
    }
});
Trader.delay = (ms) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
};
