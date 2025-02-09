"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.booleanThreshold = void 0;
const booleanThreshold = (arr, threshold = 0.5) => {
    let n = arr.length;
    if (n == 0) {
        return false;
    }
    let truths = 0;
    for (let i = 0; i < n; i++) {
        if (arr[i]) {
            truths++;
        }
    }
    let truthRatio = truths / n;
    return truthRatio >= threshold;
};
exports.booleanThreshold = booleanThreshold;
