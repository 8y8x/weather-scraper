addEventListener('load', async () => {
    /**
     * @macro
     * Shorthand for document.getElementById.
     * 
     * @param {string} x 
     */
    function $(x) {
        return document.getElementById(x);
    }

    /**
     * @macro
     * Gets the highest temperature from a WeatherSaveData array.
     * 
     * @param {WeatherSaveData[]} graph
     * @param {boolean} low If true, this will return the *lowest* temperature.
     */
    function getPeakTemperature(graph, low = false) {
        return graph.reduce((v, c) => v.temperature > c.temperature != low ? v : c).temperature;
    }

    /**
     * @macro
     * Throws an error if the operation is false.
     * 
     * @param {any} operation 
     * @param {string} error
     */
    function assert(operation, error) {
        if (!operation)
            throw new Error(error);
    }

    let graphViewButtons = [];
    class GraphViewButton {

        get disabled() { return this._disabled }
        set disabled(prop) {
            assert(typeof(prop) === 'boolean', 'Value must be a boolean');

            if (prop && !this.disabled) {
                this._element.classList.add('disabled');
                this._element.title = 'Not enough graph data';
            } else if (!prop && this.disabled) {
                this._element.classList.remove('disabled');
                this._element.title = '';
            }

            this._disabled = prop;

            return prop;
        }

        get element() { return this._element; }
        set element(_) { return _; }

        get type() { return this._type; }
        set type(_) { return _; }

        constructor(/** @type {HTMLElement} */ element, /** @type {GraphViewType} */ type) {
            assert(element instanceof HTMLElement, 'Parameter #1 must be a HTMLElement');
            assert(typeof(type) === 'number', 'Parameter #2 must be a GraphViewType');
            assert(Object.keys(GraphViewType).find(x => GraphViewType[x] === type),
                   'Parameter #2 must be a GraphViewType');

            this._disabled = false;
            this._element = element;
            this._type = type;

            element.addEventListener('click', this.select.bind(this));

            graphViewButtons.push(this);
        }

        deselect() {
            this.element.style.backgroundColor = this.element.style.cursor = '';
        }

        select() {
            if (this.disabled)
                return;

            if (this.type === GraphViewType.ALL_TIME)
                renderer.applyGraph(trueGraph, this.type);
            else
                renderer.applyGraph(trueGraph.slice(trueGraph.length - this.type),
                                    this.type);

            // deselect all other buttons
            graphViewButtons.forEach(x => x !== this && x.deselect());

            this.element.style.backgroundColor = '#92e2';
            this.element.style.cursor = 'default';
        }
    }

    const GraphViewType = {
        ALL_TIME: -1,
        THIRTY_DAYS: 30,
        SEVEN_DAYS: 7
    }

    class WeatherSaveData {

        get day() { return this._day; }
        set day(_) { return _; }

        get records() { return this._records; }
        set records(_) { return _; }

        get temperature() { return this._temperature; }
        set temperature(_) { return _; }
        
        /**
         * @param {object} input
         */
        constructor(input) {
            assert(typeof (input) === 'object', 'Parameter #1 must be an object');
            assert(typeof (input.day) === 'number',
                'Invalid weather save data (property "day" is not a number');
            assert(typeof (input.records) === 'number',
                'Invalid weather save data (property "records" is not a number');
            assert(typeof (input.temperature) === 'number',
                'Invalid weather save data (property "temperature" is not a number');

            this._day = input.day;
            this._records = input.records;
            this._temperature = input.temperature;
        }
    }

    class Renderer {
        get canvas() { return this._canvas; }
        set canvas(_) { return _; }

        get ctx() { return this._ctx; }
        set ctx(_) { return _; }

        get sidecanvas() { return this._sidecanvas; }
        set sidecanvas(_) { return _; }

        get sctx() { return this._sctx; }
        set sctx(_) { return _; }

        get graph() { return this._graph; }
        set graph(_) { return _; }

        get graphViewType() { return this._graphViewType; }
        set graphViewType(_) { return _; }

        constructor(/** @type HTMLCanvasElement */ canvas,
                    /** @type HTMLCanvasElement */ sidecanvas) {
            assert(canvas instanceof HTMLCanvasElement, 'Parameter #1 must be a HTMLCanvasElement');
            assert(sidecanvas instanceof HTMLCanvasElement,
                   'Parameter #2 must be a HTMLCanvasElement');


            this._ctx = (this._canvas = canvas).getContext('2d');
            this._sctx = (this._sidecanvas = sidecanvas).getContext('2d');
            this._graph = [];
            this._graphViewType = GraphViewType.ALL_TIME;
            this._mouseHoverSpace = null;
        
            canvas.addEventListener('mousemove', this.mousemoveEvent.bind(this));
            canvas.addEventListener('mouseleave', this.mouseleaveEvent.bind(this));

            this.render();
        }

        applyGraph(/** @type {WeatherSaveData[]} */ graph, /** @type {GraphViewType} */ type) {
            assert(graph instanceof Array, 'Parameter #1 must be an Array');
            assert(typeof(type) === 'number', 'Parameter #2 must be a GraphViewType');
            assert(Object.keys(GraphViewType).find(x => GraphViewType[x] === type),
                   'Parameter #2 must be a GraphViewType');

            this._graph = graph;
            this._graphViewType = type;

            graphViewButtons.forEach(x => {
                if (graph.length >= x.type && x.disabled)
                    x.disabled = false;
                else if (graph.length < x.type && !x.disabled)
                    x.disabled = true;
            })
        }

        connectPoints() {
            if (this.graph.length <= 1)
                return;

            const ctx = this.ctx;

            let spacing = this.getGraphSpacing(),
                rect = this.canvas.getBoundingClientRect(),
                canvasWidth = rect.width,
                canvasHeight = rect.height - 20,
                highestTemp = getPeakTemperature(this.graph),
                lowestTemp = getPeakTemperature(this.graph, true),
                oldestDay = this.graph[0].day,
                recentDay = this.graph[this.graph.length - 1].day;

            ctx.strokeStyle = '#92e';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(spacing / 2 | 0, canvasHeight - (canvasHeight / (highestTemp - lowestTemp)) * (this.graph[0].temperature - lowestTemp) + 10);
            for (let i = 0; i < this.graph.length; ++i) {
                let x = (spacing * (0.5 + (this.graph[i].day - oldestDay))),
                    y = (canvasHeight / (highestTemp - lowestTemp)) * (this.graph[i].temperature - lowestTemp);

                y = canvasHeight - y + 10;

                ctx.lineTo(x, y);
                ctx.arc(x, y, 2, 0, 2*Math.PI);
            }
            ctx.stroke();
        }

        clearCanvas() {
            /** @type {DOMRect} */
            let rect = this.canvas.getBoundingClientRect();
            this.ctx.clearRect(0, 0, rect.width, rect.height);
            this.sctx.clearRect(0, 0, 30, rect.height);

            return this;
        }

        drawEmptyGraph() {
            const ctx = this.ctx;

            let width = this.canvas.getBoundingClientRect().width;

            ctx.font = '24px Raleway';
            ctx.fillStyle = '#000';
            ctx.globalAlpha = 0.2;
            ctx.textAlign = 'center';

            ctx.fillText('No graph data to display :(', width / 2, (265 - 24) / 2);

            ctx.globalAlpha = 1;
        }

        drawLines() {
            if (this.graph.length <= 1)
                return;

            const ctx = this.ctx;

            let spacing = this.getGraphSpacing(),
                rect = this.canvas.getBoundingClientRect(),
                canvasWidth = rect.width,
                canvasHeight = rect.height;

            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.2;
            for (let i = spacing / 2; i <= canvasWidth; i += spacing) {
                ctx.beginPath();
                ctx.moveTo(i | 0, 0);
                ctx.lineTo(i | 0, canvasHeight);
                ctx.stroke();
            }

            if (this._mouseHoverSpace !== null) {
                let firstDay = this.graph[0].day,
                    entry = this.graph.filter(v => v.day - firstDay === this._mouseHoverSpace)[0],
                    canvasHeight = this.canvas.getBoundingClientRect().height;

                if (entry) {
                    ctx.globalAlpha = 0.05;
                    ctx.lineWidth = 10;
                    ctx.beginPath();
                    ctx.moveTo(spacing / 2 + (spacing * this._mouseHoverSpace), 0);
                    ctx.lineTo(spacing / 2 + (spacing * this._mouseHoverSpace), canvasHeight);
                    ctx.stroke();
                }
            }


            ctx.globalAlpha = 1;
        }

        drawSideMeasurements() {
            const ctx = this.sctx;

            let highestTemp = getPeakTemperature(this.graph),
                lowestTemp = getPeakTemperature(this.graph, true),
                canvasHeight = this.canvas.getBoundingClientRect().height;

            ctx.font = '14px Raleway';
            ctx.fillStyle = '#000';
            ctx.globalAlpha = 0.4;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';

            ctx.fillText(highestTemp + '°', 30, 10);
            ctx.fillText(lowestTemp + '°', 30, canvasHeight - 10);
        }

        drawTopBottom() {
            if (this.graph.length <= 1)
                return;

            const ctx = this.ctx;

            let spacing = this.getGraphSpacing(),
                rect = this.canvas.getBoundingClientRect(),
                canvasWidth = rect.width,
                canvasHeight = rect.height;

            ctx.strokeStyle = '#000';
            ctx.globalAlpha = 0.2;
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(5, 10);
            ctx.lineTo(canvasWidth - (spacing / 2) + 10, 10);
            ctx.moveTo(5, canvasHeight - 10);
            ctx.lineTo(canvasWidth - (spacing / 2) + 10, canvasHeight - 10);
            ctx.stroke();

            ctx.globalAlpha = 1;
        }

        /**
         * @returns {number}
         */
        getGraphSpacing() {
            /** @type {number} */
            let width = this.canvas.getBoundingClientRect().width;
            return width / (this.graph[this.graph.length - 1].day - this.graph[0].day + 1);
        }

        mousemoveEvent(/** @type {MouseEvent} **/ ev) {
            if (this.graph.length <= 1)
                return;

            let x = ev.offsetX,
                spacing = this.getGraphSpacing();

            this._mouseHoverSpace = (x / spacing) | 0;
        }

        mouseleaveEvent() {
            this._mouseHoverSpace = null;
        }

        render() {
            if (this.canvas.getBoundingClientRect().width !== 0) { // Prevent crashes
                this.ctx.save();

                this.clearCanvas();
                if (this.graph.length <= 1)
                    this.drawEmptyGraph();
                else {
                    this.drawLines();
                    this.drawTopBottom();
                    this.drawSideMeasurements();
                    this.connectPoints();
                    this.writeHoveringTemp();
                }

                this.ctx.restore();
            }

            requestAnimationFrame(this.render.bind(this));
        }

        writeHoveringTemp() {
            if (this._mouseHoverSpace === null)
                return;
            const ctx = this._ctx;

            ctx.globalAlpha = 1;
            ctx.fillStyle = '#92a';
            ctx.textAlign = 'center';
            let firstDay = this.graph[0].day,
                entry = this.graph.filter(v => v.day - firstDay === this._mouseHoverSpace)[0];

            if (!entry)
                return;

            let offset,
                highestTemp = getPeakTemperature(this.graph),
                lowestTemp = getPeakTemperature(this.graph, true),
                rect = this.canvas.getBoundingClientRect(),
                canvasHeight = rect.height,
                canvasWidth = rect.width,
                spacing = this.getGraphSpacing();

            if (highestTemp - entry.temperature > (highestTemp - lowestTemp) / 2) 
                offset = canvasHeight / 4;
            else
                offset = canvasHeight * 0.75;

            let temp = entry.temperature + '°',
                date = new Date(entry.day * 1e3 * 60 * 60 * 24);

            let x = spacing / 2 + (spacing * this._mouseHoverSpace);

            date = new Intl.DateTimeFormat('en-GB').format(date);

            ctx.font = '600 14px Raleway';
            let tempLength = ctx.measureText(temp).width + 8,
                dateLength = ctx.measureText(date).width + 8;

            let tempx = x;
            if (tempx < 10 + (tempLength / 2)) tempx = 10 + (tempLength / 2);
            if (tempx > canvasWidth - 10 - (tempLength / 2)) tempx = canvasWidth - 10 - (tempLength / 2);

            let datex = x;
            if (datex < 10 + (dateLength / 2)) datex = 10 + (dateLength / 2);
            if (datex > canvasWidth - 10 - (dateLength / 2)) datex = canvasWidth - 10 - (dateLength / 2);

            ctx.clearRect(tempx - (tempLength / 2), offset - 25, tempLength, 20);
            ctx.clearRect(datex - (dateLength / 2), offset - 5, dateLength, 20);

            ctx.fillText(entry.temperature + '°', tempx, offset - 10);
            ctx.fillText(date, datex, offset + 10);
        }
    }

    async function fetchGraphData() {
        let data = [];
        let res = await fetch('http://' + location.hostname + ':8000/get');
        res = await res.json();
        res.forEach(v => data.push(new WeatherSaveData(v)));
    
        if (data[data.length - 1].day - data[0].day >= 7)
            button_7d.disabled = false;
        else
            button_7d.disabled = true;

        if (data[data.length - 1].day - data[0].day >= 30)
            button_30d.disabled = false;
        else
            button_30d.disabled = true;

        $('current-temp').textContent = data[data.length - 1].temperature + '°';

        return data;
    }

    /** @type {Renderer} */
    const renderer = new Renderer($('graph'), $('graph-side'));

    let button_all_time = new GraphViewButton($('graph-all-time'), GraphViewType.ALL_TIME),
        button_7d = new GraphViewButton($('graph-7d'), GraphViewType.SEVEN_DAYS),
        button_30d = new GraphViewButton($('graph-30d'), GraphViewType.THIRTY_DAYS);

    /** @type {WeatherSaveData[]} */
    let trueGraph = await fetchGraphData();
    button_all_time.select();

    setInterval(async () => {
        trueGraph = await fetchGraphData();
    }, 1e3 * 60 * 30); // Update every 30 minutes
});
