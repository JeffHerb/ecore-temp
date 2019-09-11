define([], function() {

    var _priv = {};

    // Function that will continue to loop up the document parent chain until it reaches body or stop selector is true
    var getFirst = function(dSource, sSelector) {

        if (!dSource || (dSource && dSource.nodeType !== 1)) {

            journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'findParent', func: 'getFirst' }, 'Invalid starting source element specified');

            return false;
        }

        var dParent = dSource.parentNode;

        while (true) {

            // Double check we havent already reached the top of the DOM.
            if (dParent.nodeName === "BODY") {
                return false;
            }

            // Check to see if the selector provided matches
            if (dParent.matches(sSelector)) {

                return dParent;
            }
            else {

                dParent = dParent.parentNode;
            }
            
        }

    };

    return {
        getFirst: getFirst
    };

});