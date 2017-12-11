import ArrayStrategy      from './Constants/ArrayStrategy';
import IMergeErrorMessage from './Interfaces/IMergeMessage';
import * as Messages      from './Messages';

class Config {
    public deep:                boolean       = false;
    public cloneAtLeaf:         boolean       = false;
    public includeReadOnly:     boolean       = false;
    public includeNonEmurable:  boolean       = false;
    public mergeArrays:         boolean       = true;
    public arrayStrategy:       ArrayStrategy = ArrayStrategy.REPLACE;

    public errorMessage: IMergeErrorMessage = Messages.MERGE_ERROR;

    constructor() {
        Object.seal(this);
    }
}

export default Config;