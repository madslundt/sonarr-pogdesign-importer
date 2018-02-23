import * as moment from 'moment';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { IPogDesignConfig, IItem } from 'interfaces/scraper';
import { IScraper } from '../interfaces/scraper';


class PogDesign implements IScraper {
    private readonly config: IPogDesignConfig;
    private readonly verbose: boolean;

    private readonly DATE_STRING: string = 'MMMM-YYYY';
    private readonly URL: string = 'https://www.pogdesign.co.uk';
    private readonly SELECTOR: string = '#data>.pgwidth';
    private readonly SHOW_CLASS: string = 'contbox prembox removed';
    private readonly TITLE_SELECTOR: string = 'h2';
    private readonly SELECTED_SELECTOR: string = '.hil.selby';
    private readonly SELECTED_REGEX: RegExp = /.+?(\d+).+/g;

    constructor(config: IPogDesignConfig, verbose: boolean = false) {
        this.config = config;
        this.verbose = verbose;

        this.validateConfig(config);
    }

    private validateConfig(config: IPogDesignConfig) {
        if (config.minimumStars < 0) { throw 'minimumStars has to be greater or equal to 0'; }
        if (config.monthsForward < 0) { throw 'monthsforward has to be greater or equal to 0'; }
    }

    private extractSelectedCount(text: string): number {
        let count = 3;
        while (count--) {
            let selected = this.SELECTED_REGEX.exec(text);
            if (selected && selected.length) {
                return parseInt(selected[1]);
            }
        }

        return -1;
    }

    private async getItem(child: Cheerio): Promise<IItem | null> {
        const title = child.find(this.TITLE_SELECTOR).text();
        const selectedText = child.find(this.SELECTED_SELECTOR).text();

        const selectedCount = this.extractSelectedCount(selectedText);

        if (selectedCount > this.config.minimumStars) {
            const result = <IItem> {
                title: title
            }
            return result;
        }

        return null;
    }

    private async getItems(html: string) {
        let result: IItem[] = [];

        if (!html || !html.length) {
            return result;
        }

        const $ = cheerio.load(html);

        const children = $(this.SELECTOR).children();

        for (let i = 0; i < children.length; i++) {
            let child = $(children.get(i));

            if (child.hasClass(this.SHOW_CLASS)) {
                const item = await this.getItem(child);
                if (item) {
                    result.push(item);
                }
            } else if (result.length) {
                break;
            }
        }

        return result;
    }

    private async scrapeUrl(url: string) {
        const res = await fetch(url);

        if (!res.ok) {
            console.log(`Error scraping url: ${url}`);
        }

        const text = await res.text();
        const items = await this.getItems(text);

        if (this.verbose && items.length) {
            console.log(`Found ${items.length} series.\n`);
        }

        return items;
    }

    async process() {
        let date = new Date();

        let result: IItem[] = [];

        for (let i = 0; i <= this.config.monthsForward; i++) {
            const url = this.getUrl(date);

            const items = await this.scrapeUrl(url);
            result = result.concat(items);

            date.setMonth(date.getMonth() + 1);
        }

        return result;
    }

    private getUrl(date: Date) {
        const dateFormat = this.getDateFormat(date);
        const result = `${this.URL}/cat/TV-shows-starting-${dateFormat}`;

        if (this.verbose) {
            console.log(`Fetching PogDesign for ${dateFormat}`);
        }

        return result;
    }

    private getDateFormat(date: Date): string {
        const result = moment(date).format(this.DATE_STRING);

        return result;
    }
}

export default PogDesign;