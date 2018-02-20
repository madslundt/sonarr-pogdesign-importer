import { IConfig } from './interfaces/config';
import PogDesign from './scrapers/pogdesign';
import { IItem } from './interfaces/scraper';
// import SonarrApi from 'sonarrapi';

class App {
    private config: IConfig;

    constructor(config: IConfig) {
        this.config = config;
    }

    async process() {
        const start = new Date();
        let end   = new Date();
        end.setMonth(start.getMonth() + this.config.monthsForward);

        const pogDesign = new PogDesign(this.config);
        let items = await pogDesign.process(start, end);

        // const sonarrApi = new SonarrApi(this.config);
        console.log();
        if (this.config.genresIgnored && this.config.genresIgnored.length) {
            items = this.filterCategories(items);
        }

        for (const item of items) {
            console.log(`Added ${item.title} with ${item.stars} stars to Sonarr`);
            // sonarrApi.addSeries(item.sonarrInfo);
        }
    }

    private filterCategories(items: IItem[]) {
        const genres = this.config.genresIgnored.map(genre => genre.toLocaleLowerCase());

        return items.filter(item => {
            const itemGenres = item.sonarrInfo.genres.map(genre => genre.toLocaleLowerCase());
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