import { IConfig } from './interfaces/config';
import { ISeries } from 'interfaces/sonarr';
import fetch from 'node-fetch';


class SonarrApi {
    private readonly apiKey: string;
    private readonly url: string;
    constructor(config: IConfig) {
        this.url = config.sonarrUrl;
        this.apiKey = config.sonarrApi;
    }

    lookupSeries(term: string) {
        const url: string = `${this.url}/api/series/lookup?term=${term}`;

        return fetch(url, {
            headers: {
                'X-Api-Key': this.apiKey
            }
        });
    }

    addSeries(series: ISeries) {
        const url: string = `${this.url}/api/series`;

        return fetch(url, {
            headers: {
                'X-Api-Key': this.apiKey
            },
            method: 'POST',
            body: JSON.stringify(series)
        });
    }

    getProfiles() {
        const url: string = `${this.url}/api/profile`;

        return fetch(url, {
            headers: {
                'X-Api-Key': this.apiKey
            }
        });
    }

    getPaths() {
        const url: string = `${this.url}/api/rootfolder`;

        return fetch(url, {
            headers: {
                'X-Api-Key': this.apiKey
            }
        });
    }
}

export default SonarrApi;