"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CentralLoop = void 0;
const date_time_1 = require("../model/date_time");
const persistence_driver_1 = require("../persistence/persistence_driver");
const site_1 = require("../site");
const analysis_1 = require("./analysis");
const data_source_1 = require("./data_source");
const Log_1 = require("./Log");
const memory_data_1 = require("./memory_data");
const socket_1 = require("./socket");
const uuid_1 = require("./uuid");
class CentralLoop {
}
exports.CentralLoop = CentralLoop;
_a = CentralLoop;
CentralLoop.init = (fx = yes => { }) => {
    Log_1.Log.flow(`Init > Central Loop initialized with an interval of ${site_1.Site.interval}, granularity of ${site_1.Site.granularity}, and data length of ${site_1.Site.dataLength}.`, 0);
    _a.run();
};
CentralLoop.run = () => {
    const ts = Date.now();
    const id = uuid_1.UUIDHelper.short();
    Log_1.Log.flow(`CL > ${id} > Iteration initialized.`, 0);
    persistence_driver_1.PersistenceDriver.getAllPairs(r => {
        if (r.length == 0) {
            Log_1.Log.flow(`CL > ${id} > No pairs available.`, 0);
            _a.conclude(ts, id);
        }
        else {
            let pairs = structuredClone(r);
            const runPerPair = (cb) => {
                if (pairs.length == 0) {
                    cb();
                }
                else {
                    const pairTS = Date.now();
                    const passOn = (symbol) => {
                        Log_1.Log.flow(`CL > ${id} > ${symbol} > Concluded.`, 1);
                        if (pairs.length == 0) {
                            runPerPair(cb);
                        }
                        else {
                            const now = Date.now();
                            const nextPairTS = pairTS + site_1.Site.pairInterval;
                            const diff = nextPairTS - now;
                            if (diff <= 0) {
                                runPerPair(cb);
                            }
                            else {
                                setTimeout(() => {
                                    runPerPair(cb);
                                }, diff);
                            }
                        }
                    };
                    const pair = pairs.shift();
                    const symbol = `${pair.base}${pair.quote}`;
                    Log_1.Log.flow(`CL > ${id} > ${symbol} > Initialized.`, 1);
                    data_source_1.DataSource.getHistoricCSData(symbol, memory_data_1.MemoryData.freshStatus[symbol] ? 1 : site_1.Site.dataLength, site_1.Site.granularity, pairTS.toString(), rx => {
                        if (!rx.succ) {
                            memory_data_1.MemoryData.freshStatus[symbol] = false;
                            Log_1.Log.flow(`CL > ${id} > ${symbol} > Error "${rx.message}" occurred while fetching historic data.`, 1);
                            passOn(symbol);
                        }
                        else {
                            if (memory_data_1.MemoryData.freshStatus[symbol]) {
                                // data update
                                memory_data_1.MemoryData.history[symbol].shift();
                                memory_data_1.MemoryData.history[symbol].push(rx.message[0]);
                            }
                            else {
                                memory_data_1.MemoryData.history[symbol] = rx.message;
                            }
                            memory_data_1.MemoryData.freshStatus[symbol] = true;
                            Log_1.Log.flow(`CL > ${id} > ${symbol} > Historic data acquired.`, 1);
                            analysis_1.Analysis.entry(id, symbol, ry => {
                                if (!ry.succ) {
                                    Log_1.Log.flow(`CL > ${id} > ${symbol} > Analysis Failed with message "${ry.message}".`, 1);
                                    passOn(symbol);
                                }
                                else {
                                    socket_1.MySocket.broadcastDecision(Object.assign(Object.assign({}, ry.message), { base: pair.base, quote: pair.quote }));
                                    persistence_driver_1.PersistenceDriver.updatePair(Object.assign(Object.assign({}, pair), { buy: ry.message.buy, sell: ry.message.sell }), r => {
                                        Log_1.Log.flow(`CL > ${id} > ${symbol} > Analysis Results (BUY: ${ry.message.buy ? "YES" : "NO"} | SELL: ${ry.message.sell ? "YES" : "NO"}).`, 1);
                                        passOn(symbol);
                                    });
                                }
                            });
                        }
                    });
                }
            };
            runPerPair(() => {
                _a.conclude(ts, id);
            });
        }
    });
};
CentralLoop.conclude = (ts, id) => {
    Log_1.Log.flow(`CL > ${id} > Iteration concluded.`, 0);
    const now = Date.now();
    const nextStartTime = ts + site_1.Site.interval;
    const diff = nextStartTime - now;
    if (diff <= 0) {
        _a.run();
    }
    else {
        Log_1.Log.flow(`CL > Next iteration scheduled at ${(0, date_time_1.getDateTime)(nextStartTime)}.`, 0);
        setTimeout(() => {
            _a.run();
        }, diff);
    }
};
