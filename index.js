const _ = require('lodash');
const pretty = require('pretty-time');
const chalk = require('chalk');
const util = require('util');

/**
 * Constructor
 *
 * @param  {integer} samples Defines the number of samples nperf should collect for each test; defualts to 1000000
 */
function nperf(samples = 1000000) {
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
    if (this.tests.length === 0) return this;

    this.tests.forEach(x => {
        const start = process.hrtime();

        let i = this.samples;
        while (i--) {
            x.fn();
        }

        x.time = process.hrtime(start);
        x.avg = (x.time[0] * 1e9 + x.time[1]) / this.samples;
    });

    const avg = this.tests.map(x => x.avg);
    this.min = _.min(avg);
    this.max = _.max(avg);

    this.log();

    return this;
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

        this._log.push(util.format((x.avg === this.min ? '%s. %s ' : chalk.grey('%s. %s ')) + color('%sx') + chalk.gray(' (avg ~%s)'),
            i + 1,
            x.desc,
            Math.round(this.max/x.avg),
            pretty(x.avg, 3)
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
