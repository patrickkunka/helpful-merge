import IMergeErrorMessage from './Interfaces/IMergeMessage';

function errorHandler(err: Error, target: any, message: IMergeErrorMessage) {
    // This expression will match the following error messages:
    // - 'Cannot add property foo, object is not extensible' (V8)
    // - 'can't define property "foo": Object is not extensible' (Rhino)

    const re = /property "?(\w*)"?[,:] object/i;

    let matches: RegExpExecArray = null;

    // If error is not a `TypeError`, or does not match the expression above,
    // rethrow it

    if (!(err instanceof TypeError) || !(matches = re.exec(err.message))) throw err;

    const keys: string[] = Object.keys(target);
    const offender: string = matches[1].toLowerCase();

    // Iterate trough all keys in the target object, checking
    // for a "best match" based on most number of like characters
    // insensitive of case

    const bestMatch = keys.reduce((lastBestMatch: string, key: string) => {
        let charIndex = 0;

        while (
            charIndex < offender.length &&
            offender.charAt(charIndex) === key.charAt(charIndex).toLowerCase()
        ) charIndex++;

        return charIndex > lastBestMatch.length ? key : lastBestMatch;
    }, '');

    throw new TypeError(message(matches[1], bestMatch));
}

export default errorHandler;