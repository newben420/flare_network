"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.correctEntry = void 0;
const correctEntry = (buy, signalSeq, desc) => {
    var _a;
    if (!buy || ["BEAR_ENTRY", "BULL_ENTRY"].indexOf(desc) == -1) {
        return buy;
    }
    if (["BEAR_ENTRY", "BULL_ENTRY"].indexOf(desc) != -1 && buy) {
        if (signalSeq.length >= 3) {
            let cpy = structuredClone(signalSeq);
            let fourth = "";
            if (cpy.length > 3) {
                fourth = (_a = cpy.slice(-4, -3)[0]) !== null && _a !== void 0 ? _a : "";
                cpy = cpy.slice(cpy.length - 3);
            }
            cpy = cpy.join(" ");
            const seq1 = cpy == "BCNO ADMP ADMP";
            const seq2 = cpy == "ADMP ADMP ADMP";
            const seq3 = cpy == "FHNP FHNP BDNP";
            const seq4 = cpy == "FGNO FHNP BDNP";
            if (desc == "BULL_ENTRY") {
                return seq3 || seq4;
            }
            else {
                return (seq1 || seq2) && (["BDNP", ""].indexOf(fourth) == -1);
            }
        }
        else {
            return false;
        }
    }
    return false;
};
exports.correctEntry = correctEntry;
