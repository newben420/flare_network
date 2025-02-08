"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.correctExit = void 0;
const correctExit = (sell, signalSeq, desc) => {
    if (!sell || ["BEAR_EXIT", "BULL_EXIT"].indexOf(desc) == -1) {
        return sell;
    }
    if (["BEAR_EXIT", "BULL_EXIT"].indexOf(desc) != -1 && sell) {
        if (signalSeq.length > 0) {
            let sig = signalSeq[signalSeq.length - 1];
            return (desc == "BEAR_EXIT" && sig == "FGJK") || (desc == "BULL_EXIT" && sig == "EHIL");
        }
        else {
            return sell;
        }
    }
    return false;
};
exports.correctExit = correctExit;
