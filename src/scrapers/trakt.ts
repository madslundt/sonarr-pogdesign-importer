import fetch from 'node-fetch';
import { ITraktConfig, IScraper, IItem } from '../interfaces/scraper';
import { ITraktShow } from '../interfaces/trakt';


class Trakt implements IScraper {
    private readonly config: ITraktConfig;
    private readonly verbose: boolean;

    private readonly URL: string = 'https://api.trakt.tv/shows/';
    private readonly URL_ALL: string = 'https://api.trakt.tv/calendars/all/shows/';
    private readonly MAX_RATING: number = 100;
    private readonly VERSION: string = '2';
    private readonly DEFAULT_TO_YEAR_OFFSET: number = 10;
    private readonly PAGE_LIMIT: number = 100;
    private readonly VALID_STATUSES: string[] = ["returning series", "in production", "planned", "canceled", "ended"];


    constructor(config: ITraktConfig, verbose: boolean = false) {
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

    private validateConfig(config: ITraktConfig) {
        if (!config.apiKey.length) { throw 'apiKey needs to be specified'; }
        if (!config.listName.length) { throw 'listName needs to be specified'; }

        if (this.config.listName.toLocaleLowerCase() !== 'new') {
            if (config.fromYear && config.toYear && config.toYear < config.fromYear) {
                throw 'toYear must be greater or equal to fromYear';
            }

            if (config.minimumRating < 0 || config.minimumRating > 100) {
                throw 'minimumRating must be between 0 and 100';
            }

            if (config.statuses && config.statuses.some(status => this.VALID_STATUSES.indexOf(status) == -1)) {
                throw `status must be an array of one or more of these [${this.VALID_STATUSES.join(', ')}`;
            }
        }
    }

    private getItems(shows: ITraktShow[]) {
        const result = shows.map(show => {
            if (this.verbose) {
                console.log(`Checking ${show.title || show.show.title} (${show.year || show.show.year})`);
            }
            return <IItem>{
                title: show.title || show.show.title,
                year: show.year || show.show.year,
                tvdbId: show.ids ? show.ids.tvdb : show.show.ids.tvdb
            };
        });

        return result;
    }

    async process() {
        const res = await this.getTitles()
        if (!res.ok) {
            console.log(`Could not connect to Trakt API. Got ${res.status} ${await res.text()}`);
        }

        const json: ITraktShow[] = await res.json();

        const result: IItem[] = this.getItems(json);

        return result;
    }

    private getTitles() {
        let url: string = "";
        let extra: string = "";

        if (this.config.listName.toLocaleLowerCase() === 'new') {
            url = `${this.URL_ALL}new`;
        } else {
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

            if (this.config.statuses && this.config.statuses.length > 0) {
                path += "&status=" + this.config.statuses.join();
                extra += `, status in [${this.config.statuses.join(", ")}]`;
            }

            url = `${this.URL}${this.config.listName.toLocaleLowerCase()}${path}&limit=${this.PAGE_LIMIT}`;
        }

        if (this.verbose) {
            console.log(`Fetching Trakt url ${url}`);
            console.log(`Fetching Trakt list ${this.config.listName} ${extra}`);
        }


        return fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'trakt-api-version': this.VERSION,
                'trakt-api-key': this.config.apiKey
            }
        });
    }
}

export default Trakt;
