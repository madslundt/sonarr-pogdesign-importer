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
const pogdesign_1 = require("./scrapers/pogdesign");
const sonarrapi_1 = require("./sonarrapi");
const moment = require("moment");
const trakt_1 = require("./scrapers/trakt");
class App {
    constructor(config) {
        this.config = config;
        this.sonarrApi = new sonarrapi_1.default(config);
    }
    scrape() {
        return __awaiter(this, void 0, void 0, function* () {
            let result = [];
            for (const scraper of this.config.scrapers) {
                try {
                    console.log(`${scraper.type} started`);
                    console.log();
                    const items = yield this.getItems(scraper);
                    if (items && items.length) {
                        result = result.concat(items);
                    }
                    console.log();
                    console.log(`${scraper.type} finished successfully with ${items.length} item(s)`);
                }
                catch (exception) {
                    console.log(`Skipping... ${exception}`);
                }
                console.log();
                console.log();
            }
            return result;
        });
    }
    getItems(scraper) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (scraper.type.toLocaleLowerCase()) {
                case 'trakt':
                    const trakt = new trakt_1.default(scraper, this.config.verbose);
                    return trakt.process();
                case 'pogdesign':
                    const pogdesign = new pogdesign_1.default(scraper, this.config.verbose);
                    return pogdesign.process();
                default:
                    throw `'${scraper.type}' is not a valid type`;
            }
        });
    }
    lookupItems(items) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = [];
            for (const item of items) {
                const res = yield this.sonarrApi.lookupSeries(item.title);
                if (!res.ok) {
                    console.log(`Sonarr responded with ${res.status}: ${yield res.text()}`);
                    continue;
                }
                const series = yield res.json();
                const thisYear = parseInt(moment().format('YYYY'));
                for (const serie of series) {
                    if ((item.tvdbid === serie.tvdbId) || (!item.tvdbid && serie.year >= thisYear)) {
                        serie.profileId = this.config.sonarr.profileId;
                        serie.rootFolderPath = this.config.sonarr.path;
                        serie.seasonFolder = this.config.sonarr.useSeasonFolder;
                        result.push(serie);
                    }
                }
            }
            return result;
        });
    }
    process() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.config.verbose) {
                console.log('Scraping started');
            }
            const scrapeItems = yield this.scrape();
            if (this.config.verbose) {
                console.log(`Got ${scrapeItems.length} series from scraping`);
            }
            let items = yield this.lookupItems(scrapeItems);
            if (this.config.verbose) {
                console.log(`${items.length}/${scrapeItems} series were found in Sonarr.`);
            }
            if (this.config.genresIgnored && this.config.genresIgnored.length) {
                if (this.config.verbose) {
                    console.log();
                }
                items = this.filterCategories(items);
            }
            if (this.config.verbose) {
                console.log();
            }
            yield this.addSeries(items);
        });
    }
    addSeries(items) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`${items.length} series ready to be imported to Sonarr:`);
            let alreadyAdded = 0;
            let notAdded = 0;
            for (const item of items) {
                if (!this.config.test) {
                    const res = yield this.sonarrApi.addSeries(item);
                    if (!res.ok) {
                        if (res.status === 400) {
                            alreadyAdded++;
                        }
                        else {
                            notAdded++;
                        }
                        if (this.config.verbose || res.status !== 400) {
                            console.log(`Sonarr responded with ${res.status}: ${yield res.text()}`);
                        }
                        continue;
                    }
                    const json = yield res.json();
                    if (this.config.verbose) {
                        console.log(JSON.stringify(json, null, 2));
                    }
                }
                console.log(`\t${item.title}`);
            }
            if (alreadyAdded) {
                console.log(`${alreadyAdded} series was already added`);
            }
            if (notAdded) {
                console.log(`${notAdded} series failed to be added`);
            }
        });
    }
    filterCategories(items) {
        const genres = this.config.genresIgnored.map(genre => genre.toLocaleLowerCase());
        const result = items.filter(item => {
            const itemGenres = item.genres.map(genre => genre.toLocaleLowerCase());
            const isOk = !genres.filter(genre => {
                return itemGenres.indexOf(genre) !== -1;
            }).length;
            if (!isOk && this.config.verbose) {
                console.log(`${item.title} skipped because the genres do not match.`);
            }
            return isOk;
        });
        console.log();
        if (this.config.verbose) {
            console.log(`${items.length - result.length} series were skipped.`);
        }
        return result;
    }
}
exports.default = App;
