import Config from './Config';

function merge(target: any, source: any, options: any = {}): any {
    const config: Config = options instanceof Config ? options : Object.assign(new Config(), options);

    let sourceKeys: string[] = [];

    if (!target || typeof target !== 'object') {
        throw new TypeError(`[Helpful Merge] Target "${target.toString()}" must be a valid object`);
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

            target[key] = source[key];
        } else {
            // Deep merge objects/arrays

            if (!target[key] && !config.cloneAtLeaf) {
                // Target property is null or undefined (a leaf), source property
                // is an object, if `cloneAtLeaf` is disabled, assign
                // by reference only and do not clone.

                target[key] = source[key];

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