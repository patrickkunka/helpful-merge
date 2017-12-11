export const MERGE_ERROR = (offender: string, suggestion: string = ''): string => {
    return `Unknown property "${offender}"` + (suggestion ? ` Did you mean "${suggestion}"?` : '');
};

export const TYPE_ERROR = (target: string): string => {
    return `[Helpful Merge] Target "${target}" must be a valid object`;
};