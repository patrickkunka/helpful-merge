import FluentMerge from '../FluentMerge';
import IConfig from './IConfig';

interface IMerge<T extends any> {
    (target: T, source: any, options?: (IConfig|true)): T;
    from: (...sources: any[]) => FluentMerge<T>;
    to: (target: T) => FluentMerge<T>;
    with: (options: (IConfig|true)) => FluentMerge<T>;
}

export default IMerge;