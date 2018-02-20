export interface IConfig {
    monthsForward: number,
    sonarrApi: string,
    sonarrUrl: string,
    genresIgnored: string[],
    minimumStars: number,
    verbose?: boolean
}