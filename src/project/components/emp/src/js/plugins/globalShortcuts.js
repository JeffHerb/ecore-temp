define(['shortcut', 'render'], function(shortcut, render) {

    var _priv = {};

    _priv.contextMenu =  function() {

        var $body = $(document.body);
        var hostname = window.location.hostname;

        var contextMenu = {
            allowedEnv: ['dvm.int.nystax.gov'],
            counter: 0,
            lock: true,
            threshold: 3
        };

        $body.on('keypress', function (e) {

            var $focus = $(':focus');

            var inputElms = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];

            var key = e.keyCode || e.which;

            // Filter our environments
            if (contextMenu.allowedEnv.indexOf(hostname) === -1) {

                if ($focus.length === 0 || ($focus.length === 1 && inputElms.indexOf($focus[0].nodeName) === -1)) {

                    // Check to see if the key struck and the
                    if (key === 5 && e.shiftKey && e.ctrlKey && contextMenu.lock) {

                        contextMenu.counter += 1;

                        if (contextMenu.counter === 3) {

                            // Unlock the context menu
                            contextMenu.lock = false;

                            journal.log({ type: 'info', owner: 'UI', module: 'emp' }, 'Context menu unlocked for 30 seconds!');

                            setTimeout(function () {

                                contextMenu.lock = true;
                                contextMenu.counter = -1;

                                journal.log({ type: 'info', owner: 'UI', module: 'emp' }, 'Context menu locked');
                            }, 30000);
                        }
                        else {

                            journal.log({ type: 'info', owner: 'UI', module: 'emp' }, "Context unlock hit!");
                        }

                    }

                }
            }
        });

        $body.on('contextmenu', function (e) {

            if (contextMenu.allowedEnv.indexOf(hostname) === -1) {

                // Check to see if the context menu is locked
                if (contextMenu.lock) {

                    e.preventDefault();

                    journal.log({ type: 'info', owner: 'UI', module: 'emp' }, 'Block context menu from appearing based on environment.');
                }
                else {

                    journal.log({ type: 'info', owner: 'UI', module: 'emp' }, 'Block context menu enabled in blocked environment.');
                }
            }
        });
    };

    _priv.lotusFormModal = function() {

        shortcut.register({
            keys: 'ctrl+shift+f',
            callback: createPopup,
            description: 'Lotus Form Popup',
            type: 'keydown',
        });

        function createPopup() {

            var fixPopupHeight = function _fix_popup_height(modal, table) {

                function fixRowHeight(total, allocated, modal, table) {

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

                    $messages.each(function () {

                        var $message = $(this);

                        allocated += $message.outerHeight();
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
                            journal.log({ type: 'error', owner: 'UI', module: 'emp', func: 'selectionPopup-recheck' }, 'Selection popup table is large taking too much time to build.');
                        }

                    })(checks);
                }
                else {
                    fixRowHeight(maxModalHeight, (allocated + MODAL_THREASHOLD), modal, table);
                }
            };

            function createModal(tableJSON) {

                var popupContents = {
                    "type": "div",
                    "template": "universal",
                    "attributes": {
                        "className": "emp-lotus-form-modal"
                    },
                    "contents": []
                };

                popupContents.contents.push(tableJSON);

                render.section(null, popupContents, 'return', function(htmlContents) {

                    var lotusFormModal = $.modal({
                        html: htmlContents,
                        hideDestroy: false,
                        buildInvisible: true,
                        autoOpen: true,
                        onCreate: function(modal) {

                            var tableOptions = {
                                setup: {
                                    changeReturn: false,
                                    responsive: false,
                                },
                                plugins: {
                                    resize: {
                                        noControl: true,
                                        manualHeight: true
                                    }
                                },
                            };

                            modal.table.on('setup.table', function (evt) {

                                var table = emp.reference.tables[$(evt.target).attr('id')];

                                // Update the modal object link
                                modal.table = table;

                                modal.table.$self.on('table.filterButtonClick', function () {
                                    fastdom.measure(function () {
                                        fixPopupHeight(modal, modal.table);
                                    });
                                });

                            });

                            modal.table.on('resize.table', function (evt) {

                                if (modal.config.isOpen) {

                                    modal.center();
                                }
                            });

                            modal.table.table(tableOptions);
                        }
                    });

                    var $table = lotusFormModal.$self.find('table').eq(0);

                    lotusFormModal.table = $table;

                });
            }

            var newTable = {
                "template": "table",
                "attributes": {
                    "id": "lotusFormsTable",
                    "data-filter": false,
                    "data-responsive": false,
                    "data-resize": false
                },
                "title": "Lotus Form Templates",
                "head": {
                    "rows": [
                        {
                            "columns": [
                                {
                                    "type": "header",
                                    "attributes": {
                                        "title": "DLN",
                                        "data-type": "alpha"
                                    },
                                    "text": "DLN"
                                },
                                {
                                    "type": "header",
                                    "attributes": {
                                        "title": "Form",
                                        "data-type": "alpha"
                                    },
                                    "text": "Form"
                                },
                                {
                                    "type": "header",
                                    "attributes": {
                                        "title": "Lotus Form",
                                        "data-type": "primaryButton"
                                    },
                                    "text": "Lotus Form",
                                    "style": "minwidth",
                                    "hideLabel": true
                                }
                            ]
                        }
                    ]
                },
            };

            var pageID = fwData.context.screen.id;

            if (pageID.indexOf('-') !== -1) {
                pageID = pageID.split('-')[0];
            }

            if (pageID === "NDD184S") {

                var formsTable = document.getElementById('documentSearchTable');

                if (formsTable) {

                    var tableRows = formsTable.querySelectorAll('tr');

                    var buildTable = true;

                    if (tableRows.length === 1) {
                        var cellLength = tableRows[0].querySelectorAll('td').length;

                        if (cellLength === 1) {

                            buildTable = false;
                        }
                    }

                    if (buildTable) {

                        newTable.body = {
                            rows: []
                        };

                        var docTableJSON = emp.reference.tables.documentSearchTable.dataStore;
                        var docTableJSONRow = docTableJSON.body.rows;

                        rowLoop:
                        for (var r = 0, rLen = docTableJSONRow.length; r < rLen; r++) {

                            var docTableJSONCells = docTableJSONRow[r].columns;
                            var lastColumn = docTableJSONRow[r].columns[docTableJSONRow[r].columns.length - 1].contents[0];

                            if (typeof lastColumn === "object" && lastColumn.template === "field" && lastColumn.type === "button" && lastColumn.options.length) {

                                for (var b = 0, bLen = lastColumn.options.length; b < bLen; b++) {

                                    var button = lastColumn.options[b];

                                    // Check to see if this is a button
                                    if (button.template === "field" && button.type === "button" && button.input.text === "View Image") {

                                        var onclick = button.input.attributes.onclick;

                                        // Lotus forms has the following WPF_ value;
                                        if (onclick.indexOf(':strict:WPF_') !== -1) {

                                            // This is a legit row and we need to make a copy of the button
                                            var lotusButton = $.extend(true, {}, button);

                                            // Remove format property of PDF so we get the raw input.
                                            lotusButton.input.attributes.onclick = lotusButton.input.attributes.onclick.replace("'EDMS_OUTPUT_FORMAT':':strict:PDF'", "'EDMS_OUTPUT_FORMAT':''");
                                            lotusButton.input.text = "View Form";
                                            lotusButton.input.attributes.title = "View Form";

                                            var DLN = docTableJSONRow[r].columns[0].text;
                                            var form = docTableJSONRow[r].columns[1].text;

                                            newTable.body.rows.push({
                                                "columns": [
                                                    {
                                                        "text": DLN
                                                    },
                                                    {
                                                        "text": form
                                                    },
                                                    {
                                                        "contents": [ lotusButton ]
                                                    }
                                                ]
                                            });

                                        }
                                        else {

                                            // Image button is not a lotus form
                                            continue rowLoop;
                                        }

                                    }

                                    continue;

                                }

                            }
                        }
                    }

                    if (require.defined('modal')) {

                        createModal(newTable);
                    }
                    else {

                        cui.load('modal', function _selection_modal() {
                            createModal(newTable);
                        });
                    }

                }
                else {

                    journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'globalShortcut', func: 'lotusFormModal' }, 'Lotus Form popup blocked because the standard documents table #documentSearchTable was not found.');
                    return false;
                }

            }
            else {

                journal.log({ type: 'warning', owner: 'UI', module: 'emp', submodule: 'globalShortcut', func: 'lotusFormModal' }, 'Blocked Lotus Form popup because we are not on an EDMS forms page.');
                return false;
            }

        }

    };

    return {
        contextMenu: _priv.contextMenu,
        lotusFormModal: _priv.lotusFormModal
    };

});
