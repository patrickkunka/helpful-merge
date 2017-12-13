import IBestMatch         from './Interfaces/IBestMatch';
import IMergeErrorMessage from './Interfaces/IMergeMessage';

function handleMergeError(err: Error, target: any, offendingKey: string, message: IMergeErrorMessage) {
    // Rethrow if:
    // - offending key already exists on target
    // - object not sealed
    // - is extensible
    // - error not a TypeError

    if (
        Object.hasOwnProperty.call(target, offendingKey) ||
        !Object.isSealed(target) ||
        Object.isExtensible(target) ||
        !(err instanceof TypeError)
    ) throw err;

    const offendingKeyLower = offendingKey.toLowerCase();

    // Iterate through keys in target

    // For each key, compare with the offending key

    const bestMatch: IBestMatch = Object.keys(target).reduce((currBestMatch: IBestMatch, currKey: string) => {
        const totalMatching = getTotalMatching(currKey.toLowerCase(), offendingKeyLower);
        const delta = Math.abs(currKey.length - offendingKey.length);

        if (
            totalMatching > currBestMatch.totalMatching ||
            (totalMatching === currBestMatch.totalMatching && delta < currBestMatch.delta)
        ) {
            // If a greater number of matching characters, or the same
            // number, but a lesser delta, usurp the best match

            return {key: currKey, delta, totalMatching};
        }

        return currBestMatch;
    }, {key: '', delta: Infinity, totalMatching: 0});

    const suggestion = bestMatch && bestMatch.totalMatching > 1 ? bestMatch.key : '';

    throw new TypeError(message(offendingKey, suggestion));
}

/**
 * Returns the number of common, consecutive characters
 * between two strings.
 */

export function getTotalMatching(possibleKey: string, offendingKey: string): number {
    const longer: string = possibleKey.length > offendingKey.length ? possibleKey : offendingKey;
    const shorter: string = longer === possibleKey ? offendingKey : possibleKey;

    let leftPointer = 0;
    let leftInnerPointer = 0;
    let leftTotalMatching = 0;
    let lastCommonIndex = -1;

    for (; leftPointer < longer.length; leftPointer++) {
        while (
            leftTotalMatching === 0 &&
            longer[leftPointer] !== shorter[leftInnerPointer] &&
            leftInnerPointer < shorter.length
        ) {
            // No match at present, move innerPointer through all possible
            // indices until a match is found

            leftInnerPointer++;
        }

        if (longer[leftPointer] === shorter[leftInnerPointer]) {
            // Match found

            if (lastCommonIndex !== leftPointer - 1) {
                // If beginning of a new match, reset total common

                leftTotalMatching = 0;
            }

            lastCommonIndex = leftPointer;
            leftTotalMatching++;
            leftInnerPointer++;

            // Whole word matched, end

            if (leftTotalMatching === shorter.length) break;
        } else if (leftTotalMatching > 1) {
            // No match, but at least two common characters found, end

            break;
        } else {
            // No match at this index, reset

            leftTotalMatching = leftInnerPointer = 0;
        }
    }

    lastCommonIndex = -1;

    let rightPointer = 0;
    let rightInnerPointer = 0;
    let rightTotalMatching = 0;

    const longerLastIndex = longer.length - 1;
    const shorterLastIndex = shorter.length - 1;

    // As above, but from right to left

    for (; rightPointer < longer.length - leftPointer; rightPointer++) {
        while (
            rightTotalMatching === 0 &&
            longer[longerLastIndex - rightPointer] !== shorter[shorterLastIndex - rightInnerPointer] &&
            rightInnerPointer < shorter.length
        ) {
            rightInnerPointer++;
        }

        if (longer[longerLastIndex - rightPointer] === shorter[shorterLastIndex - rightInnerPointer]) {
            if (lastCommonIndex !== rightPointer - 1) rightTotalMatching = 0;

            lastCommonIndex = rightPointer;
            rightTotalMatching++;
            rightInnerPointer++;
        } else if (rightTotalMatching > 1) {
            break;
        } else {
            rightTotalMatching = rightInnerPointer = 0;
        }
    }

    return Math.min(shorter.length, leftTotalMatching + rightTotalMatching);
}

export default handleMergeError;