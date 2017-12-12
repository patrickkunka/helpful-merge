export const MERGE_ERROR = (offender: string, suggestion: string = ''): string => {
    return `Unknown property "${offender}"` + (suggestion ? `. Did you mean "${suggestion}"?` : '');
};

export const TYPE_ERROR_TARGET = (target: any): string => {
    return `[Helpful Merge] Target "${target}" must be a valid object`;
};

export const TYPE_ERROR_SOURCE = (source: any): string => {
    return `[Helpful Merge] Source "${source}" must be a valid object`;
};

export const INVALID_ARRAY_STRATEGY = (strategy: any): string => {
    return `[Helpful Merge] Invalid array strategy "${strategy}"`;
};