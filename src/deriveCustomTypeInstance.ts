function deriveCustoTypeInstance({constructor}: any): any {
    if (typeof constructor === 'function' && constructor !== Object) {
        return new constructor();
    }

    return {};
}

export default deriveCustoTypeInstance;