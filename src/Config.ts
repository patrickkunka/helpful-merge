import ArrayStrategy from './Constants/ArrayStrategy';

class Config {
    public deep:                boolean       = false;
    public cloneAtLeaf:         boolean       = false;
    public includeReadOnly:     boolean       = false;
    public includeNonEmurable:  boolean       = false;
    public mergeArrays:         boolean       = true;
    public arrayStrategy:       ArrayStrategy = ArrayStrategy.REPLACE;

    constructor() {
        Object.seal(this);
    }

    public errorMessage(offender, suggestion) {
        return `Invalid option "${offender}"` + (suggestion ? ` Did you mean "${suggestion}"?` : '');
    }
}

export default Config;