import { ISeries } from "./sonarr";

export interface IScraper {
    process: (fromDate: Date, toDate: Date) => Promise<IItem[]>
}

export interface IItem {
    title: string,
    // categories: string[],
    // status: Status,
    stars: number,
    sonarrInfo: ISeries
}