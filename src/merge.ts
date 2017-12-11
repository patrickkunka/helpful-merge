import Config        from './Config';
import errorHandler  from './errorHandler';
import * as Messages from './Messages';

function merge(target: any, source: any, options: any = {}): any {
    let sourceKeys: string[] = [];
    let config: Config;

    if (options instanceof Config) {
        config = options;
    } else {
        config = new Config();
    }

    if (typeof options === 'boolean') {
        config.deep = true;
    } else if (options && typeof options === 'object') {
        Object.assign(config, options);
    }

    if (!target || typeof target !== 'object') {
        throw new TypeError(Messages.TYPE_ERROR(target.toString()));
    }

    if (Array.isArray(source)) {
        for (let i = 0; i < source.length; i++) {
            sourceKeys.push(i.toString());
        }
    } else if (source) {
        sourceKeys = Object.keys(source);
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
            (Array.isArray(source) && !config.mergeArrays)
        ) {
            // - Shallow merge
            // - All non-object primatives
            // - Null pointers
            // - Arrays if `mergeArray` disabled

            try {
                target[key] = source[key];
            } catch (err) {
                errorHandler(err, target, config.errorMessage);
            }
        } else {
            // Deep merge objects/arrays

            if (!target[key] && !config.cloneAtLeaf) {
                // Target property is null or undefined (a leaf), source property
                // is an object, if `cloneAtLeaf` is disabled, assign
                // by reference only and do not clone.

                try {
                    target[key] = source[key];
                } catch (err) {
                    errorHandler(err, target, config.errorMessage);
                }

                continue;
            }

            if (!Object.prototype.hasOwnProperty.call(target, key) || target[key] === null) {
                // If property does not exist on target, instantiate an empty
                // object or array to merge into

                target[key] = Array.isArray(source[key]) ? [] : {};
            }

            // Recursively deep copy objects or arrays

            merge(target[key], source[key], config);
        }
    }

    return target;
}

export default merge;