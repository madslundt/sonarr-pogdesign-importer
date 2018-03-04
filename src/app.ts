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
                const items = await this.getItems(scraper);
                if (items && items.length) {
                    result = result.concat(items);
                }
                console.log(`${scraper.type} finished successfully with ${items.length} series`);
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
        let alreadyExists: number = 0;

        for (const item of items) {
            if (result.some(r => r.tvdbId === item.tvdbId || r.title.toLocaleLowerCase() === item.title.toLocaleLowerCase())) {
                continue;
            }

            const res = await this.sonarrApi.lookupSeries(item.title);
            if (!res.ok) {
                console.log(`Sonarr responded with ${res.status}: ${await res.text()}`);
                continue;
            }

            const series: ISeries[] = await res.json();

            const thisYear = parseInt(moment().format('YYYY'));
            for (const serie of series) {
                if ((item.tvdbId === serie.tvdbId) || (!item.tvdbId && serie.year >= thisYear)) {
                    serie.profileId = this.config.sonarr.profileId;
                    serie.rootFolderPath = this.config.sonarr.path;
                    serie.seasonFolder = this.config.sonarr.useSeasonFolder;

                    if (!result.some(r => r.tvdbId === serie.tvdbId) && !serie.added) {
                        result.push(serie);
                    } else if (this.config.verbose && serie.added) {
                        alreadyExists++;
                    }
                    break;
                }
            }
        }

        if (this.config.verbose && !result.length) { console.log(`\nAll series already exists in Sonarr.`); }
        if (this.config.verbose && result.length) { console.log(`\n${alreadyExists} already exists in Sonarr.`); }

        return result;
    }

    async process() {
        if (this.config.verbose) { console.log('Scraping started'); }
        const scrapeItems = await this.scrape();

        let items = await this.lookupItems(scrapeItems);

        console.log();
        if (items.length > 0) {
            if (this.config.verbose) { console.log(`\n${items.length} new series are ready to be imported into Sonarr.`); }

            if (this.config.genresIgnored && this.config.genresIgnored.length) {
                if (this.config.verbose) { console.log(); }
                items = this.filterCategories(items);
            }

            if (this.config.verbose) { console.log(); }
            await this.addSeries(items);
        } else {
            console.log('Nothing new to add to Sonarr');
        }

    }

    private async addSeries(items: ISeries[]) {
        let notAdded: number = 0;

        for (const item of items) {
            console.log(`\t${item.title}`);

            if (!this.config.test) {
                const res = await this.sonarrApi.addSeries(item);
                if (!res.ok) {
                    notAdded++;
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
        }

        console.log();
        if (notAdded) { console.log(`${notAdded} series failed to be added`); }

        const totalImported = items.length - notAdded;

        if (totalImported) {
            console.log(`${totalImported} was successfully imported to Sonarr`);
        } else if (notAdded) {
            console.log('Something went wrong when adding. Please try again with verbose.')
        }
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
