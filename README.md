# Minimalistic performance measurement util
_TBD_

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
1. Array.prototype.concat 2x (~197ms)
2. Spread-Operator 1x (~381ms)
```

## API
_TBD_

## License

Released under the MIT license.
