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
exports.DataSource = void 0;
const axios_1 = __importDefault(require("axios"));
const site_1 = require("../site");
const res_1 = require("../model/res");
class DataSource {
}
exports.DataSource = DataSource;
_a = DataSource;
DataSource.checkAvailabablePair = (symbol, fx) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    let r = yield _a.get("/api/v2/spot/public/symbols?symbol=" + symbol);
    if (!r.succ) {
        fx(r);
    }
    else {
        if (r.message.msg == "success" && (Array.isArray(r.message.data) ? (r.message.data.length > 0) : false)) {
            fx(res_1.GRes.succ(r.message.data[0].symbol));
        }
        else {
            fx(res_1.GRes.err((_b = r.message.msg) !== null && _b !== void 0 ? _b : "UNKNOWN"));
        }
    }
});
DataSource.getHistoricCSData = (symbol, limit, granularity, endTime, fx) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    let r = yield _a.get(`/api/v2/spot/market/history-candles?symbol=${symbol}&granularity=${granularity}&endTime=${endTime}&limit=${limit}`);
    if (!r.succ) {
        fx(r);
    }
    else {
        if (r.message.msg == "success" && (Array.isArray(r.message.data) ? (r.message.data.length > 0) : false)) {
            fx(res_1.GRes.succ(r.message.data));
        }
        else {
            fx(res_1.GRes.err((_b = r.message.msg) !== null && _b !== void 0 ? _b : "UNKNOWN"));
        }
    }
});
DataSource.post = (path, body, headers = {}) => {
    return new Promise((fx, reject) => {
        const { b, h, p } = _a.encode("POST", `${site_1.Site.external[0]}${path}`, body, headers);
        axios_1.default.post(p, b, {
            timeout: site_1.Site.externalTimeout,
            headers: h,
        }).then(response => {
            if (response.status == 200) {
                fx(res_1.GRes.succ(_a.decode(response.data).r));
            }
            else {
                fx(res_1.GRes.err(`${response.status.toString()} - ${response.statusText.toString()}.`));
            }
        }).catch(error => {
            // Log.dev(error);
            try {
                if (error.response.data) {
                    fx(res_1.GRes.err(`${error.response.data.code} - ${error.response.data.msg}`));
                }
                else {
                    fx(res_1.GRes.err(`INTERFACE`));
                }
            }
            catch (error) {
                fx(res_1.GRes.err(`INTERFACE`));
            }
        });
    });
};
DataSource.get = (path, headers = {}) => {
    return new Promise((fx, reject) => {
        const { b, h, p } = _a.encode("GET", `${site_1.Site.external[0]}${path}`, {}, headers);
        axios_1.default.get(p, {
            timeout: site_1.Site.externalTimeout,
            headers: h,
        }).then(response => {
            if (response.status == 200) {
                fx(res_1.GRes.succ(_a.decode(response.data).r));
            }
            else {
                fx(res_1.GRes.err(`${response.status.toString()} - ${response.statusText.toString()}.`));
            }
        }).catch(error => {
            // Log.dev(error);
            try {
                if (error.response.data) {
                    fx(res_1.GRes.err(`${error.response.data.code} - ${error.response.data.msg}`));
                }
                else {
                    fx(res_1.GRes.err(`INTERFACE`));
                }
            }
            catch (error) {
                fx(res_1.GRes.err(`INTERFACE`));
            }
        });
    });
};
DataSource.encode = (type, path, body = {}, headers = {}) => {
    if (site_1.Site.useProxy) {
        // encode here
        return { p: path, b: body, h: headers };
    }
    else {
        return { p: path, b: body, h: headers };
    }
};
DataSource.decode = (response) => {
    if (site_1.Site.useProxy) {
        // encode here
        return { r: response };
    }
    else {
        return { r: response };
    }
};
