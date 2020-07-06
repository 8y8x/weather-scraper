# weather-scraper
This collects the current temperature from The Weather Network every hour and combines the data into a list of daily peak temperatures. You can then view the graph in your browser.

It's worth mentioning this only collects data about Vancouver.

## Install dependencies:
```bash
npm i -g typescript
npm i @types/node node-fetch
```

## Start the project:
```bash
npm test
```

Once running, you can view the graph in the browser at http://127.0.0.1:8000 . You can leave it running on a server and it will continue to collect data.
