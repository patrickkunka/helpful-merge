import './index';

import * as chai from 'chai';
import merge  from './merge';

const {assert} = chai;

describe('FluentMerge', () => {
    it('performs a basic merge', () => {
        const target = merge.to({foo: 'foo'}).from({bar: 'bar'}).exec();

        assert.deepEqual(target, {foo: 'foo', bar: 'bar'});
    });

    it('performs a basic merge in any order', () => {
        const target = merge
            .with({deep: true})
            .from({foo: 'foo'})
            .to({bar: 'bar'})
            .exec();

        assert.deepEqual(target, {foo: 'foo', bar: 'bar'});
    });

    it('merges multiple sources', () => {
        const target = merge.to({}).from({foo: 'foo'}, {bar: 'bar'}).exec();

        assert.deepEqual(target, {foo: 'foo', bar: 'bar'});
    });

    it('merges multiple sources from right to left', () => {
        const target = merge.to({}).from({foo: 'foo'}, {foo: 'bar'}).exec();

        assert.deepEqual(target, {foo: 'bar'});
    });

    it('will copy the source(s) if no target is supplied', () => {
        const source = {foo: 'foo'};
        const target = merge.from(source).exec();

        assert.notEqual(source, target);
    });

    it('accepts a configuration opject', () => {
        const source = {foo: []};
        const target = merge.to({}).from(source).with(true).exec();

        assert.notEqual(source.foo, target.foo);
    });
});