"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Analysis = void 0;
const res_1 = require("../model/res");
const site_1 = require("../site");
const correct_entry_1 = require("./correct_entry");
const correct_exit_1 = require("./correct_exit");
const Log_1 = require("./Log");
const memory_data_1 = require("./memory_data");
const basic_strategy_1 = require("./strategy/basic_strategy");
const main_strategy_1 = require("./strategy/main_strategy");
const main_strategy_extended_1 = require("./strategy/main_strategy_extended");
const test_strategy_1 = require("./strategy/test_strategy");
const strategyRegistry = {
    BasicStrategy: basic_strategy_1.BasicStrategy,
    TestStrategy: test_strategy_1.TestStrategy,
    MainStrategy: main_strategy_1.MainStrategy,
    ExtendedMainStrategy: main_strategy_extended_1.ExtendedMainStrategy,
};
const getStrategyByName = (className) => {
    const StrategyClass = strategyRegistry[className];
    if (!StrategyClass) {
        return null;
    }
    return new StrategyClass;
};
class Analysis {
}
exports.Analysis = Analysis;
Analysis.instanceID = "";
Analysis.symbol = "";
Analysis.callback = r => { };
Analysis.data = [];
Analysis.determined = false;
Analysis.results = {};
Analysis.open = [];
Analysis.close = [];
Analysis.high = [];
Analysis.low = [];
Analysis.baseVolume = [];
Analysis.quoteVolume = [];
Analysis.usdtVolume = [];
Analysis.strategy = null;
Analysis.entry = (instanceID, symbol, callback) => {
    Analysis.instanceID = instanceID,
        Analysis.symbol = symbol,
        Analysis.callback = callback;
    Analysis.data = memory_data_1.MemoryData.history[symbol];
    Analysis.determined = false;
    Analysis.results = {};
    if (Analysis.strategy === null) {
        Analysis.strategy = getStrategyByName(site_1.Site.strategy);
    }
    Analysis.run();
};
Analysis.conclude = () => {
    Log_1.Log.flow(`CL > ${Analysis.instanceID} > ${Analysis.symbol} > Analysis > Concluded.`, 2);
    Analysis.callback(Analysis.determined ? res_1.GRes.succ(Analysis.results) : res_1.GRes.err(Analysis.results));
};
Analysis.run = () => {
    Log_1.Log.flow(`CL > ${Analysis.instanceID} > ${Analysis.symbol} > Analysis > Initialized.`, 2);
    Analysis.open = Analysis.data.map(x => parseFloat(x[1]));
    Analysis.high = Analysis.data.map(x => parseFloat(x[2]));
    Analysis.low = Analysis.data.map(x => parseFloat(x[3]));
    Analysis.close = Analysis.data.map(x => parseFloat(x[4]));
    Analysis.baseVolume = Analysis.data.map(x => parseFloat(x[5]));
    Analysis.quoteVolume = Analysis.data.map(x => parseFloat(x[6]));
    Analysis.usdtVolume = Analysis.data.map(x => parseFloat(x[7]));
    if (Analysis.strategy === null) {
        Analysis.results = "NO_STRATEGY";
        Analysis.determined = false;
        Analysis.conclude();
    }
    else {
        Analysis.strategy.run(Analysis.symbol, Analysis.instanceID, Analysis.open, Analysis.close, Analysis.high, Analysis.low, Analysis.baseVolume, Analysis.quoteVolume, Analysis.usdtVolume, r => {
            if (r.succ) {
                memory_data_1.MemoryData.updateGraph(Analysis.symbol, r.message.rate, r.message.buy, r.message.sell);
                const signals = memory_data_1.MemoryData.getSignalHistory(Analysis.symbol);
                r.message = Object.assign(Object.assign({}, r.message), { signals, buy: (0, correct_entry_1.correctEntry)(r.message.buy, signals, r.message.desc), sell: (0, correct_exit_1.correctExit)(r.message.sell, signals, r.message.desc) });
            }
            Analysis.results = r.message;
            Analysis.determined = r.succ;
            Analysis.conclude();
        });
    }
};
