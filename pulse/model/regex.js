"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalRegex = void 0;
class LocalRegex {
}
exports.LocalRegex = LocalRegex;
LocalRegex.storageKey = /^[a-zA-Z\s0-9\-_]+$/;
LocalRegex.general = /^.+$/;
LocalRegex.generalEmpty = /[.\n\t\s]*/;
LocalRegex.script = /^[a-z0-9_\-A-Z]+\.js$/;
LocalRegex.env = /^\.env(\.[a-z0-9A-Z\-_]+)?$/;
LocalRegex.port = /^\d{1,5}$/;
LocalRegex.title = /^[A-Za-z0-9]{1,100}$/;
