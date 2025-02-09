"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalRegex = void 0;
class LocalRegex {
}
exports.LocalRegex = LocalRegex;
LocalRegex.storageKey = /^[a-zA-Z\s0-9\-_]+$/;
LocalRegex.general = /^.+$/;
LocalRegex.generalEmpty = /[.\n\t\s]*/;
LocalRegex.token = /^[A-Z0-9\s_\-]{1,100}$/;
LocalRegex.flt = /^([\d]{1,})(\.([\d]{1,}))?$/;
LocalRegex.integer = /^[\d]+$/;
