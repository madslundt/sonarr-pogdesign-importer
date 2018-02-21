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
const fs = require("fs");
const sonarrapi_1 = require("./sonarrapi");
const stripTrailingSlashes = (url) => {
    return url.endsWith('/') ? url.slice(0, -1) : url;
};
const isConfigValid = (config) => {
    return config.sonarrUrl.length &&
        config.sonarrUrl.startsWith('http') &&
        config.sonarrApi.length &&
        config.monthsForward >= 0 &&
        config.minimumStars >= 0 &&
        config.sonarrProfileId > 0 &&
        config.sonarrPath.length &&
        config.genresIgnored &&
        config.sonarrUseSeasonFolder !== undefined &&
        config.sonarrPath.endsWith('/') &&
        config.sonarrPath.startsWith('/');
};
const getProfiles = (config) => __awaiter(this, void 0, void 0, function* () {
    const sonarrApi = new sonarrapi_1.default(config);
    const res = yield sonarrApi.getProfiles();
    const profiles = yield res.json();
    if (config.verbose) {
        console.log(JSON.stringify(profiles, null, 2));
    }
    else {
        console.log('Profile id | Profile name');
        for (const profile of profiles) {
            console.log(`${profile.id} | ${profile.name}`);
        }
    }
});
const getPaths = (config) => __awaiter(this, void 0, void 0, function* () {
    const sonarrApi = new sonarrapi_1.default(config);
    const res = yield sonarrApi.getPaths();
    const paths = yield res.json();
    console.log(JSON.stringify(paths, null, 2));
});
const loadConfig = (args) => __awaiter(this, void 0, void 0, function* () {
    const configPath = args.config || args.c;
    if (!configPath) {
        console.log(`Config has not been specified`);
        process.exit(1);
    }
    const fileContent = fs.readFileSync(configPath, 'utf8');
    if (!fileContent) {
        console.log(`Can not file any config located at ${configPath}`);
        process.exit(1);
    }
    const result = JSON.parse(fileContent);
    result.sonarrUrl = stripTrailingSlashes(result.sonarrUrl);
    if (args.profiles) {
        yield getProfiles(result);
        process.exit(0);
    }
    if (args.paths) {
        yield getPaths(result);
        process.exit(0);
    }
    if (!isConfigValid(result)) {
        console.log(`Config is not valid`);
        process.exit(1);
    }
    return result;
});
exports.loadConfig = loadConfig;
