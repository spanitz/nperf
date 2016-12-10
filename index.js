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
                x.avg = (x.time[0] * 1e9 + x.time[1]) / samples;
            });

            const avg = this._tests.map(x => x.avg);
            this.min = _.min(avg);
            this.max = _.max(avg);

            this.log();

            return this;
        },
        log() {
            this._log = [util.format(chalk.cyan('%s'), this._tests.map(x => x.desc).join(' vs. '))];
            this._tests = _.sortBy(this._tests, x => x.avg);

            this._tests.forEach((x, i) => {
                const color = x.avg === this.min ? chalk.green.bold : x.avg === this.max ? chalk.red : chalk.gray;

                this._log.push(util.format((x.avg === this.min ? '%s. %s ' : chalk.grey('%s. %s ')) + color('%sx') + chalk.grey(' (avg ~%s)'),
                    i + 1,
                    x.desc,
                    Math.round(this.max/x.avg),
                    pretty(x.avg, 3)
                ));
            });

            if (process.env.NODE_ENV !== 'test') {
                console.log(this._log.join('\n'));
            }
        }
    };
}
