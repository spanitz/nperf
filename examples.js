const nperf = require('.');
const _ = require('lodash');

// nperf()
//     .test('Spread-Operator', () => {
//         const b = [4, 5, 6];
//         [1, 2, 3, ...b];
//     })
//     .test('Array.prototype.concat', () => {
//         const a = [1, 2, 3];
//         a.concat([4, 5, 6]);
//     })
//     .test('Array.prototype.push', () => {
//         const a = [1, 2, 3];
//         a.push(4);
//         a.push(5);
//         a.push(6);
//     })
//     .run();

nperf()
    .test('for', () => {
        const b = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for(let i = 0; i < b.length; i++) {
            b[i]++;
        }
    })
    .test('while', () => {
        const b = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        let i = b.length;
        while(i--) {
            b[i]++;
        }
    })
    .test('Array.prototype.forEach', () => {
        const b = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        b.forEach(x => {
            x++;
        });
    })
    .test('_.forEach', () => {
        const b = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        _.forEach(b, x => {
            x++;
        });
    })
    .run();
//
// nperf()
//     .test('Template string', () => {
//         const a = 'foo';
//         const b = 'bar';
//         const c = 'baz';
//         `${a} ${b} ${c}`;
//     })
//     .test('String concat', () => {
//         const a = 'foo';
//         const b = 'bar';
//         const c = 'baz';
//         a + ' ' + b + ' ' + c;
//     })
//     .test('Array.prototype.join', () => {
//         const a = 'foo';
//         const b = 'bar';
//         const c = 'baz';
//         [a, b, c].join(' ');
//     })
//     .run();
