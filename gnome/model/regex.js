"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalRegex = void 0;
class LocalRegex {
}
exports.LocalRegex = LocalRegex;
LocalRegex.storageKey = /^[a-zA-Z\s0-9\-_]+$/;
LocalRegex.general = /^.+$/;
LocalRegex.url = new RegExp(`^(ht|f)tp(s?):\\/\\/[0-9a-zA-Z]([\\-\\.\\w]*[0-9a-zA-Z])?(:[0-9]+)?(\\/)?([a-zA-Z0-9\\-\\.\\?,'\\/\\+&%\\$#_]*)?$`, 'i');
LocalRegex.generalEmpty = /[.\n\t\s]*/;
LocalRegex.password = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*\-]).{8,30}$/;
LocalRegex.token = /^[A-Z0-9\s_\-]{1,100}$/;
LocalRegex.flt = /^([\d]{1,})(\.([\d]{1,}))?$/;
LocalRegex.integer = /^[\d]+$/;
