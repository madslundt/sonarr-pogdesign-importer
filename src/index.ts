import * as minimist from 'minimist';
import { loadConfig } from './utils';
import App from './app';


const init = async () => {
    const args = minimist(process.argv.slice(2));
    const config = await loadConfig(args);
    if (!config) {
        process.exit(1);
    } else {
        const app = new App(config);
        app.process();
    }
}

init();