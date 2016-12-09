process.env.NODE_ENV = 'test';

const chai = require('chai');
const spies = require('chai-spies');

chai.use(spies);

const expect = chai.expect;
const nperf = require('.');

describe('nperf', () => {
    it('should default to 1000000 samples', () => {
        const instance = nperf();
        expect(instance.samples).to.equal(1000000);
    });
    it('should set samples to 123', () => {
        const instance = nperf(123);
        expect(instance.samples).to.equal(123);
    });

    describe('test()', () => {
        it('should add a new test case', () => {
            const instance = nperf().test('foo', () => {});
            expect(instance._tests.length).to.equal(1);
        });
        it('should add a new test case with the correct properties', () => {
            const instance = nperf().test('foo', () => {});
            expect(instance._tests[0]).to.have.property('fn');
            expect(instance._tests[0].fn).to.be.a('function');
            expect(instance._tests[0]).to.have.property('desc')
            expect(instance._tests[0].desc).to.equal('foo');
        });
    });
    describe('run()', () => {
        it('should add time metric as hrtime Array', () => {
            const instance = nperf(1).test('foo', () => {}).run();
            expect(instance._tests[0]).to.have.property('time');
            expect(instance._tests[0].time).to.be.an('array');
        });
        it('should add _time metric in nanoseconds', () => {
            const instance = nperf(1).test('foo', () => {}).run();
            expect(instance._tests[0]).to.have.property('_time');
            expect(instance._tests[0]._time).to.be.a('number');
        });
        it('should call foo 3 times', () => {
            const spy = chai.spy(() => {});
            nperf(3).test('foo', spy).run();
            expect(spy).to.have.been.called.exactly(3);
        });
        it('should calculate extremes', () => {
            const instance = nperf(1).test('foo', () => {}).test('bar', () => {}).run();
            expect(instance.min).to.be.a('number');
            expect(instance.max).to.be.a('number');
        });
    });
    describe('log()', () => {
        it('should call log()', () => {
            const instance = nperf(1).test('foo', () => {});
            const spy = chai.spy.on(instance, 'log');
            instance.run();
            expect(spy).to.have.been.called();
        });
        it('should create log output', () => {
            const instance = nperf(1).test('foo', () => {}).test('bar', () => {}).run();
            expect(instance._log).to.be.an('array');
            expect(instance._log).to.have.lengthOf(3);
        });
        it('should sort log output ascending by _time', () => {
            const instance = nperf(1).test('foo', () => {}).test('bar', () => {});

            instance._tests[0].time = [2, 1e8];
            instance._tests[0]._time = instance._tests[0].time[0] * 1e9 + instance._tests[0].time[1];
            instance._tests[1].time = [1, 1e8];
            instance._tests[1]._time = instance._tests[1].time[0] * 1e9 + instance._tests[1].time[1];
            instance.log();

            expect(instance._tests[0].desc).to.equal('bar');
            expect(instance._tests[1].desc).to.equal('foo');
        });
    });
});
