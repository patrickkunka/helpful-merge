import IConfig from './Interfaces/IConfig';
import merge   from './merge';

class FluentMerge<T extends any> {
    private target: T = null;
    private sources: any[] = [];
    private config: IConfig|true = {};

    constructor(firstInstruction) {
        firstInstruction.bind(this);
    }

    public to(target: T) {
        this.target = target;

        return this;
    }

    public from(...sources: any[]) {
        this.sources = sources;

        return this;
    }

    public with(options?: IConfig|true) {
        this.config = options;

        return this;
    }

    public return(): T {
        return this.sources.reduce((target, source) => merge(target, source, this.config), this.target || {});
    }
}

export default FluentMerge;