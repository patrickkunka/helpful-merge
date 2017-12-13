import * as chai          from 'chai';
import {getTotalMatching} from './handleMergeError';

const assert = chai.assert;

describe('getTotalMatching()', () => {
    it('should itentify 0 common characters between two unique strings', () => {
        const total = getTotalMatching('foo', 'bar');

        assert.equal(total, 0);
    });

    it('should itentify all characters as common, between two identical strings', () => {
        const total = getTotalMatching('foo', 'foo');

        assert.equal(total, 3);
    });

    it('should itentify common characters at the start of two partially identical strings', () => {
        const total = getTotalMatching('foo', 'fooBar');

        assert.equal(total, 3);
    });

    it('should itentify common characters at the start of two partially identical strings', () => {
        const total = getTotalMatching('fooBar', 'foo');

        assert.equal(total, 3);
    });

    it(`should itentify common characters at the end of two partially
        identical strings, while ignoring characters of different case`, () => {
        const total = getTotalMatching('bar', 'fooBar');

        assert.equal(total, 2);
    });

    it(`should itentify common characters in the middle of a string`, () => {
        const total = getTotalMatching('foo', 'barFooBar');

        assert.equal(total, 2);
    });

    it(`should sum isolated common characters on either side of a string`, () => {
        const total = getTotalMatching('fooBarCar', 'fooBrrCar');

        assert.equal(total, 8);
    });

    it(`should not sum groups of common characters that appear multiple times`, () => {
        const total = getTotalMatching('foo', 'fooBarfooBaroo');

        assert.equal(total, 3);
    });
});