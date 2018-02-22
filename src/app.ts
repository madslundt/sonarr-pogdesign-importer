import { IConfig, IScraper } from './interfaces/config';
import PogDesign from './scrapers/pogdesign';
import { IItem } from './interfaces/scraper';
import { ISeries } from './interfaces/sonarr';
import SonarrApi from './sonarrapi';
import * as moment from 'moment';
import Trakt from './scrapers/trakt';

class App {
    private readonly config: IConfig;
    private readonly sonarrApi: SonarrApi;

    constructor(config: IConfig) {
        this.config = config;
        this.sonarrApi = new SonarrApi(config);
    }

    private async scrape() {
        let result: IItem[] = [];

        for (const scraper of this.config.scrapers) {
            try {
                console.log(`${scraper.type} started`);
                console.log();
                const items = await this.getItems(scraper);
                if (items && items.length) {
                    result = result.concat(items);
                }
                console.log();
                console.log(`${scraper.type} finished successfully with ${items.length} item(s)`);
            } catch (exception) {
                console.log(`Skipping... ${exception}`);
            }
            console.log();
            console.log();
        }

        return result;
    }

    private async getItems(scraper: IScraper) {
        switch (scraper.type.toLocaleLowerCase()) {
            case 'trakt':
                const trakt = new Trakt(scraper, this.config.verbose);
                return trakt.process();
            case 'pogdesign':
                const pogdesign = new PogDesign(scraper, this.config.verbose);
                return pogdesign.process();
            default:
                throw `'${scraper.type}' is not a valid type`;
        }
    }

    private async lookupItems(items: IItem[]) {
        let result: ISeries[] = [];

        for (const item of items) {
            const res = await this.sonarrApi.lookupSeries(item.title);
            if (!res.ok) {
                console.log(`Sonarr responded with ${res.status}: ${await res.text()}`);
                continue;
            }

            const series: ISeries[] = await res.json();

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
    }

    async process() {
        if (this.config.verbose) { console.log('Scraping started'); }
        const scrapeItems = await this.scrape();

        if (this.config.verbose) { console.log(`Got ${scrapeItems.length} series from scraping`); }
        let items = await this.lookupItems(scrapeItems);

        if (this.config.verbose) { console.log(`${items.length}/${scrapeItems} series were found in Sonarr.`); }
        if (this.config.genresIgnored && this.config.genresIgnored.length) {
            if (this.config.verbose) { console.log(); }
            items = this.filterCategories(items);
        }

        if (this.config.verbose) { console.log(); }
        await this.addSeries(items);

    }

    private async addSeries(items: ISeries[]) {
        console.log(`${items.length} series ready to be imported to Sonarr:`);
        let alreadyAdded: number = 0;
        let notAdded: number = 0;
        for (const item of items) {
            if (!this.config.test) {
                const res = await this.sonarrApi.addSeries(item);
                if (!res.ok) {
                    if (res.status === 400) {
                        alreadyAdded++;
                    } else {
                        notAdded++;
                    }
                    if (this.config.verbose || res.status !== 400) {
                        console.log(`Sonarr responded with ${res.status}: ${await res.text()}`);
                    }
                    continue;
                }

                const json = await res.json();

                if (this.config.verbose) {
                    console.log(JSON.stringify(json, null, 2));
                }
            }

            console.log(`\t${item.title}`);
        }

        if (alreadyAdded) { console.log(`${alreadyAdded} series was already added`); }
        if (notAdded) { console.log(`${notAdded} series failed to be added`); }
    }

    private filterCategories(items: ISeries[]) {
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

export default App;