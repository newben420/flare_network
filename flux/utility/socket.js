"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
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
_a = MySocket;
MySocket.io = null;
MySocket.initialize = (ioInst) => {
    _a.io = ioInst;
    _a.runOnce();
};
MySocket.dbSub = persistence_driver_1.PersistenceDriver.dbEvent.subscribe(x => {
    if (_a.io != null) {
        _a.io.emit("db_update", x);
    }
});
MySocket.tradeSub = persistence_driver_1.PersistenceDriver.newTradeEvent.subscribe(x => {
    if (_a.io != null) {
        _a.io.emit("new_trade", x);
    }
});
MySocket.broadcastRapidValuation = (val) => {
    if (_a.io != null) {
        _a.io.emit("rapid_valuation", val);
    }
};
MySocket.runOnce = () => {
    if (_a.io != null) {
        _a.io.on("connection", (socket) => {
            Log_1.Log.dev(`Socket client connected with id ${socket.id}.`);
            socket.on("initial_load", (f) => {
                let obj = {};
                obj.db = persistence_driver_1.PersistenceDriver.getDB();
                obj.trades = persistence_driver_1.PersistenceDriver.getTrades();
                obj.title = site_1.Site.title;
                obj.base = site_1.Site.baseToken;
                obj.start = site_1.Site.startBalance;
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
            socket.on("close", (f) => __awaiter(void 0, void 0, void 0, function* () {
                const { Rapid } = yield Promise.resolve().then(() => __importStar(require('./rapid')));
                Rapid.close(r => {
                    f(r);
                });
            }));
        });
    }
};
