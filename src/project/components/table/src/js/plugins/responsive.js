/*jshint loopfunc: true */
define(['stylesheet', 'render'], function (stylesheet, render) {
    var _priv = {};
    var _setup = {};
    var _events = {};
    var _prototype = {};
    var _defaults = {
        setup: {
            responsive: true,
        },
        plugins: {
            responsive: {
                automatic: true,
                windowSize: {
                    previous: window.innerWidth,
                    current: window.innerWidth,
                },
                maxPriority: 1,
                menuColumn: false,
                primaryColumn: false,
                primaryButton: false,
                colState: {
                    hidden: [],
                    visible: [],
                    always: {
                        hidden: [],
                        visible: [],
                    },
                },
                columns: [],
                savedConfig: false,
                changedConfig: false,
                menuConfig: {
                    hidden: [],
                    visible: []
                }
            },
        },
    };

    var HAS_HIDDEN_COLUMNS_CLASS = 'emp-table-responsive-has-hidden-columns';

    var DEFAULT_COLUMN_DEF = {
        type: 'data',               // simple description of what the column has inside of it
        dataStoreIndex: undefined,  // the posiiton in the dataStore which the column can be found starting at 0
        renderIndex: undefined,     // render index is th visual index of the column starting at 1
        priority: 0,                // controls if the column can be hidden or not.
        visibility: true,           // indicates current visibility (ture is visible, false is hidden)
        togglable: true,            // indicates if a column can change visibility states
        dataType: false,            // Data type for the defined columns contents
        columnType: false,          // Defined column type for the column
    };

    var DYNAMIC_STYLES = {
        displayNone: {
            display: 'none',
        },
        displayTableCell: {
            display: 'table-cell',
        },
    };

    var TOLERANCE = 15;

    // =================
    // Private Functions
    // =================

    _priv.createColumnDefinitions = function _create_column_defintions(table) {
        var columnStore;

        // Get the rendered count directly from the rendered table
        var $columns = table.obj.$thead.children('tr').eq(0).children('th:not(".table-control-col")');

        // Figure out the max priority count from the table
        var maxPriority = [];
        var usedPriority = [];
        var totalLength = $columns.length;

        for (var k = 0, klen = $columns.length; k < klen; k++) {

            maxPriority.push(k + 1);

            var colData = table.dataStore.head.rows[0].columns[k];

            if (colData && colData.responsive && colData.responsive.priority) {
                usedPriority.push(colData.responsive.priority);
            }

        }

        var priority = maxPriority.filter(function(val) {
          return usedPriority.indexOf(val) == -1;
        });

        // Loop through all of the column that have been rendered
        for (var i = 0, len = $columns.length; i < len; i++) {

            // Create default set of column properties
            var colDef = $.extend(true, {}, DEFAULT_COLUMN_DEF);

            if (table.dataStore.selectable && !table.dataStore.emptyTable) {
                var index = i + 1;
            }

            var $renderedCell = $($columns[i]);

            var definedIndex = $renderedCell.attr('data-col-index');

            columnStore = table.dataStore.head.rows[0].columns[definedIndex];

            // Save off an link to the header
            colDef.$cell = $renderedCell;

            // Save off the original position on load
            colDef.originalPos = i;

            // Save off the indexs and other useful demographis
            colDef.dataStoreIndex = i;

            if (table.dataStore.selectable) {

                if (table.dataStore.emptyTable) {

                    colDef.renderIndex = i + 1;
                }
                else {

                    colDef.renderIndex = i + 2;
                }

            }
            else {
                colDef.renderIndex = i + 1;
            }

            colDef.text = $renderedCell.text().trim();

            if (columnStore.attributes) {
                colDef.dataType = columnStore.attributes['data-type'];
                colDef.columnType = columnStore.attributes['data-columnType'];
            }

            // Process the columns primaryly based on there defined datatype.
            switch (colDef.dataType) {
                case 'button':
                    colDef.priority = 0;
                    // When a button column is still present dont allow it to ever be hidden hide.
                    colDef.togglable = false;

                    // Remember button columns should always be hidden, unless they are the primary button.
                    if (columnStore.responsive && !columnStore.responsive.primaryButton) {

                        // Register this column as always visible
                        table.config.plugins.responsive.colState.always.hidden.push(i);
                    }

                    break;

                case 'primaryButton':
                    colDef.priority = 0;
                    colDef.togglable = false;

                    // Register this column as always visible
                    table.config.plugins.responsive.colState.always.visible.push(i);

                    break;

                case 'buttonMenu':
                    colDef.priority = 0;
                    colDef.togglable = false;

                    // Register this column as the menu column
                    table.config.plugins.responsive.menuColumnDS = definedIndex;
                    table.config.plugins.responsive.menuColumn = colDef.renderIndex;

                    // Register this column as always visible
                    table.config.plugins.responsive.colState.always.visible.push(i);

                    break;

                case 'notifier':
                    colDef.priority = 0;

                    colDef.togglable = false;

                    // Register this column as always visible
                    table.config.plugins.responsive.colState.always.visible.push(i);

                    break;

                case 'alpha':
                case 'numeric':
                case 'date':
                case 'icon':
                case 'score':
                case 'dateTime':
                case 'rating':
                case 'control':
                case 'currency':
                case 'alphaNumeric':

                    // Catch all for incorret datatype columns
                    if ($renderedCell.hasClass('cui-hidden')) {
                        colDef.type = 'hidden';
                        colDef.togglable = false;
                        colDef.visibility = false;
                    }
                    else {

                        // Check to see if there is a responsive object with the dataStore definition for the column
                        if (columnStore.responsive) {

                            // Check for priority
                            if (columnStore.responsive.priority) {
                                if (!isNaN(columnStore.responsive.priority)) {
                                    if (typeof columnStore.responsive.priority === 'string') {
                                        columnStore.responsive.priority = parseInt(columnStore.responsive.priority);
                                    }

                                    colDef.priority = columnStore.responsive.priority;
                                }
                                else {

                                    // Set the priority to be the max for right now
                                    if (priority.length >= 1) {

                                        colDef.priority = priority.shift();
                                    }
                                    else {

                                        colDef.priority = totalLength;
                                    }
                                }
                            }
                            else {

                                // Set the priority to be the max for right now
                                if (priority.length >= 1) {

                                    colDef.priority = priority.shift();
                                }
                                else {

                                    colDef.priority = totalLength;
                                }
                            }

                            // Check for min-width
                            if (columnStore.responsive.minWidth) {
                                if (!isNaN(columnStore.responsive.minWidth)) {
                                    if (typeof columnStore.responsive.minWidth === 'string') {
                                        columnStore.responsive.minWidth = parseInt(columnStore.responsive.minWidth);
                                    }

                                    colDef.minWidth = columnStore.responsive.minWidth;

                                    if (!colDef.$self) {

                                        colDef.$cell[0].style.minWidth = colDef.minWidth + 'px';
                                    }
                                    else {

                                        colDef.$self[0].style.minWidth = colDef.minWidth + 'px';
                                    }

                                }
                            }
                        }
                        else {

                            // Set the priority to be the max for right now
                            if (priority.length >= 1) {

                                colDef.priority = priority.shift();
                            }
                            else {

                                colDef.priority = totalLength;
                            }
                        }
                    }

                    break;

                // All the other odds and ends we might have to deal with for columns
                default:

                    if (columnStore.responsive && columnStore.responsive.priority) {

                        colDef.priority = columnStore.responsive.priority;

                    } else if (priority.length >= 1) {

                        colDef.priority = priority.shift();
                    }
                    else {

                        colDef.priority = totalLength;
                    }

                    // Detect hidden columns
                    if ($renderedCell.hasClass('cui-hidden')) {
                        colDef.type = 'hidden';
                        colDef.togglable = false;
                        colDef.visibility = false;

                        // Dont add anything for these columns because they will never be showable. These are developer columns
                    }
                    // Detects selectable control columns
                    else if ($renderedCell.hasClass('table-control-col')) {

                        colDef.type = 'control';
                        colDef.togglable = false;

                        table.config.plugins.responsive.colState.always.visible.push(i);
                    }
                    else {

                    }

                    break;
            }


            if (columnStore !== undefined && columnStore.attributes) {
                // Notifier check till we can do something better.
                if ((columnStore.attributes['data-type'] === 'notifiers') || (columnStore.hideLabel && columnStore.style && columnStore.style === 'min-width' && columnStore.attributes && columnStore.attributes['data-type'] === 'alpha')) {

                    colDef.priority = 0;

                    colDef.togglable = false;

                    // Register this column as always visible
                    table.config.plugins.responsive.colState.always.visible.push(i);
                }
            }


            if ((!colDef.minWidth) || (colDef.minWidth < table.config.plugins.responsive.columnMins[i])) {
                colDef.minWidth = table.config.plugins.responsive.columnMins[i];
            }

            if (table.config.plugins.responsive.colState.always.visible.indexOf(i) === -1 && table.config.plugins.responsive.colState.always.hidden.indexOf(i) === -1 && colDef.priority !== 0) {
                // Add this column to the visible column array
                table.config.plugins.responsive.colState.visible.push(i);
            }

            // Save the column data off in the plugin
            table.config.plugins.responsive.columns.push(colDef);
        }
    };

    // Function is sued to create the css selector that will be used to hide or show a column
    _priv.columnStyleSelector = function _column_style_selector (id, columnNum) {
        var elements = ['td', 'th'];
        var selector = '';

        // Prefix the id
        id = '#' + id;

        // Loop through the elements to create the column selectors.
        elements.forEach(function (value, index) {
            if (index === elements.length - 1) {
                selector += id + ' tr ' + value + ':nth-child(' + columnNum + ')';
            }
            else {
                selector += id + ' tr ' + value + ':nth-child(' + columnNum + '), ';
            }
        });

        return selector;
    };

    // Function generates the different priority orders for the columns
    _priv.priorityOrder = function _priority_order(table) {

        // Make a copy of the column def object. We want to make sure we dont change the originals.
        var columns = table.config.plugins.responsive.columns.concat();

        function compare (a, b) {

            // `a` has a higher prority and should be hidden before `b`
            if (a.priority < b.priority) {
                return -1;
            }
            // `b` has a higher prority and should be hidden before `a`
            else if (a.priority > b.priority) {
                return 1;
            }
            // Both have the same priority
            else {
                // Tie-breaker 1: the wider of the columns is sorted first
                if (a.minWidth > b.minWidth) {
                    return 1;
                }
                else if (a.minWidth < b.minWidth) {
                    return -1;
                }
                // Tie-breaker 2: right-most column is sorted first
                else if (a.renderedIndex > b.renderedIndex) {
                    return 1;
                }
                else if (a.renderedIndex < b.renderedIndex) {
                    return -1;
                }
                // Otherwise they're truly equal, which should never happen...
                else {
                    return 1;
                }
            }
        }


        // Do a initial sort
        var order = columns.sort(compare);

        var columnOrderIndex = [];

        //Now remove any priority 0 columns
        for (var i = 0, len = order.length; i < len; i++) {
            var colDef = order[i];

            if (colDef.priority !== 0 && colDef.togglable === true) {

                // Push up the index based on the original position from onload;
                columnOrderIndex.push(colDef.originalPos);
            }
            else {

            }
        }

        table.config.plugins.responsive.order = columnOrderIndex.reverse();
    };

    // Function is used to update the table stylesheet to hide a column
    _priv.hideColumn = function _hide_column(table, columns, cb) {

        // Check to make sure a column or array of columns has been provided
        if (columns !== undefined) {

            // Turn into an array
            if (!Array.isArray(columns)) {
                columns = [columns];
            }

            // Place to hold updated styles
            var styles = {};

            // Loop through and build all of the column hide selectors all at once.
            for (var i = 0, len = columns.length; i < len; i++) {

                var originalCol = columns[i];

                var colDef = false;

                for (var oc = 0, ocLen = table.config.plugins.responsive.columns.length; oc < ocLen; oc++) {

                    if (table.config.plugins.responsive.columns[oc].originalPos === originalCol) {
                        colDef = table.config.plugins.responsive.columns[oc];
                        break;
                    }

                }

                //var colDef = table.config.plugins.responsive.columns[columns[i]];
                //var colPos = colDef.originalPos

                // Set the visibility of this column to false
                colDef.visibility = false;

                // Add the column to the hidden array if its not in the always hidden array
                if (table.config.plugins.responsive.colState.always.hidden.indexOf(originalCol) === -1) {
                    table.config.plugins.responsive.colState.hidden.push(originalCol);
                }

                // Remove this column from the visible array
                if (table.config.plugins.responsive.colState.visible.indexOf(originalCol) !== -1) {
                    var index = table.config.plugins.responsive.colState.visible.indexOf(originalCol);

                    table.config.plugins.responsive.colState.visible.splice(index, 1);
                }

                if (!colDef.CSSSelector) {
                    colDef.CSSSelector = _priv.columnStyleSelector(table.id, colDef.renderIndex);
                }

                var CSSSelector = colDef.CSSSelector;

                styles[CSSSelector] = DYNAMIC_STYLES.displayNone;

                // Check to see if there is a rendered menu that need to be updated as well
                if (table.config.plugins.responsive.$columnMenu) {

                    table.config.plugins.responsive.$columnMenu.find('li[data-col-index="' + originalCol + '"]').children('button').removeClass('emp-selected');
                }
            }


            // check to see if we have a responsive control
            if (table.obj.$responsiveControl) {
                // Check to see if we need to update the colum control color
                if (table.config.plugins.responsive.colState.hidden.length) {
                    table.obj.$responsiveControl.addClass(HAS_HIDDEN_COLUMNS_CLASS);
                }
                else {
                    table.obj.$responsiveControl.removeClass(HAS_HIDDEN_COLUMNS_CLASS);
                }
            }

            // Now update both the stylesheets

            // Regular Stylesheet
            if (table.config.plugins.responsive.stylesheet !== undefined && table.config.plugins.responsive.stylesheet !== null) {
                stylesheet.updateRule(table.config.plugins.responsive.stylesheet, styles);
            }

            // Print Stylesheet
            if (table.config.plugins.responsive.printStyleSheet !== undefined && table.config.plugins.responsive.printStyleSheet !== null) {
                stylesheet.updateRule(table.config.plugins.responsive.printStyleSheet, styles);
            }

            _priv.recheckVisibility(table, columns, false);

            if (typeof cb === "function") {
                cb();
            }

        }
    };

    _priv.showColumn = function _show_column (table, columns, cb) {

        // Check to make sure a column or array of columns has been provided
        if (columns !== undefined) {

            // Turn into an array
            if (!Array.isArray(columns)) {
                columns = [columns];
            }

            // Place to hold updated styles
            var styles = {};

            // Loop through and build all of the column hide selectors all at once.
            for (var i = 0, len = columns.length; i < len; i++) {

                var originalCol = columns[i];

                var colDef = false;

                for (var oc = 0, ocLen = table.config.plugins.responsive.columns.length; oc < ocLen; oc++) {

                    if (table.config.plugins.responsive.columns[oc].originalPos === originalCol) {
                        colDef = table.config.plugins.responsive.columns[oc];
                        break;
                    }

                }

                // Set the visibility of this column to false
                colDef.visibility = true;

                // Add the column to the visible array if its not in the always visivle array
                if (table.config.plugins.responsive.colState.always.visible.indexOf(originalCol) === -1) {
                    table.config.plugins.responsive.colState.visible.push(originalCol);
                }

                // Remove this column from the hidden array
                if (table.config.plugins.responsive.colState.hidden.indexOf(originalCol) !== -1) {
                    var index = table.config.plugins.responsive.colState.hidden.indexOf(originalCol);

                    table.config.plugins.responsive.colState.hidden.splice(index, 1);
                }

                if (!colDef.CSSSelector) {
                    colDef.CSSSelector = _priv.columnStyleSelector(table.id, colDef.renderIndex);
                }

                var CSSSelector = colDef.CSSSelector;

                styles[CSSSelector] = DYNAMIC_STYLES.displayTableCell;

                // Check to see if there is a rendered menu that need to be updated as well
                if (table.config.plugins.responsive.$columnMenu) {

                    table.config.plugins.responsive.$columnMenu.find('li[data-col-index="' + originalCol + '"]').children('button').addClass('emp-selected');
                }
            }


            // check to see if we have a responsive control
            if (table.obj.$responsiveControl) {
                // Check to see if we need to update the colum control color
                if (table.config.plugins.responsive.colState.hidden.length) {
                    table.obj.$responsiveControl.addClass(HAS_HIDDEN_COLUMNS_CLASS);
                }
                else {
                    table.obj.$responsiveControl.removeClass(HAS_HIDDEN_COLUMNS_CLASS);
                }
            }

            // Regular Stylesheet
            if (table.config.plugins.responsive.stylesheet !== undefined || table.config.plugins.responsive.stylesheet !== null) {
                stylesheet.updateRule(table.config.plugins.responsive.stylesheet, styles);
            }

            // Print Stylesheet
            if (table.config.plugins.responsive.printStyleSheet !== undefined || table.config.plugins.responsive.printStyleSheet !== null) {
                stylesheet.updateRule(table.config.plugins.responsive.printStyleSheet, styles);
            }

            _priv.recheckVisibility(table, columns, true);

            if (typeof cb === "function") {
                cb();
            }

        }
    };

    _priv.recheckVisibility = function _recheck_visibility (table, columns, state, cb) {

        var styleUpdates = {};

        // Recheck hidden
        for (var i = 0, len = columns.length; i < len; i++) {
            var colDef = table.config.plugins.responsive.columns[columns[i]];

            if (colDef.$cell.is(':visible') !== state) {

                styleUpdates[colDef.CSSSelector] = (state) ? DYNAMIC_STYLES.displayTableCell : DYNAMIC_STYLES.displayNone;
            }
        }

        if (Object.keys(styleUpdates).length) {

            if (table.config.plugins.responsive.stylesheet !== undefined || table.config.plugins.responsive.stylesheet !== null) {
                stylesheet.updateRule(table.config.plugins.responsive.stylesheet, styleUpdates);
            }

            // Print Stylesheet
            if (table.config.plugins.responsive.printStyleSheet !== undefined || table.config.plugins.responsive.printStyleSheet !== null) {
                stylesheet.updateRule(table.config.plugins.responsive.printStyleSheet, styleUpdates);
            }
        }

        if (table.dataStore.emptyTable || table.dataStore.largeTable) {
            _priv.fixEmptyTable(table);
        }
    };

    _priv.getSectionSize = function _get_section_size(table, knowSection) {

        if (knowSection) {

            // Check to see if the table is in a section
            var $parentSection = table.$self.parents('section').eq(0);

            if ($parentSection.length === 1) {

                return $parentSection.outerWidth();
            }
        }

        // Default to window outer width
        return emp.$window.outerWidth();
    };

    _priv.reflow = function _reflow(table, revert, setup, source) {

        // Check to see if this script should do anything
        if (table.config.plugins.responsive.automatic) {

            fastdom.measure(function () {
                var i;
                var len;
                var colNumber;
                var colDef;
                var difference;

                // Get the current window width
                table.config.plugins.responsive.currentSize = _priv.getSectionSize(table);

                // If revert equal out the previous width because we want to do hides.
                if (revert) {
                    table.config.plugins.responsive.previousSize = _priv.getSectionSize(table);
                }

                // Filter out horizontal change
                if ((table.config.plugins.responsive.currentSize <= table.config.plugins.responsive.previousSize) || setup) {

                    var clientWidth = table.obj.$viewWrapper[0].clientWidth;
                    var scrollWidth = table.obj.$viewWrapper[0].scrollWidth;

                    var $tableSection = table.$self.parents('section');

                    var containerWidth;

                    if ($tableSection.length > 0) {

                        // We need to find the visibile width
                        var sectionWidth = _priv.getSectionSize(table);
                        var sectionOffsetLeft = $tableSection[0].offsetLeft;
                        var windowWidth = emp.$window.outerWidth();

                        if ((sectionOffsetLeft + sectionWidth) > windowWidth) {

                            containerWidth = windowWidth - sectionOffsetLeft - TOLERANCE;
                        }
                        else {

                            containerWidth = sectionWidth;
                        }

                    }
                    else {

                       containerWidth = _priv.getSectionSize(table, false);
                    }

                    // Check to see if the table is scrolling but within a threshold.
                    if ((clientWidth < scrollWidth && (scrollWidth - clientWidth >= 5)) || clientWidth > containerWidth) {

                        // Figure out the amount of space we need to reclaim by removing columns.
                        difference = table.obj.$viewWrapper[0].scrollWidth - table.obj.$viewWrapper[0].clientWidth;

                        if (difference === 0) {
                            difference = clientWidth - containerWidth;
                        }

                        var columnsToHide = [];

                        // Loop through and find the next column that is visible
                        for (i = 0, len = table.config.plugins.responsive.order.length; i < len; i++) {

                            // Get this columns information
                            colNumber = table.config.plugins.responsive.order[i];
                            colDef = table.config.plugins.responsive.columns[colNumber];

                            // Check to see if this is a visible column
                            if (colDef && colDef.visibility) {

                                // Get the current rendered width
                                var colWidth = colDef.$cell.outerWidth();

                                // Check to see if the minWidth plus the tolerance is less than the rendered current width
                                if (colDef.minWidth + TOLERANCE <= colWidth) {

                                    // We will assume the min width is all the space we will get back
                                    difference -= colDef.minWidth;

                                }
                                else {

                                    // We will use the render width
                                    difference -= colWidth;

                                }

                                // Add column to the to be hidden array.
                                columnsToHide.push(colNumber);

                                // Only if the difference is more than the tolerance level keep looking for more columns to hide
                                if (difference > TOLERANCE) {

                                    continue;
                                }

                                // Stop looping and move forward
                                break;
                            }
                            else {
                                continue;
                            }
                        }

                        // Update the previous position now that it has been processed.
                        table.config.plugins.responsive.previousSize = table.config.plugins.responsive.currentSize;

                        if (columnsToHide.length > 0) {

                            fastdom.mutate(function () {

                                // Hide the columns that need to be hidden
                                _priv.hideColumn(table, columnsToHide, function() {

                                    fastdom.measure(function() {

                                        // Check one last time just in case to see if we still need to hide anything
                                        if (table.obj.$viewWrapper[0].clientWidth < table.obj.$viewWrapper[0].scrollWidth) {

                                            _priv.reflow(table, revert, setup);
                                        }
                                        else {

                                            table.reflow(table, "Responsive reflow", false);
                                        }

                                    });

                                });
                            });
                        }
                    }
                    else {

                        // There is nothing to change, just update the position
                        table.config.plugins.responsive.previousSize = table.config.plugins.responsive.currentSize;
                    }
                }
                else {

                    //table.config.plugins.responsive.previousSize = table.config.plugins.responsive.currentSize;

                    // Only execute this if there is something to show
                    if (table.config.plugins.responsive.colState.hidden.length > 0) {
                        difference = table.config.plugins.responsive.currentSize - table.config.plugins.responsive.previousSize;
                        var columnsToShow = [];
                        var tableMinWidth = 0;

                        // Now we need to get a total size of the currently visible columns
                        for (i = 0, len = table.config.plugins.responsive.columns.length; i < len; i++) {
                            colDef = table.config.plugins.responsive.columns[i];

                            if (colDef && colDef.visibility) {
                                tableMinWidth += colDef.minWidth;
                            }
                        }

                        // Minumum required min-width
                        //difference = table.config.plugins.responsive.currentSize - tableMinWidth;

                        // Loop through all of the columns backwards
                        for (i = table.config.plugins.responsive.order.length - 1; i >= 0; --i) {
                            colNumber = table.config.plugins.responsive.order[i];
                            colDef = table.config.plugins.responsive.columns[colNumber];

                            if (colDef && !colDef.visibility) {
                                var colMinWidth = colDef.minWidth + TOLERANCE;

                                if (colMinWidth < difference) {
                                    difference -= colMinWidth;
                                    columnsToShow.push(colNumber);

                                    continue;
                                }

                                // Stop looping and move forward
                                break;

                            }
                            else {
                                continue;
                            }
                        }

                        if (columnsToShow.length > 0) {
                            fastdom.mutate(function () {
                                // Show the hidden columns
                                _priv.showColumn(table, columnsToShow);

                                // Reflow the table to fix the header
                                table.reflow(table, "Responsive reflow", false);
                            });
                        }
                    }
                    else {
                        // There is nothing to change, just update the position
                        table.config.plugins.responsive.previousSize = table.config.plugins.responsive.currentSize;

                        // Reflow the table to fix the header
                        table.reflow(table, "Responsive reflow", false);
                    }
                }
            });
        }

        fastdom.measure(function() {

            if (table.obj.$tbody.hasClass('emp-empty-table')) {

                fastdom.mutate(function() {

                    _priv.fixEmptyTable(table);
                });
            }
        });
    };

    _priv.fixEmptyTable = function _fix_empty_table (table, setup) {

        var colSpan = 0;

        for (var i = 0, len = table.config.plugins.responsive.columns.length; i < len; i++) {

            if (table.config.plugins.responsive.columns[i].visibility) {

                colSpan += 1;
            }
        }

        table.$self.find('tbody tr td').attr('colspan', colSpan);

    };

    _priv.testMenuObject = function _test_menu_object (current, pending) {

        function arraysEqual(arr1, arr2) {
            if(arr1.length !== arr2.length)
                return false;
            for(var i = arr1.length; i--;) {
                if(arr1[i] !== arr2[i])
                    return false;
            }

            return true;
        }

        var hidden = arraysEqual(current.hidden, pending.hidden);
        var visible = arraysEqual(current.visible, pending.visible);

        if (hidden && visible) {

            return false;
        }
        else {

            return true;
        }
    };

    // ===============
    // Event Functions
    // ===============

    // Event function will generate the menu on the first click, after that it will only position and
    // expose the unorder list container
    _events.columnMenu = function _column_menu (evt, table) {

        // Check to see if the column menu exists
        if (!table.config.plugins.responsive.$columnMenu) {

            // Create the column menu for the first time
            var $menuRoot = $('<ul/>', {
                'id': table.id + '_column_menu',
                'class': 'emp-table-responsive-column-menu'
            });

            // Now loop through all of the columns and add those that can be toggled
            for (var i = 0, len = table.config.plugins.responsive.columns.length; i < len; i++) {

                var colDef = table.config.plugins.responsive.columns[i];

                // Check to see if the column is togg
                if (colDef.togglable) {
                    var selected = (colDef.visibility) ? 'emp-selected' : '';

                    var $menuItem = $('<li/>', {
                                        'data-col-index': colDef.originalPos
                                    })
                                    .append(
                                        $('<button/>', {
                                            'class': selected,
                                            'id': table.id + "_" + (colDef.text.replace(/\s/g, '_')).replace(/[`~!@#$%^&*()|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '') + "_column"
                                        })
                                        .text(colDef.text)
                                        .on('click', {'table': table, 'colDef':colDef}, function (evt) {
                                            _events.columnMenuButton(evt, evt.data.table, evt.data.colDef);
                                        })
                                    );

                    $menuItem.appendTo($menuRoot);

                }

            }

            $divider = $('<li>', {
                            'class': 'menu-divider-container'
                        })
                        .append(
                            $('<span/>', {
                                'class': 'menu-divider'
                            })
                        );

            if (!table.dataStore.isExternal) {

                // Save Control
                $saveControl = $('<li>',{
                                'class': 'emp-table-static-save-link'
                            })
                            .append(
                                $('<a/>', {
                                    'role': 'button',
                                    'id': table.id + "_save_control"
                                })
                                .text('Save')
                                .on('click', {'table': table}, _events.saveColumnConfig)
                            );

                // Now add controls
                $revertUndoControl = $('<li/>', {
                                        "class": "emp-table-static-undo-revert-link cui-hidden"
                                    })
                                    .append(
                                        $('<a/>', {
                                            'href': '#',
                                            'id': table.id + "_undo_control"
                                        })
                                        .text('Undo')
                                        .on('click', {'table': table}, _events.tableRevertUndo)
                                    );

                $revertControl = $('<li/>', {
                                        "class": "emp-table-static-revert-link"
                                    })
                                    .append(
                                        $('<a/>', {
                                            'href': '#',
                                            'id': table.id + "_revert_control"
                                        })
                                        .text('Revert')
                                        .on('click', {'table': table}, _events.tableRevert)
                                    );
            }


            $close = $('<li/>')
                        .append(
                            $('<a/>', {
                                'href': '#',
                                'id': table.id + "_close_control"
                            })
                            .text('Close')
                            .on('click', function (evt) {
                                evt.preventDefault();

                                $close = $(evt.target);
                                $close.parents('.emp-table-responsive-column-menu').eq(0).removeClass('emp-selected');
                            })
                        );

            $divider.appendTo($menuRoot);

            if (!table.dataStore.isExternal) {
                $saveControl.appendTo($menuRoot);
                $revertControl.appendTo($menuRoot);
                $revertUndoControl.appendTo($menuRoot);
            }
            $close.appendTo($menuRoot);

            // Save off the menu
            table.config.plugins.responsive.$columnMenu = $menuRoot;

            // Save off the save control
            table.config.plugins.responsive.columnMenuControls = {};

            if (!table.dataStore.isExternal) {
                table.config.plugins.responsive.columnMenuControls.$saveControl = $saveControl;
                table.config.plugins.responsive.columnMenuControls.$revertControl = $revertControl;
                table.config.plugins.responsive.columnMenuControls.$revertUndoControl = $revertUndoControl;
            }

            fastdom.mutate(function () {
                emp.$body.append($menuRoot);
            });
        }

        // check to see if the menu is already positions
        if (table.config.plugins.responsive.$columnMenu.hasClass('emp-selected')) {
            fastdom.mutate(function () {
                // Remove the selected class to hide the menu
                table.config.plugins.responsive.$columnMenu.removeClass('emp-selected');
            });
        }
        else {
            var $columnButton = table.obj.$responsiveControl;
            var columnButtonOffset = $columnButton.offset();

            fastdom.mutate(function () {
                table.config.plugins.responsive.$columnMenu
                    .css({
                        top: (columnButtonOffset.top + $columnButton.outerHeight() + 5),
                        right: (emp.$window.width() - columnButtonOffset.left - $columnButton.outerWidth())
                    })
                    .addClass('emp-selected');

                //FIXME: Is this event being turned off anywhere?
                emp.$body.on('click', function (evt) {
                    if ($(evt.target).closest('.emp-table-responsive-column-menu').length === 0) {
                        _events.closeColumnMenu();
                    }
                });
            });
        }
    };

    // Main resize control event.
    _events.resize = function _resize (evt) {

        var table = evt.data.table;
        var resized;

        // close any open menus
        //_events.buttonMenuClose();

        clearTimeout(resized);

        resized = setTimeout(
            function () {
                _priv.reflow(table);

                table.$self.trigger('resize.table');
            },
            200
        );
    };

    // Event function that will reset the table back to defaults... kinda of
    _events.tableRevert = function _table_revert(evt) {

        evt.preventDefault();

        var table = evt.data.table;

        // Start by finding all columns that are togglable and set them back to true
        var columnsToShow = [];

        // Save the restored columns back in localStorage
        var tableArgument = 'tables.' + table.id + '.columns';

        // Turn automatic reflowing back on.
        table.config.plugins.responsive.automatic = true;

        // Check to see if there are any saved table preference. If not generate a in session set for now.
        if (!table.config.plugins.responsive.localPrefs) {

            journal.log({type: 'info', owner: 'UI', module: 'table', submodule: 'responsive', func: 'saveColumnConfig'}, 'Table: ' + table.id + ' did not have any saved configs at time of revert.');

            var columns =  {
                visible: [],
                hidden: []
            };

            for (var c = 0, cLen = table.config.plugins.responsive.columns.length; c < cLen; c++) {

                var column = table.config.plugins.responsive.columns[c];

                if (column.visibility && column.togglable) {

                    columns.visible.push(column.originalPos);
                }
                else if (!column.visibility && column.togglable) {

                    columns.hidden.push(column.originalPos);
                }

            }

            table.config.plugins.responsive.lastLocalPref = $.extend(true, {}, columns);
        }
        else {

            // Save off the old config
            table.config.plugins.responsive.lastLocalPref = $.extend(true, {}, table.config.plugins.responsive.localPrefs);
        }


        for (var i = 0, len = table.config.plugins.responsive.columns.length; i < len; i++) {

            var colDef = table.config.plugins.responsive.columns[i];

            // Filter out all of the columns that are hidden but can be showen
            if (!colDef.visibility && colDef.togglable) {

                columnsToShow.push(colDef.originalPos);
            }

        }

        if (columnsToShow.length > 0) {

            fastdom.mutate(function() {

                _priv.showColumn(table, columnsToShow, function() {

                    _priv.reflow(table);

                    table.reflow();

                    fastdom.measure(function() {

                        emp.prefs.setPage(tableArgument, false);

                        var set = emp.prefs.setPage(tableArgument, columns);

                    });

                });

            });

        }
        else {

            _priv.reflow(table);

            table.reflow();
        }

        if (table.config.plugins.responsive && table.config.plugins.responsive.columnMenuControls) {

            // Remove both save an saved text because its forced to nothing
            table.config.plugins.responsive.columnMenuControls.$saveControl.removeClass('cui-hidden');

            // Toggle Revert to now have revert undo
            table.config.plugins.responsive.columnMenuControls.$revertControl.addClass('cui-hidden');

            if (table.config.plugins.responsive.lastLocalPref && typeof table.config.plugins.responsive.lastLocalPref === "object") {
                table.config.plugins.responsive.columnMenuControls.$revertUndoControl.removeClass('cui-hidden');
            }

            table.config.plugins.responsive.lastMenuAction = "revert";
        }

    };

    _events.tableRevertUndo = function _table_revert_undo(evt) {

        evt.preventDefault();

        var table = evt.data.table;

        var hideColumns = table.config.plugins.responsive.lastLocalPref.hidden || [];
        var showColumns = table.config.plugins.responsive.lastLocalPref.visable || [];

        if (hideColumns.length) {
            _priv.hideColumn(table, hideColumns);
        }

        if (showColumns.length) {
            _priv.showColumn(table, showColumns);
        }

        table.config.plugins.responsive.columnMenuControls.$revertControl.removeClass('cui-hidden');
        table.config.plugins.responsive.columnMenuControls.$revertUndoControl.addClass('cui-hidden');

        // Make a copy back to local Preferences
        table.config.plugins.responsive.localPrefs = $.extend(true, {}, table.config.plugins.responsive.lastLocalPref);

        // Save the restored columns back in localStorage
        var tableArgument = 'tables.' + table.id + '.columns';

        // Flush out the configs
        emp.prefs.setPage(tableArgument, table.config.plugins.responsive.localPrefs);

        table.config.plugins.responsive.lastMenuAction = "revert-undo";
    };

    // Event function that will call the appropriate show or hide function based on column current state
    _events.columnMenuButton = function _column_menu_button(evt, table, colDef) {

        // Turn off automatic reflow (show/hide of columns) when the user starts picking them.
        table.config.plugins.responsive.automatic = false;

        fastdom.measure(function() {

            if (colDef.visibility) {

                _priv.hideColumn(table, colDef.originalPos);
            }
            else {

                _priv.showColumn(table, colDef.originalPos);
            }

            var currentMenuConfig = {
                hidden: [],
                visible: []
            };

            // Get all of the visuble columns
            for (var i = 0, len = table.config.plugins.responsive.columns.length; i < len; i++) {


                var column = table.config.plugins.responsive.columns[i];

                if (column.visibility && column.togglable) {

                    currentMenuConfig.visible.push(column.originalPos);

                }
                else if (!column.visibility && column.togglable) {

                    currentMenuConfig.hidden.push(column.originalPos);
                }
            }

            var saveableMenu = _priv.testMenuObject(table.config.plugins.responsive.menuConfig, currentMenuConfig);

            fastdom.mutate(function() {

                table.reflow();

                // if (saveableMenu) {

                //     if (table.config.plugins.responsive.columnMenuControls.$saveText.hasClass('cui-hidden')) {

                //         table.config.plugins.responsive.columnMenuControls.$saveControl.removeClass('cui-hidden');
                //     }
                // }
                // else {



                //     if (!table.config.plugins.responsive.columnMenuControls.$saveControl.hasClass('cui-hidden')) {

                //         table.config.plugins.responsive.columnMenuControls.$saveControl.addClass('cui-hidden');
                //     }
                // }

            });

        });

        // Fix the empty table colspan because we removed the column
        if (table.dataStore.emptyTable || table.dataStore.largeTable) {

            _priv.fixEmptyTable(table);
        }
    };

    _events.closeColumnMenu = function _close_column_menu(evt, table) {

        var $menu = $('.emp-table-responsive-column-menu.emp-selected');

        if ($menu.length) {

            $menu.removeClass('emp-selected');
        }
    };

    _events.saveColumnConfig = function _save_column_config(evt) {

        var table = evt.data.table;

        var columns = {
            hidden: [],
            visible: []
        };

        var verifyFirst = (typeof table.config.plugins.responsive.localPrefs === "object") ? true : false;

        var tableArgument = 'tables.' + table.id + '.columns';

        // Get all of the visuble columns
        for (var i = 0, len = table.config.plugins.responsive.columns.length; i < len; i++) {

            var column = table.config.plugins.responsive.columns[i];

            if (column.visibility && column.togglable) {

                columns.visible.push(column.originalPos);
            }
            else if (!column.visibility && column.togglable) {

                columns.hidden.push(column.originalPos);
            }
        }

        // Hook to prevent users from being evil
        if (verifyFirst) {

            var hasChanged = _priv.testMenuObject(columns, table.config.plugins.responsive.localPrefs);

            if (!hasChanged) {
                journal.log({type: 'info', owner: 'UI', module: 'table', submodule: 'responsive', func: 'saveColumnConfig'}, 'Save action blocked as there is nothing different to save.');

                return false;
            }

        }

        emp.prefs.setPage(tableArgument, false);

        // Update the localPrefs to contain what was just added
        table.config.plugins.responsive.localPrefs = columns;

        if (emp.prefs && typeof emp.prefs.setPage === "function") {

            var set = emp.prefs.setPage(tableArgument, columns);

            if (set) {

                table.config.plugins.responsive.menuConfig = columns;

            }
            else {

                journal.log({type: 'error', owner: 'UI', module: 'table', submodule: 'responsive', func: 'saveColumnConfig'}, 'Failed to save table column preferences.');
            }
        }
        else {

            journal.log({type: 'error', owner: 'UI', module: 'table', submodule: 'responsive', func: 'saveColumnConfig'}, 'Could not save table column config as preferences setPage is not a function.');
        }

        table.config.plugins.responsive.lastMenuAction = "save";

        // Set revert back to the default just in case undo is still the default value
        var $menu = $('.emp-table-responsive-column-menu.emp-selected');

        if ($menu.length) {

            $menu.removeClass('emp-selected');
        }
    };

    // ===================
    // Prototype Functions
    // ===================

    _prototype.deleteStyleSheets = function _delete_style_sheets() {

        var table = this;

        stylesheet.deleteSheet(table.id + "-screen");
        stylesheet.deleteSheet(table.id + '-print');
    };

    _prototype.responseiveReflow = function _responsive_reflow(source) {

        var table = this;

        _priv.reflow(table, false, false, source);
    };

    _prototype.showAllColumns = function _responsive_show_all_columns(columnsToShow) {

        var table = this;

        fastdom.mutate(function() {

            _priv.showColumn(table, columnsToShow, function() {

                _priv.reflow(table);

                table.reflow();

            });

        });
    };

    _prototype.revertResponsiveView = function _revert_responsive_view(evt) {

        _events.tableRevert(evt);

    };

    // ===============
    // Setup Functions
    // ===============

    _setup.responsive = function _responsive (table, next) {

        //console.log(table);

        // start by defining some style sheets These we will keep for the long haul
        table.config.plugins.responsive.stylesheet = stylesheet.newSheet(table.id + "-screen");
        table.config.plugins.responsive.printStyleSheet = stylesheet.newSheet(table.id + '-print', 'print');

        if (table.dataStore && table.dataStore.attributes['data-type'] && table.dataStore.attributes['data-type'] === "pivot") {
            journal.log({type: 'info', owner: 'UI', module: 'table', submodule: 'responsive', func: 'setup'}, 'Bypassing plugin because table is listed as pivot. For' + ' table: ' + table.id);
            next();
        }

        var responsiveOption = table.$self.attr('data-responsive');

        if (responsiveOption === "false") {

            table.config.setup.responsive = false;
        }

        // Check to make sure that responsive should be setup on this table
        if (table.config.setup.responsive) {

            table.obj.$responsiveControl = table.obj.$tableWrapper.find('.emp-table-responsive-column-control');

            table.obj.$responsiveControl.on('click', function(evt) {
                _events.columnMenu(evt, table);
            });

            // Make a clone of the table
            var $tableClone = table.obj.$viewWrapper.clone().wrap('<div class="emp-table">').parent();

            if (table.dataStore.body && table.dataStore.body.rows.length > 100) {
                $tableClone.find('table tbody tr:gt(100)').remove();
            }

            // Before adding it, add the class needed to kep the column hidden
            $tableClone.addClass('table-responsive-copy');
        }

        var tableMinWidths = [];

        // We need to make some quick dom updates
        fastdom.mutate(function () {

            if (table.config.setup.responsive) {

                // Add it to the page
                emp.$body.append($tableClone);

            }

            fastdom.measure(function () {

                var currentTableSize = emp.$window.outerWidth();

                // Save off the current window sizes
                table.config.plugins.responsive.previousSize = currentTableSize;
                table.config.plugins.responsive.currentSize = currentTableSize;

                if (table.config.setup.responsive) {

                    var $headers = $tableClone.find('table thead tr').eq(0).children('th');

                    for (var i = 0, len = $headers.length; i < len; i++) {

                        var minWidth = $($headers[i]).outerWidth();

                        // Override to ensure a specific minimum width
                        if (minWidth < 32) {
                            minWidth = 32;
                        }

                        tableMinWidths.push(minWidth);
                    }
                }

                fastdom.mutate(function () {

                    if ($tableClone) {

                        // Remove the copy as we no longer need it.
                        $tableClone.remove();
                    }

                    // Save off the minimum column lengths found
                    table.config.plugins.responsive.columnMins = tableMinWidths;

                    // Call the column definition creation function
                    _priv.createColumnDefinitions(table);

                    // Now that the column definitions have been created create the show/hide order
                    _priv.priorityOrder(table);

                    if (table.config.setup.responsive) {

                        if (!table.dataStore.isExternal) {

                            var userTablePreferences = emp.prefs.getPage('tables.' + table.id + '.columns');
                            var invalidTablePref = false;

                            table.config.plugins.responsive.localPrefs = userTablePreferences;

                            if (!table.config.plugins.responsive.localPrefs || typeof table.config.plugins.responsive.localPrefs !== "object" || (typeof table.config.plugins.responsive.localPrefs === "object" && !Object.keys(table.config.plugins.responsive.localPrefs).length) ) {
                                table.config.plugins.responsive.localPrefs = false;
                            }

                            // Additional column test if table preferences are found
                            if (typeof userTablePreferences === "object" && (userTablePreferences.visible || userTablePreferences.hidden)) {

                                var userPrefVisibleCount = (userTablePreferences.visible && Array.isArray(userTablePreferences.visible) && userTablePreferences.visible.length) ? userTablePreferences.visible.length : 0;
                                var userPrefHiddenCount = (userTablePreferences.hidden && Array.isArray(userTablePreferences.hidden) && userTablePreferences.hidden.length) ? userTablePreferences.hidden.length : 0;
                                var userTotalPrefCount = userPrefVisibleCount + userPrefHiddenCount;

                                if (userTotalPrefCount !== table.config.plugins.responsive.order.length) {
                                    invalidTablePref = true;
                                }

                                // Continue test in case the column count matches.
                                if (!invalidTablePref) {

                                    var hiddenColZero, visibleColZero = false;

                                    if (!invalidTablePref && userTablePreferences && userTablePreferences.hidden && userTablePreferences.visible && (userTablePreferences.hidden.length >= 1 || userTablePreferences.visible.length >=1)) {

                                        table.config.plugins.responsive.savedConfig = true;

                                        table.config.plugins.responsive.menuConfig = userTablePreferences;
                                    }
                                }
                            }
                            else {

                                journal.log({type: 'info', owner: 'UI', module: 'table', submodule: 'responsive', func: 'setup'}, 'No table preferences were found for' + ' table: ' + table.id);
                            }

                            if (invalidTablePref) {

                                journal.log({type: 'warning', owner: 'UI', module: 'table', submodule: 'responsive', func: 'setup'}, 'Table saved preferences were considered invalid and removed!');

                                userTablePreferences = false;

                                table.config.plugins.responsive.localPrefs = false;

                                table.config.plugins.responsive.savedConfig = false;

                                table.config.plugins.responsive.menuConfig = {
                                    hidden: [],
                                    visible: []
                                };

                                emp.empMessage.createMessage({text:"Your saved table preferences were removed because the table structure no longer matches. Please recreate and save your table preferences.", type:"warning"}, {pageNotifier: false, scroll:false, field:table.$self});

                                emp.prefs.setPage('tables.' + table.id + '.columns', false);
                            }

                        }
                        else {
                            journal.log({ type: 'info', owner: 'UI', module: 'table', submodule: 'responsive', func: 'setup' }, 'skipping table preferences for external');
                        }

                    }

                    fastdom.measure(function() {

                        if (table.config.plugins.responsive.order.length >= 1 && table.config.setup.responsive) {

                            // Expose a way that settings can be pasted in to hide user hidden columns
                            var columnsToHide = table.config.plugins.responsive.colState.always.hidden.concat(table.config.plugins.responsive.colState.hidden);

                            if (typeof userTablePreferences === "object" && userTablePreferences.hidden && userTablePreferences.visible) {

                                // Check for indexs that should be hidden
                                if (Array.isArray(userTablePreferences.hidden) && userTablePreferences.hidden.length > 0) {

                                    for (var h = 0, hLen = userTablePreferences.hidden.length; h < hLen; h++) {

                                        // Check to make sure the index is in the to be hidden array
                                        if (columnsToHide.indexOf(userTablePreferences.hidden[h]) === -1) {

                                            columnsToHide.push(userTablePreferences.hidden[h]);
                                        }
                                    }

                                }

                                // Check for indexs that should be visible
                                if (Array.isArray(userTablePreferences.visible) && userTablePreferences.visible.length > 0) {

                                    for (var v = 0, vLen = userTablePreferences.visible.length; v < vLen; v++) {

                                        // Check to make sure the index is not the to be columns to hide array
                                        if (columnsToHide.indexOf(userTablePreferences.visible[v]) !== -1) {

                                            var visPos = columnsToHide.indexOf(userTablePreferences.visible[v]);

                                            // Remove column from to hide array as it should be shown.
                                            columnsToHide.splice(visPos, 1);
                                        }
                                    }

                                }

                                // Turn automatic reflowing of as a specific table arrangement was requested.
                                table.config.plugins.responsive.automatic = false;

                            }


                            // Check to see if any columns have been marked as hidden always or hidden initially
                            if (columnsToHide.length) {

                                // Call the hide column private function
                                _priv.hideColumn(table, columnsToHide);
                            }

                            // Setup window reflow event
                            emp.$window.on('resize', {table: table}, _events.resize);


                            // Reflow the table.
                            _priv.reflow(table, false, true);
                        }

                        // Fix the empty table colspan because we removed the column
                        if (table.dataStore.emptyTable || table.dataStore.largeTable) {

                            _priv.fixEmptyTable(table, true);
                        }

                    });
                });
            });
        });


        // Items to do when the debind table function is called.
        table.$self.on('debind', function () {

            emp.$window.off('resize', _events.resize);

        });

        next();
    };

    return {
        _setup: _setup,
        _defaults: _defaults,
        _prototype: _prototype
    };

});
