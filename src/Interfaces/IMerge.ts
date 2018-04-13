import FluentMerge from '../FluentMerge';
import IConfig from './IConfig';

interface IMerge<T extends any> {
    /**
     * Merges the properties of a source object into a target object.
     *
     * @param  {any}          target  The target object to be merged into.
     * @param  {any}          source  The source object containing the properties to be copied.
     * @param  {IConfig|true} options An optional configuration object, or `true` as a shorthand for `{deep: true}`.
     * @return {any}          A reference to the modified target object.
     */

    (target: T, source: any, options?: (IConfig|true)): T;

    /**
     * Supplies a "fluent merge" instance with one or more source objects to merge from, in right to left order.
     *
     * @param  {...any} sources One or more source objects to merge from, supplied as individual parameters.
     * @return {FluentMerge}
     */

    from: (...sources: any[]) => FluentMerge<T>;

    /**
     * Supplies a "fluent merge" instance with a target object to merge into and return.
     *
     * @param  {any} target A target object to merge into.
     * @return {FluentMerge}
     */

    to: (target: T) => FluentMerge<T>;

    /**
     * Supplies a "fluent merge" instance with a configuration object of one or more options.
     *
     * @param  {IConfig|true} options An optional configuration object.
     * @return {FluentMerge}
     */

    with: (options: (IConfig|true)) => FluentMerge<T>;
}

export default IMerge;