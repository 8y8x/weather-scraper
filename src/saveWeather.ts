import { promises as fs } from 'fs';

import WeatherSaveData from './WeatherSaveData';
import getDayFromTimestamp from './getDayFromTimestamp';

export default (temp: number): Promise<any> => new Promise(async (resolve, reject) => {
    let data: WeatherSaveData[];

    try {
        data = JSON.parse((await fs.readFile('./storage/temperatures.json')).toString());
    } catch(err) {
        return reject(err);
    }

    let now: number = getDayFromTimestamp(Date.now()),
        last: number = data.length - 1;
    if (last >= 0 && data[last].day == now) {
        ++data[last].records;
        if (data[last].temperature < temp) {
            data[last].temperature = temp;
        }
    } else {
        data.push({
            day: now,
            records: 1,
            temperature: temp
        });
    }

    try {
        await fs.writeFile('./storage/temperatures.json', JSON.stringify(data));
    } catch(err) {
        return reject(err);
    }

    resolve();
});