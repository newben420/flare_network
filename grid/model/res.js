"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GRes = exports.Res = void 0;
class Res {
}
exports.Res = Res;
class GRes {
}
exports.GRes = GRes;
GRes.succ = (message = "") => {
    return { succ: true, message };
};
GRes.err = (message = "") => {
    return { succ: false, message };
};
