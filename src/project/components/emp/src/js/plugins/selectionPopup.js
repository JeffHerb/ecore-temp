define(['jquery', 'render', 'guid', 'process'], function ($, render, guid, process) {

    var emp = false;

    var MODAL_THREASHOLD = 50;

    var initalModalHeight = false;
    var initalTableWrapperHeight = false;

    var selectionPopup = function _selection_popup(event, settings) {

        if (settings.measure) {

            if (!emp) {
                emp = window.emp;
            }

            emp.getPreformance('selectionPopup');
        }

        // Input that maps values when the selection pop/go is clicked
        if (settings.inputMapping) {

            process.directMap(settings.inputMapping);
        }

        var resizeModal = function _resize_modal (modal){
                modal.adjustCSS();
                modal.adjustHeight();
                modal.center();
        };

        // Function called when the selection popup is going to be closed
        var destoryTable = function _destroy_table (modal) {

            // Check to see if a click blocker is in place and remove it.
            if (emp.clickblocker.check) {
                emp.clickblocker.remove();
            }

            // Call the table debind event.
            modal.table.debind();

            delete emp.reference.tables[modal.table.id];

            if (modal.table.config.setup.responsive) {
                modal.table.deleteStyleSheets();
            }
        };

        var fixPopupHeight = function _fix_popup_height(modal, table) {

            function fixRowHeight(total, allocated, modal, table) {

                //console.log(total, allocated, modal.$self.outerHeight());

                if (modal.$self.outerHeight() < total) {
                    total = modal.$self.outerHeight();
                }

                var tableOuterHeight = table.obj.$tableWrapper.outerHeight() - table.obj.$viewWrapper.height();
                var tableHeadHeight = table.obj.$thead.outerHeight();

                allocated += tableHeadHeight + tableOuterHeight;

                var remaining = total - allocated;

                // Get a running count of rows
                var rowCount = 0;

                var $rows = table.obj.$tbody.children('tr');

                for (var i = 0, len = $rows.length; i < len; i++) {

                    var $row = $rows.eq(i);

                    var rowHeight = $row.outerHeight();

                    if (remaining > rowHeight + 2) {

                        rowCount += 1;

                        remaining -= (rowHeight + 2);

                    }
                    else {

                        break;
                    }

                }

                table.resize(rowCount, function () {

                    setTimeout(function () {

                        table.reflow(function () {

                            resizeModal(modal);

                            // Only show if its not already being shown.
                            if (!modal.config.isOpen) {
                                modal.show();
                            }

                        });

                    }, 50);

                });
            }

            // Get the max height we can fill
            var maxModalHeight = modal.getMaxContentAreaHeight();
            var allocated = 0;

            var tableHeaderHeight = table.obj.$viewWrapper[0].offsetTop;

            var $messages = modal.$self.find('.cui-messages');

            if ($messages.length) {

                $messages.each(function() {

                    var $message = $(this);

                    allocated +=  $message.outerHeight();
                });
            }

            if (tableHeaderHeight < 10) {

                var checks = 0;

                (function recheck(check) {

                    if (check < 5) {

                        tableHeaderHeight = table.obj.$viewWrapper[0].offsetTop;

                        if (tableHeaderHeight < 10) {
                            recheck(check += 1);
                        }
                        else {
                            fixRowHeight(maxModalHeight, (allocated + MODAL_THREASHOLD), modal, table);
                        }

                    }
                    else {
                        journal.log({type: 'error', owner: 'UI', module: 'emp', func: 'selectionPopup-recheck'}, 'Selection popup table is large taking too much time to build.');
                    }

                })(checks);
            }
            else {
                fixRowHeight(maxModalHeight, (allocated + MODAL_THREASHOLD), modal, table);
            }
        };

        // Function to create a popup
        var createPopup = function _create_popup ($control, htmlContent, headerContent, footerContent, selectionControls) {

            fastdom.mutate(function () {

                var $preModalTable = $(htmlContent.querySelector('table'));

                if ($preModalTable.length && settings.prefilter) {
                    $preModalTable.attr('data-open-filters', 'true');
                }

                // Build the modal
                var selectionPopup = $.modal({
                    html: htmlContent,
                    header:{
                        html: headerContent,
                    },
                    footer:{
                        html: footerContent,
                    },
                    hideDestroy: true,
                    buildInvisible: true,
                    onCreate: function (modal) {
                        var tableOptions = {
                            setup: {
                                changeReturn: true,
                            },
                            plugins: {
                                resize: {
                                    noControl: true,
                                    manualHeight: true
                                },
                                changeReturn: {
                                    mapping: settings.mapping,
                                },
                            },
                        };

                        modal.table.on('setup.table', function (evt) {

                            journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'selectionPopup => createPopup'}, 'Setting up table inside of selection popup modal."');

                            var table = emp.reference.tables[$(evt.target).attr('id')];

                            // Update the modal object link
                            modal.table = table;

                            modal.table.$self.on('table.filterButtonClick', function() {
                                fastdom.measure(function(){
                                    fixPopupHeight(modal, modal.table);
                                });
                            });

                            if (table.dataStore.body && table.dataStore.body.rows.length > 0) {

                                setTimeout(function () {
                                    fixPopupHeight(modal, table);

                                    if (!modal.config.isOpen) {

                                        modal.show();

                                        if (settings.measure) {
                                            emp.getPreformance('selectionPopup');
                                        }
                                    }

                                }, 150);
                            }
                            else {
                                modal.show();

                                if (settings.measure) {
                                    emp.getPreformance('selectionPopup');
                                }
                            }

                        });

                        modal.table.on('resize.table', function(evt) {

                            if (modal.config.isOpen) {

                                modal.center();
                            }
                        });

                        modal.table.table(tableOptions);
                    },
                    eventHandlers: {
                        resize: function (evt, modal) {

                            if (!modal.resizeTimer) {
                                modal.resizeTimer = false;
                            }

                            clearInterval(modal.resizeTimer);

                            modal.resizeTimer = setTimeout(function() {

                                var table = modal.table;

                                if (table.dataStore.body && table.dataStore.body.rows.length > 0) {

                                   fixPopupHeight(modal, modal.table);
                                }
                            }, 200);
                        }
                    },
                    onDestroy: destoryTable,
                });

                var $table = selectionPopup.$self.find('table').eq(0);

                selectionPopup.table = $table;

                // Make a binding to the element the created the popup
                $control.attr('data-modal', selectionPopup.config.id);

                // Bind close modal event to the close button
                selectionPopup.$self.find('#' + selectionControls.close).on('click', {modal: selectionPopup}, function (evt) {
                    var modal = evt.data.modal;

                    modal.destroy();
                });

                // Bind clear event that will flush all mapped values accordingly
                selectionPopup.$self.find('#' + selectionControls.clear).on('click', {modal: selectionPopup, mapping: settings.mapping, inputMapping: settings.inputMapping}, function (evt) {

                    // Get the mapping
                    var modal = evt.data.modal;
                    var mapping = $.extend(true, {}, evt.data.mapping);

                    var keys = Object.keys(mapping);

                    // Loop through all of the mappings and set the default value to an empty string or uncheck a checkbox
                    for (var i = 0, len = keys.length; i < len; i++) {

                        var mappedElements = document.querySelector('#' + keys[i]);

                        if(mappedElements.type === 'checkbox'){

                            if(mappedElements.checked === true){

                                mappedElements.checked = false;
                            }

                        }else{
                            // Fill in with empty string value
                            mapping[keys[i]] = '';
                        }

                    }

                    process.directMap(mapping);

                    if (evt.data.inputMapping) {

                        var inputMapping = $.extend(true, {}, evt.data.inputMapping);

                        var inputMappingKeys =  Object.keys(inputMapping);

                        // Loop through all of the mappings and set the default value to an empty string
                        for (var im = 0, imLen = inputMappingKeys.length; im < imLen; im++) {

                            // Fill in with empty string value
                            inputMapping[inputMappingKeys[im]] = '';
                        }

                        process.directMap(inputMapping);
                    }

                    modal.clear = true;

                    modal.destroy();
                });

                // Check to see if a custom select button function was passed or not.
                if (settings && typeof settings.selectFunc == "function") {


                    selectionPopup.$self.find('#' + selectionControls.select).on('click', {modal: selectionPopup, mapping: settings.mapping}, function (evt) {

                        // Pull the needed values out
                        var modal = evt.data.modal;

                        // Check to see if a option has been selected (Check for false as 0 will show false positives)
                        if (modal.table.getCheckedIndex() === false) {

                            if (modal.table.config.errors === undefined || Object.keys(modal.table.config.errors).length === 0 ) {

                                // Add an error to the table
                                modal.table.addError("Please select a row.");

                                fixPopupHeight(modal, modal.table);
                            }
                        }
                        else {

                            var mapping = evt.data.mapping;

                            settings.selectFunc(evt, modal, modal.table, settings);
                        }

                    });
                }
                else {

                    // Bind a standard select button event
                    selectionPopup.$self.find('#' + selectionControls.select).on('click', {modal: selectionPopup, mapping: settings.mapping}, function (evt) {

                        // Pull the needed values out
                        var modal = evt.data.modal;

                        if (modal.table.getCheckedIndex() === false) {

                            if (modal.table.config.errors === undefined || Object.keys(modal.table.config.errors).length === 0 ) {

                                // Add an error to the table
                                modal.table.addError("Please select a row.");

                                fixPopupHeight(modal, modal.table);
                            }

                        }
                        else {

                            var mapping = $.extend(true, {}, evt.data.mapping);

                            if (modal.table.config.error) {

                                modal.table.removeErrors();
                            }

                            if (modal.table.config.setup.changeReturn && modal.table.config.plugins.changeReturn.toggleMap) {

                                emp.processMap(evt, mapping, modal.table.$self, function () {

                                    if (modal.table.config.setup.changeReturn) {

                                        var clearList = [];
                                        var clearMapping = $.extend(true, {}, settings.mapping);

                                        // Loop through and determine the
                                        for (var col in modal.table.config.plugins.changeReturn.toggleMap) {
                                            if (!modal.table.config.plugins.changeReturn.toggleMap[col].selected) {
                                                clearList.push(modal.table.config.plugins.changeReturn.toggleMap[col].name);
                                            }
                                        }

                                        // Cleanup and define the process map.
                                        for (var field in settings.mapping) {
                                            if (clearList.indexOf(field) === -1) {
                                                delete clearMapping[field];
                                            }
                                            else {
                                                clearMapping[field] = '';
                                            }
                                        }

                                        process.directMap(clearMapping);
                                    }
                                });
                            }
                            else {

                                //emp.processMap(evt, mapping, modal.table.$self);
                                process.directMap(mapping, { tableSrc: modal.table.$self });
                            }

                            modal.destroy();
                        }
                    });
                }

            });
        };

        var selectFirst = function _select_first(mapping, data) {

            var filledInMap = {};

            for (var column in mapping) {

                var col = mapping[column] - 1;

                if (data[col].text) {

                    // Only supporting text and selection popups should not have controls.
                    filledInMap[column] = data[col].text;
                }
                else {

                    filledInMap[column] = "";

                    journal.log({ type: 'info', owner: 'Developer', module: 'emp', submodule: 'selectionPopup' }, 'Selection popup select first found that column:', col, 'contained no data. Providing blank.');
                }

            }

            //emp.processMap(event, filledInMap, ":strict:");
            process.directMap(filledInMap);
        };

        if (emp === undefined) {
            emp = window.emp;
        }

        if (settings && settings.request) {

            // Save off the source control
            var $control = $(event.target);

            emp.clickblocker.add($control);

            // Create the actual request object response objects
            var req = {};
            var res = {};

            if (typeof settings.request === "string") {

                req.url = settings.request;
            }
            else if (typeof settings.request === "object") {

                req.url = settings.request.url;
            }

            // Check for data mapping object
            if (settings.request.data && typeof settings.request.data === "object") {

                // We need to crea a request data object
                for (var dest in settings.request.data) {

                    if (settings.request.data[dest] !== undefined) {

                        var $idLookup = $('#' + settings.request.data[dest]);

                        if ($idLookup.length === 1) {

                            var sendValue = null;

                            switch ($idLookup[0].nodeName) {
                                case 'INPUT':
                                case 'TEXTAREA':
                                case 'SELECT':

                                    if (($idLookup.attr('type') === "checkbox" || $idLookup.attr('type') === "radio")){

                                        if ($idLookup.is(':checked')) {

                                            sendValue = $idLookup.val();
                                        }
                                        else {

                                            sendValue = "";
                                        }

                                    }
                                    else {

                                        sendValue = $idLookup.val();
                                    }

                                    break;

                                default:

                                    sendValue = $idLookup.text();
                                    break;
                            }

                            journal.log({type: 'info', owner: 'Developer', module: 'emp', submodule: 'selectionPopup'}, 'Selection popup parameter "' + dest + '" set to:', (sendValue !== "") ? sendValue : '(empty string)', '"');

                            settings.request.data[dest] = sendValue;
                        }
                        else if ($idLookup.length === 0) {
                            journal.log({type: 'warn', owner: 'Developer', module: 'emp', submodule: 'selectionPopup'}, 'Selection popup parameter listed could not be found via jQuery, assuming this is a hardcoded value for: "', dest, '"');
                        }
                        else {
                            journal.log({type: 'err', owner: 'Developer', module: 'emp', submodule: 'selectionPopup'}, 'Selection popup parameter listed contained source input that could not be found: "' + dest + '"');
                        }
                    }
                    else {
                        journal.log({type: 'error', owner: 'Developer', module: 'emp', submodule: 'selectionPopup'}, 'Selection popup parameter list contained an undefined source for: "', dest, '"');
                    }
                }

                // Set the request data ajax value.
                req.data = settings.request.data;

            }
            else if (settings.data && typeof settings.data !== "object") {

                journal.log({type: 'error', owner: 'FW', module: 'emp', func: 'selectionPopup'}, 'Selection Popups contained a definition for request data, but it was not in the proper object format. Skipping data porition of request');
            }

            res.done = function _selection_popup_res_done(data) {

                if (settings.hasOwnProperty('autoSingleSelect') === false) {
                    settings.autoSingleSelect = true;
                }

                var messages = false;
                var errorMsg = false;
                var renderModal = true;

                if (data && data.status && data.status === "success") {

                    if (data.result && data.result.length) {

                        // Before we get too far, check for all prerender functions
                        if (settings && settings.preRenderCheck && typeof settings.preRenderCheck === "function") {

                            renderModal = settings.preRenderCheck(event, data);

                            if (renderModal === false) {

                                if (settings.autoSingleSelectFunc && typeof settings.autoSingleSelectFunc === "function") {

                                    settings.autoSingleSelectFunc(data);
                                }
                            }
                            else if (renderModal === undefined) {

                                emp.clickblocker.remove();
                            }

                        }
                        else if (settings && settings.autoSingleSelect && data) {

                            var tableData = data.result[0].body.contents[0];

                            if (tableData.body && tableData.body.rows && tableData.body.rows.length === 1) {

                                renderModal = false;

                                selectFirst(settings.mapping, tableData.body.rows[0].columns);

                            }

                        }

                        if (renderModal) {

                            journal.log({type: 'info', owner: 'UI', module: 'emp', func: 'selectionPopup'}, 'Selection popup render not skipped!.');

                            data = data.result[0];

                            data.rowLimit = 25;

                            // Check to see if this being body wrapped in the proper AJAX response object
                            if (data.body && !data.template) {

                                if (data.messages) {
                                    messages = data.messages;

                                    for (var m = 0, mLen = messages.lenght; m < mLen; m++) {

                                        if (messages[m].type === "error") {

                                            errorMsg = true;
                                            break;
                                        }

                                    }

                                }

                                data = data.body;
                            }

                            if (Array.isArray(data) && data.length === 1) {
                                data = data[0];
                            }
                            else if (Array.isArray(data) && data.length > 1) {

                                journal.log({type: 'error', owner: 'UI', module: 'emp', func: 'selectionPopup'}, 'Selection popup ajax request returned more than one nodes worth of data in an array format.');
                            }

                            if (data.contents && data.contents.length === 1 && data.contents[0].template === "table") {

                                data = data.contents[0];

                                if (!data.attributes) {
                                    data.attributes = {};
                                }

                                // Remove specific plugins
                                //data.attributes['data-responsive'] = "false";
                            }

                            data.type = "breakout";

                            if (settings.selectReturn) {

                                if (!data.attributes) {
                                    data.attributes = {};
                                }

                                data.attributes['data-changereturn'] = "true";
                            }

                            data.rowLimit = 50;

                            // Create some ids for the new buttons
                            var selectionControls = {
                                close: guid() + '_close',
                                clear: guid() + '_clear',
                                select: guid() + '_select',
                            };

                            // Static renderer contents
                            var popupContents = {
                                "type": "div",
                                "template": "universal",
                                "attributes": {
                                    "className": "emp-selection-popup-modal-controls"
                                },
                                "contents": [

                                ]
                            };

                            var headerHtml = "";

                            var footerHtml = $('<header/>', {
                                                'class': "emp-col-full button-col emp-button-group cui-align-right"
                                            });

                            // Add Close Button
                            var closeButton = $('<button/>' ,{
                                                'id' :  selectionControls.close
                                            })
                                            .text('Close');

                            footerHtml.append(closeButton);


                            // Add Clear Selection
                            if (settings === undefined || !settings.removeClear) {

                                var clearButton = $('<button/>', {
                                                'id' : selectionControls.clear
                                            }).text('Clear Selection');

                                footerHtml.append(clearButton);
                            }

                            // Add Select Button
                            var selectButton = $('<button/>', {
                                            'id' : selectionControls.select,
                                            'class': 'cui-button-primary'
                                        }).text("Select");

                            footerHtml.append(selectButton);

                            // Check the message variable for any popup messages
                            if (messages) {

                                for (var i = 0, len = messages.length; i < len; i++) {

                                    if (!messages[i].template) {
                                        messages[i].template = "message";
                                    }

                                    popupContents.contents.push(messages[i]);
                                }
                            }

                            // Add data
                            popupContents.contents.push(data);

                            // Render the section
                            var testContent = render.section(null, popupContents, 'return', function (contentHtml) {

                                if (contentHtml) {

                                    // Check to see if the require module
                                    if (require.defined('modal')) {

                                        // Create the modal
                                        createPopup($control, contentHtml, headerHtml, footerHtml, selectionControls);
                                    }
                                    else {

                                        // Load the require module and then create the modal
                                        cui.load('modal', function _selection_modal() {
                                            createPopup($control, contentHtml, headerHtml, footerHtml, selectionControls);
                                        });
                                    }
                                }
                                else {
                                    journal.log({type: 'error', owner: 'UI', module: 'emp', submodule: '', func: 'selectionPopup'}, 'Failed to build selection popup.');
                                }
                            });
                        }
                        else {

                            if (emp.clickblocker.check) {
                                emp.clickblocker.remove();
                            }

                            if (settings.autoSelect) {

                                settings.selectFunc(":render-skipped:", false, data, mapping);

                                journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'selectionPopup'}, 'Render blocked but auto select was enabled!');
                            }
                            else if (settings && settings.autoSingleSelect) {

                                journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'selectionPopup'}, 'Render blocked and standard auto select single was executed!');
                            }
                            else {

                                journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'selectionPopup'}, 'Selection popup was not render, and there was no auto select function enabled.');
                            }
                        }

                    }
                    else if (data.messages && data.messages.length) {

                        journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'selectionPopup'}, 'Selection Popup request only returned a messages, not the normal but still possibly valid');

                        if (emp.clickblocker.check) {
                            emp.clickblocker.remove();
                        }

                        for (var n = 0, nLen = data.messages.length; n < nLen; n++) {

                            emp.empMessage.createMessage(data.messages[n], {});
                        }
                    }

                }

            };

            res.fail = function _selection_popup_res_fail(data) {

                console.log(data);

                journal.log({type: 'error', owner: 'UI', module: 'emp', submodule: 'selectionPopup'}, 'Selection Popup failed to get a response from the url. "' + data + '"');

                var msg = {
                    "type": "error",
                    "template": "message",
                    "text": "Selection popup request failed. Please contact the help desk to report this issue."
                };

                emp.empMessage.createMessage(msg);

                if (data && data.status && data.status !== "success") {

                    var msgObj = false;

                    // Check for global message
                    if (data.messsages) {

                        msgObj = data.messages;
                    }
                    else if (data.result && data.result[0].work) {

                        msgObj = data.result[0].messages;
                    }

                    if (msgObj) {

                        if (!Array.isArray(msgObj)) {

                            msgObj = [ msgObj ];
                        }

                        for (var i = 0, len = msgObj.length; i < len; i++) {

                            emp.empMessage.createMessage(msgObj[i]);
                        }

                    }
                    else {

                        journal.log({type: 'error', owner: 'UI', module: 'emp', submodule: 'selectionPopup'}, 'Selection Popup data returned, but no fail message was provided.');
                    }
                }

                if (emp.clickblocker.check) {

                    emp.clickblocker.remove();
                }

            };

            if (settings.mockup) {

                res.done(window[settings.mockData]);
            }
            else {

                // Now perform the AJAX request.
                emp.ajax.request(req, res, true);
            }
        }
        else {

            journal.log({type: 'error', owner: 'FW', module: 'emp', func: 'selectionPopup'}, 'Selection Popups settings object is missing either the request or mapping parameter or both!');

            return false;
        }

        return true;
    };

    if (!emp) {
        emp = window.emp;
    }

    return selectionPopup;

});
