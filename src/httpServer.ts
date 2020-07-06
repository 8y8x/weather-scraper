import { createServer } from 'http';
import { promises as fs } from 'fs';

createServer(async (req, res) => {
    let url: string = (req.url || '').toLowerCase();
    if (url.endsWith('/')) url = url.substring(0, url.length - 2);

    switch (url) {
        case '/get':
            res.end(await fs.readFile('./storage/temperatures.json'));
            break;

        case '/desktop.css':
        case '/mobile.css':
        case '/index.js':
        case '/vancouver.jpg':
            res.end(await fs.readFile('./web' + url));
            break;

        default:
            res.end(await fs.readFile('./web/index.html'));
    }
}).listen(8000);