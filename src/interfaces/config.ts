export interface IConfig {
    monthsForward: number,
    sonarrApi: string,
    sonarrUrl: string,
    sonarrProfileId: number,
    sonarrPath: string,
    genresIgnored: string[],
    minimumStars: number,
    verbose?: boolean
}