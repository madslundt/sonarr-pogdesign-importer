import { ITraktConfig, IPogDesignConfig, ScraperType } from "./scraper";

export interface IConfig {
    genresIgnored: string[],
    networksExactIgnored: string[],
    networksContainIgnored: string[],
    sonarr: {
        url: string,
        apiKey: string,
        profileId: number,
        path: string,
        useSeasonFolder: boolean,
    }

    scrapers: IScraper[],

    verbose?: boolean,
    test?: boolean
}

export interface IScraper extends ITraktConfig, IPogDesignConfig {
    type: ScraperType,
}