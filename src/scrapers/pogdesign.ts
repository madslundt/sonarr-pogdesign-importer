import { IScraper, IItem } from "../interfaces/scraper";
import { IConfig } from '../interfaces/config';
import * as moment from 'moment';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import SonarrApi from './../sonarrapi';
import { ISeries } from "../interfaces/sonarr";


class PogDesign implements IScraper {
    private readonly config: IConfig;
    private readonly sonarrApi: SonarrApi;

    private readonly DATE_STRING: string = 'MMMM-YYYY';
    private readonly URL: string = 'https://www.pogdesign.co.uk';
    private readonly SELECTOR: string = '#data>.pgwidth';
    private readonly SHOW_CLASS: string = 'contbox prembox removed';
    private readonly TITLE_SELECTOR: string = 'h2';
    private readonly SELECTED_SELECTOR: string = '.hil.selby';
    private readonly SELECTED_REGEX: RegExp = /.+?(\d+).+/g;

    constructor(config: IConfig) {
        this.config = config;
        this.sonarrApi = new SonarrApi(config);
    }

    private async getShowInfo(title: string): Promise<ISeries | null> {
        const res = await this.sonarrApi.lookupSeries(title);
        const info: ISeries[] = await res.json();

        const thisYear = parseInt(moment().format('YYYY'));
        for (const i of info) {
            if (i.year >= thisYear) {
                return i;
            }
        }

        return null;
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
            const info = await this.getShowInfo(title);
            if (info) {
                const result: IItem = {
                    title: title,
                    stars: selectedCount,
                    sonarrInfo: info
                };

                return result;
            } else {
                console.log(`Could not find ${title}`);
            }
        } else if (this.config.verbose) {
            console.log(`${title} skipped because it only has ${selectedCount} stars`);
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
        let items: IItem[] = [];
        const res = await fetch(url);
        const text = await res.text();
        items = await this.getItems(text);

        return items;
    }

    public async process(fromDate: Date, toDate: Date) {
        const months = toDate.getMonth() - fromDate.getMonth();

        let date = fromDate;
        let result: IItem[] = [];
        for (let i = 0; i < months; i++) {
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

        return result;
    }

    private getDateFormat(date: Date): string {
        const result = moment(date).format(this.DATE_STRING);

        return result;
    }
}

export default PogDesign;