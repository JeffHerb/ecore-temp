define(['utils'], function(utils) {

    var _priv = {};

    _priv.elementParent = function _element_parent(startElem, searchClass) {

        var stopLoop = false;
        var foundTarget = false;
        var currentElem = startElem;

        while (!stopLoop) {

            currentElem = currentElem.parentNode;

            if (currentElem.nodeName !== "BODY") {

                if (currentElem.classList.contains(searchClass)) {
                    stopLoop = true;
                    foundTarget = true;
                }
            }
            else {
                stopLoop = true;
            }

        }

        if (foundTarget) {
            return currentElem;
        }

        return false;
    };

    // Common function to pull values from DOM elements
    _priv.getElemValue = function _get_elem_value(elmField) {

        var value = false;

        switch (elmField.nodeName) {

            case 'INPUT':
            case 'TEXTAREA':
            case 'SELECT':

                value = elmField.value;
                break;

            // Catch all none input field types
            default:

                value = elmField.innerText;
                break;
        }

        return value;
    };

    // Common function to lookup DOM elements be ID
    _priv.lookupFieldValue = function _lookup_field(fieldID) {

        // See if we can find a field with a given id
        var elmField = document.getElementById(fieldID);

        if (elmField) {

            return _priv.getElemValue(elmField);
        }
        else {

            return false;
        }

    };

    // Common function to get the source value
    _priv.findSourceValue = function _find_source_value(src) {

        // Convert numbers to string
        if (typeof src === "number") {
            src = src.toString();
        }

        // Check for static indicators
        if (src.indexOf(':strict:') !== -1) {

            // Remove strict hook from static value
            src = src.replace(':strict:', '');

            if (src.indexOf('/s') !== -1) {
                src = src.replace(/\/s/g, ' ');
            }

            return src;
        }
        else {

            var lookupValue = _priv.lookupFieldValue(src);

            if (lookupValue !== false) {

                if (src.indexOf('/s') !== -1) {
                    src = src.replace(/\/s/g, ' ');
                }

                return lookupValue;
            }
            else {

                journal.log({ type: 'warning', owner: 'UI', module: 'process', func: 'valueMap' }, 'Unable to find source field or text (' + src + '), defaulting value too: ' + src);

                if (src.indexOf('/s') !== -1) {
                    src = src.replace(/\/s/g, ' ');
                }

                return src;
            }
        }

    };

    // Common function to place values into dest fields
    /*
     *  Object structure
     *      {
     *          dest: DOM Element,
     *          src: Actual Value (string)
     *      }
     */
    _priv.executeFieldMap = function _execute_field_map(map) {

        for (var i = 0, len = map.length; i < len; i++) {

            var oMap = map[i];

            try {

                var parentRoot = false;
                var inputDataStore = false;

                switch(oMap.dest.nodeName) {

                    case "INPUT":

                        var type = oMap.dest.getAttribute('type');

                        if (type === "checkbox" || type === "radio") {

                            parentRoot = _priv.elementParent(oMap.dest, 'emp-field');
                            inputDataStore = emp.ds.getStore(parentRoot.getAttribute('data-store-id'));

                            if (inputDataStore) {

                                // Check to see if the check and uncheck values are defined
                                if (inputDataStore.input && inputDataStore.input.checkValue && inputDataStore.input.uncheckValue) {

                                    if (inputDataStore.input.checkValue === oMap.src) {

                                        oMap.dest.checked = true;
                                    }
                                    else if (inputDataStore.input.uncheckValue === oMap.src) {

                                        oMap.dest.checked = false;
                                    }

                                }
                                else if (oMap.src === ":check" || oMap.src === ":check:" || oMap.src === ":uncheck" || oMap.src === ":uncheck:") {

                                    if (oMap.src === ":check" || oMap.src === ":check:") {

                                        oMap.dest.checked = true;
                                    }
                                    else if (oMap.src === ":uncheck" || oMap.src === ":uncheck:") {

                                        oMap.dest.checked = false;
                                    }

                                }

                            }

                        }
                        else {

                            oMap.dest.value = oMap.src;
                        }

                        break;

                    case "SELECT":

                        var options = oMap.dest.options;

                        // Loop and remove any currently selected option
                        for (var o = 0, oLen = options.length; o < oLen; o++) {

                            if (options[o].hasAttribute("selected")) {
                                options[o].removeAttribute("selected");
                            }
                        }

                        oMap.dest.value = oMap.src;
                        break;

                    case "TEXTAREA":

                        oMap.dest.value = oMap.src;
                        break;

                    case "I":

                        parentRoot = _priv.elementParent(oMap.dest, 'emp-field');
                        inputDataStore = emp.ds.getStore(parentRoot.getAttribute('data-store-id'));

                        if (inputDataStore) {

                            // Check to see if the check and uncheck values are defined
                            if (inputDataStore.input && inputDataStore.input.checkValue && inputDataStore.input.uncheckValue) {

                                if (inputDataStore.input.checkValue === oMap.src) {

                                    oMap.dest.classList.remove("emp-icon-stop");
                                    oMap.dest.classList.add("emp-icon-redcheck");
                                }
                                else if (inputDataStore.input.uncheckValue === oMap.src) {

                                    oMap.dest.classList.remove("emp-icon-redcheck");
                                    oMap.dest.classList.add("emp-icon-stop");
                                }

                            }
                            else if (oMap.src === ":check" || oMap.src === ":check:" || oMap.src === ":uncheck" || oMap.src === ":uncheck:") {

                                if (oMap.src === ":check" || oMap.src === ":check:") {

                                    oMap.dest.classList.remove("emp-icon-stop");
                                    oMap.dest.classList.add("emp-icon-redcheck");
                                }
                                else if (oMap.src === ":uncheck" || oMap.src === ":uncheck:") {

                                    oMap.dest.classList.remove("emp-icon-redcheck");
                                    oMap.dest.classList.add("emp-icon-stop");
                                }

                            }

                        }

                        break;

                    default:

                        oMap.dest.innerText = oMap.src;
                        break;

                }

                journal.log({ type: 'info', owner: 'UI', module: 'process', func: 'executeFieldMap' }, 'Setting input ' + oMap.dest.id + ' to:', (oMap.src !== "") ? oMap.src : ":empty-string:");

            }
            catch (e) {

                journal.log({ type: 'error', owner: 'UI', module: 'process', func: 'executeFieldMap' }, 'Unable to set destination value or text for:', (oMap.src !== "") ? oMap.src : ":empty-string:");

                return false;
            }

        }

        return true;
    };

    _priv.executeQueryMap = function _execute_query_map(map) {

        var qs = false;

        for (var i = 0, len = map.length; i < len; i++) {

            if (qs) {
                qs += "&" + map[i].dest + "=" + map[i].src;
            }
            else {
                qs = "?" + map[i].dest + "=" + map[i].src;
            }

        }

        return qs;
    };

    // This function is used when we need to preform a process mapping without the existance of a form target.
    var directMap = function _direct_map(destSrc, settings) {

        // New map
        var map = [];
        var tableRef = false;
        var tableColumnValues = false;

        if (settings && settings.tableSrc) {

            // Get ride of the jQuery reference!
            if (settings.tableSrc instanceof jQuery) {

                settings.tableSrc = settings.tableSrc[0];
            }

            // Get the id
            var tableID = settings.tableSrc.getAttribute('id');

            if (emp.reference.tables[tableID]) {

                tableRef = emp.reference.tables[tableID];
                tableColumnValues = tableRef.getCheckedColumnValues();
            }
            else {

                console.log("ERROR NO TABLE IN REFERNECE");
            }
        }

        for (var dest in destSrc) {

            var finalValue = false;

            // Get the destination location
            var finalDest = document.querySelector('#' + dest);

            // See if we found the destination elem
            if (finalDest) {

                if (settings && settings.tableSrc) {

                    // Remove 1 from the index as values are passed starting at 1 not 0
                    var tableColumn = destSrc[dest] - 1;

                    finalValue = _priv.findSourceValue(tableColumnValues[tableColumn]);
                }
                else {

                    finalValue = _priv.findSourceValue(destSrc[dest]);
                }

                map.push({ "dest": finalDest, "src": finalValue });

                // check for a display example
                var finalDestDisplay = document.querySelector('#' + dest + '_DISPLAY');

                if (finalDestDisplay) {
                    map.push({ "dest": finalDestDisplay, "src": finalValue });
                }
            }
            else {

                console.log("Destination provided is invalid");
            }
        }

        if (map.length) {

            // Execute the field map
            return _priv.executeFieldMap(map);
        }

        return true;
    };

    // This function is used for mapping related directly to forms
    var formMap = function _value_map(form, destSrc) {

        var map = [];

        form = document.getElementById(form.id);

        if (typeof destSrc === "object") {

            // Loop throught the dest source map
            for (var dest in destSrc) {

                // Get the current source value/field name
                var src = destSrc[dest];

                // Store the dest ids just in case
                var destID = dest;

                destID = utils.cleanupID(destID);

                // Try and find the dest location
                if (form) {
                    dest = form.querySelector('#' + destID);
                }
                else {
                    dest = document.getElementById(destID);
                }

                if (dest) {

                    // Validate the source value
                    if (typeof src === "string" || typeof src == undefined || typeof src === "boolean" || typeof src === "number") {

                        if (typeof src === "string") {

                            src = _priv.findSourceValue(src);

                        }
                        else if (typeof src === "number") {
                            src = src.toString();
                        }
                        else if (src === undefined) {

                            src = "";
                            journal.log({ type: 'warning', owner: 'UI', module: 'process', func: 'valueMap' }, 'Source value is undefined, defaulting to a empty string');
                        }

                        // Add the map object
                        map.push( {dest: dest, src: src}) ;
                    }
                    else {

                        journal.log({ type: 'error', owner: 'UI', module: 'process', func: 'valueMap' }, 'Failed on invalid source type in destSrc map for:', destID);

                        return false;
                    }
                }
                else {

                    journal.log({ type: 'error', owner: 'UI', module: 'process', func: 'valueMap' }, 'Process map included a dest field (' + destID + ') that does not exist on the DOM.');

                    return false;
                }

            }

            // Check to see if map has something to process
            if (map.length) {

                _priv.executeFieldMap(map);
            }
            else {

                journal.log({ type: 'info', owner: 'UI', module: 'process', func: 'valueMap' }, 'Process map resulted in an empty end map.');
            }

            return true;
        }
        else {

            journal.log({ type: 'error', owner: 'UI', module: 'process', func: 'valueMap' }, 'Value map failed because passed argument was not an object');
        }

        return false;

    };

    var queryString = function(destSrc) {

        var map = [];

        if (typeof destSrc === "object") {

            // Loop throught the dest source map
            for (var dest in destSrc) {

                // Get the current source value/field name
                var src = destSrc[dest];

                // Store the dest ids just in case
                var destID = dest;

                // Validate the source value
                if (typeof src === "string" || typeof src == undefined || typeof src === "boolean") {

                    if (typeof src === "string") {

                        src = _priv.findSourceValue(src);
                    }
                    else if (src === undefined) {

                        src = "";
                        journal.log({ type: 'warning', owner: 'UI', module: 'process', func: 'queryString' }, 'Source value is undefined, defaulting to a empty string');
                    }

                    // Add the map object
                    map.push({ dest: dest, src: src });
                }
                else {

                    journal.log({ type: 'error', owner: 'UI', module: 'process', func: 'queryString' }, 'Failed on invalid source type in destSrc map for:', destID);

                    return false;
                }

            }

            // Check to see if map has something to process
            if (map.length) {

                return _priv.executeQueryMap(map);
            }
            else {

                journal.log({ type: 'info', owner: 'UI', module: 'process', func: 'queryString' }, 'Process map resulted in an empty end map.');
            }

            return true;
        }
        else {

            journal.log({ type: 'error', owner: 'UI', module: 'process', func: 'queryString' }, 'Value map failed because passed argument was not an object');
        }

    };

    return {
        // Used with static maps
        directMap: directMap,
        // Used with forms maps
        formMap: formMap,
        queryString: queryString
    };

});
