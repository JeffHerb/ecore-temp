define([], function() {

    var cleanupID = function(id) {

        var returnID = id;

        if (id.indexOf('.') !== -1 || id.indexOf('#') !== -1) {

            // check for class css character
            if (returnID.indexOf('.') !== -1) {

                returnID = returnID.replace(/\./g, '');
            }

            // check for id css character
            if (returnID.indexOf('#') !== -1) {

                returnID = returnID.replace(/\#/g, '');
            }
        }

        if (returnID !== id) {
            journal.log({ type: 'error', owner: 'DEV|FW', module: 'processMap', func: 'formMap' }, 'Form created with a dangerous id (' + id + ')! It is not recommmended to create form id\'s that contain special characters used by CSS selectors. It is highly recommended you rename this control if possible.');
        }

        return returnID;
    };

    var arrayEqual = function(arr1, arr2) {
        if (arr1.length !== arr2.length)
            return false;
        for (var i = arr1.length; i--;) {
            if (arr1[i] !== arr2[i])
                return false;
        }

        return true;
    };

    return {
        arrayEqual: arrayEqual,
        cleanupID: cleanupID
    };

});
