import * as fs from 'fs';
import { IConfig } from './interfaces/config';

const stripTrailingSlashes = (url: string) => {
    return url.endsWith('/') ? url.slice(0, -1) : url;
}

const isConfigValid = (config: IConfig) => {
    return config.sonarrUrl.length || config.sonarrApi.length || config.monthsForward >= 0 || config.minimumStars >= 0;
}

const loadConfig = (args: {[key: string]: string}): IConfig => {
    const configPath = args.config || args.c;

    if (!configPath) {
        throw `Config has not been specified`;
    }

    const fileContent = fs.readFileSync(configPath, 'utf8');

    if (!fileContent) {
        throw `Can not file any config located at ${configPath}`;
    }

    const result: IConfig = JSON.parse(fileContent);

    result.sonarrUrl = stripTrailingSlashes(result.sonarrUrl);

    if (!isConfigValid(result)) {
        throw `Config is not valid`;
    }

    return result;
}

export {
    loadConfig,
};