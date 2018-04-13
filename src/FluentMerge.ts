import IConfig from './Interfaces/IConfig';
import merge   from './merge';

class FluentMerge<T = any> {
    private target: T = null;
    private sources: any[] = [];
    private config: IConfig|true = {};

    /**
     * Supplies a fluent merge instance with a target object to merge into and return.
     */

    public to(target: T): FluentMerge {
        this.target = target;

        return this;
    }

    /**
     * Supplies a fluent merge instance with one or more source objects to merge from, in right to left order.
     */

    public from(...sources: any[]): FluentMerge {
        this.sources = sources;

        return this;
    }

    /**
     * Supplies a fluent merge instance with a configuration object of one or more options.
     */

    public with(options?: IConfig|true): FluentMerge {
        this.config = options;

        return this;
    }

    /**
     * Executes a fluent merge instance, merging all provided sources into the
     * target, as per any provided configuration, and returning a reference to
     * the target.
     */

    public exec(): T {
        return this.sources.reduce((target, source) => merge(target, source, this.config), this.target || {});
    }
}

export default FluentMerge;