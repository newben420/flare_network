"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryData = void 0;
const site_1 = require("../site");
class Graph {
    constructor() {
        this.rate = 0;
        this.signals = [];
    }
}
class Decision {
    constructor(b = false, s = false) {
        this.buy = b;
        this.sell = s;
    }
}
class MemoryData {
}
exports.MemoryData = MemoryData;
MemoryData.freshStatus = {};
MemoryData.history = {};
MemoryData.signalGraph = {};
MemoryData.decisionGraph = {};
MemoryData.signalHistory = {};
MemoryData.updateGraph = (symbol, rate, buy, sell) => {
    if (!MemoryData.signalGraph[symbol]) {
        MemoryData.signalGraph[symbol] = new Graph();
    }
    if (!MemoryData.signalHistory[symbol]) {
        MemoryData.signalHistory[symbol] = [];
    }
    if (rate !== MemoryData.signalGraph[symbol].rate && MemoryData.signalGraph[symbol].signals.length > 0) {
        // new sets of decisions
        MemoryData.signalHistory[symbol].push(MemoryData.signalGraph[symbol].signals.sort((a, b) => a.localeCompare(b)).join(""));
        if (MemoryData.signalHistory[symbol].length > site_1.Site.maxSignalHistoryLength) {
            MemoryData.signalHistory[symbol] = MemoryData.signalHistory[symbol].slice(MemoryData.signalHistory[symbol].length - site_1.Site.maxSignalHistoryLength);
        }
        MemoryData.signalGraph[symbol].signals = [];
    }
    if (MemoryData.decisionGraph[symbol]) {
        if (buy) {
            if (MemoryData.decisionGraph[symbol].buy) {
                if (MemoryData.signalGraph[symbol].signals.indexOf("A") == -1) {
                    MemoryData.signalGraph[symbol].signals.push("A");
                }
            }
            else {
                if (MemoryData.signalGraph[symbol].signals.indexOf("B") == -1) {
                    MemoryData.signalGraph[symbol].signals.push("B");
                }
            }
            if (MemoryData.decisionGraph[symbol].sell) {
                if (MemoryData.signalGraph[symbol].signals.indexOf("C") == -1) {
                    MemoryData.signalGraph[symbol].signals.push("C");
                }
            }
            else {
                if (MemoryData.signalGraph[symbol].signals.indexOf("D") == -1) {
                    MemoryData.signalGraph[symbol].signals.push("D");
                }
            }
        }
        else {
            if (MemoryData.decisionGraph[symbol].buy) {
                if (MemoryData.signalGraph[symbol].signals.indexOf("E") == -1) {
                    MemoryData.signalGraph[symbol].signals.push("E");
                }
            }
            else {
                if (MemoryData.signalGraph[symbol].signals.indexOf("F") == -1) {
                    MemoryData.signalGraph[symbol].signals.push("F");
                }
            }
            if (MemoryData.decisionGraph[symbol].sell) {
                if (MemoryData.signalGraph[symbol].signals.indexOf("G") == -1) {
                    MemoryData.signalGraph[symbol].signals.push("G");
                }
            }
            else {
                if (MemoryData.signalGraph[symbol].signals.indexOf("H") == -1) {
                    MemoryData.signalGraph[symbol].signals.push("H");
                }
            }
        }
        if (sell) {
            if (MemoryData.decisionGraph[symbol].buy) {
                if (MemoryData.signalGraph[symbol].signals.indexOf("I") == -1) {
                    MemoryData.signalGraph[symbol].signals.push("I");
                }
            }
            else {
                if (MemoryData.signalGraph[symbol].signals.indexOf("J") == -1) {
                    MemoryData.signalGraph[symbol].signals.push("J");
                }
            }
            if (MemoryData.decisionGraph[symbol].sell) {
                if (MemoryData.signalGraph[symbol].signals.indexOf("K") == -1) {
                    MemoryData.signalGraph[symbol].signals.push("K");
                }
            }
            else {
                if (MemoryData.signalGraph[symbol].signals.indexOf("L") == -1) {
                    MemoryData.signalGraph[symbol].signals.push("L");
                }
            }
        }
        else {
            if (MemoryData.decisionGraph[symbol].buy) {
                if (MemoryData.signalGraph[symbol].signals.indexOf("M") == -1) {
                    MemoryData.signalGraph[symbol].signals.push("M");
                }
            }
            else {
                if (MemoryData.signalGraph[symbol].signals.indexOf("N") == -1) {
                    MemoryData.signalGraph[symbol].signals.push("N");
                }
            }
            if (MemoryData.decisionGraph[symbol].sell) {
                if (MemoryData.signalGraph[symbol].signals.indexOf("O") == -1) {
                    MemoryData.signalGraph[symbol].signals.push("O");
                }
            }
            else {
                if (MemoryData.signalGraph[symbol].signals.indexOf("P") == -1) {
                    MemoryData.signalGraph[symbol].signals.push("P");
                }
            }
        }
    }
    if (!MemoryData.decisionGraph[symbol]) {
        MemoryData.decisionGraph[symbol] = new Decision();
    }
    MemoryData.decisionGraph[symbol].buy = buy;
    MemoryData.decisionGraph[symbol].sell = sell;
};
MemoryData.getSignalHistory = (symbol) => {
    let history = [];
    if (MemoryData.signalHistory[symbol]) {
        history = history.concat(MemoryData.signalHistory[symbol]);
    }
    if (MemoryData.signalGraph[symbol] ? MemoryData.signalGraph[symbol].signals.length > 0 : false) {
        history = history.concat([MemoryData.signalGraph[symbol].signals.sort((a, b) => a.localeCompare(b)).join("")]);
    }
    if (history.length > site_1.Site.maxSignalHistoryLength) {
        history = history.slice(history.length - site_1.Site.maxSignalHistoryLength);
    }
    return history;
};
