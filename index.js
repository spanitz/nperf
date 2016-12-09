const _ = require('lodash');
const pretty = require('pretty-time');
const chalk = require('chalk');

module.exports = nperf;

function nperf(samples = 1000000) {
    return {
        _tests: [],
        samples,
        test(desc, fn) {
            this._tests.push({ desc, fn });
            return this;
        },
        run() {
            this._tests.forEach(x => {
                const start = process.hrtime();

                let i = samples;
                while (i--) {
                    x.fn();
                }

                x.time = process.hrtime(start);
                x._time = x.time[0] * 1e9 + x.time[1];
            });

            this.log();
        },
        log() {
            const time = this._tests.map(x => x._time);
            const min = _.min(time);
            const max = _.max(time);

            console.log(chalk.cyan('%s'), this._tests.map(x => x.desc).join(' vs. '));

            this._tests = _.sortBy(this._tests, x => x._time);

            this._tests.forEach((x, i) => {
                const color = i === 0 ? chalk.green.bold : x._time === max ? chalk.red : chalk.gray;

                console.log((i === 0 ? '%s. %s ' : chalk.grey('%s. %s ')) + color('%sx') + chalk.grey(' (~%s)'),
                    i + 1,
                    x.desc,
                    Math.round(max/x._time),
                    pretty(x.time)
                );
            });
        }
    };
}
