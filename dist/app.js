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
class App {
    constructor(config) {
        this.config = config;
        this.sonarrApi = new sonarrapi_1.default(config);
    }
    scrape() {
        return __awaiter(this, void 0, void 0, function* () {
            const start = new Date();
            let end = new Date();
            end.setMonth(start.getMonth() + this.config.monthsForward);
            const pogDesign = new pogdesign_1.default(this.config);
            const items = yield pogDesign.process(start, end);
            return items;
        });
    }
    lookupItems(items) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = [];
            for (const item of items) {
                const res = yield this.sonarrApi.lookupSeries(item.title);
                const series = yield res.json();
                const thisYear = parseInt(moment().format('YYYY'));
                for (const serie of series) {
                    if (serie.year >= thisYear) {
                        serie.stars = item.stars;
                        serie.profileId = this.config.sonarrProfileId;
                        serie.rootFolderPath = this.config.sonarrPath;
                        serie.seasonFolder = this.config.sonarrUseSeasonFolder;
                        result.push(serie);
                    }
                }
            }
            return result;
        });
    }
    process() {
        return __awaiter(this, void 0, void 0, function* () {
            const scrapeItems = yield this.scrape();
            if (this.config.verbose) {
                console.log();
            }
            let items = yield this.lookupItems(scrapeItems);
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
            for (const item of items) {
                if (!!this.config.test) {
                    yield this.sonarrApi.addSeries(item);
                }
                console.log(`Added ${item.title} with ${item.stars} stars to Sonarr`);
            }
        });
    }
    filterCategories(items) {
        const genres = this.config.genresIgnored.map(genre => genre.toLocaleLowerCase());
        return items.filter(item => {
            const itemGenres = item.genres.map(genre => genre.toLocaleLowerCase());
            const isOk = !genres.filter(genre => {
                return itemGenres.indexOf(genre) !== -1;
            }).length;
            if (!isOk && this.config.verbose) {
                console.log(`${item.title} skipped because the genres do not match.`);
            }
            return isOk;
        });
    }
}
exports.default = App;
