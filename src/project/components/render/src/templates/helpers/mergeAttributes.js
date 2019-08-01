// Create the attribute helper
Handlebars.registerHelper('mergeAttributes', function(context, options) {

    // Pull the default JSON object
    if (options !== undefined) {

        var defaults = (options.hash && options.hash.defaults) ? options.hash.defaults : {};
        var extend = (options.hash && options.hash.extend) ? options.hash.extend : {};
        var dynamics = (options.hash && options.hash.dynamics) ? options.hash.dynamics : [];
        var skipAttributes = (options.hash && options.hash.skipAttributes) ? options.hash.skipAttributes : false;
        var suppressClasses = (options.hash && options.hash.suppressClasses) ? options.hash.suppressClasses : false;

    } else {

        var defaults = {};
        var extend = {};
        var dynamics = {};
    }

    var temp = {};

    // Merge the objects
    function merge(obj1, obj2) {

        var temp = obj1 || {};

        // Loop through all of the passed objects
        for (var p in obj2) {

            // Check to see if the defaults are in the passed settings
            if (temp.hasOwnProperty(p)) {

                // Alway override on id
                if (p === "id") {

                    temp[p] = obj2[p]
                }
                if (p === "size") {
                    temp[p] = temp[p];
                }
                else {

                    if (typeof obj2[p] === "string" && typeof temp[p] === "string") {

                        var classes = obj2[p].split(' ');

                        for (var c = 0, len = classes.length; c < len; c++) {

                            if (temp[p].indexOf(classes[c]) === -1) {
                                temp[p] += " " + classes[c];
                            }
                        }

                    }
                    else {

                        temp[p] = obj2[p];
                    }
                }

                //break;

            } else {

                if(p.indexOf('data-') !== -1) {
                    if (typeof obj2[p] === "object") {
                        temp[p] = JSON.stringify(obj2[p]);
                    }
                }

                // Defaults dont have the passes setting so add.
                temp[p] = obj2[p];

            }


        }

        return temp;

    };

    // Function to add attribute formats to elements
    function addDefaultAttributes(type, value) {

        if (temp.hasOwnProperty(type)) {

            temp[type] += " " + value;

        } else {
            temp[type] = value;
        }

    };

    // Check to see if the templated call included a default option. If so lets make sure that its in a stringified json format
    if (defaults.constructor === String) {

        try {

            defaults = JSON.parse(defaults);

        } catch(e) {

            console.log("Failed to change the defaults object into a JSON do to a JSON parse error");

        }

    }

    // Now try to make the extend object and object as handlebars templates are strings
    if (extend.constructor === String) {

        try {

            extend = JSON.parse(extend);

            if (Object.keys(extend).length) {

                defaults = merge(defaults, extend);
            }


        } catch(e) {

            console.log("Failed to change the extend object into a JSON do to a JSON parse error");

        }

    } else if (extend.constructor === Object) {

        if (Object.keys(extend).length) {
            defaults = merge(defaults, extend);
        }
    }

    // Merge the data sets
    defaults = merge(defaults, context);

    // Check to see if the skip attribute was provided
    if (skipAttributes) {

        var keys = skipAttributes.split(',');

        for (var i = 0, len = keys.length; i < len; i++) {

            if (defaults[keys[i]]) {

                delete defaults[keys[i]];
            }
        }
    }

    if (suppressClasses && defaults.className) {

        var scl = suppressClasses.split(',');

        if (scl.length) {

            for (var s = 0, sLen = scl.length; s < sLen; s++) {

                if (defaults.className.indexOf(scl[s]) !== -1) {
                    defaults.className = defaults.className.replace(scl[s], '');
                }

            }

        }

    }

    // Return the raw set
    return defaults;


});
