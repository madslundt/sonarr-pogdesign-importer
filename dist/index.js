"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const minimist = require("minimist");
const utils_1 = require("./utils");
const app_1 = require("./app");
const init = () => __awaiter(this, void 0, void 0, function* () {
    const args = minimist(process.argv.slice(2));
    const config = yield utils_1.loadConfig(args);
    if (!config) {
        process.exit(1);
    }
    else {
        const app = new app_1.default(config);
        app.process();
    }
});
init();
