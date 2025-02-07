"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENVCONFIG = void 0;
const dotenv_1 = require("dotenv");
const ENVCONFIG = () => {
    const args = process.argv.slice(2);
    (0, dotenv_1.config)({
        path: args[0] || ".env",
    });
};
exports.ENVCONFIG = ENVCONFIG;
