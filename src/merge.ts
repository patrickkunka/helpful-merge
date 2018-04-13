import Config           from './Config';
import ArrayStrategy    from './Constants/ArrayStrategy';
import FluentMerge      from './FluentMerge';
import handleMergeError from './handleMergeError';
import IConfig          from './Interfaces/IConfig';
import IMerge           from './Interfaces/IMerge';
import * as Messages    from './Messages';

function merge<T extends any>(target: T, source: any, options: (IConfig|true) = null): T {
    let sourceKeys: string[] = [];
    let config: Config;

    if (options instanceof Config) {
        config = options;
    } else {
        config = new Config();
    }

    if (typeof options === 'boolean' && options === true) {
        config.deep = true;
    } else if (options && config !== options && typeof options === 'object') {
        merge(config, options);

        if ([ArrayStrategy.PUSH, ArrayStrategy.REPLACE].indexOf(config.arrayStrategy) < 0) {
            throw RangeError(Messages.INVALID_ARRAY_STRATEGY(config.arrayStrategy));
        }
    }

    if (!target || typeof target !== 'object') {
        throw new TypeError(Messages.TYPE_ERROR_TARGET(target));
    }

    if (!source || typeof source !== 'object') {
        throw new TypeError(Messages.TYPE_ERROR_SOURCE(source));
    }

    if (Array.isArray(source)) {
        if (config.arrayStrategy === ArrayStrategy.PUSH) {
            // Merge arrays via push()

            target.push(...source);

            return target;
        }

        for (let i = 0; i < source.length; i++) {
            sourceKeys.push(i.toString());
        }
    } else {
        sourceKeys = Object.getOwnPropertyNames(source);
    }

    for (const key of sourceKeys) {
        const descriptor = Object.getOwnPropertyDescriptor(source, key);

        // Skip read-only properties

        if (typeof descriptor.get === 'function' && !descriptor.set && !config.includeReadOnly) continue;

        // Skip non-enumerable properties

        if (!descriptor.enumerable && !config.includeNonEmurable) continue;

        if (
            !config.deep ||
            typeof source[key] !== 'object' ||
            source[key] === null ||
            (Array.isArray(source[key]) && config.useReferenceIfArray) ||
            (!target[key] && config.useReferenceIfTargetUnset)
        ) {
            // If:
            // - Shallow merge
            // - All non-object primatives
            // - Null pointers
            // - Arrays, if `useReferenceIfArray` set
            // - Target prop null or undefined and `useRererenceIfTargetUnset` set

            try {
                target[key] = source[key];
            } catch (err) {
                handleMergeError(err, target, key, config.errorMessage);
            }
        } else {
            // Deep merge objects/arrays

            if (!Object.prototype.hasOwnProperty.call(target, key) || target[key] === null) {
                // If property does not exist on target, instantiate an empty
                // object or array to merge into

                try {
                    target[key] = Array.isArray(source[key]) ? [] : {};
                } catch (err) {
                    handleMergeError(err, target, key, config.errorMessage);
                }
            }

            // Recursively deep copy objects or arrays

            merge(target[key], source[key], config);
        }
    }

    return target;
}

(merge as IMerge<any>).from = () => new FluentMerge(FluentMerge.prototype.from);
(merge as IMerge<any>).to = () => new FluentMerge(FluentMerge.prototype.to);
(merge as IMerge<any>).with = () => new FluentMerge(FluentMerge.prototype.with);

export default merge as IMerge<any>;