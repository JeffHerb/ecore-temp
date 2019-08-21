// $ json-server audit.json
// http://localhost:8888/dist/tests/table/selection-popup.html

define([], function () {
    ///////////////
    // Constants //
    ///////////////

    var CLASSES = {
        // Global classes used and defined outside of this plugin
        hidden: 'cui-hidden',
        uiOnly: 'cui-ui-only',
        hideSpinner: 'cui-hide-spinner',
        hideFromScreen: 'cui-hide-from-screen',
        rowFlex: 'cui-flex-row',
        colSmall: 'cui-col-small',
        colFlexSmall: 'cui-flex-col-small',
        colFixedSmall100: 'cui-fixed-col-small-100px',
        colFixedSmall20: 'cui-fixed-col-small-20px',
        datePicker: 'cui-c-datepicker',
        icon: 'cui-icon',

        // Table component classes
        controlRow: 'emp-icon-table-filter-toggle',

        // Plugin-specific classes that are only used here
        filterRow: 'emp-filter-row emp-tablefilter-wrapper',
        filterCell: 'emp-tablefilter-cell',
        filterInput: 'emp-tablefilter-input',
        filterNone: 'emp-tablefilter-none',
        filterPane: 'emp-tablefilter-optionpane',
        filterSelectedParam: 'emp-tablefilter-optionpane-selected-option',
        optionPaneRadioOption: 'emp-tablefilter-optionpane-radio-option',
        optionPaneClose: 'emp-tablefilter-optionpane-close',
        datePaneSection: 'emp-tablefilter-optionpane-date-section',
        datePaneSelection: 'emp-tablefilter-optionpane-date-selection',
        datePaneControls: 'emp-tablefilter-optionpane-date-controls',
        datePaneRangeRuleCheckbox: 'emp-tablefilter-range-checkbox',
        dataPaneLabel: 'emp-tablefilter-optionpane-date-label',
        datePaneStateRange: 'emp-tablefilter-optionpane-startRange',
        datePaneEndRange: 'emp-tablefilter-optionpane-endRange',
        datePaneRangeInput: 'emp-tablefilter-optionpane-date-input-begin',
        datePaneRangeCheckbox: 'emp-tablefilter-optionpane-date-check-begin',
        datePaneMatchingMonth: 'emp-tablefilter-optionpane-date-month',
        datePaneMatchingDay: 'emp-tablefilter-optionpane-date-day',
        datePaneMatchingYear: 'emp-tablefilter-optionpane-date-year',
    };

    // Miscellaneous values that are referenced by multiple functions
    var VALUES = {
            dateRegex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
            dateButtonDefaultText: '&nbsp;',
            inputTimer: 350,
            attributes: {
                dataFilterIndex: 'data-filter-index',
                dataColIndex: 'data-col-index',
            },
            ignoreFocusEventAttr: 'data-ignore-next-focus',
    };

    var DATE_SETTINGS = {
        isSet: false, // Whether any values have been applied at all. If `false`, then this rule should be ignored
        range: {
            enabled: false,
            begin: '',
            end: '',
        },
        matching: {
            enabled: false,
            day: 0,
            month: 0,
            year: 0,
        },
        lastSearch: ''
    };

    // Private globals

    var _priv = {};
    var _setup = {};
    var _events = {};
    var _rules = {};
    var _prototype = {};
    var _defaults = {
        setup: {
            filter: true,
        },
        plugins: {
            filter: {
            },
        },
    };
    var _typingTimer;

    // Elements used in the date option pane
    var $dateRangeCheckbox;
    var $dateRangeBeginCheckbox;
    var $dateRangeBeginInput;
    var $dateRangeEndCheckbox;
    var $dateRangeEndInput;
    var $dateMatchCheckbox;
    var $dateMatchInputMonth;
    var $dateMatchInputDay;
    var $dateMatchInputYear;
    var $dateMatchInputHidden;
    var $includeBlankCheckbox;

    //////////////////
    // Rule methods //
    //////////////////

    // These methods evaluate a given cell against a filter rule. They are called by `_priv.executeFilters()` as needed. There is one function for each rule type.

    _rules.alpha = function _rulesAlpha (colRule, dataStore /*, table*/) {
        var compareValue = colRule.compareValue.toLowerCase().trim();

        // Check to make sure the value exists
        if (typeof compareValue !== 'undefined' && compareValue !== '') {
            // We have a comparison so get the actual cell value from the dataStore.
            var cellValue = _priv.getColumnValue(dataStore).toLowerCase().trim();

            // First check to see if the cell is empty
            if (cellValue === '') {
                return false;
            }
            // alpha check is simply to verify the index exists
            else if (cellValue.indexOf(compareValue) === -1) {
                // Index not found; skip
                return false;
            }
        }

        // All is fine fallback
        return true;
    };

    _rules.alphaNumeric = function _rulesAlphaNumeric (colRule, dataStore) {

        var compareValue = colRule.compareValue.toLowerCase().trim();

        // Check to make sure the value exists
        if (typeof compareValue !== 'undefined' && compareValue !== '') {
            // We have a comparison so get the actual cell value from the dataStore.
            var cellValue = _priv.getColumnValue(dataStore).toLowerCase().trim();

            // First check to see if the cell is empty
            if (cellValue === '') {
                return false;
            }
            // alpha check is simply to verify the index exists
            else if (cellValue.indexOf(compareValue) === -1) {
                // Index not found; skip
                return false;
            }
        }

        // All is fine fallback
        return true;
    };

    _rules.numeric = function _rulesNumeric (colRule, dataStore /*, table*/) {

        var compareValue = colRule.compareValue.toLowerCase().trim();

        // Check to make sure the value exists
        if (typeof compareValue !== 'undefined' && compareValue !== '') {
            // We have a comparison so get the actual cell value from the dataStore.
            var cellValue = _priv.getColumnValue(dataStore).toLowerCase().trim();

            // Strip commas from the value because `parseFloat` can't handle them (e.g. it thinks `3,000` is `3`)
            cellValue = cellValue.replace(/,/g, '');

            if (!colRule.filterParams) {
                colRule.filterParams = 'gte';
            }

            // Parse the values
            compareValue = (isNaN(parseFloat(compareValue))) ? 0: parseFloat(compareValue);
            cellValue =    ( isNaN( parseFloat(cellValue) ) ) ? 0 : parseFloat(cellValue);

            switch (colRule.filterParams) {
                case 'gt':
                    if (cellValue > compareValue) {
                        return true;
                    }

                    break;

                case 'gte':

                    if (cellValue >= compareValue) {
                        return true;
                    }

                    break;

                case 'eq':

                    if (cellValue === compareValue) {

                        return true;
                    }

                    break;

                case 'lt':
                    if (cellValue < compareValue) {
                        return true;
                    }

                    break;

                case 'lte':
                    if (cellValue <= compareValue) {
                        return true;
                    }

                    break;

                case 'co':
                    if (cellValue.toString().indexOf(compareValue.toString()) !== -1) {
                        return true;
                    }

                    break;

                default:
                    // Fallback to skipping the row
                    return false;
            }
        }

        // Fallback to skipping the row
        return false;
    };

    _rules.score = function _rulesScore (colRule, dataStore /*, table*/) {
        var compareValue = colRule.compareValue.toLowerCase().trim();

        // Check to make sure aa
        if (compareValue !== null && compareValue !== undefined && compareValue !== '') {
            // We have a comparison so get the actual cell value from the dataStore.
            var cellValue = _priv.getColumnValue(dataStore).toLowerCase().trim();

            if (colRule.filterParams === undefined) {
                colRule.filterParams = 'gte';
            }

            // Parse the values
            compareValue = (isNaN(parseFloat(compareValue))) ? 0: parseFloat(compareValue);
            cellValue =    ( isNaN( parseFloat(cellValue) ) ) ? 0 : parseFloat(cellValue);

            switch (colRule.filterParams) {
                case 'gt':
                    if (cellValue > compareValue) {
                        return true;
                    }

                    break;

                case 'gte':

                    if (cellValue >= compareValue) {
                        return true;
                    }

                    break;

                case 'eq':

                    if (cellValue === compareValue) {

                        return true;
                    }

                    break;

                case 'lt':
                    if (cellValue < compareValue) {
                        return true;
                    }

                    break;

                case 'lte':
                    if (cellValue <= compareValue) {
                        return true;
                    }

                    break;

                case 'co':
                    if (cellValue.toString().indexOf(compareValue.toString()) !== -1) {
                        return true;
                    }

                    break;

                default:
                    // Fallback to skipping the row
                    return false;
            }
        }

        // Fallback to skipping the row
        return false;
    };

    _rules.notifier = function _rulesNotifier (colRule, dataStore /*, table*/) {
        var cellValue = _priv.getColumnValue(dataStore);

        switch (colRule.compareValue) {
            // Special values:

            // Rows with no notifiers
            case ':none':
                if (cellValue === '' || cellValue === undefined) {
                    return true;
                }
                else {
                    return false;
                }

                break;

            // Rows with some notifier(s)
            case ':any':
                if (cellValue !== '') {
                    return true;
                }
                else {
                    return false;
                }

                break;

            // Rows with the specified notifier
            default:
                if (cellValue === undefined) {
                    cellValue = '';
                }
                else {
                    cellValue = cellValue.toLowerCase();
                }

                // Check and match for a compare
                if (colRule.compareValue === cellValue) {
                    return true;
                }
                else {
                    return false;
                }

                break;
        }
    };

    _rules.date = function _rulesDate (colRule, dataStore /*, table*/) {
        var cellValue = _priv.getColumnValue(dataStore);
        var settings = colRule.dateSettings;
        var failsToSatisfyCondition = false;
        var cellValuePieces;

        // "Matching" option
        if (settings.matching.enabled) {
            if (VALUES.dateRegex.test(cellValue)) {
                // Break the column value into pieces
                cellValuePieces = VALUES.dateRegex.exec(cellValue).splice(1);

                // Check against each piece as long as the user has provided a value (i.e. ignore if the rule value is not > 0)

                // Exact match for the month
                if (settings.matching.month && settings.matching.month !== parseInt(cellValuePieces[0], 10)) {
                    failsToSatisfyCondition = true;
                }
                // Exact match for the day
                else if (settings.matching.day && settings.matching.day !== parseInt(cellValuePieces[1], 10)) {
                    failsToSatisfyCondition = true;
                }
                // Allow partial match for the year
                else if (settings.matching.year && cellValuePieces[2].indexOf(settings.matching.year) === -1) {
                    failsToSatisfyCondition = true;
                }
            }
            else if(settings.matching.month || settings.matching.day || settings.matching.year){
                failsToSatisfyCondition = true;
            }
        }

        // "Range" option
        if (settings.range.enabled) {
            // Check the row's validity:
            if(VALUES.dateRegex.test(cellValue)){

                // Convert the cell's value to a Date object
                cellValue = new Date(cellValue);

                // Test against begin date only
                if (settings.range.begin && !settings.range.end) {
                    // `cellValue` must be newer than the begin date (inclusive)
                    if (cellValue - new Date(settings.range.begin) < 0) {
                        failsToSatisfyCondition = true;
                    }
                }
                // Test against end date only
                else if (!settings.range.begin && settings.range.end) {
                    // `cellValue` must be older than the end date (inclusive)
                    if (new Date(settings.range.end) - cellValue < 0) {
                        failsToSatisfyCondition = true;
                    }
                }
                // Test against both begin and end dates
                else if (settings.range.begin && settings.range.end) {
                    // `cellValue` must be older than the end date (inclusive) or newer than the begin date (inclusive)
                    if ((new Date(settings.range.end) - cellValue < 0) || (cellValue - new Date(settings.range.begin) < 0)) {
                        failsToSatisfyCondition = true;
                    }
                }
            }
            else if(settings.range.begin || settings.range.end){
                failsToSatisfyCondition = true;
            }
        }
        // Else, neither range nor matching was enabled, so the rule is satisfied by default

        return !failsToSatisfyCondition;
    };

    _rules.rating = function _ruleRating (colRule, dataStore) {

        var compareValue = colRule.compareValue;

        if (compareValue !== "") {

            var ratingCompare = parseFloat(colRule.compareValue);

            var cellValue = dataStore.contents[0];

            if (typeof cellValue === "object" && cellValue.type === "rating") {

                cellValue = cellValue.parts.hidden.input.attributes.value;

                if (cellValue !== undefined && parseFloat(cellValue) === parseFloat(compareValue)) {

                    return true;
                }
                else {

                    return false;
                }

            }
            else {

                return false;
            }


        }

        return true;
    };

    _rules.link = function _ruleLink (colRule, dataStore) {
        var compareValue = colRule.compareValue.toLowerCase().trim();

        // Check to make sure the value exists
        if (typeof compareValue !== 'undefined' && compareValue !== '') {
            // We have a comparison so get the actual cell value from the dataStore.
            var cellValue = _priv.getColumnValue(dataStore).toLowerCase().trim();

            // First check to see if the cell is empty
            if (cellValue === '') {
                return false;
            }
            // alpha check is simply to verify the index exists
            else if (cellValue.indexOf(compareValue) === -1) {
                // Index not found; skip
                return false;
            }
        }

        // All is fine fallback
        return true;
    };

    ///////////////////////////
    // Data store management //
    ///////////////////////////

    _priv.getColumnValue = function _getColumnValue (dataStore) {
        // First check for contents array
        if (dataStore.contents && dataStore.contents.length > 0) {
            // we have contents, so look through all of the contents and find values
            var cellContents = '';

            for (var i = 0, len = dataStore.contents.length; i < len; i++) {

                // Handle inputs
                if (dataStore.contents[i].template && dataStore.contents[i].template === 'field') {
                    if (dataStore.contents[i].input.attributes && dataStore.contents[i].input.attributes.value) {
                        cellContents += dataStore.contents[i].input.attributes.value;
                    }
                }
                // Handle score component
                else if (dataStore.contents[i].template && dataStore.contents[i].template === 'score') {
                    if (dataStore.contents[i].percentage) {
                        cellContents += dataStore.contents[i].percentage;
                    }
                }
                else {
                    cellContents += dataStore.contents[i].text;
                }
            }

            return cellContents;
        }
        else {
            return (dataStore.text === undefined) ? '' : dataStore.text;
        }
    };

    /**
     * Iterates through the rules and applies them to the table rows
     *
     * This is the main function that actually applies the filters to the table's data store and causes its view to be refreshed
     *
     * @param   {Object}  table  Table instance
     */
    _priv.executeFilters = function _executeFilters (table) {

        var filterColRules = [];
        var i;
        var len;
        var j;
        var jLen;
        var colRule;
        var ruleType;
        var dateColRules = []; // Holds the parameters that need to be passed to `_priv.positionPane()` for open date panes

        // Start by looking for the headers that are causing the table columns that need to be filtered.
        for (i = 0, len = table.config.plugins.filter.filterRow.length; i < len; i++) {
            if (table.config.plugins.filter.filterRow[i].compareValue !== '' || (table.config.plugins.filter.filterRow[i].hasOwnProperty('dateSettings') && table.config.plugins.filter.filterRow[i].dateSettings.isSet)) {
                filterColRules.push(table.config.plugins.filter.filterRow[i]);
            }
        }

        table.resetLoadRecord();

        var filteredSelected = false;

        // Only continue if we found that a column is requesting to be filtered.
        if (filterColRules.length > 0) {

            // Now we need to loop through each row and apply said filters
            bodyRows:
            for (i = 0, len = table.dataStore.body.rows.length; i < len; i++) {

                // Unset the initial skip value back to false
                table.dataStore.body.rows[i].skip = false;

                // Loop throught the different header items
                filterDefs:
                for (j = 0, jLen = filterColRules.length; j < jLen; j++) {
                    colRule = filterColRules[j];
                    ruleType = colRule.filter;

                    // Override to route to correct filter function
                    switch(ruleType) {

                        case 'currency':
                        case 'score':
                            ruleType = 'numeric';
                            break;
                    }

                    // Only continue with this filter check it there is a known filter rule related to it
                    if (typeof _rules[ruleType] === 'function') {
                        var colDataStore = table.dataStore.body.rows[i].columns[colRule.dataStoreIndex];
                        var result = _rules[ruleType](colRule, colDataStore, table);

                        // Check if this is a date rule with an open option pane
                        if (ruleType === 'date') {
                            // Make sure we haven't already stored this column's info (the loop will run for every row in the table and we want to avoid duplicates)
                            if (dateColRules.indexOf(colRule) === -1) {

                                // Add the parameter that we'll need to later when we call `_priv.positionPane()`
                                dateColRules.push(colRule);
                            }
                        }

                        if (!result) {
                            // mark the table as skipable
                            table.dataStore.body.rows[i].skip = true;

                            // include rows with blank data
                            if(ruleType === 'date') {

                                if($includeBlankCheckbox[0].checked){

                                    if (!colDataStore.text || colDataStore.text === '') {
                                        table.dataStore.body.rows[i].skip = false;
                                    }
                                }
                            }

                            if (table.dataStore.body.rows[i].selected) {
                                filteredSelected = true;
                            }

                            continue bodyRows;
                        }
                    }
                    else {

                        journal.log({type: 'error', owner: 'UI', module: 'table', submodule: 'filters', func: 'executeFilters'}, 'Could not find valid ruleType:' + ruleType);
                    }
                }
            }
        }
        else {

            journal.log({type: 'info', owner: 'UI', module: 'table', submodule: 'filters', func: 'executeFilters'}, 'Could not identify the row attempting to be filtered.');

            for (i = 0, len = table.dataStore.body.rows.length; i < len; i++) {
                // Unset the initial skip value back to false
                table.dataStore.body.rows[i].skip = false;
            }
        }

        // Re-render the table
        table.renderBody();

        // There may be date option panes that need to be repositioned if the width of the button or table columns changed
        if (dateColRules.length) {
            dateColRules.forEach(function _executeFilters_dateLoop (dateColRule) {
                if (colRule.$options && dateColRule.optionsVisibile) {

                    // Use a timer to allow the table to reflow first
                    setTimeout(function _executeFilters_dateLoop_timeout () {

                        _priv.positionPane(dateColRule.$filterControl, dateColRule, table, true);
                    }, 100);
                }

                _priv.setButtonText(dateColRule);
            });
        }

        if (table.dataStore.selectable) {

            // var $firstCell = table.config.plugins.filter.$filterRow.find('td').eq(0);
            // var $firstCellContents = $firstCell.children();

            // if (filteredSelected && $firstCellContents.length === 0) {

            //     $('<span>', {
            //         class: 'emp-icon-warning',
            //         title: "Current filter is hidding selected rows"
            //     }).appendTo($firstCell);
            // }
            // else if (!filteredSelected && $firstCellContents.length) {

            //     $firstCell.empty();
            // }

            // Clear all selections on filter.
            table.setAllSelection(false, table);
        }

        table.$self.trigger('table.filter');
    };

    _priv.setButtonText = function _setButtonText (colRule) {
        var buttonText = '';
        var settings = colRule.dateSettings;
        var isMatchingRuleInvalid = false;
        var isRangeRuleInvalid = false;

        // "Matching" option
        if (settings.matching.enabled) {
            // Month
            if (settings.matching.month) {
                if (settings.matching.month < 10) {
                    buttonText += '0'; // Leading zero
                }

                buttonText += settings.matching.month; // Actual value
            }
            else {
                buttonText += '__';
            }

            // Separator
            buttonText += '/';

            // Day
            if (settings.matching.day) {
                if (settings.matching.day < 10) {
                    buttonText += '0';
                }

                buttonText += settings.matching.day;
            }
            else {
                buttonText += '__';
            }

            // Separator
            buttonText += '/';

            // Year
            if (settings.matching.year) {
                buttonText += '' + settings.matching.year; // Convert to string so leading zeros are not dropped
            }
            else {
                buttonText += '____';
            }

            // No values were actually entered. This happens when the box is checked but no valid values were typed.
            if (buttonText === '__/__/____') {
                buttonText = '';
                isMatchingRuleInvalid = true;
            }
        }

        // "Range" option
        if (settings.range.enabled) {
            // Only the Begin date was set
            if (settings.range.begin && !settings.range.end) {
                buttonText = 'Begin ' + settings.range.begin;
            }
            // Only the End date was set
            else if (!settings.range.begin && settings.range.end) {
                buttonText = 'End ' + settings.range.end;
            }
            // Both begin and end dates were set
            else if (settings.range.begin && settings.range.end) {
                buttonText = settings.range.begin + ' - ' + settings.range.end;
            }
            // Neither one is properly set
            else {
                isRangeRuleInvalid = true;
            }
        }
        // Else, neither range nor matching was enabled, so the rule is satisfied by default

        // Validate the button text:

        // Both types of filters were applied
        if (!isRangeRuleInvalid && !isMatchingRuleInvalid && settings.matching.enabled && settings.range.enabled) {
            // This is too complex to describe in the small amount of space occupied by the button, so just display a generic message
            buttonText = '<em>(Multiple)</em>';
        }
        // Fall back to the default text if nothing was set
        else if (buttonText.length === 0) {
            buttonText = VALUES.dateButtonDefaultText;
        }

        // Update the button element
        colRule.$filterControl.html(buttonText);
    };

    /**
     * Interprets the state of the date range UI and updates the filter accordingly
     *
     * The `_updateDateRangeSettings` argument is useful for performance reasons, e.g. if you will be performing a series of changes and do not want to update the table until all changes are finished
     *
     * @param   {Object}   table                Table instance
     * @param   {Object}   colRule              Column rule object
     * @param   {Boolean}  doNotExecuteFilters  Do not update the table view by calling `_priv.executeFilters()`. Optional.
     */
    _priv.updateDateRangeSettings = function _updateDateRangeSettings (table, colRule, doNotExecuteFilters) {

        // Validate the user's entry and normalize the date value as mm/dd/yyyy
        var __getDateValue = function __getDateValue (value) {

            var parts; // Pieces of the date (month, day, and year)

            // Only proceed if the value is a valid date
            if (VALUES.dateRegex.test(value)) {
                // Make sure the month and day are zero-padded so it exactly fits the MM/DD/YYYY format
                parts = VALUES.dateRegex.exec(value);

                // Reset the value to an empty string which will will build back up with the matching pieces from the regex
                value = '';

                // Month
                if (parts[1].length === 1) {
                    value += '0';
                }

                value += parts[1] + '/';

                // Day
                if (parts[2].length === 1) {
                    value += '0';
                }

                value += parts[2] + '/';

                // Year
                value += parts[3];

                return value;
            }
            else {
                return '';
            }
        };

        var lastSearch = colRule.dateSettings.lastSearch;

        // Begin date

        // Update the actual date value that goes with this check box in our rule object
        if ($dateRangeBeginCheckbox.is(':checked')) {
            // Update the rule
            colRule.dateSettings.range.begin = __getDateValue($dateRangeBeginInput.val().trim());
        }
        else {
            // Clear the entry in the rule object if the box is unchecked so that the value will not apply. The user's typed-in value will remain in the check box, we just don't want it to affect the filtering of the table.
            colRule.dateSettings.range.begin = '';
        }

        // End date

        if ($dateRangeEndCheckbox.is(':checked')) {
            colRule.dateSettings.range.end = __getDateValue($dateRangeEndInput.val().trim());
        }
        else {
            colRule.dateSettings.range.end = '';
        }

        // Re-evaluate the table based on the updated rules, unless the caller requested not to do so
        if (!doNotExecuteFilters) {

            var nextSearch = colRule.dateSettings.range.begin + "|" + colRule.dateSettings.range.end;

            if (nextSearch !== lastSearch) {


                if (lastSearch === "" && nextSearch === "|") {

                    colRule.dateSettings.lastSearch = nextSearch;
                }
                else {

                    colRule.dateSettings.lastSearch = nextSearch;

                    _priv.executeFilters(table);
                }

            }

        }

        return colRule;
    };

    ////////////////////////
    // UI and DOM methods //
    ////////////////////////

    /**
     * Creates the UI of the filter row and its inputs
     *
     * @param   {Event}  evt  [description]
     * @return  {[type]}       [description]
     */
    _priv.generateFilterRow = function _generateFilterRow (evt, tableRef) {

        fastdom.measure(function _generateFilterRow_a () {

            var $row = $('<tr/>');
            var table = false;
            var $firstRow = false;
            if (evt) {
                table = evt.data.table;
                $firstRow = table.obj.$thead.children('tr').eq(0).children('th');
            }
            else {
                table = tableRef;
                $firstRow = tableRef.obj.$thead.children('tr').eq(0).children('th');
            }
            var i;
            var len;
            var j;
            var jLen;

            // Create the storage object
            var row = [];

            // Setup `<tr>`
            $row
                .addClass(CLASSES.filterRow)
                .addClass(CLASSES.uiOnly);

            // Loop through the header
            for (i = 0, len = $firstRow.length; i < len; i++) {
                // Create the header cell
                var $filterCell = $('<td/>',
                                        {
                                            'class': CLASSES.filterCell,
                                        })
                                        .attr(VALUES.attributes.dataFilterIndex, i);

                var colRule = {
                        filter: false,
                        $options: false,
                        width: 'auto',
                        compareValue: '',
                        filterParams: false,
                        dataStoreIndex: false
                    };

                // Get the header cell for reference
                var $headerCell = $($firstRow[i]);

                // Lookup the column
                var colStore = table.dataStore.head.rows[0].columns[$headerCell.attr(VALUES.attributes.dataColIndex)];

                // Save off the header cell reference
                colRule.$headerCell = $headerCell;

                // Check to see if this column is either hidden or one of our support column
                if (colStore === undefined || colStore.visibility === 'hidden' ||
                    $headerCell.hasClass('table-control-col') || (colStore.attribute && colState.attribute['data-type'] === 'button') ||
                        (colStore.attribute && colState.attribute['data-type'] === 'buttonMenu') ) {

                    // For the hidden table cells do nothing!
                    if (colStore !== undefined && colStore.visibility && colStore.visibility === 'hidden') {
                        // create now jQuery element for this cell
                        colRule.$filterCell = $filterCell.addClass(CLASSES.hidden);
                    }
                    else {
                        colRule.$filterCell = $filterCell.addClass(CLASSES.filterNone);
                    }
                }
                // Let's assume that this is a filterable column
                else {
                    // Save off the dataStore index
                    colRule.dataStoreIndex = $headerCell.attr(VALUES.attributes.dataColIndex);

                    // Pull out the data-type bill
                    colRule.filter = (colStore.attributes && colStore.attributes['data-type']) ? colStore.attributes['data-type'] : 'alpha';

                    if (colRule.filter === 'alpha' && colStore.style && colStore.style.indexOf('min-width') !== -1) {
                        colRule.filter = 'notifier';
                    }

                    // Create a filter control based on the column's type
                    switch (colRule.filter) {
                        case 'alpha':
                        case 'alphaNumeric':
                        case 'link':
                            colRule.$filterControl = $('<input/>',
                                                        {
                                                            'id': table.id + '_input_filter_' + i,
                                                            'class': CLASSES.filterInput,
                                                            'data-text': "text",
                                                            'type': 'text',
                                                        })
                                                        .attr('size', '1') // This attribute must be present to control its size with CSS; the value doesn't matter
                                                        .on('keyup', {table: table}, _events.onInitialInputKeyup)
                                                        .on('mouseup', {table: table}, _events.onInputMouseUp);

                            $filterCell.append(colRule.$filterControl);

                            break;

                        case 'date':
                            colRule.$filterControl = $('<button/>',
                                                        {
                                                            'id': table.id + '_button_filter_' + i,
                                                            'class': CLASSES.filterInput,
                                                            'data-text': "date",
                                                            'type': 'button',
                                                            //'size': '1',
                                                        })
                                                        .attr('size', '1')
                                                        .on('click', {table: table}, _events.onDateFilterButtonClick)
                                                        .on('keyup',   {table: table}, _events.onDateFilterButtonFocus)
                                                        .html('&nbsp;');

                            $filterCell.append(colRule.$filterControl);

                            // Add the standard date settings object
                            colRule.dateSettings = $.extend(true, {}, DATE_SETTINGS);

                            break;

                        case 'numeric':
                        case 'currency':
                        case 'score':
                            colRule.$filterControl = $('<input/>',
                                                        {
                                                            'id': table.id + '_input_filter_' + i,
                                                            'class': CLASSES.filterInput,
                                                            'type': 'text',
                                                            'data-text': "numbers",
                                                            //'size': '1',
                                                        })
                                                        .attr('size', '1')
                                                        .on('keyup',   {table: table}, _events.onInitialInputKeyup)
                                                        .on('keypress', {table: table}, _events.onInputNumberKeyPress)
                                                        .on('keydown', {table: table}, _events.onInputKeyDown)
                                                        .on('focus',   {table: table}, _events.onInputFocus)
                                                        .on('mouseup', {table: table}, _events.onInputMouseUp);

                            $filterCell.append(colRule.$filterControl);

                            break;

                        case 'notifier':

                            var notifierOptions = [];

                            for (j = 0, jLen = table.dataStore.body.rows.length; j < jLen; j++) {
                                var column = table.dataStore.body.rows[j].columns[$headerCell.attr(VALUES.attributes.dataColIndex)];
                                var columnValue = _priv.getColumnValue(column);

                                if (notifierOptions.indexOf(columnValue) === -1 && columnValue !== '' && columnValue !== undefined) {
                                    notifierOptions.push(columnValue);
                                }
                            }

                            // Only provide a filter if notifiers were found
                            if (notifierOptions.length > 0) {
                                // Sort the notifiers into order.
                                notifierOptions = notifierOptions.sort();

                                // Create select and append default blank element
                                colRule.$filterControl = $('<select/>',
                                                            {
                                                                'id': table.id + '_input_filter_' + i,
                                                                'class': CLASSES.filterInput,
                                                            })
                                                            .attr('size', '1')
                                                            .append(
                                                                $('<option/>')
                                                                    .val('')
                                                            )
                                                            .on('change', {table: table}, _events.onChange);


                                for (j = 0, jLen = notifierOptions.length; j < jLen; j++) {
                                    colRule.$filterControl
                                        .append(
                                            $('<option/>',
                                                {
                                                    value: notifierOptions[j],
                                                })
                                                .text(notifierOptions[j])
                                        );
                                }

                                // Special none value
                                colRule.$filterControl
                                    .append(
                                        $('<option/>',
                                            {
                                                value: ':none',
                                            })
                                            .text('(None)')
                                    );

                                // Special any value
                                colRule.$filterControl
                                    .append(
                                        $('<option/>',
                                            {
                                                value: ':any',
                                            })
                                            .text('(Any)')
                                    );

                                $filterCell.append(colRule.$filterControl);
                            }

                            break;

                        case 'rating':

                            var ratingOptions = [0, 1, 2, 3, 4, 5];

                            // Create select and append default blank element
                            colRule.$filterControl = $('<select/>',
                                                        {
                                                            'id': table.id + '_input_filter_' + i,
                                                            'class': CLASSES.filterInput,
                                                        })
                                                        .attr('size', '1')
                                                        .append(
                                                            $('<option/>')
                                                                .val('')
                                                        )
                                                        .on('input', {table: table}, _events.onChange);

                            for (j = 0, jLen = ratingOptions.length; j < jLen; j++) {
                                colRule.$filterControl
                                    .append(
                                        $('<option/>',
                                            {
                                                value: ratingOptions[j],
                                            })
                                            .text(ratingOptions[j])
                                    );
                            }

                            $filterCell.append(colRule.$filterControl);

                            break;
                    }

                    // Save off the header cell
                    colRule.$filterCell = $filterCell;
                }

                $row.append($filterCell);

                // Save the column rule definition
                row.push(colRule);
            }

            table.config.plugins.filter.$filterRow = $row;
            table.config.plugins.filter.filterRow = row;

            fastdom.mutate(function _generateFilterRow_a () {
                table.obj.$tbody.prepend($row);

                fastdom.measure(function _generateFilterRow_b () {
                    // Check to see if we have a table footer and hide it if we do.
                    if (table.obj.$tfoot) {
                        table.obj.$tfoot.addClass(CLASSES.hidden);
                    }

                    table.reflow();
                });
            });

            // Watch for the filter row to be closed
            table.$self.on('table.hideFilterRow', {table: table}, _events.onFilterRowHide);
        });
    };

    /**
     * Creates a numeric options pane
     *
     * @param   {jQuery}  $input   Input field for the column
     * @param   {String}  id       ID of the option pane
     * @param   {Object}  colRule  Column rule object
     * @param   {Object}  table    Table instance
     */
    _priv.generateNumericPane = function _generateNumericPane ($input, id, colRule, table) {
        var $optionPane;
        var $optionsListContainer;
        var $optionsListItem;

        // Outer-pane
        $optionPane = $('<div/>',
                            {
                                'id': id,
                                'class': CLASSES.filterPane,
                                'data-source': table.id,
                            });

        // List of options
        $optionsListContainer = $('<ul/>');

        // Generic list item that will be cloned for each entry in the list
        $optionsListItem = $('<li/>',
                                {
                                    'class': CLASSES.optionPaneRadioOption,
                                });

        $optionsListContainer
            // Greater than
            .append(
                $optionsListItem.clone()
                    .append(
                        $('<button/>',
                            {
                                'value': 'gt',
                                'type': 'button',
                            })
                            .text('Greater than')
                            .on('click', {colRule: colRule, table: table}, _events.onNumericOptionButtonClick)
                    )
            )

            // Greater than or equal to
            .append(
                $optionsListItem.clone()
                    .addClass(CLASSES.filterSelectedParam)
                    .append(
                        $('<button/>',
                            {
                                'value': 'gte',
                                'type': 'button',
                            })
                            .text('Greater than or equal to')
                            .on('click', {colRule: colRule, table: table}, _events.onNumericOptionButtonClick)
                    )
            )

            // Equal to
            .append(
                $optionsListItem.clone()
                    .append(
                        $('<button/>',
                            {
                                'value': 'eq',
                                'type': 'button',
                            })
                            .text('Equal to')
                            .on('click', {colRule: colRule, table: table}, _events.onNumericOptionButtonClick)
                    )
            )

            // Less than or equal to
            .append(
                $optionsListItem.clone()
                    .append(
                        $('<button/>',
                            {
                                'value': 'lte',
                                'type': 'button',
                            })
                            .text('Less than or equal to')
                            .on('click', {colRule: colRule, table: table}, _events.onNumericOptionButtonClick)
                    )
            )

            // Less than
            .append(
                $optionsListItem.clone()
                    .append(
                        $('<button/>',
                            {
                                'value': 'lt',
                                'type': 'button',
                            })
                            .text('Less than')
                            .on('click', {colRule: colRule, table: table}, _events.onNumericOptionButtonClick)
                    )
            )

            // Contains
            .append(
                $optionsListItem.clone()
                    .append(
                        $('<button/>',
                            {
                                'value': 'co',
                                'type': 'button',
                            })
                            .text('Contains')
                            .on('click', {colRule: colRule, table: table}, _events.onNumericOptionButtonClick)
                    )
            )

            // Close button
            .append(
                $optionsListItem.clone()
                    .append(
                        $('<a/>',
                            {
                                'class': CLASSES.optionPaneClose,
                                'role': 'button',
                                'tabindex': '0',
                            })
                            .text('Close')
                            .on('click keydown', {colRule: colRule}, _events.onOptionPaneCloseClick)
                    )
            );

        // Add list to pane
        $optionPane.append($optionsListContainer);

        _priv.optionPaneList.push(colRule);

        return $optionPane;
    };

    _priv.generateDatePane = function _generateDatePane ($input, id, colRule, table) {
        var $optionPane;
        var $optionsListContainer;
        var $optionsListItem;
        var $dateSelection;
        var $dateControl;
        var $rangeWrapper;
        var $rangeSelection;
        var $rangeControl;
        var $startingRange;
        var $endingRange;
        var $match;
        var $matchSelection;
        var $matchControl;

        $optionPane = $('<div/>',
                            {
                                'class': CLASSES.filterPane,
                                'id': id,
                                'data-source': table.id,
                            });

        $optionsListContainer = $('<ul/>');

        $optionsListItem = $('<li/>',
                                {
                                    'class': CLASSES.datePaneSection,
                                });

        $dateSelection = $('<div/>',
                            {
                                'class': CLASSES.datePaneSelection,
                            });

        $dateControl = $('<div/>',
                            {
                                'class': CLASSES.datePaneControls,
                            });

        // Range Section
        $rangeWrapper = $optionsListItem.clone();

        $dateRangeCheckbox = $('<input/>',
                                {
                                    'id': id + '_range_selection',
                                    'class': CLASSES.datePaneRangeRuleCheckbox,
                                    'type': 'checkbox',
                                    'value': 'range',
                                })
                                .on('change keyup', {table: table, colRule: colRule, type: 'range'}, _events.onDateTypeChange);

        $rangeSelection = $dateSelection.clone()
                            .append(
                                $('<div/>',
                                    {
                                        'class': CLASSES.colSmall,
                                    })
                                    .append($dateRangeCheckbox)
                            )
                            .append(
                                $('<div/>',
                                    {
                                        'class': CLASSES.colSmall,
                                    })
                                    .append(
                                        $('<label/>')
                                            .attr('for', id + '_range_selection')
                                            .text('In Range')
                                    )
                            );

        $rangeControl = $dateControl.clone();

        // Starting Input
        // ============

        $startingRange = $('<div/>',
                            {
                                'class': CLASSES.datePaneStateRange,
                            });

        $dateRangeBeginCheckbox = $('<input/>',
                                    {
                                        'id': id + '_range_begin',
                                        'class': CLASSES.datePaneRangeCheckbox,
                                        'type': 'checkbox',
                                    })
                                    .on('change keyup', {table: table, colRule: colRule, part: 'begin'}, _events.onDateRangeChange);



        $dateRangeBeginInput = $('<input/>',
                                    {
                                        'id': id + '_range_begin_date',
                                        'class': CLASSES.datePaneRangeInput + ' emp-date',
                                        'type': 'text',
                                        'size': '10',
                                        'placeholder': 'MM/DD/YYYY',
                                    })
                                    // We need to watch `keyup` so we can update the UI live as the user types, and we also need to watch `change` because that's what the date picker will fire
                                    .on('change keyup', {table: table, colRule: colRule, part: 'begin'}, _events.onDateRangeChange);

        // Add Starting range checkbox
        $startingRange

            // Add Starting range checkbox label
            .append(
                $('<div/>', {})
                    .append($dateRangeBeginCheckbox)
                    .append(
                        $('<label/>',
                            {
                                'for': id + '_range_begin',
                                'class': CLASSES.dataPaneLabel
                            })
                            .text('Search Begin:')
                    )
            )

            // Add Date Input
            .append(
                $('<div/>', {})
                    .append(
                        $dateRangeBeginInput
                    )
                    .append(
                        $('<button/>',
                            {
                                'id': 'cal_' + id + '_range_begin_date',
                                'class': CLASSES.icon + ' ' + CLASSES.datePicker,
                                'type': 'button',
                                'title': 'Date Picker',
                            })
                            .text('Date Picker')
                    )
            );

        $rangeControl.append($startingRange);

        // Ending Input
        // ============

        $endingRange = $('<div/>', {
            'class': CLASSES.datePaneEndRange
        });

        $dateRangeEndCheckbox = $('<input/>',
                                    {
                                        'id': id + '_range_ending',
                                        'class': CLASSES.datePaneRangeCheckbox,
                                        'type': 'checkbox',
                                    })
                                    .on('change keyup', {table: table, colRule: colRule, part: 'end'}, _events.onDateRangeChange);

        $dateRangeEndInput = $('<input/>',
                                {
                                    'id': id + '_range_ending_date',
                                    'class': CLASSES.datePaneRangeInput + ' emp-date',
                                    'type': 'text',
                                    'size': '10',
                                    'placeholder': 'MM/DD/YYYY',
                                })
                                .on('change keyup', {table: table, colRule: colRule, part: 'end'}, _events.onDateRangeChange);

        // Add Ending range checkbox
        $endingRange
            .append(
                $('<div/>', {})
                    .append($dateRangeEndCheckbox)
                    .append(
                        $('<label/>',
                            {
                                'for': id + '_range_ending',
                                'class': CLASSES.dataPaneLabel
                            })
                            .text('Search End:')
                    )
            )

            // Add Date Input
            .append(
                $('<div/>', {})
                    .append($dateRangeEndInput)
                    .append(
                        $('<button/>',
                            {
                                'id': 'cal_' + id + '_range_ending_date',
                                'class': CLASSES.icon + ' ' + CLASSES.datePicker,
                                'type': 'button',
                                'title': 'Date Picker',
                            })
                            .text('Date Picker')
                    )
            );

        $rangeControl.append($endingRange);

        // Append range rows
        $rangeWrapper.append($rangeSelection);
        $rangeWrapper.append($rangeControl);

        // Add to the pane
        $optionsListContainer.append($rangeWrapper);

        // ======================================
        // Match Section
        // ======================================

        $match = $optionsListItem.clone();

        $dateMatchCheckbox = $('<input/>',
                                {
                                    'id': id + '_match_selection',
                                    'type': 'checkbox',
                                    'value': 'matching',
                                })
                                .on('change keyup', {table: table, colRule: colRule, type: 'matching'}, _events.onDateTypeChange);

        $matchSelection = $dateSelection.clone()
                            // Check box
                            .append(
                                $('<div/>',
                                    {
                                        'class': CLASSES.colSmall
                                    })
                                    .append($dateMatchCheckbox)
                            )
                            // Label
                            .append(
                                $('<div/>',
                                    {
                                        'class': CLASSES.colSmall,
                                    })
                                    .append(
                                        $('<label/>',
                                            {
                                                'for': id + '_match_selection',
                                            })
                                            .text('Matching')
                                    )
                            );

        $match.append($matchSelection);

        $matchControl = $dateControl.clone();

        $dateMatchInputMonth = $('<input/>',
                                    {
                                        'id': id + '_match_month',
                                        'class': CLASSES.datePaneMatchingMonth + ' ' + CLASSES.hideSpinner,
                                        'type': 'text',
                                        'placeholder': 'MM',
                                        'maxlength': '2',
                                        'size': '2'
                                    })
                                    .on('keyup', {table: table, colRule: colRule, part: 'month'}, _events.onDateMatchingChange);

        $dateMatchInputDay = $('<input/>',
                                {
                                    'id': id + '_match_day',
                                    'class': CLASSES.datePaneMatchingDay + ' ' + CLASSES.hideSpinner,
                                    'type': 'number',
                                    'placeholder': 'DD',
                                    'maxlength': '2',
                                    'size': '2'
                                })
                                .on('keyup', {table: table, colRule: colRule, part: 'day'}, _events.onDateMatchingChange);

        $dateMatchInputYear = $('<input/>',
                                {
                                    'id': id + '_match_year',
                                    'class': CLASSES.datePaneMatchingYear + ' ' + CLASSES.hideSpinner,
                                    'type': 'text',
                                    'placeholder': 'YYYY',
                                    'maxlength': '4',
                                    'size': '4'
                                })
                                .on('keyup', {table: table, colRule: colRule, part: 'year'}, _events.onDateMatchingChange);

        $dateMatchInputHidden = $('<input/>',
                                    {
                                        'id': id + '_match_hidden',
                                        'type': 'hidden',
                                    })
                                    .on('change', {table: table, colRule: colRule, part: 'hidden'}, _events.onDateMatchingChange);

        $matchControl
            // Month input
            .append($dateMatchInputMonth)
            .append(
                $('<label/>',
                    {
                        'for': id + '_match_month',
                        'class': CLASSES.hideFromScreen,
                    })
                    .text('Month')
            )
            .append(
                $('<span/>')
                    .text('/')
            )

            // Day input
            .append($dateMatchInputDay)
            .append(
                $('<label/>',
                    {
                        'for': id + '_match_day',
                        'class': CLASSES.hideFromScreen,
                    })
                    .text('Day')
            )
            .append(
                $('<span/>')
                    .text('/')
            )

            // Year input
            .append($dateMatchInputYear)
            .append(
                $('<label/>',
                    {
                        'for': id + '_match_year',
                        'class': CLASSES.hideFromScreen,
                    })
                    .text('Year')
            )
            .append($dateMatchInputHidden)

            .append(
                $('<button/>',
                    {
                        'id': 'cal_' + id + '_match_hidden',
                        'class': CLASSES.icon + ' ' + CLASSES.datePicker,
                        'type': 'button',
                        'title': 'Date Picker',
                    })
                    .text('Date Picker')
            );

        $match.append($matchControl);

        // Add to the pane
        $optionsListContainer.append($match);

        // ======================================
        // Include blank section
        // ======================================

        $includeBlank = $optionsListItem.clone();

        $includeBlankCheckbox = $('<input/>',
                                {
                                    'id': id + '_include_blank',
                                    'type': 'checkbox',
                                    'checked': 'checked',
                                    'value': 'include blank',
                                })
                                .on('change keyup',{table: table}, _events.onIncludeBlankChange);

        $includeBlankSelection = $dateSelection.clone()
                            //check box div
                            .append(
                                $('<div/>',
                                    {
                                        'class': CLASSES.colSmall
                                    })
                                    .append($includeBlankCheckbox)
                            )
                            //label div
                            .append(
                                $('<div/>',
                                    {
                                        'class': CLASSES.colSmall,
                                    })
                                    .append(
                                        $('<label/>',
                                            {
                                                'for': id + '_include_blank',
                                            })
                                            .text('Include Blank')
                                    )
                            );

        $includeBlank.append($includeBlankSelection);

        // Add to the pane
        $optionsListContainer.append($includeBlank);

        // ===========================================

        // Clear button
        $optionsListContainer
            .append(
                $optionsListItem.clone()
                    .append(
                        $('<a/>',
                            {
                                'class': CLASSES.optionPaneClose,
                                'role': 'button',
                                'tabindex': '0',
                            })
                            .text('Clear')
                            .on('click', {table: table, colRule: colRule}, _events.onDateClearButtonClick)
                    )
            );

        // Close button
        $optionsListContainer
            .append(
                $optionsListItem.clone()
                    .append(
                        $('<a/>',
                            {
                                'class': CLASSES.optionPaneClose,
                                'role': 'button',
                                'tabindex': '0',
                            })
                            .text('Close')
                            .on('click', {colRule: colRule}, _events.onOptionPaneCloseClick)
                            .on('keyup', {colRule: colRule}, _events.onOptionPaneCloseKeydown)
                    )
            );

        // ==========================================

        // Add list to pane
        $optionPane.append($optionsListContainer);

        // Setup datepickers
        $startingRange.find('.' + CLASSES.datePicker).datepicker();
        $endingRange.find('.' + CLASSES.datePicker).datepicker();
        $matchControl.find('.' + CLASSES.datePicker).datepicker();

        _priv.optionPaneList.push(colRule);

        return $optionPane;
    };

    /**
     * Clears a date option pane and resets the column rule to the default settings
     *
     * @param   {Object}  colRule  Column rule
     *
     * @return  {Object}           Updated column rule
     */
    _priv.clearDatePane = function _clearDatePane (colRule) {

        // Replace all settings with a fresh, blank copy
        colRule.dateSettings = $.extend(true, {}, DATE_SETTINGS);

        // Clear the option pane's input fields
        if ($dateRangeCheckbox) {
            $dateRangeCheckbox.prop('checked', false);
        }

        if ($dateRangeBeginCheckbox) {
            $dateRangeBeginCheckbox.prop('checked', false);
        }

        if ($dateRangeBeginInput) {
            $dateRangeBeginInput.val('');
        }

        if ($dateRangeEndCheckbox) {
            $dateRangeEndCheckbox.prop('checked', false);
        }

        if ($dateRangeEndInput) {
            $dateRangeEndInput.val('');
        }

        if ($dateMatchCheckbox) {
            $dateMatchCheckbox.prop('checked', false);
        }

        if ($dateMatchInputMonth) {
            $dateMatchInputMonth.val('');
        }

        if ($dateMatchInputDay) {
            $dateMatchInputDay.val('');
        }

        if ($dateMatchInputYear) {
            $dateMatchInputYear.val('');
        }

        if ($dateMatchInputHidden) {
            $dateMatchInputHidden.val('');
        }

        // Reset the button text
        // Normally the text is set by `_rule.date()` but that function won't run how since `colRule.isSet` is `false`
        colRule.$filterControl.html(VALUES.dateButtonDefaultText);

        return colRule;
    };

    //////////////////
    // Option panes //
    //////////////////

    // Collection of all option panes' `colRule` objects so we know which option panes exist
    _priv.optionPaneList = [];

    /**
     * Opens a single option pane
     *
     * @param   {jQuery}  $input   Input element that goes with the option pane
     * @param   {Object}  colRule  Column rule object
     * @param   {Object}  table    Table instance
     */
    _priv.openPane = function _openPane ($input, colRule, table) {

        // Loop through all option panes to make sure no other ones are open
        _priv.optionPaneList.forEach(function (filterCol) {

            if (filterCol !== colRule) {

                _priv.closePane(filterCol, {noFocus: true});
            }
        });

        // Pane was not already visible, so setup the event listeners
        if (!colRule.optionsVisibile) {
            emp.$body.on('click',    {$input: $input, colRule: colRule, table: table}, _events.onBodyClick);
            emp.$window.on('resize', {$input: $input, colRule: colRule, table: table}, _events.onWindowResize);
        }

        // Hook to prevent just closed panes
        if (colRule.justClosed) {

            colRule.justClosed = false;
        }
        else {

            colRule.optionsVisibile = true;

            _priv.positionPane($input, colRule, table);

        }
    };

    /**
     * Closes a single option pane
     *
     * @param   {Object}   colRule            Column rule object
     * @param   {Boolean}  doNotRemoveEvents  If `true`, event handlers on the body and window will not be removed
     */
    _priv.closePane = function _closePane (colRule, options) {

        colRule.$options.css({'opacity': '0', 'left': '-1000px'});
        colRule.optionsVisibile = false;

        // Remove event listeners, unless asked not to (e.g. `_priv.closeAllPanes()` can do it just once to avoid redundancy)
        if (!options || !options.doNotRemoveEvents) {
            emp.$body.off('click', _events.onBodyClick);
            emp.$window.off('resize', _events.onWindowResize);
        }

        // Set focus back to the input
/*         if (colRule.$filterControl && (!options || !options.noFocus)) {

            // When we trigger the `focus` event, that event handler will in turn (re)open the very pane we just closed. To avoid this, we're setting an attribute on the element to tell it to ignore the `focus` and leave the pane closed. This is not an ideal way to communicate with the event handler, however `jQuery.trigger()` doesn't seem to pass along custom data like it's supposed to, so I don't know how else to send the message to `_events.onInputFocus()` that it shouldn't open the pane. (CP 4/19/2016)
            colRule.$filterControl.attr(VALUES.ignoreFocusEventAttr, 'true');

            colRule.$filterControl.trigger('focus');
        } */
    };

    /**
     * Closes all option panes
     *
     * @param   {Object}  colRule  Column rule object
     */
    _priv.closeAllPanes = function _closeAllPanes (colRule) {
        // Loop through all option panes to make sure none are open
        _priv.optionPaneList.forEach(function (filterCol) {
            _priv.closePane(filterCol, {doNotRemoveEvents: true});
        });

        emp.$body.off('click', _events.onBodyClick);
        emp.$window.off('resize', _events.onWindowResize);
    };

    /**
     * Positions an option pane with respect to its input
     *
     * @param   {jQuery}  $input   Input element that goes with the option pane
     * @param   {Object}  colRule  Column rule object
     * @param   {Object}  table    Table instance
     */
    _priv.positionPane = function _positionPane ($input, colRule, table, skipFocus) {

        var inputPos = $input.offset();
        var windowWidth = emp.$window.width();

        fastdom.mutate(function _positionPane_a () {
            // Append the pane to the body if it hasn't been done already
            if (colRule.$options.parent().length === 0) {
                colRule.$options.css({opacity: 0});
                emp.$body.append(colRule.$options);
            }

            fastdom.measure(function _positionPane_b () {
                var paneWidth = colRule.$options.outerWidth();
                var leftPos = inputPos.left + $input.outerWidth() + 5;

                if (leftPos + paneWidth >= windowWidth) {
                    leftPos = inputPos.left - paneWidth - 5;
                }

                fastdom.mutate(function _positionPane_c () {

                    colRule.$options.css({
                        top: inputPos.top,
                        left: leftPos,
                        opacity: 1,
                    });

                    fastdom.measure(function _positionPane_d () {

                        if (!skipFocus) {

                            switch (colRule.filter) {

                                case "date":

                                    colRule.$options.find('input.' + CLASSES.datePaneRangeRuleCheckbox).focus();
                                    break;

                            }

                        }

                    });
                });
            });
        });
    };

    /////////////////////
    // Event Functions //
    /////////////////////

    /**
     * Toggles the row of filter inputs
     *
     * @param   {Event}  evt  Click event on the filter icon
     */
    _events.filterRow = function _filterRow (evt) {
        var table = evt.data.table;

        // The row's DOM has not been generated yet
        if (!table.config.plugins.filter.$filterRow) {

            table.resizeOffset(1);

            // Call the private build function
            _priv.generateFilterRow(evt, table);

            table.$self.trigger('table.showFilterRow');
            table.$self.trigger('table.filterButtonClick');
        }
        // The row exists in the DOM
        else {
            var $firstRow = $(table.obj.$tbody.children('tr').eq(0));

            // Check to see if the first row is a flex row
            if ($firstRow.hasClass(CLASSES.filterRow) && !$firstRow.hasClass(CLASSES.hidden)) {
                fastdom.mutate(function _filterRow_a () {

                    table.resizeOffset(0);

                    // Hide the filter row
                    table.config.plugins.filter.$filterRow.addClass(CLASSES.hidden);

                    fastdom.measure(function _filterRow_b () {

                        // Check to see if we have a table footer and hide it if we do.
                        if (table.obj.$tfoot) {
                            table.obj.$tfoot.removeClass(CLASSES.hidden);
                        }

                        table.reflow(table);

                        table.$self.trigger('table.hideFilterRow');
                        table.$self.trigger('table.filterButtonClick');
                    });
                });
            }
            else {
                fastdom.mutate(function _filterRow_c () {

                    table.resizeOffset(1);

                    // Display the filter row
                    table.config.plugins.filter.$filterRow.removeClass(CLASSES.hidden);

                    fastdom.measure(function _filterRow_d () {
                        // Check to see if we have a table footer and hide it if we do.
                        if (table.obj.$tfoot) {
                            table.obj.$tfoot.addClass(CLASSES.hidden);
                        }

                        table.reflow(table);

                        table.$self.trigger('table.showFilterRow');
                        table.$self.trigger('table.filterButtonClick');
                    });
                });
            }
        }

        table.obj.$viewWrapper.scrollTop(0);
    };

    /**
     * Clears all filters and resets the table when the filter row is hidden
     *
     * @param   {Event}  evt  Click event on the filter toggle icon
     */
    _events.onFilterRowHide = function _onFilterRowHide (evt) {
        var table = evt.data.table;
        var needToReExecute = false;

        table.config.plugins.filter.filterRow.forEach(function (colRule) {
            // Clear the compare value
            if (colRule.compareValue) {
                // Track whether we're actually updating any columns so we can avoid re-evaluating the whole table if nothing has changed
                needToReExecute = true;

                // Clear the value
                colRule.compareValue = '';
            }

            // Date rule
            if (colRule.dateSettings) {
                // Clear the settings and UI
                colRule = _priv.clearDatePane(colRule);

                // This flag would not have been set above because dates don't have a `compareValue`
                needToReExecute = true;
            }
            // All other rule types
            else {
                // Clear the input field
                if (colRule.$filterControl && colRule.$filterControl.length) {
                    colRule.$filterControl.val('');
                }
            }
        });

        // Reevaluate the table
        if (needToReExecute) {
            _priv.executeFilters(table);
        }
    };

    /**
     * Handles clicks on numeric option pane operators
     *
     * @param   {Event}  evt  Click event on a `<button>`
     */
    _events.onNumericOptionButtonClick = function _onNumericOptionButtonClick (evt) {
        var colRule = evt.data.colRule;
        var table = evt.data.table;
        var $button = $(evt.target);

        colRule.filterParams = $button.val(); // $button.get(0).value;

        // Find the currently active button and remove the selection class
        colRule.$options
            .find('.' + CLASSES.filterSelectedParam)
                .removeClass(CLASSES.filterSelectedParam);

        $button
            .parent()
                .addClass(CLASSES.filterSelectedParam);

        if (colRule.compareValue !== '') {
            // Apply the new rules
            _priv.executeFilters(table);
        }

        // Set focus to the input
        colRule.$filterControl.focus();
    };

    /**
     * Closes a numeric option pane
     *
     * @param   {Event}  evt  Click event
     */
    _events.onOptionPaneCloseClick = function _onOptionPaneCloseClick (evt) {

        _priv.closePane(evt.data.colRule);
    };

    _events.onOptionPaneCloseKeydown = function _onOptionPaneCloseKeydown (evt) {

        // Enter key on close
        if (evt.which !== 9) {

            evt.data.colRule.justClosed = true;

            // Close the pane
            _priv.closePane(evt.data.colRule);
        }
    };

    /**
     * Handles having focus set on a filter input
     *
     * @param   {Event}    evt            Focus event
     *
     * @return  {Boolean}                 `false`
     */
    _events.onInputFocus = function _onInputFocus (evt) {
        var $input = $(evt.target);
        var table;
        var colRuleIndex;
        var colRule;
        var paneId;

        // Check if we were told not process this event any further (see `_priv.closePane()` for further explanation)
        if ($input.attr(VALUES.ignoreFocusEventAttr) === 'true') {
            // Remove the attribute so the next event is not ignored as well
            $input.removeAttr(VALUES.ignoreFocusEventAttr);

            return true;
        }

        table = evt.data.table;
        colRuleIndex = $input.parent().attr(VALUES.attributes.dataFilterIndex);
        colRule = table.config.plugins.filter.filterRow[colRuleIndex];

        switch (colRule.filter) {
            case 'numeric':
            case 'currency':
            case 'score':

                // Check for pane id
                if (!colRule.$options) {
                    // generate the id
                    paneId = table.id + '_filter_input_' + colRule.dataStoreIndex;

                    // Save off the pane
                    colRule.$options = _priv.generateNumericPane($input, paneId, colRule, table);
                }

                // Open the pane
                _priv.openPane($input, colRule, table);

                break;

            case 'date':

                break;
        }

        return false;
    };

    // Delays the keyup event until the user stops typing
    _events.onInitialInputKeyup = function _onInitialInputKeyup (evt) {

        // Clear any existing timer
        clearTimeout(_typingTimer);

        // Wait for the user to stop typing
        _typingTimer = setTimeout(function () {
            _events.onInputKeyup(evt);
            clearTimeout(_typingTimer);
        }, VALUES.inputTimer);
    };

    // Handles keystrokes after the timer has run its course
    _events.onInputKeyup = function _on_input_keyup (evt) {

        var table = evt.data.table;
        var $input = $(evt.target);
        var $filterCell = $input.parent();
        var filterIndex = $filterCell.attr(VALUES.attributes.dataFilterIndex);
        var colRule = table.config.plugins.filter.filterRow[filterIndex];


        //Handle all cases where the filter should be run or updated.
        // Escape key
        if (evt.which && evt.which === 27) {
            // Check to see if we have filter options
            if (colRule.$options) {
                if (colRule.optionsVisibile) {
                    _priv.closePane(colRule);
                }
                else {
                    // Escape will dump all the field contents
                    $input.val('');

                    // Apply the new rules
                    _priv.executeFilters(table);
                }
            }
        }
        else if ($input.attr('data-text') === "numbers") {

            var inputValue = $input.val();

            if (inputValue !== ".") {

                colRule.compareValue = evt.target.value.replace(/[, ;]/g, '').toLowerCase();

                _priv.executeFilters(table);
            }
            else {

                colRule.compareValue = "0.";

                _priv.executeFilters(table);
            }
        }
        // Standard text entry or dropdown change
        // Anything else except Tab (even Shift-Tab, unless it also has an option pane)
        else if (!evt.which || !(evt.which === 9 && !evt.shiftKey)) {
            // Normalize the input value for easier matching
            colRule.compareValue = evt.target.value.replace(/^\s*/g, '').toLowerCase();

            // Apply the new rules
            _priv.executeFilters(table);
        }


        //After filters have been applied prevent further event propigation if needed.
        // Enter
        if (evt.which && evt.which === 13) {
            // Check to see if we have filter options
            if (colRule.$options) {
                if (colRule.optionsVisibile) {
                    _priv.closePane(colRule);
                }
                else {

                    // Escape will dump all the field contents
                    $input.val('');

                    // Apply the new rules
                    _priv.executeFilters(table);
                }
            }
            else {

                // Override this so we random enter in filter inputs dont cause the page to submit
                evt.stopPropagation();
                evt.preventDefault();
            }
        }
        // Tab
        else if (evt.which === 9) {

        }
    };

    _events.onInputKeyDown = function _on_input_keydown (evt) {
        var table = evt.data.table;
        var $input = $(evt.target);
        var $filterCell = $input.parent();
        var filterIndex = $filterCell.attr(VALUES.attributes.dataFilterIndex);
        var colRule = table.config.plugins.filter.filterRow[filterIndex];
        var keyCode = (!evt.charCode) ? evt.which : evt.charCode;

        // Check for arrow keys
        if ($input.attr('data-text') === "numbers") {

            var inputValue = $input.val();

            if ((evt.which === 38 || evt.which === 40)) {

                evt.preventDefault();


                if (inputValue === "") {

                    $input.val("0");
                }
                else {

                    inputValue = parseInt(inputValue);

                    if (evt.which === 38) {

                        inputValue += 1;
                    }

                    if (evt.which === 40) {

                        inputValue -= 1;
                    }

                    $input.val(inputValue);

                }
            }

        }
        // Check for Tab key, but not shift-tab
        else if (evt.which === 9 && !evt.shiftKey && colRule.$options) {
        	// Check whether the option pane is open
            if (colRule.optionsVisibile) {
                // Set focus to the first choice in the list
                colRule.$options.find('[tabindex]').eq(0).focus();
                evt.preventDefault();
            }
        }
    };

    _events.onInputNumberKeyPress = function _on_input_number_keypress (evt) {

        var regex = new RegExp("^[,.0-9]+$");
        var keyCode = (!evt.charCode) ? evt.which : evt.charCode;
        var key = String.fromCharCode(keyCode);

        if (!regex.test(key)) {

            event.preventDefault();
            return false;
        }

    };

    _events.onInputMouseUp = function _on_input_mouse_up (evt) {

        var table = evt.data.table;
        var $input = $(evt.target);
        var $filterCell = $input.parent();
        var filterIndex = $filterCell.attr(VALUES.attributes.dataFilterIndex);
        var colRule = table.config.plugins.filter.filterRow[filterIndex];

        var before = $input.val();

        setTimeout(function() {

            var after = $input.val();

            // Check to see if the input was cleared.
            if (before !== "" && after === "") {

                journal.log({type: 'info', owner: 'UI', module: 'table', submodule: 'filters', func: 'onInputMouseUp'}, 'Filter cleared by using the IE "X" input clear control. Column: ' + filterIndex);

                // Set the compare value to nothing
                colRule.compareValue = "";

                // Execute the filter update
                _priv.executeFilters(table);
            }

        }, 50);
    };

    _events.onChange = function _onChange (evt) {
        var $dropdown = $(evt.target);
        var $filterCell = $dropdown.parent();
        var filterIndex = $filterCell.attr(VALUES.attributes.dataFilterIndex);
        var table = evt.data.table;
        var colRule = table.config.plugins.filter.filterRow[filterIndex];

        // Normalize the input value for easier matching
        colRule.compareValue = evt.target.value.replace(/^\s*/g, '').toLowerCase();

        _priv.executeFilters(table);
    };

    _events.onDateFilterButtonClick = function _onDateFilterButtonClick (evt) {

        var table = evt.data.table;
        var $button = $(evt.target);
        var colRule = $button.parent().attr(VALUES.attributes.dataFilterIndex);

        colRule = table.config.plugins.filter.filterRow[colRule];

        switch (colRule.filter) {

            case 'date':
                // Check for pane ID
                if (!colRule.$options) {
                    // generate the ID
                    var paneId = table.id + '_filter_button_' + colRule.dataStoreIndex;

                    // Save off the pane
                    colRule.$options = _priv.generateDatePane($button, paneId, colRule, table);
                }

                // Open the pane if it's not already open
                if (!colRule.optionsVisibile) {

                    _priv.openPane($button, colRule, table);
                }
                // Close the pane because it was already open
                else {

                    _priv.closePane(colRule, {justClosed: true});
                }

                break;
        }
    };

    _events.onDateFilterButtonFocus = function onDateFilterButtonFocus(evt) {

        // Only kick off focus when the keyup is tab, on the button
        if (evt.which === 9 || evt.which === 13) {

            // Pass this to the click event because the logic is the same
            _events.onDateFilterButtonClick(evt);

        }
    };

    // Handle user entry in the date range inputs
    // Event type will be `keyup` if the user is typing, or `change` if the date picker was used
    _events.onDateRangeChange = function _onDateRangeChange (evt) {
        var isBeginNotEmpty;
        var isEndNotEmpty;
        var colRule = evt.data.colRule;
        var $input = $(evt.target);
        var newDate;

        var __formatDate = function __formatDate (dateObj) {
            var newDateMonth;
            var newDateDay;

            // Month
            newDateMonth = dateObj.getMonth() + 1;

            // Zero-pad month
            if (newDateMonth < 10) {
                newDateMonth = '0' + newDateMonth;
            }

            // Date
            newDateDate = dateObj.getDate();

            // Zero-pad date
            if (newDateDate < 10) {
                newDateDate = '0' + newDateDate;
            }

            return newDateMonth + '/' + newDateDate + '/' + dateObj.getFullYear();
        };

        // Ignore modifier keys, Enter, Tab, and left/right arrow keys
        if (evt.shiftKey || evt.ctrlKey || evt.altKey || [9, 13, 16, 17, 18, 37, 39].indexOf(evt.keyCode) !== -1) {
            return true;
        }

        // Close the pane if the Escape key was pressed
        if (evt.keyCode === 27) {
            _priv.closePane(colRule);

            return true;
        }

        isBeginNotEmpty = ($dateRangeBeginInput.val().trim().length !== 0);
        isEndNotEmpty = ($dateRangeEndInput.val().trim().length !== 0);

        // Set the check boxes' states unless the user clicked on a checked box directly (if the latter happened, we don't want to undo their check just because the input is empty or will feel like the UI is broken or unresponsive)
        if (evt.target.type !== 'checkbox') {
            // Begin date
            $dateRangeBeginCheckbox.prop('checked', isBeginNotEmpty);

            // End date
            $dateRangeEndCheckbox.prop('checked', isEndNotEmpty);
        }

        // Check the radio button regardless, since the user is editing this section of the pane
        $dateRangeCheckbox.prop('checked', true);
        colRule.dateSettings.range.enabled = true;

        // Set the filter to be 'on' if at least one of the inputs is not empty and its checkbox is checked
        colRule.dateSettings.isSet = (isBeginNotEmpty || isEndNotEmpty);

        // Increment/decrement the value first, if the arrow keys were pressed

        if (evt.keyCode === 38 ||evt.keyCode === 40) {

            // Up arrow was pressed
            if (evt.keyCode === 38) {
                // Process and validate the currently entered date
                colRule = _priv.updateDateRangeSettings(evt.data.table, colRule, true);

                // If the date is valid, go to the next date
                newDate = new Date(colRule.dateSettings.range[evt.data.part]);

                // Increment date object
                newDate.setDate(newDate.getDate() + 1);

                $input.val(__formatDate(newDate));
            }
            // Down arrow was pressed
            else if (evt.keyCode === 40) {
                // Process and validate the currently entered date
                colRule = _priv.updateDateRangeSettings(evt.data.table, colRule, true);

                // If the date is valid, go to the previous date
                newDate = new Date(colRule.dateSettings.range[evt.data.part]);

                // Increment date object
                newDate.setDate(newDate.getDate() - 1);

                $input.val(__formatDate(newDate));
            }

        }
        else {

            // Pass the keyup to the emp function if it exiests
            if (emp.dateMasking) {

                if($input.attr('type') != "checkbox"){
                    emp.dateMasking(evt, $input);
                }
            }

            // if (VALUES.dateRegex.test($input.val())) {

            //     // Validate the values and update the table
            //     _priv.updateDateRangeSettings(evt.data.table, colRule, false);
            // }

            // Always update the date range settings. Allows for start/begin filters to be disabled/enabled again while filtering.
            _priv.updateDateRangeSettings(evt.data.table, colRule, false);
        }
    };

    /**
     * Handles changes to the main check boxes on the date pane that enable/disable the 'matching' and 'range' filters
     *
     * @param   {Event}  evt  Change event on a check box
     */
    _events.onDateTypeChange = function _onDateTypeChange (evt) {
        var colRule = evt.data.colRule;
        var newValue = $(this).is(':checked');

        // Mark this setting as enabled/disabled
        colRule.dateSettings[evt.data.type].enabled = newValue;

        _priv.executeFilters(evt.data.table);

        // Close the pane if the Escape key was pressed
        if (evt.keyCode === 27) {
            _priv.closePane(colRule);

            return true;
        }
    };

    /**
     * Handles changes on the Include Blank checkbox
     *
     * @param   {Event}  evt Change event on Include Blank checkbox
    **/
    _events.onIncludeBlankChange = function _onIncludeBlankChange(evt){

        _priv.executeFilters(evt.data.table);
    };

    /**
     * Handles clicks on a date pane's 'Clear' button
     *
     * @param   {Event}  evt  Click event
     */
    _events.onDateClearButtonClick = function _onDateClearButtonClick (evt) {
        var colRule = evt.data.colRule;

        // Clear the settings and UI
        colRule = _priv.clearDatePane(colRule);

        // Reevaluate the table
        _priv.executeFilters(evt.data.table);
    };

    /**
     * Handles keystrokes and changes to any "matches this date" input field
     *
     * @param   {Event}  evt  Keyup or change event in a text field
     */
    _events.onDateMatchingChange = function _onDateMatchingChange (evt) {
        var isNumberKey = false; // Used for reference when we're deciding whether to shift focus to another field
        var table;
        var colRule;
        var settings;
        var part; // Piece of the date (month, day, or year) that is being modified
        var originalValue; // Exact value of the input; needed for the hidden date picker field
        var value; // The value, converted to an integer

        /**
         * Updates the hidden datepicker input when one of the individual inputs has changed
         * This ensures the data picker opens to the correct date by default
         */
        var __updateHiddenInput = function __updateHiddenInput () {
            var month = settings.matching.month;
            var day = settings.matching.day;
            var year = settings.matching.year;
            var now = new Date();

            // If the rule object does not have a specificed value, fill in the current date
            if (!month) {
                month = now.getMonth() + 1;
            }

            if (!day) {
                day = now.getDate();
            }

            if (!year) {
                year = now.getFullYear();
            }

            // Set this even if there are no values so that the rule is applied (e.g. when the user clears out their entry)
            settings.isSet = true;

            $dateMatchInputHidden.val(month + '/' + day + '/' + year);
        };

        // Ignore modifier keys, Enter, Tab, backspace,  and left/right arrow keys
        if (evt.shiftKey || evt.ctrlKey || evt.altKey || [9, 13, 16, 17, 18, 37, 39].indexOf(evt.keyCode) !== -1) {
            return true;
        }

        // Close the pane if the Escape key was pressed
        if (evt.keyCode === 27) {

            _priv.closePane(evt.data.colRule, {justClosed: true});

            return true;
        }

        // Detect number key presses
        // We need to ensure `evt.keyCode` is defined before doing comparisons because this function is also triggered by `change` events which wouldn't populate that property
        if (evt.keyCode && ((evt.keyCode >= 48 && evt.keyCode <= 57) || (evt.keyCode >= 96 && evt.keyCode <= 105))) {

            isNumberKey = true;
        }
        else {

            // Remove any stray character keys from the match input
            evt.target.value = evt.target.value.replace(/[^0-9\.\/]/g,'');

            if (evt.keyCode && [8, 46].indexOf(evt.keyCode) === -1) {

                return true;
            }
        }

        // Ensure the corresponding radio button is selected
        // Do this before looking up the `colRule` object because this event will change its value (i.e. it enables the "matching" option)
        $dateMatchCheckbox
            .prop('checked', true)
            .trigger('change', evt.data);

        table = evt.data.table;
        part = evt.data.part; // Piece of the date (month, day, or year) that is being modified
        originalValue = this.value.trim();
        value = parseInt(originalValue, 10);
        colRule = evt.data.colRule;
        settings = colRule.dateSettings;

        // Validate the value and update the `colRule` object

        if (!value) {
            value = 0;
        }

        if (part === 'month') {
            if (value > 12) {
                settings.matching.month = 0;
            }

            // Update the value only if it's changed (e.g. ignore arrows and other keys that didn't actually change the value) so we can avoid needlessly re-filtering the table
            if (settings.matching.month !== value) {
                settings.matching.month = value;
            }

            // Update the hidden input
            __updateHiddenInput();

            // Set focus to the next field if the user is done here
            // For example, if the month is currently `1`, they may be about to type `10` or `12`, so don't shift the focus. But if they've typed `4` there's nothing else they could type that would be valid, so we might as well shift focus to the next input.
            // Also, ignore non-numeric presses because it means the user is still editing the field (e.g. incrementing the value, tabbing between them, etc)
            // if (isNumberKey && settings.matching.month > 1) {
            //     $dateMatchInputDay.focus();
            // }

            _priv.executeFilters(table);
        }
        else if (part === 'day') {
            if (value > 31) {
                settings.matching.day = 0;
            }

            if (settings.matching.day !== value) {
                settings.matching.day = value;
            }

            __updateHiddenInput();

            // Set focus to the next field
            // We're using 4 as the minimum value to indicate completion. If the user pressed 1, 2, or 3 they may be starting to type a two-digit date.
            // if (isNumberKey && settings.matching.day > 3) {
            //     $dateMatchInputYear.focus();
            // }

            _priv.executeFilters(table);
        }
        else if (part === 'year') {
            if (value > 2200 || value < 1800) { //FIXME: These limits are arbitrary. They should be synchronized with the date picker.
                settings.matching.year = 0;
            }

            if (settings.matching.year !== value) {
                settings.matching.year = value;
            }

            __updateHiddenInput();

            _priv.executeFilters(table);
        }
        // Date picker was used and the hidden input has been populated
        else if (part === 'hidden' && VALUES.dateRegex.test(originalValue)) {
            colRule.compareValue = originalValue;
            settings.matching.enabled = true;

            // Break the date into logical pieces
            value = VALUES.dateRegex.exec(originalValue);

            // Update the rule object and populate the input fields

            settings.matching.month = parseInt(value[1], 10);
            $dateMatchInputMonth.val(value[1]);

            settings.matching.day = parseInt(value[2], 10);
            $dateMatchInputDay.val(value[2]);

            settings.matching.year = parseInt(value[3], 10);
            $dateMatchInputYear.val(value[3]);

            settings.isSet = true;

            _priv.executeFilters(table);
        }
    };

    // Closes panes if the user clicks away from them
    _events.onBodyClick = function _on_body_click (evt) {

        // Look up the DOM to see if the user clicked within a pane
        if (evt.target !== evt.data.$input.get(0) && $(evt.target).closest('.' + CLASSES.filterPane).length === 0) {
            _priv.closeAllPanes();
        }
    };

    // Re-positions panes when the user resizes the window
    _events.onWindowResize = function _on_window_resize (evt) {

        _priv.positionPane(evt.data.$input, evt.data.colRule, evt.data.table);
    };

    /////////////////////
    // Setup Functions //
    /////////////////////

    _setup.filters = function _setup_filters (table, next) {

        if (!table.config.empty) {
            // Check for filter HTML option
            var filterCheck = table.$self.attr('data-filter');
            var openFilters = table.$self.attr('data-open-filters');

            if (filterCheck === "false") {
                table.config.setup.filter = false;
            }

            if (openFilters === true || openFilters === "true") {

                // Make sure there is something to filter before opening the filters
                if (table.dataStore && table.dataStore.body && table.dataStore.body.rows.length > 0) {
                    table.config.setup.preopen = true;
                }
                else {
                    table.config.setup.preopen = false;
                }

            }
            else {
                table.config.setup.preopen = false;
            }

            if (table.config.setup.filter) {

                if (table.dataStore && table.dataStore.body && table.dataStore.body.rows.length > 0) {

                    table.obj.$filterControl = table.obj.$tableWrapper.find('.' + CLASSES.controlRow);
                    table.obj.$filterControl.on('click', {table: table}, _events.filterRow);
                }

                if (table.config.setup.preopen) {

                    _priv.generateFilterRow(false, table);
                }
            }

            // Call a table reflow on filter as we want the sticky headers to fix there alignment
            table.$self.on('table.filter', function() {

                fastdom.mutate(function() {

                    table.reflow();
                });

            });

        }

        next();
    };

    return {
        _setup: _setup,
        _events: _events,
        _defaults: _defaults
    };
});
