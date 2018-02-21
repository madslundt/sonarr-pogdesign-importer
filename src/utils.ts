import * as fs from 'fs';
import { IConfig } from './interfaces/config';
import SonarrApi from './sonarrapi';
import { IProfile } from './interfaces/sonarr';

const stripTrailingSlashes = (url: string) => {
    return url.endsWith('/') ? url.slice(0, -1) : url;
}

const isConfigValid = (config: IConfig) => {
    if (!config.sonarrUrl.length)                   { console.log('sonarrUrl has to be defined'); return false; }
    if (!config.sonarrApi.length)                   { console.log('sonarrApi has to be defined'); return false; }
    if (!config.sonarrPath.length)                  { console.log('sonarrPath has to be defined'); return false; }
    if (!config.genresIgnored)                      { console.log('genresIgnored has to be defined'); return false; }
    if (config.monthsForward < 0)                   { console.log('monthsForwards has to be greater or equal to 0'); return false; }
    if (config.minimumStars < 0)                    { console.log('minimumStars has to be greater or equal to 0'); return false; }
    if (config.sonarrProfileId <= 0)                { console.log('sonarrProfileId has to be greater or equal to 1'); return false; }
    if (!config.sonarrPath.endsWith('/'))           { console.log('sonarrPath has to end with \'/\''); return false; }
    if (config.sonarrUseSeasonFolder === undefined) { console.log('sonarrUseSeasonFolder has to be defined'); return false; }

    return true;
}

const getProfiles = async (config: IConfig) => {
    const sonarrApi = new SonarrApi(config);
    const res = await sonarrApi.getProfiles();
    if (!res.ok) {
        console.log(`Sonarr responded with ${res.status}: ${await res.text()}`);
        return;
    }

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
    if (!res.ok) {
        console.log(`Sonarr responded with ${res.status}: ${await res.text()}`);
        return;
    }

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