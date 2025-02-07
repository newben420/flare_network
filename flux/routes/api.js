"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRoute = void 0;
const env_config_1 = require("../env_config");
(0, env_config_1.ENVCONFIG)();
const express_1 = require("express");
exports.apiRoute = (0, express_1.Router)();
