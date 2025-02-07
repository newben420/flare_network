"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMean = void 0;
const calculateMean = (narr) => {
    let l = narr.length;
    let i;
    let sum = 0;
    for (i = 0; i < l; i++) {
        sum += narr[i];
    }
    return sum / l;
};
exports.calculateMean = calculateMean;
