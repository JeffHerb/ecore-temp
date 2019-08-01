define(['dataStore', 'deepmerge', 'render',], function(ds, dm, render) {

    var _priv = {};


    _priv.otherDropdown = function _other_dropdown(dSelectElem) {

        dSelectElem.addEventListener('change', function _other_select_change(event) {

            // Get the dropdown element, parent container and value container
            var dSelectOtherDropdown = event.target;
            var dSelectOtherParentContainer = dSelectOtherDropdown.parentNode.parentNode.parentNode;
            var dSelectOtherValueContainer = dSelectOtherParentContainer.nextElementSibling;

            var otherValue = dSelectOtherDropdown.getAttribute('data-select-other');

            if (otherValue === dSelectOtherDropdown.value) {

                var dOption = dSelectOtherDropdown.querySelector('option[value="' + otherValue + '"]');

                var sOptionText = dOption.text.toLowerCase().trim();

                if (sOptionText === "other") {

                    if (dSelectOtherValueContainer.classList.contains('cui-hidden')) {
                        dSelectOtherValueContainer.classList.remove('cui-hidden');
                    }

                }
                else {

                    journal.log({ type: 'error', owner: 'Developer', module: 'emp', events: '', func: 'otherDropdown' }, 'Developer defined invalid field to act as Other. Other fields must have the specific text of "Other".');
                }
            }
            else {

                if (!dSelectOtherValueContainer.classList.contains('cui-hidden')) {
                    dSelectOtherValueContainer.classList.add('cui-hidden');

                    var dDescribeInputs = dSelectOtherValueContainer.querySelectorAll('input, select, textarea');

                    if (dDescribeInputs.length) {

                        for (var dElem = 0, dElemLen = dDescribeInputs.length; dElem < dElemLen; dElem++) {

                            // Set value to nothing
                            dDescribeInputs[dElem].value = "";

                            dDescribeInputs[dElem].removeAttribute("value");
                        }

                    }

                }
            }


        });

    };

    _priv.clearAllSearchBox = function _clear_all_searchbox(event) {

        journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'events', func: 'clearAllSearchBox'}, 'User clicked clear all!');

        var dSearchBoxForm = document.querySelector('#form_search .emp-search-fields');

        var headerIDRow = dSearchBoxForm.querySelector('#headerID');
        var headerIDDropdown;

        if(headerIDRow){
            
            headerIDDropdown = headerIDRow.querySelector('#HEADER_ID_TYPE');
        }

        // Verify it can be changes (Not readonly page)
        if (headerIDDropdown && headerIDDropdown.nodeName === "SELECT") {

            var headerDataStore = ds.getStore('globalHeader');

            if (headerDataStore.search.headerID) {

                headerDataStore.search.headerID.defaultValues = {};

                if (headerDataStore.search.headerID.select.input.defaultValue) {

                    headerDataStore.search.headerID.select.input.value = headerDataStore.search.headerID.select.input.defaultValue;
                }

            }

            var data = {
                template: 'partialCaller',
                partialTemp: 'headerID',
                arguments: dm({}, headerDataStore)
            };

            if (data.arguments.search.headerID) {

                data.arguments.search.headerID.defaultValues = {};

                render.section(undefined, data, 'return', function (html) {

                    var currentHeaderID = document.getElementById('headerID');
                    var parentContainer = currentHeaderID.parentNode;

                    parentContainer.insertBefore(html.firstChild, currentHeaderID);

                    parentContainer.removeChild(currentHeaderID);

                });
            }

        }

        // Clear all the regular inputs after this.
        _priv.clearSearchbox(event, true);

    };

    _priv.clearSearchbox = function _clear_searchbox(event, fromAll) {

        journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'events', func: 'clearSearchbox'}, 'User clicked clear or clear was called via clear all click!');

        function setGenericInput(fromAll, input, inputDefault, inputIsRequired) {

            if (fromAll) {

                if (inputDefault && inputIsRequired) {

                    input.removeAttribute('value');
                    input.setAttribute('value', inputDefault.trim());
                    input.value = inputDefault.trim();
                }
                else {

                    input.removeAttribute('value');
                    input.setAttribute('value', "");
                    input.value = "";
                }

            }
            else {

                // On regular clear, defaults are restored otherwise the field is wiped.
                if (inputDefault) {

                    input.removeAttribute('value');
                    input.setAttribute('value', inputDefault.trim());
                    input.value = inputDefault.trim();
                }
                else {

                    input.removeAttribute('value');
                    input.setAttribute('value', "");
                    input.value = "";
                }

            }

        }

        function clearDropdown(input) {

            var options = input.querySelectorAll('option');

            // Loop through and remove the selected attribute to ensure its gone!
            for (var o = 0, oLen = options.length; o < oLen; o++) {

                var option = options[o];

                option.removeAttribute('selected');

            }

        }

        // Get all of the fields currently in the searchbox
        var dSearchBoxForm = document.querySelector('#form_search .emp-search-fields');

        var adNormalSearchRows = dSearchBoxForm.querySelectorAll('.cui-row:not(#headerID)');

        for (var r = 0, rLen = adNormalSearchRows.length; r < rLen; r++) {

            var row = adNormalSearchRows[r];

            var inputs = row.querySelectorAll('input, select, textarea, .emp-data');

            for (var i = 0, iLen = inputs.length; i < iLen; i++) {

                var input = inputs[i];
                var rootElem = input.parentNode.parentNode;

                // Lets get some input attributes
                var inputID = input.getAttribute('id');
                var inputName = input.getAttribute('name');
                var inputDefault = input.getAttribute('data-default');
                var inputType = input.nodeName;

                var inputIsRequired = rootElem.classList.contains('cui-required');
                var inputHTMLType = false;


                // Skip to next input if this is a regular clear hit and its a tax type field.
                if (!fromAll) {

                    // Check to see if this ia at tax type field.
                    if ((inputID.indexOf('S_TAX_TYPE') !== -1) || (inputID.indexOf('S_TAX_SUB_TYPE') !== -1)) {
                        continue;
                    }

                }

                if (inputType === "INPUT") {
                    inputHTMLType = input.getAttribute('type').toLocaleLowerCase();
                }

                switch(inputType) {

                    case "INPUT":

                        switch (inputHTMLType) {

                            case "radio":
                            case "checkbox":

                                // Check if they user clicked clear all
                                if (fromAll) {

                                    // Since we are coming from an all click and the input has a default and its required, we need to restore the value
                                    if (inputDefault && inputIsRequired) {

                                        input.checked = inputDefault.trim();
                                    }
                                    else {

                                        input.checked = false;
                                    }

                                }
                                else {

                                    // Since normal clear was clicked, if there is a default. Reset it, otherwise just clear.
                                    if (inputDefault) {

                                        input.checked = inputDefault.trim();
                                    }
                                    else {
                                        input.checked = false;
                                    }
                                }

                                break;

                            default:

                                // Because this is a hidden field we need to look in a different location for the hidden attribute tag
                                if (inputHTMLType === "hidden") {
                                    inputIsRequired = (input.getAttribute('data-required')) ? true : false;
                                }

                                setGenericInput(fromAll, input, inputDefault, inputIsRequired);

                                break;

                        }

                        break;

                    case "SELECT":

                        if (fromAll) {

                            if (inputDefault && inputIsRequired) {

                                clearDropdown(input);
                                input.value = inputDefault;
                            }
                            else {

                                clearDropdown(input);
                                input.value = "";
                            }

                        }
                        else{

                            if (inputDefault) {

                                clearDropdown(input);
                                input.value = inputDefault;
                            }
                            else {

                                clearDropdown(input);
                                input.value = "";
                            }

                        }


                        break;

                    case "TEXTAREA":

                            setGenericInput(fromAll, input, inputDefault, inputIsRequired);

                        break;

                    case "P":
                    case "SPAN":

                        if (fromAll) {

                            if (inputDefault && inputIsRequired) {

                                input.innerHTML = inputDefault;
                            }
                            else {

                                input.innerHTML = "";
                            }

                        }
                        else {

                            if (inputDefault) {

                                input.innerHTML = inputDefault;
                            }
                            else {

                                input.innerHTML = "";
                            }

                        }

                        break;

                }

            }

        }


    };

    return {
        clearAllSearchBox: _priv.clearAllSearchBox,
        clearSearchbox: _priv.clearSearchbox,
        otherDropdown: _priv.otherDropdown
    };

});
