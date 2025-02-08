"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySocket = void 0;
const env_config_1 = require("../env_config");
(0, env_config_1.ENVCONFIG)();
const Log_1 = require("./Log");
const site_1 = require("../site");
const res_1 = require("../model/res");
const persistence_driver_1 = require("../persistence/persistence_driver");
const rapid_1 = require("./rapid");
class MySocket {
}
exports.MySocket = MySocket;
MySocket.io = null;
MySocket.initialize = (ioInst) => {
    MySocket.io = ioInst;
    MySocket.runOnce();
};
MySocket.dbSub = persistence_driver_1.PersistenceDriver.dbEvent.subscribe(x => {
    if (MySocket.io != null) {
        MySocket.io.emit("db_update", x);
    }
});
MySocket.tradeSub = persistence_driver_1.PersistenceDriver.newTradeEvent.subscribe(x => {
    if (MySocket.io != null) {
        MySocket.io.emit("new_trade", x);
    }
});
MySocket.valSub = rapid_1.Rapid.valEvent.subscribe(val => {
    if (MySocket.io != null) {
        MySocket.io.emit("valuation", val);
    }
});
MySocket.runOnce = () => {
    if (MySocket.io != null) {
        MySocket.io.on("connection", (socket) => {
            Log_1.Log.dev(`Socket client connected with id ${socket.id}.`);
            socket.on("initial_load", (f) => {
                let obj = {};
                obj.db = persistence_driver_1.PersistenceDriver.getDB();
                obj.trades = persistence_driver_1.PersistenceDriver.getTrades();
                obj.title = site_1.Site.title;
                obj.baseToken = site_1.Site.baseToken;
                obj.grid = site_1.Site.maxGrids;
                obj.tradeToken = site_1.Site.tradeToken;
                f(res_1.GRes.succ(obj));
            });
            socket.on("disconnect", () => {
                Log_1.Log.dev(`Socket client with id ${socket.id} disconnected.`);
            });
            socket.on("toggle_trader", (f) => {
                persistence_driver_1.PersistenceDriver.toggleTrader(undefined, r => {
                    f(r);
                });
            });
            socket.on("toggle_live", (f) => {
                persistence_driver_1.PersistenceDriver.toggleLive(undefined, r => {
                    f(r);
                });
            });
            socket.on("reset", (f) => {
                persistence_driver_1.PersistenceDriver.reset(r => {
                    f(r);
                });
            });
            socket.on("close", (trade, valuation, f) => {
                rapid_1.Rapid.close(trade, valuation, r => {
                    f(r);
                });
            });
            socket.on("edit_balance", (val, f) => {
                persistence_driver_1.PersistenceDriver.updateBalance(parseFloat(val), r => {
                    f(r);
                });
            });
        });
    }
};
