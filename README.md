# Helpful Merge

[![Build Status](https://img.shields.io/travis/patrickkunka/helpful-merge.svg?style=flat-square)](https://travis-ci.org/patrickkunka/helpful-merge)
[![Coverage Status](https://img.shields.io/coveralls/patrickkunka/helpful-merge.svg?style=flat-square)](https://coveralls.io/github/patrickkunka/helpful-merge)
[![Latest Release](https://img.shields.io/npm/v/helpful-merge.svg?style=flat-square)](https://www.npmjs.com/package/helpful-merge)
[![Apache License](https://img.shields.io/npm/l/helpful-merge.svg?style=flat-square)](https://www.apache.org/licenses/)

A highly-configurable merge implementation with intelligent suggestion-based error handling for validating consumer-provided input against configuration interfaces.

For example, consider the following common scenario of a consumer misspelling properties on a configuration interface:

```js
import merge from 'helpful-merge';

// Configuration interface with defaults (must be sealed):
const defaults = Object.seal({
    autoplay: false
    volume: 0.85
});

// Arbitrary consumer-provided options:
const options = {
    autoplays: true
};

// Merge consumer options over defaults:
merge(defaults, options);

// TypeError: Unknown property "autoplays". Did you mean "autoplay"?
```
As demonstrated above, Helpful Merge will throw an exception when invalid properties are provided by the consumer, providing the closest matching suggestion for the offending property:

**TypeError: Unknown property "autoplays". Did you mean "autoplay"?**

Helpful Merge is great for creating robust and helpful entry points for JavaScript libraries and APIs and also includes efficient and customizable implementations of deep recursive merge, array merge, and more.

Helpful merge is small at only 4KB bundled and minified (2KB gzipped).

#### Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration Options](#configuration-options)
- [Fluent Interface](#fluent-interface)
- [Library Example](#library-example)

## Installation

Firstly, install the package using your package manager of choice.

```
npm install helpful-merge --save-dev
```

You may then import the merge function into your project's modules.

```js
import merge from 'helpful-merge';
```

## Usage

Helpful Merge can be used in place of any existing merge implementation such as ES6 `Object.assign()`, lodash/underscore's `merge()`, or jQuery's `$.extend()`.

Unlike `Object.assign()` however, Helpful Merge will only merge **one source object** into one target object at a time when using the standard calling syntax. This is because its third parameter is reserved for an optional configuration object (see [Configuration Options](#configuration-options)).

If you would like to merge multiple source objects into a target object in a single operation, Helpful Merge provides an alternative "fluent" interface for doing this. See [Fluent Interface](#fluent-interface).

#### Syntax

```js
merge(target, source, options?);
```

|         | Name     | Type     | Description |
|---------|----------|----------|-------------|
| @param  | target   | `T extends any` | The target object to merge into |
| @param  | source   | `any` | The source object to merge properties from |
| @param  | options? | <code>IConfig&#124;boolean</code> | An optional object of configuration options or `true` as a shorthand for `{deep: true}` |
| @return | target   | `T` | A reference to the updated target object |

## Configuration Options

The `merge()` function accepts an optional third parameter of configuration options with the following defaults:

```js
{
    deep: false,
    arrayStrategy: ArrayStrategy.REPLACE,
    errorMessage: Messages.MERGE_ERROR,
    includeNonEnumerable: false,
    includeReadOnly: false
    preserveTypeIfTargetUnset: false,
    useReferenceIfArray: false,
    useReferenceIfTargetUnset: false,
}
```

Zero or more of these options can be passed to the merge function after the source object, as needed:

```js
merge(target, source, {
    deep: true,
    useReferenceIfTargetUnset: true
});
```

The most commonly used configuration option `deep`, can be provided in a shorthand form by simply passing `true` as the third parameter, instead of an object:

```js
merge(target, source, true);
```

### Available Options

- [deep](#deep)
- [arrayStrategy](#arraystrategy)
- [errorMessage](#errormessage)
- [includeNonEnumerable](#includenonenumerable)
- [includeReadOnly](#includereadonly)
- [preserveTypeIfTargetUnset](#preservetypeiftargetunset)
- [useReferenceIfArray](#usereferenceifarray)
- [useReferenceIfTargetUnset](#usereferenceiftargetunset)

### `deep`

| Type      | Default |
|-----------|---------|
| `boolean` | `false` |

An optional boolean dictating whether or not to perform a deep recursive merge. By default, only a simple shallow merge will be performed, and any properties in the source object with object or array values will be copied to the target by reference only.

This option may also be set using an alternative shorthand syntax whereby the value `true` is passed as the third parameter instead of `{deep: true}`.

##### Example 1: Shallow merge (default behavior)
```js
const target = {};

const source = {
    foo: {},
    bar: false
};

merge(target, source);

console.log(target.foo); // {}

assert.equal(target.foo, source.foo) // true
```

##### Example 2: Deep Merge
```js
const target = {};

const source = {
    foo: {},
    bar: false
};

merge(target, source, {deep: true});
// ^ or, shorthand form: merge(target, source, true);

console.log(target.foo); // {}

assert.equal(target.foo, source.foo) // false
```

### `arrayStrategy`

| Type | Default |
|------|---------|
| <code>'PUSH'&#124;'REPLACE'</code> | `'REPLACE'` |

A string dictating the kind of array merge strategy to use when copying the values of one array into another. By default, arrays are merged using the `'REPLACE'` strategy, where each value in the source array overwrites the value of the same index in the target.

In certain configuration interfaces, where we are may wish to extend some base configuration with additional values, a `'PUSH'` strategy may be preferable. In this case, the values of the source array are pushed on to the target array, and no data is overwritten.

To avoid magic strings, the possible values are available via the exported `ArrayStrategy` enum, via `ArrayStrategy.PUSH`, and `ArrayStrategy.REPLACE`.

##### Example 1: Replace strategy (default behavior)
```js
const target = {
    foo: ['Jim', 'Jane', 'Joe']
};

const source = {
    foo: ['Bill', 'Bob']
};

merge(target, source, true);

console.log(target.foo); // ['Bill', 'Bob', 'Joe'];
```

##### Example 2: Push strategy
```js
import merge, {ArrayStrategy} from 'helpful-merge';

const target = {
    foo: ['Jim', 'Jane', 'Joe']
};

const source = {
    foo: ['Bill', 'Bob']
};

merge(target, source, {
    deep: true,
    arrayStrategy: ArrayStrategy.PUSH
});

console.log(target.foo); // ['Jim', 'Jane', 'Joe', 'Bill', 'Bob']
```

### `errorMessage`



| Type | Default |
|------|---------|
| `(offending: string, suggestion: string) => string` | `Message.MERGE_ERROR` |

A optional function with which to override the default error message thrown when a consumer attempts to add undefined properties to a sealed or non-extensible target object.

The function receives two arguments, the key of the offending property, and a suggestion in the form of the key of a closely matching property on the target (if found). The function must return a string.

The default error message function is as follows:

```js
(offender, suggestion = '') => {
    return `Unknown property "${offender}"` + (suggestion ? `. Did you mean "${suggestion}"?` : '');
}
```

##### Example: Implementing a custom error message
```js
const errorMessage = (offender, suggestion = '') => {
    return `[MyLibrary] Invalid POST option "${offender}"` + (suggestion ? `. Maybe you you meant "${suggestion}"?` : '');
};

merge(target, source, {errorMessage});

// TypeError: [MyLibrary] Invalid POST option "cache". Maybe you meant "useCache"?
```

### `includeNonEnumerable`

| Type      | Default |
|-----------|---------|
| `boolean` | `false` |

An optional boolean dictating whether or not to copy non-enumerable properties on the source object to the target object.

##### Example 1: Skipping non-enumerable properties (default behavior)
```js
const target = {};
const source = {};

Object.defineProperty(source, 'foo', {
    value: 'Hello world!',
    enumerable: false
});

merge(target, source);

console.log(source.foo); // 'Hello world!'
console.log(target.foo); // 'undefined'
```

##### Example 2: Including non-enumerable properties
```js
const target = {};
const source = {};

Object.defineProperty(source, 'foo', {
    value: 'Hello world!',
    enumerable: false
});

merge(target, source, {
    includeNonEnumerable: true
});

console.log(source.foo); // 'Hello world!'
console.log(target.foo); // 'Hello world!'
```

### `includeReadOnly`

| Type      | Default |
|-----------|---------|
| `boolean` | `false` |

An optional boolean dictating whether or not to copy the values of "read-only" properties on the source object to the target object. Read only properties are defined as accessor properties with a "getter", but no "setter".

Typically these would be defined on both the source and target, negating the need to copy them, as their values would be equal on both objects for the same underlying data.

##### Example 1: Skipping read-only properties (default behavior)
```js
const target = {};

const source = {
    firstName: 'Jill',
    lastName: 'Kay'
};

Object.defineProperty(source, 'fullName', {
    get() {
        return this.firstName + this.lastName
    }
});

merge(target, source);

console.log(source.fullName); // 'Jill Kay'
console.log(target.fullName); // 'undefined'
```

##### Example 2: Including read-only properties
```js
const target = {};

const source = {
    firstName: 'Jill',
    lastName: 'Kay'
};

Object.defineProperty(source, 'fullName', {
    get() {
        return this.firstName + this.lastName
    }
});

merge(target, source, {
    includeReadOnly: true
});

console.log(source.fullName); // 'Jill Kay'
console.log(target.fullName); // 'Jill Kay'
```

### `preserveTypeIfTargetUnset`

| Type      | Default |
|-----------|---------|
| `boolean` | `false` |

An optional boolean dictating whether or not to attempt preservation of custom types, when performing a deep merge into a `null` (unset) target value.

For example, property `source.foo` may be an instance of consumer class `Foo`, and property `target.foo` may be set to `null`. By default in this scenario, the individual properties and values of `source.foo` would be copied onto a new plain object (`{}`) which would be assigned to `target.foo`.

When `preserveTypeIfTargetUnset` is set to `true`, Helpful Merge will attempt to derive the custom type (`Foo`) of `source.foo`, assign a new instance of it to `target.foo`, and then copy all values across.

This is particularly useful when read-only computed properties ("getters") are present on the source object and should be maintained on the target object.

##### Example 1: Deep copying into a nested unset target (default behavior)
```js
class Foo {}

const source = {
    foo: new Foo()
}

const target = {
    foo: null
};

merge(target, source, true);

assert.isOk(target.foo); // true
assert.instanceOf(source.foo, Foo); // true
assert.instanceOf(target.foo, Foo); // false
```

##### Example 2: Deep copying into a nested unset target with type preservation
```js
class Foo {}

const source = {
    foo: new Foo()
}

const target = {
    foo: null
};

merge(target, source, {
    deep: true,
    preserveTypeIfTargetUnset: true
});

assert.isOk(target.foo); // true
assert.instanceOf(source.foo, Foo); // true
assert.instanceOf(target.foo, Foo); // true
```

### `useReferenceIfArray`

| Type      | Default |
|-----------|---------|
| `boolean` | `false` |

An optional boolean dictating whether or not to copy nested arrays by reference, when performing a deep merge.

If set to `true`, the recursive merge will stop at any property who's value is an array, and copy it by reference to the target object.

This provides an efficient boundary between a defined configuration structure, and consumer-provided array values where reference will suffice, and avoids unnecessary recursion and enumeration.

##### Example 1: Deep copying nested arrays (default behavior)
```js
const target = {};

const source = {
    names: ['Joe', 'Jill', 'Jim']
};

merge(source, target, true);

console.log(target.names); // ['Joe', 'Jill', 'Jim']

assert.equal(target.names, source.names); // false
```

##### Example 2: Copying nested arrays by reference
```js
const target = {};

const source = {
    names: ['Joe', 'Jill', 'Jim']
};

merge(source, target, {
    deep: true,
    useReferenceIfArray: true
});

console.log(target.names); // ['Joe', 'Jill', 'Jim']

assert.equal(target.names, source.names); // true
```

### `useReferenceIfTargetUnset`

| Type      | Default |
|-----------|---------|
| `boolean` | `false` |

An optional boolean dictating whether or not to copy nested objects or arrays by reference, when the following criteria are met:
- A deep merge is already being performed (via `deep: true`)
- The property exists on the source object as a nested object or array
- The property does not exist on the target object, or is `null` on the target object.

If set to `true`, the recursive merge will stop at these "leaf" properties and their values will be copied to the target object by reference only, rather than being recursively cloned.

This provides an efficient boundary between a defined configuration structure, and consumer-provided hash or typed values where a reference will suffice, and avoids unnecessary recursion and enumeration.

##### Example 1: Deep copying nested objects/arrays when unset on target (default behavior)
```js
const target = {
    foo: {}
};

const source = {
    foo: {
        bar: {}
    }
};

merge(target, source, true);

console.log(target.foo.bar); // {}

assert.equal(target.foo.bar, source.foo.bar); // false
```

##### Example 2: Copying nested objects/arrays by reference when unset on target
```js
const target = {
    foo: {}
};

const source = {
    foo: {
        bar: {}
    }
};

merge(target, source, true);

console.log(target.foo.bar); // {}

assert.equal(target.foo.bar, source.foo.bar); // true
```

## Fluent Interface

Sometimes we may want to merge multiple source objects into a target object in a single operation for brevity, just as we can do with ES6 `Object.assign()`.

When using the default calling syntax (`merge()`), the third parameter is reversed for an optional configuration object, meaning we can only supply a single source object.

In order to accomodate multiple source objects, an alternative "fluent" syntax is provided whereby we can construct a merge operation by chaining together various semantic methods:

```js
import merge from 'helpful-merge';

// single source object
merge.from(source).to(target).exec();

// multiple sources (C -> target, B -> target, A -> target)
merge.from(sourceA, sourceB, sourceC).to(target).exec();

// with configuration
merge.from(source).to(target).with({deep: true}).exec();

// in any order
merge.with({deep: true}).to(target).from(source).exec();

// return value
const foo = merge.with(true).to(new Foo()).from({bar: 'baz'}).exec();

// omit `.to()` for basic object cloning
const clone = merge.from(source).exec();
```

The final `.exec()` method must always be called in order to execute the operation and return the target reference.

Just as with `Object.assign()`, multiple sources are merged from **right to left**.

All available configuration options may be supplied to `.with()`.

## Library Example

A common pattern in many libraries is to allow the consumer to provide an optional object of configuration options:

```js
const player = new Player({
    autoplay: true,
    volume: 0.8
});
```

If we don't validate that input, the consumer is free to provide erroneous configuration options and debugging the resulting problems in behavior becomes hard.

By implementing a sealed configuration class internally with sensible defaults, and merging consumer provided input into it, we can catch erroneous configuration at the point of instantiation and provide developer feedback.

##### ./Config.js
```js
class Config {
    constructor() {
        this.autoplay = false;
        this.volume = 0.8;

        Object.seal(this);
    }
}
```

#### ./Player.js
```js
import Config from './Config.js';

class Player {
    constructor(options={}) {
        this.config = new Config();

        Object.assign(this.config, options);
    }
}
```

When the consumer provides an option not defined in the config class, a type error will be thrown:

```js
const player = new Player({autoPlay: false});

// TypeError: Cannot add property autoPlay, object is not extensible
```

Unfortunately, this message is not particularly helpful for novice developers who may not understand the concept of extensibility, nor is it particularly helpful for developers without intellisense who are forced to debug at runtime, which depending on your library's target demographic, could be the majority of users. This is where Helpful Merge comes in.

We can replace `Object.assign()` in the above example with Helpful Merge's `merge()` implementation, which provides a helpful and customizable error message with a suggestion of the closest matching property name on the target object:

#### ./Player.js
```js
import merge from 'helpful-merge';

import Config from './Config';

class Player {
    constructor(options={}) {
        this.config = new Config();

        merge(this.config, options);
    }
}
```

Now the consumer will see the following error message:

```js
const player = new Widget({autoPlay: false});

// TypeError: Unknown property "autoPlay". Did you mean "autoplay"?
```

This provides an easy means of catching typos, incorrect casing, or API version mismatches, which in turn provides a great developer experience for consumers of your library or API.

Helpful Merge also allows us to easily customize this error message to further improve the developer experience for your library or API. For example:

```js
// TypeError: [Player] Invalid configuration option "autoPlay". Did you mean "autoplay"?
```

---

© 2017 Patrick Kunka / KunkaLabs Ltd