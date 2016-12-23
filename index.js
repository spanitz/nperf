const _ = require('lodash');
const pretty = require('pretty-time');
const chalk = require('chalk');
const util = require('util');
const cpus = require('os').cpus().length;
const stream = process.stderr;
stream.clearLine();

const progress = (value, length, char) => {
    return `${_.repeat(chalk.white('█'), Math.floor(length * value / 100))}${_.repeat(chalk.gray('█'), length - Math.floor(length * value / 100))} ${value.toFixed(1)}%`;
}


/**
 * Constructor
 *
 * @param  {integer} samples Defines the number of samples nperf should collect for each test; defualts to 1000000
 */
function nperf(samples = 10000) {
    this.tests = [];
    this.samples = samples;
}

const proto = nperf.prototype;

/**
 * Register function to be tested
 *
 * @param  {string}   desc Description of the test
 * @param  {Function} fn   Function to be tested
 * @return {nperf}
 */
proto.test = function(desc, fn) {
    this.tests.push({ desc, fn });

    return this;
}

/**
 * Executes all registered test functions
 *
 * @return {nperf}
 */
proto.run = function() {
    let i = this.tests.length;
    if (i === 0) return this;

    //this.tests.forEach(x => this._run(x.desc, x.fn));

    const next = () => {
        i--;
        this._run(this.tests[i].desc, this.tests[i].fn).then(() => {
            if (i > 0) {
                next();
            }
        })
    };

    next();

    return this;
}

proto._run = function (desc, fn) {
    if (global.gc) {
        stream.write('Collecting garbage...');
        global.gc();
        stream.cursorTo(0);
        stream.clearLine(1);
    }

    console.log(fn.toString().replace(/(^(\(.*\)|[a-zA-Z]+)\s*=>\s*\{)|(function\s*\(.*\)\s*{)|(}$)/g, ''));

    return new Promise((resolve) => {
        let i = 1;
        const samples = 100;
        const defer = 10;
        const concurrency = 100;
        const sampleTime = [];
        const sampleMem = [];
        let sumCpuUsage = 0;

        const collectSamples = () => {
            stream.cursorTo(0);
            stream.write(`Collecting samples... ${progress(i / samples * 100, 25)}`);
            stream.clearLine(1);

            let j = concurrency;
            const sampleStartTime = process.hrtime();
            while(j--) {
                fn();
            }
            const sampleEndTime = process.hrtime(sampleStartTime);

            const endTime = process.hrtime(startTime);
            const endCpu = process.cpuUsage(startCpu);

            sampleTime.push((sampleEndTime[0] * 1e9 + sampleEndTime[1]) / concurrency);
            sampleMem.push(process.memoryUsage().heapUsed);

            const currentTime = (endTime[0] * 1e9 + endTime[1]);
            const currentCpuTime = endCpu.user * 1e3;
            const currentCpuUsage = endCpu.user * 1e3 / currentTime * 100;

            sumCpuUsage += currentCpuUsage;

            if (i === samples) {
                resolve();

                process.nextTick(() => {
                    stream.cursorTo(0);
                    stream.clearLine(1);
                    stream.write(JSON.stringify({
                        desc,
                        samples,
                        totalTime: pretty(currentTime, 3),
                        totalCpuTime: pretty(currentCpuTime, 3),
                        avgCpuUsage: sumCpuUsage / samples,
                        opsPerSec: 1e9 / (sampleTime.reduce((a, b) => a + b) / samples),
                        avgExecTime: pretty(sampleTime.reduce((a, b) => a + b) / samples, 3),
                        minExecTime: pretty(_.min(sampleTime), 3),
                        maxExecTime: pretty(_.max(sampleTime), 3),
                        avgHeapUsed: sampleMem.reduce((a, b) => a + b) / samples,
                        minHeapUsed: _.min(sampleMem),
                        maxHeapUsed: _.max(sampleMem),
                    }, undefined, 2) + '\n');
                });

                return;
            }

            i++;
            setTimeout(collectSamples, defer);

            process.nextTick(() => {
                stream.cursorTo(0);
                stream.write(`Collecting samples... ${progress(i / samples * 100, 25)}`);
                stream.clearLine(1);
            });
        };

        const startTime = process.hrtime();
        const startCpu = process.cpuUsage();
        collectSamples();
    });
}

/**
 * Logs benchmark results to console
 */
proto.log = function() {
    if (this.tests.length === 0) return this;

    this._log = [];
    this._log = [util.format(chalk.cyan('%s'), this.tests.map(x => x.desc).join(' vs. '))];
    this.tests = _.sortBy(this.tests, x => x.avg);

    this.tests.forEach((x, i) => {
        const color = x.avg === this.min ? chalk.green.bold : x.avg === this.max ? chalk.red : chalk.gray;
        this._log.push(util.format((x.avg === this.min ? '%s. %s ' : chalk.gray('%s. %s ')) + color('%sx') + chalk.gray(' (avg ~%s; ops %s)'),
            i + 1,
            x.desc,
            (this.max / x.avg).toFixed(1),
            pretty(x.avg, 3),
            Math.round(1e9 / (x.time / this.samples))
        ));
    });

    if (process.env.NODE_ENV !== 'test') {
        console.log(this._log.join('\n'));
    }

    return this;
}

module.exports = function(...args) {
    return new nperf(...args);
};
