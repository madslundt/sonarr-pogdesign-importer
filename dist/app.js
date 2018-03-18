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
                    const items = yield this.getItems(scraper);
                    if (items && items.length) {
                        result = result.concat(items);
                    }
                    console.log(`${scraper.type} finished successfully with ${items.length} series`);
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
                if (result.some(r => r.tvdbId === item.tvdbId || r.title.toLocaleLowerCase() === item.title.toLocaleLowerCase())) {
                    continue;
                }
                const res = yield this.sonarrApi.lookupSeries(item.title);
                if (!res.ok) {
                    console.log(`Sonarr responded with ${res.status}: ${yield res.text()}`);
                    continue;
                }
                const series = yield res.json();
                const thisYear = parseInt(moment().format('YYYY'));
                for (const serie of series) {
                    if ((item.tvdbId === serie.tvdbId) || (!item.tvdbId && serie.year >= thisYear)) {
                        if (!result.some(r => r.tvdbId === serie.tvdbId)) {
                            serie.profileId = this.config.sonarr.profileId;
                            serie.rootFolderPath = this.config.sonarr.path;
                            serie.seasonFolder = this.config.sonarr.useSeasonFolder;
                            result.push(serie);
                        }
                        break;
                    }
                }
            }
            return result;
        });
    }
    lookupLocal(series) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.sonarrApi.getSeries();
            if (!res.ok) {
                console.log(`Sonarr responded with ${res.status}: ${yield res.text()}`);
                return series;
            }
            const localSeries = yield res.json();
            const result = series.filter(item => !localSeries || !localSeries.length || !localSeries.some(local => local.tvdbId === item.tvdbId));
            return result;
        });
    }
    process() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.config.verbose) {
                console.log('Scraping started');
            }
            const scrapeItems = yield this.scrape();
            const scrapedItems = yield this.lookupItems(scrapeItems);
            console.log();
            if (scrapedItems.length > 0) {
                let items = yield this.lookupLocal(scrapedItems);
                if (this.config.verbose && scrapedItems.length > items.length) {
                    console.log(`${scrapedItems.length - items.length}/${scrapedItems.length} series already exists in Sonarr.`);
                }
                if (!items.length) {
                    console.log('\nNothing new to add to Sonarr');
                    process.exit(0);
                }
                else if (this.config.verbose) {
                    console.log(`${items.length} new series are ready to be imported into Sonarr.`);
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
            }
            else {
                console.log('\nNothing new to add to Sonarr');
            }
        });
    }
    addSeries(items) {
        return __awaiter(this, void 0, void 0, function* () {
            let notAdded = 0;
            for (const item of items) {
                console.log(`\t${item.title}`);
                if (!this.config.test) {
                    const res = yield this.sonarrApi.addSeries(item);
                    if (!res.ok) {
                        if (this.config.verbose || res.status !== 400) {
                            notAdded++;
                            console.log(`Sonarr responded with ${res.status}: ${yield res.text()}`);
                        }
                        continue;
                    }
                    const json = yield res.json();
                    if (this.config.verbose) {
                        console.log(JSON.stringify(json, null, 2));
                    }
                }
            }
            console.log();
            const totalImported = items.length - notAdded;
            if (totalImported) {
                console.log(`${totalImported} series were successfully imported to Sonarr`);
            }
            else if (notAdded) {
                console.log('Something went wrong when adding. Please try again with verbose.');
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
