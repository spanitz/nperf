const nperf = require('.');

nperf(100)
    .test('Promise', () => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(), 10);
        });
    })
    .run();

nperf()
    .test('Spread-Operator', () => {
        const b = [4, 5, 6];

        [1, 2, 3, ...b];
    })
    .test('Array.prototype.concat', () => {
        const a = [1, 2, 3];

        a.concat([4, 5, 6]);
    })
    .test('Array.prototype.push', () => {
        const a = [1, 2, 3];

        a.push(4);
        a.push(5);
        a.push(6);
    })
    .run();

nperf()
    .test('Template string', () => {
        const a = 'foo';
        const b = 'bar';
        const c = 'baz';

        `${a} ${b} ${c}`;
    })
    .test('String concat', () => {
        const a = 'foo';
        const b = 'bar';
        const c = 'baz';

        a + ' ' + b + ' ' + c;
    })
    .test('Array.prototype.join', () => {
        const a = 'foo';
        const b = 'bar';
        const c = 'baz';

        [a, b, c].join(' ');
    })
    .run();
