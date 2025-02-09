"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeJSONParse = void 0;
const safeJSONParse = (data, isArr = false) => {
    let obj = isArr ? [] : {};
    try {
        obj = JSON.parse(data);
    }
    catch (error) {
        // do nothing
    }
    finally {
        return obj;
    }
};
exports.safeJSONParse = safeJSONParse;
