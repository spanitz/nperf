const _ = require('lodash');
const pretty = require('pretty-time');
const chalk = require('chalk');
const util = require('util');

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

            const time = this._tests.map(x => x._time);
            this.min = _.min(time);
            this.max = _.max(time);

            this.log();

            return this;
        },
        log() {
            this._log = [util.format(chalk.cyan('%s'), this._tests.map(x => x.desc).join(' vs. '))];
            this._tests = _.sortBy(this._tests, x => x._time);

            this._tests.forEach((x, i) => {
                const color = x._time === this.min ? chalk.green.bold : x._time === this.max ? chalk.red : chalk.gray;

                this._log.push(util.format((x._time === this.min ? '%s. %s ' : chalk.grey('%s. %s ')) + color('%sx') + chalk.grey(' (~%s)'),
                    i + 1,
                    x.desc,
                    Math.round(this.max/x._time),
                    pretty(x.time)
                ));
            });

            if (process.env.NODE_ENV !== 'test') {
                console.log(this._log.join('\n'));
            }
        }
    };
}
