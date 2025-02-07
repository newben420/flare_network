"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitgetConvertExchange = void 0;
const axios_1 = __importDefault(require("axios"));
const site_1 = require("../../site");
const crypto_1 = require("crypto");
const res_1 = require("../../model/res");
var ReqType;
(function (ReqType) {
    ReqType[ReqType["GET"] = 0] = "GET";
    ReqType[ReqType["POST"] = 1] = "POST";
})(ReqType || (ReqType = {}));
class BitgetConvertExchange {
}
exports.BitgetConvertExchange = BitgetConvertExchange;
BitgetConvertExchange.convert = (fromCoin, fromCoinSize, cnvtPrice, toCoin, toCoinSize, traceId, f) => {
    const ts = BitgetConvertExchange.getTimestamp();
    const path = "/api/v2/convert/trade";
    let data = {
        fromCoin: fromCoin,
        fromCoinSize: fromCoinSize,
        cnvtPrice: cnvtPrice,
        toCoin: toCoin,
        toCoinSize: toCoinSize,
        traceId: traceId
    };
    BitgetConvertExchange.request(ts, ReqType.POST, path, data, r => {
        if (r.succ) {
            if (r.message.msg == "success" && (r.message.data ? (r.message.data.ts && r.message.data.cnvtPrice && r.message.data.toCoinSize && r.message.data.toCoin) : false)) {
                r = res_1.GRes.succ(r.message.data);
            }
            else {
                r = res_1.GRes.err("Unknown response from convert endpoint.");
            }
        }
        f(r);
    });
};
BitgetConvertExchange.getQuote = (fromCoin, fromCoinSize, toCoin, toCoinSize, f) => {
    const ts = BitgetConvertExchange.getTimestamp();
    const path = "/api/v2/convert/quoted-price";
    let data = {
        fromCoin: fromCoin,
        toCoin: toCoin
    };
    if (fromCoinSize) {
        data.fromCoinSize = fromCoinSize;
    }
    if (toCoinSize) {
        data.toCoinSize = toCoinSize;
    }
    BitgetConvertExchange.request(ts, ReqType.GET, path, data, r => {
        if (r.succ) {
            if (r.message.msg == "success") {
                if (r.message.data.fee == "0" && r.message.data.fromCoin && r.message.data.cnvtPrice && r.message.data.toCoin) {
                    r = res_1.GRes.succ(r.message.data);
                }
                else {
                    r = res_1.GRes.err("Trx fee is not 0. Or some required data is missing from quoted price response " + JSON.stringify(r.message.data) + ".");
                }
            }
            else {
                r = res_1.GRes.err("Unknown response from getQuote endpoint.");
            }
        }
        f(r);
    });
};
BitgetConvertExchange.getTimestamp = () => {
    return Math.round(new Date().getTime());
};
BitgetConvertExchange.processGetData = (ob) => {
    const queryString = Object.keys(BitgetConvertExchange.sortObjectKeys(ob)).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(ob[key])).join('&');
    return (queryString.length == 0) ? '' : ("?" + queryString);
};
BitgetConvertExchange.processPostData = (ob) => {
    return (Object.keys(ob).length == 0) ? '' : JSON.stringify(ob);
};
BitgetConvertExchange.processData = (rt, data) => {
    return (rt == ReqType.GET) ? BitgetConvertExchange.processGetData(data) : BitgetConvertExchange.processPostData(data);
};
BitgetConvertExchange.makeHeaders = (ts, rt, pth, data) => {
    let headers = {
        "ACCESS-KEY": site_1.Site.exchangeKeys[0],
        "ACCESS-TIMESTAMP": ts,
        "ACCESS-PASSPHRASE": site_1.Site.exchangeKeys[2],
    };
    if (rt == ReqType.POST) {
        headers["Content-Type"] = "application/json";
    }
    // make sign
    let rawSign = `${ts}${(rt == ReqType.GET) ? "GET" : "POST"}${pth}${data}`;
    const hmac = (0, crypto_1.createHmac)('sha256', site_1.Site.exchangeKeys[1]);
    hmac.update(rawSign);
    const payload = hmac.digest();
    const signed = payload.toString('base64');
    headers["ACCESS-SIGN"] = signed;
    headers["locale"] = site_1.Site.exchangeKeys[4];
    return headers;
};
BitgetConvertExchange.request = (timestamp, type, path, data, f) => {
    let proData = BitgetConvertExchange.processData(type, data);
    let headers = BitgetConvertExchange.makeHeaders(timestamp, type, path, proData);
    ((type == ReqType.GET) ? (axios_1.default.get(`${site_1.Site.exchangeKeys[3]}${path}${proData}`, {
        headers: headers,
        timeout: parseInt(site_1.Site.exchangeKeys[5])
    })) : (axios_1.default.post(`${site_1.Site.exchangeKeys[3]}${path}`, data, {
        headers: headers,
        timeout: parseInt(site_1.Site.exchangeKeys[5])
    }))).then((response) => {
        if (response.status == 200) {
            f(res_1.GRes.succ(response.data));
        }
        else {
            f(res_1.GRes.err(`${response.status.toString()} - ${response.statusText.toString()}.`));
        }
    }).catch((error) => {
        try {
            if (error.response.data) {
                f(res_1.GRes.err(`${error.response.data.code} - ${error.response.data.msg}`));
            }
            else {
                f(res_1.GRes.err(`INTERFACE`));
            }
        }
        catch (error) {
            f(res_1.GRes.err(`INTERFACE`));
        }
    });
};
BitgetConvertExchange.sortObjectKeys = (obj) => {
    const entries = Object.entries(obj);
    entries.sort((a, b) => a[0].localeCompare(b[0]));
    const sortedObj = {};
    for (const [key, value] of entries) {
        sortedObj[key] = value;
    }
    return sortedObj;
};
