import * as fs from 'fs';
import { IConfig } from './interfaces/config';
import SonarrApi from './sonarrapi';
import { IProfile } from './interfaces/sonarr';

const stripTrailingSlashes = (url: string) => {
    return url.endsWith('/') ? url.slice(0, -1) : url;
}

const isConfigValid = (config: IConfig) => {
    return config.sonarrUrl.length &&
           config.sonarrApi.length &&
           config.monthsForward >= 0 &&
           config.minimumStars >= 0 &&
           config.sonarrProfileId > 0 &&
           config.sonarrPath.length;
}

const getProfiles = async (config: IConfig) => {
    const sonarrApi = new SonarrApi(config);
    const res = await sonarrApi.getProfiles();
    const profiles: IProfile[] = await res.json();

    if (config.verbose) {
        console.log(JSON.stringify(profiles, null, 2));
    } else {
        console.log('Profile id | Profile name')
        for (const profile of profiles) {
            console.log(`${profile.id} | ${profile.name}`);
        }
    }
}

const getPaths = async (config: IConfig) => {
    const sonarrApi = new SonarrApi(config);
    const res = await sonarrApi.getPaths();
    const paths: IProfile[] = await res.json();

    console.log(JSON.stringify(paths, null, 2));
}

const loadConfig = async (args: {[key: string]: string}) => {
    const configPath = args.config || args.c;

    if (!configPath) {
        console.log(`Config has not been specified`);
        process.exit(1);
    }

    const fileContent = fs.readFileSync(configPath, 'utf8');

    if (!fileContent) {
        console.log(`Can not file any config located at ${configPath}`);
        process.exit(1);
    }

    const result: IConfig = JSON.parse(fileContent);

    result.sonarrUrl = stripTrailingSlashes(result.sonarrUrl);

    if (args.profiles) {
        await getProfiles(result);
        process.exit(0);
    }

    if (args.paths) {
        await getPaths(result);
        process.exit(0);
    }

    if (!isConfigValid(result)) {
        console.log(`Config is not valid`);
        process.exit(1);
    }

    return result;
}

export {
    loadConfig,
};