export interface IConfig {
    monthsForward: number,
    sonarrApi: string,
    sonarrUrl: string,
    sonarrProfileId: number,
    sonarrPath: string,
    sonarrUseSeasonFolder: boolean,
    genresIgnored: string[],
    minimumStars: number,
    verbose?: boolean,
    test?: boolean
}