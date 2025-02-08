"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicStrategy = void 0;
const res_1 = require("../../model/res");
class BasicStrategy {
    run(symbol, iterationID, open, close, high, low, baseVolume, quoteVolume, usdtVolume, callback) {
        // TODO - IMPLEMENT STRATEGY
        callback(res_1.GRes.err("STRATEGY_NOT_IMPLEMENTED"));
    }
}
exports.BasicStrategy = BasicStrategy;
