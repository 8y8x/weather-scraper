import { promises as fs } from 'fs';

import getWeather from './getWeather';
import saveWeather from './saveWeather';

console.log('OK');

async function checkStorage() {
    return new Promise(async r => {
        try {
            await fs.readdir('./storage');
        } catch(err) {
            await fs.mkdir('./storage');
        }

        try {
            await fs.access('./storage/temperatures.json');
        } catch(err) {
            await fs.writeFile('./storage/temperatures.json', '[]');
        }
    });
}

async function main() {
    return new Promise(async r => {
        console.log('Getting the weather...');

        let temp: number;
        try {
            temp = await getWeather();
        } catch(err) {
            return console.warn('An error occured while getting the weather:\n' + err);
        }

        console.log('Saving the weather...');

        try {
            await saveWeather(temp);
        } catch(err) {
            return console.warn('An error occured while saving the weather:\n' + err);
        }

        console.log('Saved! @ ' + new Date());
    });
}

checkStorage().then(main);
setInterval(main, 1e3 * 60 * 60); // Call every hour

require('./httpServer');
