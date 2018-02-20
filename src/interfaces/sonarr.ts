export interface IImage {
    coverType: string;
    url: string;
}

export interface ISeason {
    seasonNumber: number;
    monitored: boolean;
}

export interface IRatings {
    votes: number;
    value: number;
}

export interface ISeries {
    title: string;
    sortTitle: string;
    seasonCount: number;
    status: string;
    overview: string;
    network: string;
    airTime: string;
    images: IImage[];
    remotePoster: string;
    seasons: ISeason[];
    year: number;
    profileId: number;
    seasonFolder: boolean;
    monitored: boolean;
    useSceneNumbering: boolean;
    runtime: number;
    tvdbId: number;
    tvRageId: number;
    tvMazeId: number;
    firstAired: Date;
    seriesType: string;
    cleanTitle: string;
    titleSlug: string;
    certification: string;
    genres: string[];
    tags: any[];
    added: Date;
    ratings: IRatings;
    qualityProfileId: number;
}