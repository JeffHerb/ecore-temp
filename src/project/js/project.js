require(['jquery', 'cui', 'emp', 'domReady!'], function ($, cui, empImport) {

    var cuiInitParams = {
        optIns:{
            iOSFix: true,
        },
    };

    // Init Core UI First
    cui.init(cuiInitParams, function () {

        // Make `emp` a global object
        if (!window.emp) {
            window.emp = empImport;
        }
        // Copy properties from the global `emp` object that was created by grunt-concat into our "real" emp object that we've imported via RequireJS
        else {
            // Currently the only property we use is `version` so we'll just check for that specifically. If we add more, we could loop through window.emp's properties and add them all to empImport. (CP 05/04/2016)
            if (window.emp.version) {
                empImport.version = window.emp.version;
            }

            // Replace the global `emp` object with our "real" version now that it has all of the properties in place
            window.emp = empImport;
        }

        // Initialize the `emp` module
        if (window.fwData) {
            empImport.init();
        }
    });
});
