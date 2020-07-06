import getWeather from './getWeather';
import saveWeather from './saveWeather';

console.log('OK');

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

main();
setInterval(main, 1e3 * 60 * 60); // Call every hour

require('./httpServer');
