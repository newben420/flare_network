"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasDuplicates = void 0;
const hasDuplicates = (strings) => {
    const seen = new Set();
    for (const str of strings) {
        if (str === "") {
            continue;
        }
        if (seen.has(str)) {
            return true;
        }
        seen.add(str);
    }
    return false;
};
exports.hasDuplicates = hasDuplicates;
