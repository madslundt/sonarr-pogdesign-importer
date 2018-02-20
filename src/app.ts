import { IConfig } from './interfaces/config';
import PogDesign from './scrapers/pogdesign';
import { IItem } from './interfaces/scraper';
import { ISeries } from './interfaces/sonarr';
import SonarrApi from './sonarrapi';
import * as moment from 'moment';

class App {
    private readonly config: IConfig;
    private readonly sonarrApi: SonarrApi;

    constructor(config: IConfig) {
        this.config = config;
        this.sonarrApi = new SonarrApi(config);
    }

    private async scrape() {
        const start = new Date();
        let end   = new Date();
        end.setMonth(start.getMonth() + this.config.monthsForward);

        const pogDesign = new PogDesign(this.config);
        const items = await pogDesign.process(start, end);

        return items;
    }

    private async lookupItems(items: IItem[]) {
        let result: ISeries[] = [];

        for (const item of items) {
            const res = await this.sonarrApi.lookupSeries(item.title);
            const series: ISeries[] = await res.json();

            const thisYear = parseInt(moment().format('YYYY'));
            for (const serie of series) {
                if (serie.year >= thisYear) {
                    serie.stars = item.stars;
                    serie.profileId = this.config.sonarrProfileId;
                    serie.rootFolderPath = this.config.sonarrPath;
                    result.push(serie);
                }
            }
        }

        return result;
    }

    async process() {
        const scrapeItems = await this.scrape();

        if (this.config.verbose) { console.log(); }
        const items = await this.lookupItems(scrapeItems);

        if (this.config.verbose) { console.log(); }
        await this.addSeries(items);

    }

    private async addSeries(items: ISeries[]) {
        if (this.config.genresIgnored && this.config.genresIgnored.length) {
            items = this.filterCategories(items);
        }

        for (const item of items) {
            await this.sonarrApi.addSeries(item);
            console.log(`Added ${item.title} with ${item.stars} stars to Sonarr`);
        }
    }

    private filterCategories(items: ISeries[]) {
        const genres = this.config.genresIgnored.map(genre => genre.toLocaleLowerCase());

        return items.filter(item => {
            const itemGenres = item.genres.map(genre => genre.toLocaleLowerCase());
            const isOk = !genres.filter(genre => {
                return itemGenres.indexOf(genre) !== -1;
            });

            if (!isOk && this.config.verbose) {
                console.log(`${item.title} is removed from the list because the genres do not match.`);
            }
            return isOk;
        });
    }
}

export default App;