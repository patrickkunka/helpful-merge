import IConfig from './Interfaces/IConfig';
import merge   from './merge';

class FluentMerge<T extends any> {
    private target: T = null;
    private sources: any[] = [];
    private config: IConfig|true = {};

    constructor(firstInstruction) {
        firstInstruction.bind(this);
    }

    /**
     * Supplies a "fluent merge" instance with a target object to merge into and return.
     *
     * @param  {any} target A target object to merge into.
     * @return {FluentMerge}
     */

    public to(target: T) {
        this.target = target;

        return this;
    }

    /**
     * Supplies a "fluent merge" instance with one or more source objects to merge from, in right to left order.
     *
     * @param  {...any} sources One or more source objects to merge from, supplied as individual parameters.
     * @return {FluentMerge}
     */

    public from(...sources: any[]) {
        this.sources = sources;

        return this;
    }

    /**
     * Supplies a "fluent merge" instance with a configuration object of one or more options.
     *
     * @param  {IConfig|true} options An optional configuration object.
     * @return {FluentMerge}
     */

    public with(options?: IConfig|true) {
        this.config = options;

        return this;
    }

    /**
     * Executes a "fluent merge" instance, merging all provided sources into the
     * target, as per any provided configuration, and returning a reference to
     * the target.
     *
     * @return {any}
     */

    public exec(): T {
        return this.sources.reduce((target, source) => merge(target, source, this.config), this.target || {});
    }
}

export default FluentMerge;