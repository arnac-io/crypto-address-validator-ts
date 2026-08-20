import { describe } from 'mocha';
import { expect } from 'chai';
import { entry, getCurrencies, findCurrency, target, validate } from './helpers/subject';

describe('test harness', function () {
    it('runs against the artifact named by TEST_TARGET', function () {
        expect(target).to.be.oneOf(['src', 'dist']);
        expect(entry).to.contain(target);
    });
});

describe('getCurrencies()', function () {
    it('Should get all currencies', function () {
        var currencies = getCurrencies();
        expect(currencies).to.be.ok;
        expect(currencies.length).to.be.greaterThan(0);
    });

    it('Should return null if currency is not found', function() {
        var currency = findCurrency('random');
        expect(currency).to.be.null;
    });

    it('Should throw exception in case of unknown currency', function() {
        const wrongCurrency = '%%%1312312';
        expect(() => validate('123', wrongCurrency, null))
            .to.throw('Missing validator for currency: ' + wrongCurrency);
    })
});
