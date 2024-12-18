"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BotController_1 = __importDefault(require("../controllers/BotController"));
const routes = (0, express_1.Router)();
routes.post('/bot', BotController_1.default.RunBot);
exports.default = routes;
