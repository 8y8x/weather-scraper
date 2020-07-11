import json
import os
import time

from http import server
from threading import Thread
from urllib import request as req



if not os.path.exists('./storage'):
    os.makedirs('storage')

if not os.path.exists('./storage/temperatures.json'):
    with open('./storage/temperatures.json', mode='w') as file:
        file.write('[]')
        file.close()
        
def getDayFromTimestamp(timestamp):
    return timestamp / 60 / 60 / 24


def getWeather():
    with req.urlopen('https://www.theweathernetwork.com/ca/api/maps/regional/9/50/-125/48/-122') as res:
        res = res.read()
        try:
            res = json.loads(res)
        except:
            return None
        
        for obj in res:
            if obj['name'] == 'Vancouver':
                return obj['temp_c']

        return None


def saveWeather(temp):
    with open('./storage/temperatures.json', mode='rt+') as file:
        data = file.read()
        print(data)
        data = json.loads(data)
        today = int(getDayFromTimestamp(time.time()))

        changed = False

        if len(data) > 0 and data[-1]['day'] >= today:
            if data[-1]['temperature'] < temp:
                data[-1]['temperature'] = temp
                data[-1]['records'] += 1
                changed = True
        else:
            data.append({ 'day': today, 'records': 1, 'temperature': temp })
            changed = True

        if changed:
            file.seek(0)
            file.write(json.dumps(data))
            file.truncate()

        file.close()

        
def main():
    print('Getting the weather...')
    try:
        temp = getWeather()
        if temp == None:
            return print('An error occured while getting the weather.')
    except Exception as err:
        return print('An error occured while getting the weather: \n' + str(err))
    
    try:
        saveWeather(temp)
    except Exception as err:
        return print('An error occured while saving the weather: \n' + str(err))


paths = {
    '/desktop.css': './web/desktop.css',
    '/mobile.css': './web/mobile.css',
    '/index.js': './web/index.js',
    '/vancouver.jpg': './web/vancouver.jpg',
    '/get': './storage/temperatures.json'
}

endings = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.jpg': 'image/jpg',
    '.json': 'text/plain'
}

class HttpHandler(server.BaseHTTPRequestHandler):
    def do_HEAD(self):
        path = self.getPath()

        self.send_response(200)

        ending = '.' + path.split('.')[-1]

        if (path in paths) and (ending in endings):
            self.send_header('Content-Type', endings[ending])
            self.end_headers()
        else:
            self.send_header('Content-Type', endings['.html'])
            self.end_headers()


    def do_GET(self):
        self.do_HEAD()
        
        path = self.getPath()

        if path in paths:
            with open(paths[path], mode='rb') as file:
                self.wfile.write(file.read())
                file.close()
        else:
            with open('./web/index.html', mode='rb') as file:
                self.wfile.write(file.read())
                file.close()

        
    def getPath(self):
        path = self.path
        if path[-1] == '/':
            path = path[0:-1]

        return path.lower()

def updateWeatherLoop():
    try:
        while True:
            main()
            time.sleep(3600)
    except Exception as err:
        raise err

Thread(target = updateWeatherLoop, daemon = True).start()
    
server.HTTPServer(('127.0.0.1', 8000), HttpHandler).serve_forever()
