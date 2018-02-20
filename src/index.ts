import * as minimist from 'minimist';
import { loadConfig } from './utils';
import App from './app';
import { IConfig } from './interfaces/config';


const init = async () => {
    const args = minimist(process.argv.slice(2));
    const config: IConfig = await loadConfig(args);
    if (!config) {
        process.exit(1);
    } else {
        const app = new App(config);
        app.process();
    }
}

init();