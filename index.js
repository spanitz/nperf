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
    const ret = fn();
    const async = ret && typeof ret.then === 'function';
    this.tests.push({ desc, fn, async });

    return this;
}

proto._runAsync = function(setup, test, i) {
    return new Promise((resolve) => {
        function* gen() {
            setup();
            while(i--) yield test.fn();
            resolve();
        }

        const iter = gen();
        (function run() {
            const curr = iter.next();
            if (!curr.done) curr.value.then(run);
        })();
    });
}

proto._runSync = function(setup, test, i) {
    return new Promise((resolve) => {
        setup();
        while (i--) test.fn();
        resolve();
    });
}

/**
 * Executes all registered test functions
 *
 * @return {nperf}
 */
proto.run = function() {
    if (this.tests.length === 0) return this;
    const ctx = this;

    function* gen() {
        let i = ctx.tests.length;
        let start;

        while(i--) {
            yield ctx[ctx.tests[i].async ? '_runAsync' : '_runSync'](
                () => { start = process.hrtime() },
                ctx.tests[i],
                ctx.samples
            ).then(() => {
                ctx.tests[i].time = process.hrtime(start);
                ctx.tests[i].avg = (ctx.tests[i].time[0] * 1e9 + ctx.tests[i].time[1]) / ctx.samples;
            });
        }

        const avg = ctx.tests.map(x => x.avg);
        ctx.min = _.min(avg);
        ctx.max = _.max(avg);
        ctx.log();
    };

    const iter = gen();
    (function run() {
        const curr = iter.next();
        if (!curr.done) curr.value.then(run);
    })();

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
        this._log.push(util.format((x.avg === this.min ? '%s. %s ' : chalk.gray('%s. %s ')) + color('%sx') + chalk.gray(' (avg ~%s)'),
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
