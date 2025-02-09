"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExponentialAlgo = void 0;
const persistence_driver_1 = require("../persistence/persistence_driver");
const site_1 = require("../site");
const Log_1 = require("./Log");
class ExponentialAlgo {
}
exports.ExponentialAlgo = ExponentialAlgo;
ExponentialAlgo.bal = 0;
ExponentialAlgo.sub = persistence_driver_1.PersistenceDriver.dbEvent.subscribe(x => {
    setTimeout(() => {
        if (x.balance != ExponentialAlgo.bal && (x.balance || x.balance === 0)) {
            let currentEntry = x.entryAmt || 0;
            let tcount = persistence_driver_1.PersistenceDriver.getTrades().length;
            let newEntry = (x.balance + (tcount * currentEntry)) / site_1.Site.maxGrids;
            if (newEntry != currentEntry) {
                Log_1.Log.flow(`Exp > Grid entry amount set as ${site_1.Site.baseToken} ${newEntry}.`, 1);
                persistence_driver_1.PersistenceDriver.updateEntryAmt(newEntry);
            }
            ExponentialAlgo.bal = x.balance;
        }
    }, 10);
});
ExponentialAlgo.init = () => {
    Log_1.Log.flow(`Exp > Initialized.`, 1);
};
