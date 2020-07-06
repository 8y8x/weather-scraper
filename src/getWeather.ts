import fetch, { Response } from 'node-fetch';
import { writeFileSync } from 'fs';
import WeatherData from './WeatherData';

export default async (): Promise<number> => new Promise(async (resolve, reject) => {
    let res: Response = await fetch('https://www.theweathernetwork.com/ca/api/maps/regional/9/50/-125/48/-122'),
        text: WeatherData[] = await res.json();

    for (let i = 0; i < text.length; ++i) {
        if (text[i].name == 'Vancouver') {
            resolve(text[i].temp_c);
        }
    }

    reject();
});