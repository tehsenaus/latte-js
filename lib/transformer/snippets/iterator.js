var ITERATOR = __iterator(ITERABLE);
while (true) {
    var VALUE;
    try {
        VALUE = ITERATOR.next();
    } catch (e) {
        if (e === StopIteration)
            break;
        throw e;
    }
    BODY;
}