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
        this.URL_ALL = 'https://api.trakt.tv/calendars/all/shows/';
        this.MAX_RATING = 100;
        this.VERSION = '2';
        this.DEFAULT_TO_YEAR_OFFSET = 10;
        this.PAGE_LIMIT = 100;
        this.VALID_STATUS = ["returning series", "in production", "planned", "canceled", "ended"];
        this.config = config;
        this.verbose = verbose;
        if (!this.config.fromYear) {
            this.config.fromYear = new Date().getFullYear();
        }
        if (!this.config.toYear) {
            this.config.toYear = new Date().getFullYear() + this.DEFAULT_TO_YEAR_OFFSET;
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
        if (this.config.listName.toLocaleLowerCase() !== 'new') {
            if (config.fromYear && config.toYear && config.toYear < config.fromYear) {
                throw 'toYear must be greater or equal to fromYear';
            }
            if (config.minimumRating < 0 || config.minimumRating > 100) {
                throw 'minimumRating must be between 0 and 100';
            }
            if (config.status && config.status.some(status => this.VALID_STATUS.indexOf(status) == -1)) {
                throw `status must be an array of one or more of these [${this.VALID_STATUS.join(', ')}`;
            }
        }
    }
    getItems(shows) {
        const result = shows.map(show => {
            if (this.verbose) {
                console.log(`Checking ${show.title || show.show.title} (${show.year || show.show.year})`);
            }
            return {
                title: show.title || show.show.title,
                year: show.year || show.show.year,
                tvdbId: show.ids ? show.ids.tvdb : show.show.ids.tvdb
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
        let url = "";
        let extra = "";
        if (this.config.listName.toLocaleLowerCase() === 'new') {
            url = `${this.URL_ALL}new`;
        }
        else {
            let years = `${this.config.fromYear}-${this.config.toYear}`;
            let ratings = `${this.config.minimumRating}-${this.MAX_RATING}`;
            extra = `between ${years}, ratings between ${ratings}`;
            let path = `?years=${years}&ratings=${ratings}`;
            if (this.config.countries && this.config.countries.length > 0) {
                path += "&countries=" + this.config.countries.join();
                extra += `, countries in [${this.config.countries.join(", ")}]`;
            }
            if (this.config.languages && this.config.languages.length > 0) {
                path += "&languages=" + this.config.languages.join();
                extra += `, languages in [${this.config.languages.join(", ")}]`;
            }
            if (this.config.networks && this.config.networks.length > 0) {
                path += "&networks=" + this.config.networks.join();
                extra += `, networks in [${this.config.networks.join(", ")}]`;
            }
            if (this.config.status && this.config.status.length > 0) {
                path += "&status=" + this.config.status.join();
                extra += `, status in [${this.config.status.join(", ")}]`;
            }
            url = `${this.URL}${this.config.listName.toLocaleLowerCase()}${path}&limit=${this.PAGE_LIMIT}`;
        }
        if (this.verbose) {
            console.log(`Fetching Trakt url ${url}`);
            console.log(`Fetching Trakt list ${this.config.listName} ${extra}`);
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
