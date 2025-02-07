"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exchange = void 0;
const bitget_convert_1 = require("./exchange/bitget_convert");
class Exchange {
}
exports.Exchange = Exchange;
Exchange.getQuote = (fromCoin, fromCoinSize, toCoin) => {
    return new Promise((f, reject) => {
        bitget_convert_1.BitgetConvertExchange.getQuote(fromCoin, fromCoinSize.toString(), toCoin, null, r => {
            f(r);
        });
    });
};
Exchange.convert = (data) => {
    return new Promise((f, reject) => {
        const { fromCoin, fromCoinSize, cnvtPrice, toCoin, toCoinSize, traceId } = data;
        bitget_convert_1.BitgetConvertExchange.convert(fromCoin, fromCoinSize, cnvtPrice, toCoin, toCoinSize, traceId, r => {
            f(r);
        });
    });
};
