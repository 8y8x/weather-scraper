import { IncomingMessage, request } from 'http';
import WeatherData from './WeatherData';

export default async (): Promise<number> => new Promise(async (resolve, reject) => {
    let res: IncomingMessage = await new Promise(r => request({
            host: 'https://www.theweathernetwork.ca',
            path: '/ca/api/maps/regional/9/50/-125/48/-122'
        }, r)),
        text: WeatherData[] = await res.read();

    for (let i = 0; i < text.length; ++i) {
        if (text[i].name == 'Vancouver') {
            resolve(text[i].temp_c);
        }
    }

    reject();
});