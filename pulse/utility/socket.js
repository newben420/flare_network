"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySocket = void 0;
const env_config_1 = require("../env_config");
(0, env_config_1.ENVCONFIG)();
const Log_1 = require("./Log");
const site_1 = require("../site");
const res_1 = require("../model/res");
const persistence_driver_1 = require("../persistence/persistence_driver");
const runtime_manager_1 = require("./runtime_manager");
const socket_io_client_1 = require("socket.io-client");
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
MySocket.uiLogUpdate = setInterval(() => {
    let cache = runtime_manager_1.RuntimeManager.getCache();
    if (cache && MySocket.io != null) {
        MySocket.io.emit("new_logs", cache);
    }
}, site_1.Site.uiLogINterval);
MySocket.runOnce = () => {
    if (MySocket.io != null) {
        MySocket.io.on("connection", (socket) => {
            var _a;
            Log_1.Log.dev(`Interface connected with id ${socket.id}.`);
            let session = site_1.Site.auth ? (((_a = socket.request.session) === null || _a === void 0 ? void 0 : _a.user) ? socket.request.session.user == site_1.Site.authUser : false) : true;
            if (!session) {
                socket.disconnect(true);
            }
            const registerEvents = () => {
                socket.on("initial_load", (f) => {
                    let obj = {};
                    obj.db = persistence_driver_1.PersistenceDriver.getDB();
                    obj.title = site_1.Site.title;
                    obj.logs = runtime_manager_1.RuntimeManager.getLogs();
                    obj.siteURL = site_1.Site.siteURL;
                    obj.root = (0, site_1.BASE_DIR)();
                    obj.max = site_1.Site.maxLogsPerSystem;
                    obj.auth = site_1.Site.auth;
                    f(res_1.GRes.succ(obj));
                });
                socket.on("update_system", (system, f) => {
                    persistence_driver_1.PersistenceDriver.updateSystem(system, r => {
                        f(r);
                    });
                });
                socket.on("delete_system", (system, f) => {
                    persistence_driver_1.PersistenceDriver.deleteSystem(system, r => {
                        f(r);
                    });
                });
            };
            if (socket.request.headers.referer) {
                // check if its from a proxied page and proxy connection to original server
                const portMatch = socket.request.headers.referer.match(/\/(\d{4,5})/);
                if (portMatch) {
                    const port = portMatch[1];
                    const targetIO = `http://localhost:${port}`;
                    const targetSocket = (0, socket_io_client_1.io)(targetIO);
                    socket.onAny((event, ...args) => {
                        targetSocket.emit(event, ...args);
                    });
                    targetSocket.onAny((event, ...args) => {
                        socket.emit(event, ...args);
                    });
                    socket.on('disconnect', () => {
                        targetSocket.disconnect();
                    });
                }
                else {
                    registerEvents();
                }
            }
            else {
                registerEvents();
            }
        });
    }
};
