export interface IIds {
    trakt: number;
    slug: string;
    tvdb: number;
    imdb: string;
    tmdb?: number;
    tvrage?: number;
}

export interface IShow {
    title: string;
    year: number;
    ids: IIds;
}

export interface ITraktShow {
    list_count: number;
    show: IShow;
}
