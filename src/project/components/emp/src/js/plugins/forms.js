define(['process', 'windows', 'clickblocker', 'utils'], function (process, windows, clkblocker, utils) {

    var _priv = {};
    var formWin;

    // Variable to track global submit status
    _priv.disabledSubmit = false;

    // Variable to keep track of all the used forms
    _priv.forms = {};

    // Function to create the actual form element
    _priv.createForm = function _create_form(formAttr, newWindow) {

        var form = false;

        function formCreation() {

            var form = document.createElement('form');

            // Loop through all attributes and add the standard form attributes
            for (var attr in formAttr) {

                _priv.createElemAttribute(form, attr, formAttr[attr]);
            }

            if (newWindow) {

                var popupInput = document.createElement('input');

                // Add window name to form post for framework
                _priv.createElemAttribute(popupInput, 'name', 'fw_popup_name');
                _priv.createElemAttribute(popupInput, 'type', 'hidden');
                _priv.createElemAttribute(popupInput, 'value', formAttr.target);

                form.appendChild(popupInput);

                var popupIndInput = document.createElement('input');

                // Add window name to form post for framework
                _priv.createElemAttribute(popupInput, 'name', 'fw_popup_request_ind');
                _priv.createElemAttribute(popupInput, 'type', 'hidden');
                _priv.createElemAttribute(popupInput, 'value', "true");

                form.appendChild(popupIndInput);

                // Add target attribute to the form.
                _priv.createElemAttribute(form, 'target', formAttr.target);

            }

            // Add form the page body
            document.body.appendChild(form);

            return form;
        }

        if (formAttr && typeof formAttr === "object") {

            // Check to see if the same form already exists
            var formCheck = document.getElementById(formAttr.id);

            if (formCheck) {

                journal.log({ type: 'info', owner: 'UI', module: 'form', func: 'virtual' }, 'Existing virtual form with the same id: ', formAttr.id, ' already exists. Removing it to ensure proper values are passed.');

                document.body.removeChild(formCheck);
            }

            // Call the actual creation function
            return formCreation();
        }
        else {

            return false;
        }

    };

    // Function to create form inputs
    _priv.createInputs = function _create_input(form, inputMap) {

        function createInput(name) {

            var id = utils.cleanupID(name);

            // Create the input attributes
            var iAttributes = {
                "name": name,
                "id": id,
                "type": "hidden",
                "value": ""
            };

            if (id !== name) {
                journal.log({ type: 'error', owner: 'DEV|FW', module: 'form', func: 'createInputs->createInput' }, 'Form created with a dangerous id (' + name + ')! It is not recommmended to create form id\'s that contain special characters used by CSS selectors. It is highly recommended you rename this control if possible.');
            }

            var input = document.createElement('input');

            for (var attr in iAttributes) {

                _priv.createElemAttribute(input, attr, iAttributes[attr]);
            }

            // Append input to form
            form.appendChild(input);
        }

        for (var input in inputMap) {

            createInput(input);
        }

        return true;
    };

    // Function to add attributes for both the input and forms tags
    _priv.createElemAttribute = function _create_element_attribute(elem, attrName, attrValue) {

        elem.setAttribute(attrName, attrValue, 0);
    };

    // Generic common function to remove click blocker
    _priv.removeBlocker = function() {

        if (clkblocker.check()) {
            clkblocker.remove();
        }
    };

    // Default virtual form attributes
    var defaultVirtualAttr = {
        id: 'virtual',
        method: 'POST',
        class: 'emp-hide-form'
    };

    // Function disables form submissions for this module
    var setDisable = function _set_disable(state) {

        _priv.disabledSubmit = state;
    };

    // Creats and submits a form
    /**
     * attributes - object containing the attributes to apply on the form
     * map - object of key value pair defining the destination : source value
     * newWindow - setting to indicate if item should appear in a new windwo (popup)
     * submitAfter - setting to indicate if the form should be submitted after its created (default: true)
     */
    var virtual = function _virtual(evt, formDef) {

        var winRef = false;

        evt.preventDefault();

        // Check to make sure that the form def was provided
        if (formDef && typeof formDef === "object") {

            // Verify that the form attributes exist
            if (formDef.attributes && formDef.attributes.action) {

                // Extend the form attributes with the defaults
                formDef.attributes = $.extend(true, {}, defaultVirtualAttr, formDef.attributes);

                // Ensure that newWindows exists and is defaulted if missing
                if (!formDef.hasOwnProperty('newWindow')) {
                    formDef.newWindow = false;
                }

                // Ensure that submitAfter exists and is defaulted if missing
                if (!formDef.hasOwnProperty('submitAfter')) {
                    formDef.submitAfter = true;
                }

                // Check and set the form target to the provided name or get the default from the windows module
                if (formDef.newWindow) {

                    if (formDef.windowName) {
                        formDef.attributes.target = formDef.windowName;
                    }
                    else {
                        formDef.attributes.target = windows.getDefaultWindowName();
                    }

                    // Check for a window reference with this name
                    winRef = windows.getReference();

                    if (!winRef) {
                        winRef = windows.createReference(formDef.attributes.target);
                    }
                }

                // check to see what the form method is as it might change the open process
                if (formDef.attributes.method.toLowerCase() === "post") {

                    /*
                     * === POST METHOD ===
                     */

                    // Create the form we will submit
                    var form = _priv.createForm(formDef.attributes, formDef.newWindow);

                    // Verify the form was created in memory
                    if (form) {

                        journal.log({ type: 'info', owner: 'UI', module: 'form', func: 'virtual' }, 'New virtual form created: ', formDef.attributes.id);

                        // Check to see if there is an input map
                        if (formDef.map && typeof formDef.map === "object") {

                            // Create all the form inputs (without values)
                            _priv.createInputs(form, formDef.map);

                            // Now execute a process map.
                            var mapResult = process.formMap(form, formDef.map);

                            // Check to verify that the map worked.
                            if (!mapResult) {

                                // Remove the click blocker
                                _priv.removeBlocker();

                                // Returning false to stop the page.
                                return false;
                            }

                        }
                        else {

                            journal.log({ type: 'info', owner: 'UI', module: 'form', func: 'virtual' }, 'No map provided to form: ', formDef.attributes.id);
                        }

                        // Save off the form instance just in case.
                        _priv.forms[formDef.attributes.id] = {
                            name: formDef.attributes.id,
                            dom: form,
                            target: form.getAttribute('target')
                        };

                        if (!formDef.submitAfter) {

                            journal.log({ type: 'info', owner: 'UI', module: 'form', func: 'virtual' }, 'Form: ' + formDef.attributes.id + ' submission block by submitAfter property being false.');
                        }
                        else {

                            if (_priv.disabledSubmit) {

                                journal.log({ type: 'info', owner: 'Developer', module: 'form', func: 'virtual' }, 'Form: ' + formDef.attributes.id + ' submission block by developer global debug disable property being true.');
                            }
                            else {

                                if (formDef.newWindow) {

                                    journal.log({ type: 'info', owner: 'Developer', module: 'form', func: 'virtual' }, 'Form: ' + formDef.attributes.id + ' attempting to open a new window.');

                                    if (formDef.lock) {

                                        journal.log({ type: 'info', owner: 'Developer', module: 'form', func: 'virtual' }, 'Form: ' + formDef.attributes.id + ' enable the parent lock feature.');

                                        // Create a click blocker
                                        clkblocker.add($(evt.target), true, true);
                                    }

                                    // Open the window and when it reports back ready (callback execute the form)
                                    windows.open(winRef.name, undefined, "POST", formDef.newWindow, formDef.lock, formDef.attributes.id, function(winRef) {

                                        _priv.forms[formDef.attributes.id].dom.submit();

                                        setTimeout(function _focusOnPopup() {

                                            if (winRef && winRef.focus) {

                                                winRef.focus();
                                            }
                                            else {

                                                journal.log({ type: 'info', owner: 'UI', module: 'form', func: 'virtual' }, 'Form: ' + formDef.attributes.id + ' focus not supoported!');
                                            }

                                            return true;
                                        }, 1000);

                                    });

                                }
                                else {

                                    // Not a new window, so just create the form normally.
                                    form.submit();
                                }

                                return true;
                            }

                        }

                        if (formDef.newWindow && formDef.lock) {

                            return {
                                "preserveBlocker": true
                            };
                        }

                        return true;

                    }
                    else {

                        journal.log({ type: 'error', owner: 'UI', module: 'form', func: 'virtual' }, 'Error occured when attempting to build out new virtual form');

                        // Remove the click blocker
                        _priv.removeBlocker();

                        return false;
                    }
                }
                else {

                    /*
                     * === GET METHOD ===
                     */
                    var externalGWindow = false;

                    if (formDef.newWindow) {

                        externalGWindow = windows.createReference();

                        if (formDef.attributes) {
                            formDef.attributes.target = externalGWindow.name;
                        }
                    }

                    var formG = _priv.createForm(formDef.attributes, formDef.newWindow);

                    if (formDef.map && typeof formDef.map === "object") {

                        // Create all the form inputs (without values)
                        _priv.createInputs(formG, formDef.map);

                        // Now execute a process map.
                        var mapResultG = process.formMap(formG, formDef.map);

                        // Check to verify that the map worked.
                        if (!mapResultG) {

                            // Remove the click blocker
                            _priv.removeBlocker();

                            // Returning false to stop the page.
                            return false;
                        }

                    }

                    if (!formDef.submitAfter) {

                        journal.log({ type: 'info', owner: 'UI', module: 'form', func: 'virtual' }, 'Form: ' + formDef.attributes.id + ' submission block by submitAfter property being false.');
                    }
                    else {

                        if (_priv.disabledSubmit) {

                            journal.log({ type: 'info', owner: 'Developer', module: 'form', func: 'virtual' }, 'Form: ' + formDef.attributes.id + ' submission block by developer global debug disable property being true.');
                        }
                        else {

                            // Save off the form instance just in case.
                            _priv.forms[formDef.attributes.id] = {
                                name: formDef.attributes.id,
                                target: formDef.attributes.id,
                                window: externalGWindow.name
                            };

                            if (formDef.newWindow) {

                                journal.log({ type: 'info', owner: 'Developer', module: 'form', func: 'virtual' }, 'Form (GET): ' + formDef.attributes.id + ' attempting to open a new window.');

                                if (formDef.lock) {

                                    journal.log({ type: 'info', owner: 'Developer', module: 'form', func: 'virtual' }, 'Form (GET): ' + formDef.attributes.id + ' enable the parent lock feature.');

                                    // Create a click blocker
                                    clkblocker.add($(evt.target), true, true);
                                }

                                // Call window open function to open the window in advance
                                windows.open(externalGWindow.name, undefined, "GET", formDef.newWindow, formDef.lock, function(winRef) {

                                    formG.submit();

                                    setTimeout(function _focusOnPopup() {

                                        if (winRef && winRef.focus) {

                                            winRef.focus();
                                        }
                                        else {

                                            journal.log({ type: 'info', owner: 'UI', module: 'form', func: 'virtual - window callback' }, 'Window focus not supoported!');
                                        }

                                        return true;
                                    }, 1000);
                                });
                            }
                            else {

                                var fullURL = formDef.attributes.action + process.queryString(formDef.map);

                                window.location = fullURL;
                            }
                        }

                    }

                    _priv.removeBlocker();

                    return true;
                }

            }
            else {

                journal.log({ type: 'error', owner: 'UI', module: 'form', func: 'virtual' }, 'Unable to process forms when form attributes or action attribute are missing.');

                return false;
            }

        }
        else {

            journal.log({ type: 'error', owner: 'UI', module: 'form', func: 'virtual' }, 'Unable to process forms when setting object is not in place');

            return false;
        }

    };

    return {
        setDisable: setDisable,
        virtual: virtual
    };

});
