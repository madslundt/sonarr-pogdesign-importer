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
const node_fetch_1 = require("node-fetch");
class Trakt {
    constructor(config, verbose = false) {
        this.URL = 'https://api.trakt.tv/shows/';
        this.MAX_RATING = 100;
        this.VERSION = '2';
        this.DEFAULT_TO_YEAR_OFFSET = 10;
        this.PAGE_LIMIT = 100;
        this.config = config;
        this.verbose = verbose;
        if (!this.config.fromYear) {
            this.config.fromYear = new Date().getFullYear();
        }
        if (!this.config.toYear) {
            this.config.toYear = this.config.fromYear + this.DEFAULT_TO_YEAR_OFFSET;
        }
        this.validateConfig(this.config);
    }
    validateConfig(config) {
        if (!config.apiKey.length) {
            throw 'apiKey needs to be specified';
        }
        if (!config.listName.length) {
            throw 'listName needs to be specified';
        }
        if (config.fromYear && config.toYear && config.toYear < config.fromYear) {
            throw 'toYear must be greater or equal to fromYear';
        }
        if (config.minimumRating < 0 || config.minimumRating > 100) {
            throw 'minimumRating must be between 0 and 100';
        }
    }
    getItems(shows) {
        const result = shows.map(show => {
            return {
                title: show.show.title,
                year: show.show.year,
                tvdbid: show.show.ids.tvdb
            };
        });
        return result;
    }
    process() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.getTitles();
            if (!res.ok) {
                console.log(`Could not connect to Trakt API. Got ${res.status} ${yield res.text()}`);
            }
            const json = yield res.json();
            const result = this.getItems(json);
            return result;
        });
    }
    getTitles() {
        const years = `${this.config.fromYear}-${this.config.toYear}`;
        const ratings = `${this.config.minimumRating}-${this.MAX_RATING}`;
        const url = `${this.URL}${this.config.listName.toLocaleLowerCase()}?years=${years}&ratings=${ratings}&limit=${this.PAGE_LIMIT}`;
        if (this.verbose) {
            console.log(`Fetching Trakt between ${years} and ratings between ${ratings}`);
        }
        return node_fetch_1.default(url, {
            headers: {
                'Content-Type': 'application/json',
                'trakt-api-version': this.VERSION,
                'trakt-api-key': this.config.apiKey
            }
        });
    }
}
exports.default = Trakt;
