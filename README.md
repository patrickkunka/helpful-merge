# Helpful Merge

A highly-configurable merge implementation with helpful error handling for validating consumer-provided input against configuration interfaces at runtime.

Perfect for creating robust and helpful entry points for JavaScript libraries and APIs.

Helpful Merge also includes efficient and customizable implementations of deep recursive merge, array merge, and more.

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

Unlike `Object.assign()` however, Helpful Merge will only merge one source object into one target object at a time, as its third parameter is reserved for an optional configuration object (see options).

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

const config = Object.assign(new Config(), consumerOptions);
```

When the consumer provides an option not defined in the config class, a type error will be thrown:

```js
const myWidget = new Widget({option3: 50}); // TypeError: Cannot add property option3, object is not extensible
```

Unfortunately, this message is not particularly helpful, and particularly unhelpful for novice developers who may not understand the concept of extensibility. There is where Helpful Merge comes in.

We can replace `Object.assign()` in the above example with Helpful Merge's merge implementation, which provides a helpful and customizable error message with a suggestion of the closest matching property name on the target object:

```js
import merge from 'helpful-merge';

...

const config = merge(new Config(), consumerOptions); // TypeError: Unknown property "option3". Did you mean "option2"?
```

This provides an easy means of catching typos, incorrect casings, or API version mismatches, which in turn provides a great developer experience for consumers of your library or API.

## Options

The `merge()` function accepts an optional third parameter of configuration options with the following defaults:

```js
{
    deep: false,
    useReferenceIfTargetUnset: false,
    useReferenceIfArray: false,
    includeReadOnly: false
    includeNonEnumerable: false,
    arrayStrategy: ArrayStrategy.REPLACE,
    errorMessage: Messages.MERGE_ERROR
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

---

© 2017 Patrick Kunka / KunkaLabs Ltd
