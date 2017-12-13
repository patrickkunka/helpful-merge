# Helpful Merge

A highly-configurable merge implementation with intelligent error handling for validating consumer-provided input against configuration interfaces.

**TL;DR:**

```js
const target = {
    animationDuration: 50
};

const source = {
    animatonDuration: 300
};

merge(target, source);

// TypeError: Unknown property "animatonDuration". Did you mean "animationDuration"?
```

Helpful Merge is great for creating robust and helpful entry points for JavaScript libraries and APIs and also includes efficient and customizable implementations of deep recursive merge, array merge, and more.

#### Contents

- [Installation](#installation)
- [Usage](#usage)
- [Background](#backgrounds)
- [Options](#options)

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

Unlike `Object.assign()` however, Helpful Merge will only merge one source object into one target object at a time, as its third parameter is reserved for an optional configuration object (see [options](#options)).

The function always returns a reference to the target object.

```js
/**
 * @param  {any}         target
 * @param  {any}         source
 * @param  {object|true} [options]
 * @return {any}         target
 */

merge(target, source, options);
```

## Background

A common pattern in many libraries is to allow the consumer to provide an optional object of configuration options:

```js
const myWidget = new Widget({
    option1: true,
    option2: 300
});
```

If we don't validate that input, the consumer is free to provide erroneous configuration options and debugging the resulting problems in behavior becomes hard.

By implementing a sealed configuration class internally with sensible defaults, and merging consumer provided input into it, we can catch erroneous configuration at the point of instantiation and provide developer feedback.

```js
class Config {
    constructor() {
        this.option1 = false;
        this.option2 = 50;

        Object.seal(this);
    }
}

...

const config = Object.assign(new Config(), consumerOptions);
```

When the consumer provides an option not defined in the config class, a type error will be thrown:

```js
const myWidget = new Widget({option3: 50});

// TypeError: Cannot add property option3, object is not extensible
```

Unfortunately, this message is not particularly helpful, and particularly unhelpful for novice developers who may not understand the concept of extensibility. There is where Helpful Merge comes in.

We can replace `Object.assign()` in the above example with Helpful Merge's merge implementation, which provides a helpful and customizable error message with a suggestion of the closest matching property name on the target object:

```js
import merge from 'helpful-merge';

...

const config = merge(new Config(), consumerOptions);

// TypeError: Unknown property "option3". Did you mean "option2"?
```

This provides an easy means of catching typos, incorrect casings, or API version mismatches, which in turn provides a great developer experience for consumers of your library or API.

Helpful Merge also allows us to easily customize this error message to further improve the developer experience for your library or API. For example:

```js
// TypeError: [MyWidget] Invalid configuration option "option3". Did you mean "option2"?
```

## Options

The `merge()` function accepts an optional third parameter of configuration options with the following defaults:

```js
{
    deep: false,
    arrayStrategy: ArrayStrategy.REPLACE,
    errorMessage: Messages.MERGE_ERROR,
    includeNonEnumerable: false,
    includeReadOnly: false
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

Each property is fully documented below:

- [deep](#deep)
- [arrayStrategy](#arraystrategy)
- [errorMessage](#errormessage)
- [includeNonEnumerable](#includenonenumerable)
- [includeReadOnly](#includereadonly)
- [useReferenceIfArray](#usereferenceifarray)
- [useReferenceIfTargetUnset](#usereferenceiftargetunset)

#### deep

| Type    | `boolean` |
|---------|-----------|
| Default | `false`   |

An optional boolean dictating whether or not to perform a deep recursive merge. By default, only a simple shallow merge will be performed, and any properties in the source object with object or array values will be copied to the target by reference only.

This option may also be set using an alternative shorthand syntax whereby the value `true` is passed as the third parameter instead of `{deep: true}`.

##### Shallow merge (default behavior)
```js
const target = {};

const source = {
    foo: {},
    bar: false
};

merge(target, source);

assert.equal(target.foo, source.foo) // true
```

##### Example 2: Deep Merge
```js
const target = {};

const source = {
    foo: {},
    bar: false
};

merge(target, source, true); // or, merge(target, source, {deep: true});

assert.equal(target.foo, source.foo) // false
```

#### arrayStrategy

| Type    | `('PUSH', 'REPLACE')` |
|---------|-----------------------|
| Default | `'REPLACE'`           |

A string dictating the kind of array merge strategy to use when copying the values of one array into another. By default, arrays are merged using the `'REPLACE'` strategy, where each value in the source array overwrite the value of the same index in the target.

In certain configuration interfaces, where we are may wish to extend some base configuration with additional values, a `'PUSH'` strategy may be preferable. In this case, the values of the source array are pushed on to the target array, and no data is overwritten.

To avoid magic strings, the available values are available via the exported `ArrayStrategy` enum, via `ArrayStrategy.PUSH`, and `ArrayStrategy.REPLACE`.

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

#### errorMessage

| Type    | `(offending: string, suggestion: string) => string` |
|---------|-----------------------------------------------------|
| Default | `Message.MERGE_ERROR`                               |

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
function errorMessage(offender, suggestion = '') {
    return `[MyLibrary] Invalid POST option "${offender}"` + (suggestion ? `. Maybe you you meant "${suggestion}"?` : '');
}

// TypeError: [MyLibrary] Invalid POST option "cache". Maybe you meant "useCache"?
```

#### includeNonEnumerable

| Type    | `boolean` |
|---------|-----------|
| Default | `false`   |

An optional boolean dictating whether or not to copy non-enumerable properties on the source object to the target object.

##### Example 1: Skipping non-enumerable properties (default behavior)
```js
const target = {};
const source = {};

Object.defineProperty(source, 'foo', {
    value: 'Hello world!'
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
    value: 'Hello world!'
});

merge(target, source, {
    includeNonEnumerable: true
});

console.log(source.foo); // 'Hello world!'
console.log(target.foo); // 'Hello world!'
```

#### includeReadOnly

| Type    | `boolean` |
|---------|-----------|
| Default | `false`   |

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
    get() => {
        return this.firstName + this.lastName
    }
});

merge(target, source);

console.log(source.fullName); // 'Jill Kay'
console.log(target.foo); // 'undefined'
```

##### Example 2: Including read-only properties
```js
const target = {};
const source = {};

Object.defineProperty(source, 'foo', {
    value: 'Hello world!'
});

merge(target, source, {
    includeReadOnly: true
});

console.log(source.foo); // 'Hello world!'
console.log(target.foo); // 'Hello world!'
```

#### useReferenceIfArray

| Type    | `boolean` |
|---------|-----------|
| Default | `false`   |

An optional boolean dictating whether or not to copy nested arrays by reference, when performing a deep merge.

If set to `true`, the recursive merge will stop at any property who's value is an array, and copy it by reference to the target object.

This provides an efficient boundary between a defined configuration structure, and consumer-provided array values where reference will suffice, and avoids unnecessary recursion and enumeration.

##### Example 1: Deep copying nested arrays (default behavior)
```js
const target = {};

const source = {
    foo: ['Joe', 'Jill', 'Jim']
};

merge(source, target, true);

console.log(target.foo); // ['Joe', 'Jill', 'Jim']

assert.equal(target.foo, source.foo); // false
```

##### Example 2: Copying nested arrays by reference
```js
const target = {};

const source = {
    foo: ['Joe', 'Jill', 'Jim']
};

merge(source, target, {
    deep: true,
    useReferenceIfArray: true
});

console.log(target.foo); // ['Joe', 'Jill', 'Jim']

assert.equal(target.foo, source.foo); // true
```

#### useReferenceIfTargetUnset

| Type    | `boolean` |
|---------|-----------|
| Default | `false`   |

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

---

© 2017 Patrick Kunka / KunkaLabs Ltd
