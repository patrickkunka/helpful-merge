import IMergeErrorMessage from './Interfaces/IMergeMessage';

interface IBestMatch {
    key: string;
    totalMatching: number;
}

function handleMergeError(err: Error, target: any, offendingKey: string, message: IMergeErrorMessage) {
    // Rethrow if:
    // - offending key already exists on target
    // - object not sealed
    // - is extensible
    // - error not a TypeError

    if (
        Object.hasOwnProperty.call(target, offendingKey) ||
        !Object.isSealed ||
        Object.isExtensible ||
        !(err instanceof TypeError)
    ) throw err;

    // Iterate through keys in target

    // For each key, count the most number of matching characters from start and end
    // The key with the highest number wins

    const bestMatch: IBestMatch = Object.keys(target).reduce((currBestMatch: IBestMatch, currKey: string) => {
        const totalMatching = getTotalMatching(currKey, offendingKey);

        return (totalMatching > currBestMatch.totalMatching) ? {key: currKey, totalMatching} : currBestMatch;
    }, null);

    const suggestion = bestMatch ? bestMatch.key : '';

    throw new TypeError(message(offendingKey, suggestion));
}

/**
 * Returns the number of common, consecutive characters
 * between two strings.
 */

function getTotalMatching(possibleKey: string, offendingKey: string): number {
    return 0;
}

export default handleMergeError;