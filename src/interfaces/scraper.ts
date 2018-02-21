export interface IScraper {
    process: () => Promise<IItem[]>
}

export type ScraperType = 'trakt' | 'pogdesign';

export interface ITraktConfig {
    apiKey: string,
    listName: string,
    minimumRating: number,
    fromYear?: number,
    toYear?: number,
}

export interface IPogDesignConfig {
    monthsForward: number,
    minimumStars: number,
}

export interface IItem {
    title: string,
    tvdbid?: number,
    year?: number
}