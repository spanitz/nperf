# nperf

[![Build Status](https://travis-ci.org/spanitz/nperf.svg?branch=master)](https://travis-ci.org/spanitz/nperf) [![Codacy Badge](https://api.codacy.com/project/badge/Coverage/a004b606bba04b23b49cffdbdbaa87fd)](https://www.codacy.com/app/info_75/nperf?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=spanitz/nperf&amp;utm_campaign=Badge_Coverage) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/a004b606bba04b23b49cffdbdbaa87fd)](https://www.codacy.com/app/info_75/nperf?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=spanitz/nperf&amp;utm_campaign=Badge_Grade)

A minimalistic performance measurement util for Node.js.

## Install
```
npm install nperf
```

## Usage
Just require nperf and define your test cases.

```javascript
const nperf = require('nperf');

nperf()
    .test('Spread-Operator', () => {
        const b = [4, 5, 6];

        [1, 2, 3, ...b];
    })
    .test('Array.prototype.concat', () => {
        const a = [1, 2, 3];

        a.concat([4, 5, 6]);
    })
    .run();
```

### Console output
```
Spread-Operator vs. Array.prototype.concat
1. Array.prototype.concat 2x (avg ~139.490ns)
2. Spread-Operator 1x (avg ~276.843ns)
```

## API
_TBD_

## Running tests
```
npm test
```

### Coverage
```
npm install istanbul -g
npm run coverage
```

## License

Released under the MIT license.
