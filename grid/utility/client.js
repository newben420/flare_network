"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GnomeClient = void 0;
const Log_1 = require("./Log");
const site_1 = require("../site");
const persistence_driver_1 = require("../persistence/persistence_driver");
const trader_1 = require("./trader");
class GnomeClient {
}
exports.GnomeClient = GnomeClient;
GnomeClient.init = (s) => {
    GnomeClient.socket = s;
    GnomeClient.socket.on("connect", () => {
        GnomeClient.socket.emit("EXTERNAL_LISTENER");
        Log_1.Log.flow("Gnome > Connected.", 0);
        persistence_driver_1.PersistenceDriver.toggleConnected(true, undefined);
    });
    GnomeClient.socket.on("decision", (decision) => {
        const { base, quote, buy, sell, desc, rate, vol, tpsl, signals } = decision;
        if (buy && quote == site_1.Site.baseToken && base == site_1.Site.tradeToken) {
            trader_1.Trader.run({ vol, tpsl, desc });
        }
    });
    GnomeClient.socket.on("disconnect", () => {
        Log_1.Log.flow("Gnome > Disconnected.", 0);
        persistence_driver_1.PersistenceDriver.toggleConnected(false, undefined);
    });
};
