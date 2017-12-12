import ArrayStrategy      from './Constants/ArrayStrategy';
import IConfig            from './Interfaces/IConfig';
import IMergeErrorMessage from './Interfaces/IMergeMessage';
import * as Messages      from './Messages';

class Config implements IConfig {
    public deep:                        boolean       = false;
    public useReferenceIfTargetUnset:   boolean       = false;
    public useReferenceIfArray:         boolean       = false;
    public includeReadOnly:             boolean       = false;
    public includeNonEmurable:          boolean       = false;
    public arrayStrategy:               ArrayStrategy = ArrayStrategy.REPLACE;

    public errorMessage: IMergeErrorMessage = Messages.MERGE_ERROR;

    constructor() {
        Object.seal(this);
    }
}

export default Config;