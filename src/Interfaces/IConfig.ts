import ArrayStrategy      from '../Constants/ArrayStrategy';
import IMergeErrorMessage from './IMergeMessage';

interface IConfig {
    deep?:                      boolean;
    useReferenceIfTargetUnset?: boolean;
    useReferenceIfArray?:       boolean;
    includeReadOnly?:           boolean;
    includeNonEmurable?:        boolean;
    arrayStrategy?:             ArrayStrategy;
    errorMessage?:              IMergeErrorMessage;
}

export default IConfig;