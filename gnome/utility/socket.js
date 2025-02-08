"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySocket = void 0;
const env_config_1 = require("../env_config");
(0, env_config_1.ENVCONFIG)();
const Log_1 = require("./Log");
const site_1 = require("../site");
const res_1 = require("../model/res");
const persistence_driver_1 = require("../persistence/persistence_driver");
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
MySocket.broadcastDecision = (decision) => {
    if (MySocket.io != null) {
        MySocket.io.to("DEC").emit("decision", decision);
    }
};
MySocket.runOnce = () => {
    if (MySocket.io != null) {
        MySocket.io.on("connection", (socket) => {
            Log_1.Log.dev(`Socket client connected with id ${socket.id}.`);
            socket.on("initial_load", (f) => {
                let obj = {};
                obj.db = persistence_driver_1.PersistenceDriver.getDB();
                obj.title = site_1.Site.title;
                f(res_1.GRes.succ(obj));
            });
            socket.on("EXTERNAL_LISTENER", () => {
                socket.join("DEC");
            });
            socket.on("disconnect", () => {
                if (socket.rooms.has("DEC")) {
                    socket.leave("DEC");
                }
            });
            socket.on("update_pair", (pair, f) => {
                persistence_driver_1.PersistenceDriver.updatePair(pair, r => {
                    f(r);
                });
            });
            socket.on("all_pairs", (pair, f) => {
                var _a;
                if (socket.rooms.has("DEC")) {
                    persistence_driver_1.PersistenceDriver.getDB().pairs;
                    f(res_1.GRes.succ((_a = persistence_driver_1.PersistenceDriver.getDB().pairs) !== null && _a !== void 0 ? _a : []));
                }
                else {
                    f(res_1.GRes.err("ACCESS_DENIED"));
                }
            });
            socket.on("delete_pair", (pair, f) => {
                persistence_driver_1.PersistenceDriver.deletePair(pair, r => {
                    f(r);
                });
            });
        });
    }
};
