import * as chai     from 'chai';
import merge         from './merge';
import * as Messages from './Messages';
import ArrayStrategy from './Constants/ArrayStrategy';

const assert = chai.assert;

describe('merge()', () => {
    it('should error if an invalid source object is provided', () => {
        assert.throws(() => merge({}, null), Messages.TYPE_ERROR_SOURCE(null));
    });

    it('should error if an invalid target object is provided', () => {
        assert.throws(() => merge(null, {}), Messages.TYPE_ERROR_TARGET(null));
    });

    it('should shallow merge the properties of one object into another', () => {
        const obj1 = {
            foo: null,
            bar: null,
            baz: null,
            car: null
        };

        const obj2 = {
            foo: 1,
            bar: true,
            baz: {},
            car: 'hello'
        };

        merge(obj1, obj2);

        assert.equal(obj1.foo, 1);
        assert.equal(obj1.bar, true);
        assert.equal(obj1.car, 'hello');
        assert.equal(obj1.baz, obj2.baz);
    });

    it('should add nested objects as references if `deep` option not set', () => {
        const obj1 = {foo: {bar: null}};
        const obj2 = {foo: {bar: 1}};

        merge(obj1, obj2);

        assert.equal(obj1.foo, obj2.foo);
        assert.equal(obj1.foo.bar, 1);
    });

    it('should recursively merge nested objects if `deep` option set', () => {
        const obj1 = {foo: {bar: null}};
        const obj2 = {foo: {bar: 1}};

        merge(obj1, obj2, {
            deep: true
        });

        assert.notEqual(obj1.foo, obj2.foo);
        assert.equal(obj1.foo.bar, 1);
    });

    it('should accept a third parameter `true` as a shorthand for `deep: true`', () => {
        const obj1 = {foo: {bar: null}};
        const obj2 = {foo: {bar: 1}};

        merge(obj1, obj2, true);

        assert.notEqual(obj1.foo, obj2.foo);
        assert.equal(obj1.foo.bar, 1);
    });

    it(`should add nested objects by references when deep merging,
        \`useReferenceIfTargetUnset\` option set, and target is unset`, () => {
        const obj1 = {foo: null};
        const obj2 = {foo: {bar: 1}};

        merge(obj1, obj2, {
            deep: true,
            useReferenceIfTargetUnset: true
        });

        assert.equal(obj1.foo, obj2.foo);
        assert.equal(obj1.foo.bar, 1);
    });

    it('should skip read-only properties', () => {
        const obj1 = {};

        const obj2 = {
            foo: 'bar',
            get baz() {
                return this.foo;
            }
        }

        merge(obj1, obj2);

        assert.isUndefined(obj1.baz);
    });

    it('should include accessor properties', () => {
        const obj1 = {};

        let baz = 'car';

        const obj2 = {
            foo: 'bar',
            get baz() {
                return baz;
            },
            set baz(value) {
                baz = value;
            }
        }

        merge(obj1, obj2);

        assert.isDefined(obj1.baz);
        assert.equal(obj1.baz, 'car');
    });

    it('should include read-only properties if `includeReadOnly` option set', () => {
        const obj1 = {};

        const obj2 = {
            foo: 'bar',
            get baz() {
                return this.foo;
            }
        }

        merge(obj1, obj2, {
            includeReadOnly: true
        });

        assert.isDefined(obj1.baz);
        assert.equal(obj1.baz, 'bar');
    });

    it('should skip non-enumerable properties', () => {
        const obj1 = {};
        const obj2 = {};

        Object.defineProperty(obj2, 'bar', {
            get:() => 'baz'
        });

        merge(obj1, obj2);

        assert.isDefined(obj2.bar);
        assert.isUndefined(obj1.bar);
    });

    it('should include non-enumerable properties if `includeNonEnumerable` option set', () => {
        const obj1 = {};
        const obj2 = {};

        Object.defineProperty(obj2, 'bar', {
            get:() => 'baz'
        });

        merge(obj1, obj2, {
            includeNonEmurable: true,
            includeReadOnly: true
        });

        assert.isDefined(obj2.bar);
        assert.isDefined(obj1.bar);
    });

    it('should merge arrays with a "REPLACE" strategy', () => {
        const arr1 = ['foo', 'bar'];
        const arr2 = ['foo', 'baz'];

        merge(arr1, arr2);

        assert.equal(arr1.length, 2);
        assert.equal(arr1[1], 'baz');
    });

    it('should merge arrays with a "PUSH" strategy if `arrayStrategy` set to "PUSH"', () => {
        const arr1 = ['foo', 'bar'];
        const arr2 = ['foo', 'baz'];

        merge(arr1, arr2, {
            arrayStrategy: ArrayStrategy.PUSH
        });

        assert.equal(arr1.length, 4);
        assert.equal(arr1[1], 'bar');
        assert.equal(arr1[2], 'foo');
        assert.equal(arr1[3], 'baz');
    });

    it('should deep merge arrays if `deep` option set', () => {
        const obj1 = {
            foo: [{}]
        };

        const obj2 = {
            foo: [{bar: 1}]
        };

        merge(obj1, obj2, true);

        assert.equal(obj1.foo.length, 1);
        assert.notEqual(obj1.foo[0], obj2.foo[0]);
        assert.equal(obj1.foo[0].bar, 1);
    });

    it('should deep merge arrays with a "PUSH" strategy if `deep` option set and `arrayStrategy` set to "PUSH"', () => {
        const obj1 = {
            foo: [{}]
        };

        const obj2 = {
            foo: [{bar: 1}]
        };

        merge(obj1, obj2, {
            deep: true,
            arrayStrategy: ArrayStrategy.PUSH
        });

        assert.equal(obj1.foo.length, 2);
        assert.equal(obj1.foo[1], obj2.foo[0]);
    });

    it('should add arrays by reference when deep merging if `useReferenceIfArray` option set', () => {
        const obj1 = {
            foo: [{}]
        };

        const obj2 = {
            foo: [{bar: 1}]
        };

        merge(obj1, obj2, {
            deep: true,
            useReferenceIfArray: true
        });

        assert.equal(obj1.foo, obj2.foo);
        assert.equal(obj1.foo.length, 1);
    });

    it('should error when adding an undefined property on a sealed object', () => {
        const obj1 = {};

        const obj2 = {
            foo: 'bar'
        };

        Object.seal(obj1);

        assert.throws(() => merge(obj1, obj2), Messages.MERGE_ERROR('foo'));
    });

    it('should error when adding an undefined property on a non-extensible object', () => {
        const obj1 = {};

        const obj2 = {
            foo: 'bar'
        };

        Object.preventExtensions(obj1);

        assert.throws(() => merge(obj1, obj2), Messages.MERGE_ERROR('foo'));
    });

    it('should provide a reasonable suggestion if a similar property name exists', () => {
        const obj1 = {
            foo: null
        };

        const obj2 = {
            Foo: 'bar'
        };

        Object.seal(obj1);

        assert.throws(() => merge(obj1, obj2), Messages.MERGE_ERROR('Foo', 'foo'));
    });

    it('should provide a reasonable suggestion if a multiple similar property names exists', () => {
        const obj1 = {
            fooBar: null,
            FooBar: null,
            foo: null
        };

        const obj2 = {
            Foo: 'bar'
        };

        Object.seal(obj1);

        assert.throws(() => merge(obj1, obj2), Messages.MERGE_ERROR('Foo', 'foo'));
    });

    it('should provide a reasonable suggestion if the most similar property names contains padding characters', () => {
        const obj1 = {
            baz: null,
            foo: null,
            FooBarCar: null
        };

        const obj2 = {
            bar: 'bar'
        };

        Object.seal(obj1);

        assert.throws(() => merge(obj1, obj2), Messages.MERGE_ERROR('bar', 'FooBarCar'));
    });

    it('should allow a custom error message to be provided', () => {
        const obj1 = {
            baz: null,
            foo: null,
            FooBarCar: null
        };

        const obj2 = {
            bar: 'bar'
        };

        Object.seal(obj1);

        const config = {
            errorMessage: (offending, suggestion) => `Invalid configuration option "${offending}". Did you mean "${suggestion}"?`
        }

        assert.throws(() => merge(obj1, obj2, config), 'Invalid configuration option "bar". Did you mean "FooBarCar"?');
    });
});