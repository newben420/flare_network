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
Trader.isRunning = false;
Trader.run = (details) => __awaiter(void 0, void 0, void 0, function* () {
    const db = persistence_driver_1.PersistenceDriver.getDB();
    if ((!_a.isRunning) && db.trader) {
        _a.isRunning = true;
        const { vol, tpsl, desc } = details;
        const id = uuid_1.UUIDHelper.short();
        let balance = db.balance || 0;
        let entry = db.entryAmt || 0;
        let tcount = persistence_driver_1.PersistenceDriver.getTrades().length;
        Log_1.Log.flow(`Trader > ${id} > Buy signal received with description "${desc}".`, 1);
        if (tcount >= site_1.Site.maxGrids) {
            Log_1.Log.flow(`Trader > ${id} > Max grid limit reached.`, 1);
        }
        else {
            if (balance <= 0) {
                Log_1.Log.flow(`Trader > ${id} > Insufficient or unset balance.`, 1);
            }
            else {
                if (entry <= 0) {
                    Log_1.Log.flow(`Trader > ${id} > Insufficient or unset grid entry amount.`, 1);
                }
                else {
                    const quote = yield exchange_1.Exchange.getQuote(site_1.Site.baseToken, entry, site_1.Site.tradeToken);
                    if (quote.succ) {
                        const spreadQuote = yield exchange_1.Exchange.getQuote(site_1.Site.tradeToken, parseFloat(quote.message.toCoinSize), site_1.Site.baseToken);
                        if (spreadQuote.succ) {
                            const spread = (parseFloat(spreadQuote.message.toCoinSize) - entry) / entry * 100;
                            let maxSpread = parseFloat((site_1.Site.maxEntrySpread == "TP") ? tpsl : ((site_1.Site.maxEntrySpread == "VOL") ? vol : (parseFloat(site_1.Site.maxEntrySpread))));
                            if (Number.isNaN(maxSpread)) {
                                maxSpread = parseFloat(vol);
                            }
                            const proceed = spread >= 0 ? true : (Math.abs(spread) <= maxSpread);
                            if (proceed) {
                                let data = quote.message;
                                const finalizeTrade = () => __awaiter(void 0, void 0, void 0, function* () {
                                    Log_1.Log.flow(`Trader > ${id} > Converted ${site_1.Site.baseToken} ${entry} to ${site_1.Site.tradeToken} ${data.toCoinSize}.`, 1);
                                    let trade = {
                                        amt: parseFloat(data.toCoinSize),
                                        amtBs: entry,
                                        ts: Date.now(),
                                        tp: (site_1.Site.takeProfit > 0) ? (Math.min(tpsl, vol) < site_1.Site.takeProfit ? Math.min(tpsl, vol) : site_1.Site.takeProfit) : (site_1.Site.risky ? tpsl : vol),
                                    };
                                    const finalx = () => {
                                        return new Promise((resolve, reject) => {
                                            persistence_driver_1.PersistenceDriver.addTrade(trade, r1 => {
                                                persistence_driver_1.PersistenceDriver.updateBalance(((persistence_driver_1.PersistenceDriver.getDB().balance || 0) - entry), r2 => {
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
                                });
                                if (db.live) {
                                    const convert = yield exchange_1.Exchange.convert(data);
                                    if (convert.succ) {
                                        yield finalizeTrade();
                                    }
                                    else {
                                        Log_1.Log.flow(`Trader > ${id} > Conversion Failed "${convert.message}".`, 1);
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
            }
        }
        _a.isRunning = false;
    }
});
