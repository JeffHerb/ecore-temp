define([], function () {

    var _priv = {};
    var _setup = {};
    var _events = {};
    var _prototype = {};
    var _defaults = {
        setup: {
            selection: true,
        },
        plugins: {
            selection: {},
        },
    };

    var CLASSES = {
        highlight: 'emp-highlight-row',
        checked: 'emp-checked-row',
        allCheckRadio: '.table-control-col input[type="checkbox"], .table-control-col input[type="radio"]'
    };

    // =================
    // Private Functions
    // =================

    // Get Functions
    // =============

    // Function gathers a list of checked indexes from the dataStore and returns an array
    _priv.getCheckedIndex = function _get_checked_index(table) {

        var checkedIndex = [];

        if (table.dataStore.selectable) {

            for (var i = 0, len = table.dataStore.body.rows.length; i < len; i++) {

                if (table.dataStore.body.rows[i].selection && table.dataStore.body.rows[i].selection.checked) {

                    checkedIndex.push(table.dataStore.body.rows[i].key);

                    if (table.dataStore.selectionType === "single") {

                        break;
                    }
                }

            }

            return checkedIndex;
        }
        else {

            journal.log({type: 'warn', owner: 'UI', module: 'table', submodule: 'selection', func: '_priv.getCheckedIndex'}, 'Table: ' + table.id + ' is not selectable and will never have checked indexes');

            return false;
        }
    };

    _priv.getCheckedRow = function _get_checked_row(table) {

        var rowIndex = [];

        if (table.dataStore.selectable) {

            for (var i = 0, len = table.dataStore.body.rows.length; i < len; i++) {

                if (table.dataStore.body.rows[i].selection && table.dataStore.body.rows[i].selection.checked) {

                    rowIndex.push(i);

                    if (table.dataStore.selectionType === "single") {

                        break;
                    }
                }

            }

            return rowIndex;
        }
        else {

            journal.log({type: 'warn', owner: 'UI', module: 'table', submodule: 'selection', func: '_priv.getCheckedIndex'}, 'Table: ' + table.id + ' is not selectable and will never have checked indexes');

            return false;
        }

    };

    _priv.getCheckedColumnValues = function _get_checked_column_values(table) {

        var row = _priv.getCheckedRow(table);

        if (row) {

            var rowDef = table.dataStore.body.rows[row];

            var valueMap = {};

            for (var c = 0, cLen = rowDef.columns.length; c < cLen; c++) {

                if (rowDef.columns[c].contents && rowDef.columns[c].contents.length) {

                    var compiledValue = "";

                    for (var cc = 0, ccLen = rowDef.columns[c].contents.length; cc < ccLen; cc++) {

                        var content = rowDef.columns[c].contents[cc];

                        if (content.template === "field") {

                            if (content.type === "select") {

                                if (content.input && content.input.value) {
                                    compiledValue += content.input.value;
                                }

                            }
                            else if (content.type === "checkbox" || content.type === "radio") {

                                if ((content.input && content.input.attributes && content.input.attributes.checked) && (content.input && content.input.attributes && content.input.attributes.value)) {
                                    compiledValue += content.input.attributes.value;
                                }

                            }
                            // For textarea and normal inputs
                            else {

                                if (content.input && content.input.attributes && content.input.attributes.value) {
                                    compiledValue += content.input.attributes.value;
                                }

                            }

                        }
                        else {
                            if (content.text) {
                                compiledValue += content.text;
                            }
                        }

                    }

                    valueMap[c] = compiledValue;

                }
                else if (rowDef.columns[c].text) {

                    valueMap[c] = rowDef.columns[c].text;
                }
                else {

                    valueMap[c] = "";
                }

            }

            return valueMap;
        }

        return false;
    };

    _priv.getHiddenInputValues = function _get_hidden_input_values(table) {

        var returnObj = {};

        var name = false;
        var value = false;

        for (var i = 0, len = table.config.hiddenInputs.$columns.length; i < len; i++) {

            if (table.config.hiddenInputs.$columns[i]) {

                // Get the current focused column value
                name = table.config.hiddenInputs.$columns[i].attr('name');
                value = table.config.hiddenInputs.$columns[i].val();

                returnObj[name] = value;

                // Get the previous focused column value
                name = table.config.hiddenInputs.$columnsTemp[i].attr('name');
                value = table.config.hiddenInputs.$columnsTemp[i].val();

                returnObj[name] = value;
            }
        }

        if (table.config.hiddenInputs.$checked) {

            name = table.config.hiddenInputs.$checked.attr('name');
            value = table.config.hiddenInputs.$checked.val();

            returnObj[name] = value;
        }

        if (table.config.hiddenInputs.$selected) {

            name = table.config.hiddenInputs.$selected.attr('name');
            value = table.config.hiddenInputs.$selected.val();

            returnObj[name] = value;
        }

        return returnObj;
    };

    // Set Functions
    // =============

    // Function updated the dataStore so all selection.checked properties match the passed state
    _priv.setAllCheckedStatesStore = function _set_all_checked_state_store(table, state) {

        for (var i = 0, len = table.dataStore.body.rows.length; i < len; i++) {

            // Add the selection object if its missing
            if (!table.dataStore.body.rows[i].selection) {

                table.dataStore.body.rows[i].selection = {};
            }

            // Double check to make sure the current row is not set to empty or readOnly
            if (table.dataStore.body.rows[i].selection && (!table.dataStore.body.rows[i].selection.empty && !table.dataStore.body.rows[i].selection.readOnly)) {

                if (!table.dataStore.body.rows[i].skip) {
                    table.dataStore.body.rows[i].selection.checked = state;
                }
            }

        }

        if (table.dataStore.selectionType === "single") {

            _priv.extactColumnValues(table, false);
        }

        _priv.updateCheckedIndex(table);
    };

    // Function marks or unmarks all checkboxes render on the table
    _priv.setAllCheckedStateScreen = function _set_all_checked_state_screen(table, state, $inputs) {

        fastdom.mutate(function () {

            $inputs.each(function() {

                $(this).prop('checked', state);

                $row = $(this).parents('tr').eq(0);

                if (state) {
                    $row.addClass(CLASSES.checked);
                }
                else {
                    $row.removeClass(CLASSES.checked);
                }

            });
        });
    };

    // Function marks a specific row in the dataStore as checked and then call screen based on need
    _priv.setRowSelection = function _set_row_selection(table, key, index, state, screen) {

        if (typeof index === "string" && !isNaN(index)) {
            index = parseInt(index);
        }

        var row = table.dataStore.body.rows[index];

        if (row) {

            if (!row.selection) {

                row.selection = {};
            }

            row.selection.checked = state;

            // Check if we need to flush the other checked index because it a radio
            if (table.dataStore.selectionType === "single") {

                for (var i = 0, len = table.dataStore.body.rows.length; i < len; i++) {

                    if (table.dataStore.body.rows[i].selection && table.dataStore.body.rows[i].selection.checked && table.dataStore.body.rows[i].key !== key) {

                        var keyType = typeof table.dataStore.body.rows[i].key;
                        var providedKeyType = typeof key;

                        if (keyType !== providedKeyType) {

                            if (keyType === "number") {
                                key = parseInt(key);
                            }
                            else if (keyType === "string") {

                                key = key.toString();
                            }
                        }

                        if (table.dataStore.body.rows[i].key !== key) {
                            table.dataStore.body.rows[i].selection.checked = false;

                            var $row = table.obj.$tbody.find('tr[data-key="' + table.dataStore.body.rows[i].key + '"]');

                            $row.removeClass(CLASSES.checked);

                        }

                    }

                    if (i === index) {
                        continue;
                    }

                }

                if (state === true) {

                    // Update the hidden input references only if its a single selection
                    _priv.extactColumnValues(table, row);
                }
                else {

                    _priv.ClearCurrentColumnValues(table);
                }

            }

            // Update the checked index
            _priv.updateCheckedIndex(table);

            if (screen) {
                _priv.setRowSelectionScreen(table, key, index, state);
            }

            if (table.dataStore.selectAll) {
                _priv.verifySelectAllState(table);
            }

        }
        else {

            journal.log({type: 'error', owner: 'UI', module: 'table', submodule: 'selection', func: '_priv.setRowSelection'}, 'Invalid row was found or not returned.');
        }
    };

    // Function updates the checked state of a visual row if it can find it.
    _priv.setRowSelectionScreen = function(table, key, index, state) {

        var $row = table.$self.find('tr[data-key="' + key + '"]');

        if ($row.length === 1) {

            var $input = $row.find(CLASSES.allCheckRadio);

            if ($input.length){

                $input.prop('checked', state);

                if (state) {

                    $row.addClass(CLASSES.checked);
                }
                else {

                    $row.removeClass(CLASSES.checked);
                }
            }

        }
    };

    // Function to set the focus (highlighted) row
    _priv.setRowHighlight = function _set_row_highlight(table, key, index) {

        var $row = table.obj.$tbody.find('tr[data-key="' + key + '"]');
        var row = table.dataStore.body.rows[index];

        if (row.key === key) {

            if (!row.highlight) {

                row.highlight = true;

                if ($row.length) {

                    $row.addClass(CLASSES.highlight);
                }

                // Loop through and un-highlight all the rest
                for (var i = 0, len = table.dataStore.body.rows.length; i < len; i++) {

                    if (table.dataStore.body.rows[i].highlight && table.dataStore.body.rows[i].key !== key) {

                        $row = table.obj.$tbody.find('tr[data-key="' + table.dataStore.body.rows[i].key + '"]');

                        if ($row.length) {

                            $row.removeClass(CLASSES.highlight);
                        }

                        table.dataStore.body.rows[i].highlight = false;
                    }
                }

                _priv.extactColumnValues(table, row);

                _priv.updateSelectedIndex(table);
            }
            else {

                journal.log({type: 'info', owner: 'UI', module: 'table', submodule: 'selection', func: '_priv.setRowHighlight'}, 'Block attempt to set focus to already focused row.');
            }
        }
        else {

            journal.log({type: 'error', owner: 'UI', module: 'table', submodule: 'selection', func: '_priv.setRowHighlight'}, 'Invalid row was found or not returned.');
        }
    };

    _priv.removeHightlight = function(table) {

        // Loop through and un-highlight all the rest
        for (var i = 0, len = table.dataStore.body.rows.length; i < len; i++) {

            // Find all the highlighted rows
            if (table.dataStore.body.rows[i].highlight) {

                var $row = table.obj.$tbody.find('tr[data-key="' + table.dataStore.body.rows[i].key + '"]');

                if ($row.length) {

                    $row.removeClass(CLASSES.highlight);
                }

                table.dataStore.body.rows[i].highlight = false;
            }
        }
    };

    // Update Functions
    // ================

    // Function updates the checked_index hidden field after pulling keys from the dataStore.
    _priv.updateCheckedIndex = function _update_checked_index(table) {

        var checkedIndex = [];

        if (table.config.hiddenInputs && table.config.hiddenInputs.$checked) {

            for (var i = 0, len = table.dataStore.body.rows.length; i < len; i++) {

                if (table.dataStore.body.rows[i].selection && table.dataStore.body.rows[i].selection.checked) {

                    checkedIndex.push(table.dataStore.body.rows[i].key);
                }
            }

            table.config.hiddenInputs.$checked.val(checkedIndex.join(','));
        }
        else {

            journal.log({type: 'warn', owner: 'UI', module: 'table', submodule: 'selection', func: '_priv.updateCheckedIndex'}, 'Skipping checked_index update for table: ' + table.id);
        }
    };

    _priv.updateSelectedIndex = function _update_selected_index(table) {

        var selectedIndex = false;

        for (var i = 0, len = table.dataStore.body.rows.length; i < len; i++) {

            if (table.dataStore.body.rows[i].highlight) {

                selectedIndex = table.dataStore.body.rows[i].key;

                break;
            }
        }

        if (selectedIndex) {

             table.config.hiddenInputs.$selected.val(selectedIndex);
        }
        else {

            table.config.hiddenInputs.$selected.val("");
        }
    };

    // Function update hidden inputs
    _priv.updateHiddenInputs = function _update_hidden_inputs(table, map) {

        if (map) {
        }
        else {

            // Handle the column and temp column inputs
            for (var i = 0, len = table.config.hiddenInputs.$columns.length; i < len; i++) {

                if (table.config.hiddenInputs.$columns[i]) {

                    table.config.hiddenInputs.$columns[i].val("");
                }

            }

            // Handle the column and temp column inputs
            for (var t = 0, tLen = table.config.hiddenInputs.$columnsTemp.length; t < tLen; t++) {

                if (table.config.hiddenInputs.$columnsTemp[i]) {

                    table.config.hiddenInputs.$columnsTemp[i].val("");
                }

            }

            table.config.hiddenInputs.$checked.val("");
            table.config.hiddenInputs.$selected.val("");

            journal.log({type: 'warning', owner: 'UI', module: 'table', submodule: 'selection', func: '_priv.updateHiddenInputs'}, 'No map provided to update hidden inputs, flushing the values');
        }
    };

    // Other Functions
    // ===============

    // Function builds out table config based on avaliable hidden table inputs
    _priv.setupHiddenInputs = function _setup_hidden_inputs(table, id) {

        var colmap = {};
        var hiddenInputs = {
            $columns: [],
            $columnsTemp: [],
            $checked: false,
            $checkedPrevious: false,
            $selected: false,
            $selectedPrevious: false
        };

        if (table.dataStore.head && table.dataStore.head.rows && table.dataStore.head.rows.length >= 1) {

            for (var i = 0, len = table.dataStore.head.rows[0].columns.length; i < len; i++) {

                var column = table.dataStore.head.rows[0].columns[i];

                if (column.attributes && column.attributes['data-colmap']) {

                    var name = column.attributes['data-colmap'];

                    name = name.substring(0, 1).toLowerCase() + name.substring(1).replace(/\s+/g, '');

                    // Try and fine the input
                    $input = table.obj.$tableContainer.find('#' + name);
                    $inputTemp = table.obj.$tableContainer.find('#' + name + '_temp');

                    colmap[i] = name;

                    if ($input) {

                        hiddenInputs.$columns.push($input);

                    }
                    else {

                        journal.log({type: 'error', owner: 'UI', module: 'table', submodule: 'selection', func: '_priv.setupHiddenInputs'}, 'Failed to find hidden input for: ' + name + ' for table: ' + table.id);
                    }

                    if($inputTemp) {

                        hiddenInputs.$columnsTemp.push($inputTemp);
                    }
                    else {

                        journal.log({type: 'error', owner: 'UI', module: 'table', submodule: 'selection', func: '_priv.setupHiddenInputs'}, 'Failed to find hidden input for: ' + name + '_temp for table: ' + table.id);
                    }

                }
                else {
                    // Push false value in place of bad columns
                    hiddenInputs.$columns.push(false);
                    hiddenInputs.$columnsTemp.push(false);
                }

            }

            // Look for checking index hidden field
            var $checkedIndex = table.obj.$tableContainer.find('#' + id + '_checked_index');

            if ($checkedIndex) {
                hiddenInputs.$checked = $checkedIndex;
            }

            var $checkedIndexPrevious = table.obj.$tableContainer.find('#' + id + '_checked_index_previous');

            if ($checkedIndexPrevious) {
                hiddenInputs.$checkedPrevious = $checkedIndexPrevious;
            }

            var $selectedIndex = table.obj.$tableContainer.find('#' + id + '_selected_index');

            if ($selectedIndex) {
                hiddenInputs.$selected = $selectedIndex;
            }

            var $selectedIndexPrevious = table.obj.$tableContainer.find('#' + id + '_selected_index_previous');

            if ($selectedIndexPrevious) {
                hiddenInputs.$selectedPrevious = $selectedIndexPrevious;
            }

            if (table.config.type === "order") {

                var $orderHiddenInput = table.obj.$viewWrapper.find('input#' + table.id + '_indexOrder');

                hiddenInputs.$orderIndex = $orderHiddenInput;

                // Get all the keys now!
                var rowKeys = _priv.getTableKeys(table);

                hiddenInputs.$orderIndex.val(rowKeys.join(','));

            }

            table.config.colmap = $.extend(true, {}, colmap);
            table.config.hiddenInputs = $.extend(true, {}, hiddenInputs);
        }
        else {

            table.config.colmap = false;
            table.config.hiddenInputs = false;

            journal.log({type: 'info', owner: 'UI', module: 'table', submodule: 'selection', func: '_priv.setupHiddenInputs'}, 'Table: ' + table.id + ' has no header so colmap and hidden inputs shouldnt exist.');
        }
    };

    _priv.findRow = function _find_row(table, ref) {

        var foundKey = [];
        var foundIndex = [];

        var key = _priv.evalRowReference(ref);

        var otherFormatKey = false;

        if (typeof key === "string" && !isNaN(key)) {
            otherFormatKey = parseInt(key);
        }
        else if (typeof key === "number") {
            otherFormatKey = key.toString();
        }

        // Do a full search in one loop!
        for (var i = 0, len = table.dataStore.body.rows.length; i < len; i++) {

            if (table.dataStore.body.rows[i].key === key) {
                foundKey.push({ 'dataStore': table.dataStore.body.rows[i], 'index': i});
            }
            else if (table.dataStore.body.rows[i].key === otherFormatKey) {
                foundKey.push({ 'dataStore': table.dataStore.body.rows[i], 'index': i});
            }

            if (i === key) {
                foundIndex.push({ 'dataStore': table.dataStore.body.rows[i], 'index': i});
            }

        }

        if (foundKey.length && foundIndex.length) {

            // Detect same row
            if (foundKey[0].key === foundIndex[0].key) {

                return foundKey[0];
            }

        }
        else {


            if (foundKey.length > 1 || foundIndex > 1) {

                journal.log({type: 'error', owner: 'Developer', module: 'table', submodule: 'selection', func: '_priv.findRow'}, 'The row key for the row selected is found in the table datastore is not unique. Row id\'s must be unique, either manually set key or allow for default index.');
            }
            else {

                // Check to see if it was just the key
                if (foundKey.length === 1) {

                    return foundKey[0];
                }

                if (foundIndex.length === 1) {

                    return foundIndex[0];
                }

                journal.log({type: 'error', owner: 'UI', module: 'table', submodule: 'selection', func: '_priv.findRow'}, 'Insufficiant context provided to find a key. It is better if you pass in a row element, a jQuery reference or a unique row key.');
            }

        }

        return false;
    };

    _priv.evalRowReference = function _eval_row_reference(ref) {

        var controlsArray = ['INPUT', 'BUTTON'];

        if (ref !== undefined) {

            if (ref instanceof jQuery) {

                return ref.attr('data-key') || false;
            }
            else if (ref.nodeType && ref.nodeType === 1 && ref.nodeName === "TR") {

                return ref.getAttribute('data-key') || false;
            }
            else if (ref.nodeType && ref.nodeType === 1 && controlsArray.indexOf(ref.nodeName) !== -1 ) {

                var $ref = $(ref.target);

                var $parentRow = $ref.parents('tr').eq(0);

                if ($parentRow.length) {

                    return $parentRow.attr('data-key') || false;
                }
                else {

                    return false;
                }

            }
            else if (typeof ref === "string" || typeof ref === "number") {

                journal.log({type: 'warning', owner: 'UI', module: 'table', submodule: 'selection', func: '_prototype.rowSelection'}, 'Looking up row by key (this is not the recommended approach)!');

                return ref;
            }
            else {

                journal.log({type: 'error', owner: 'UI', module: 'table', submodule: 'selection', func: '_prototype.rowSelection'}, 'Cannot find row in table: ' + this.id + 'invalid references, must be jQuery selection, HTML Element reference, or row render row index or row key.');

                return false;
            }
        }
    };

    _priv.extactColumnValues = function _extract_column_values(table, row) {

        _priv.ClearCurrentColumnValues(table);

        if (row) {

            for (var c = 0, cLen = row.columns.length; c < cLen; c++) {

                var value = "";

                if (table.config.hiddenInputs.$columns[c]) {

                    if (row.columns[c].text && (!row.columns[c].contents || row.columns[c].contents.length === 0)) {

                        value = row.columns[c].text;
                    }
                    else if (row.columns[c].contents && row.columns[c].contents.length) {

                        var runningValue = "";

                        for (var ce = 0, ceLen = row.columns[c].contents.length; ce < ceLen; ce++) {

                            switch (row.columns[c].contents[ce].template) {

                                case 'field':

                                    if (row.columns[c].contents[ce] === "select") {

                                        if (row.columns[c].contents[ce].input && row.columns[c].contents[ce].input.value) {

                                            runningValue += " " + row.columns[c].contents[ce].input.value;
                                        }
                                    }
                                    else {

                                        if (row.columns[c].contents[ce] === "checkbox" || row.columns[c].contents[ce] === "radio") {

                                            // Verify all of the value path and checked status
                                            if (row.columns[c].contents[ce].input && row.columns[c].contents[ce].input.attributes && row.columns[c].contents[ce].input.attributes.checked && row.columns[c].contents[ce].input.attributes.value) {

                                                runningValue += " " + row.columns[c].contents[ce].input.attributes.value;
                                            }
                                        }
                                        else {

                                            if (row.columns[c].contents[ce].input && row.columns[c].contents[ce].input.attributes && row.columns[c].contents[ce].input.attributes.value) {

                                                runningValue += " " + row.columns[c].contents[ce].input.attributes.value;
                                            }
                                        }
                                    }

                                    break;

                                case 'composite':

                                    switch(row.columns[c].contents[ce].type) {

                                        case 'search':

                                            if (row.columns[c].contents[ce].parts.text.input && row.columns[c].contents[ce].parts.text.input.attributes && row.columns[c].contents[ce].parts.text.attributes.value) {

                                                runningValue += " " + row.columns[c].contents[ce].parts.text.attributes.value;
                                            }

                                            break;

                                        case 'rating':

                                            if (row.columns[c].contents[ce].parts.hidden.input && row.columns[c].contents[ce].parts.hidden.input.attributes && row.columns[c].contents[ce].parts.hidden.attributes.value) {

                                                runningValue += " " + row.columns[c].contents[ce].parts.hidden.input.attributes.value;
                                            }

                                            break;

                                        default:

                                            break;
                                    }

                                    break;

                                case 'score':
                                    runningValue += " " + row.columns[c].contents[ce].score;
                                    break;

                                case 'icon':
                                case 'link':
                                case 'notifier':

                                    runningValue += " " + row.columns[c].contents[ce].text;
                                    break;

                                case undefined:

                                    journal.log({type: 'info', owner: 'UI', module: 'table', submodule: 'selection', func: '_priv.extactColumnValues'}, 'Table: ' + table.id + ' Extract column values is set to undefined: ' + row.columns[c].contents[ce]);

                                    break;
                            }

                        }

                        value = runningValue.trim();
                    }
                    else if (!row.columns[c].text && ( !row.columns[c].contents || (row.columns[c].contents && row.columns[c].contents.length === 0))) {

                        journal.log({type: 'warning', owner: 'UI', module: 'table', submodule: 'selection', func: '_priv.extactColumnValues'}, 'Column:', c, 'Containes no text or contents. Sending empty string');
                    }
                    else {

                        journal.log({type: 'error', owner: 'UI', module: 'table', submodule: 'selection', func: '_priv.extactColumnValues'}, 'Could not find valid contents for row column:', c, row, row.columns[c]);
                    }

                    journal.log({type: 'info', owner: 'UI', module: 'table', submodule: 'selection', func: '_priv.extactColumnValues'}, 'Table hidden field: ' + table.config.hiddenInputs.$columns[c].attr('name') + " set to => " + ((value) ? value : ':empty-string:'));

                    table.config.hiddenInputs.$columns[c].val(value);
                }
            }

            // Check if we have checked and selected hidden fields
            if (table.config.hiddenInputs.$checked && table.config.hiddenInputs.$checkedPrevious) {

                table.config.hiddenInputs.$checkedPrevious.val(table.config.hiddenInputs.$checked.val());
            }

            if (table.config.hiddenInputs.$selected && table.config.hiddenInputs.$selectedPrevious) {

                table.config.hiddenInputs.$selectedPrevious.val(table.config.hiddenInputs.$selected.val());
            }
        }
    };

    // Function will move all temp hidden field values back to 
    _priv.reverseColumnValues = function _reverse_column_values(table) {

    };

    _priv.ClearCurrentColumnValues = function _clear_current_column_values(table, row, skipTemp) {

        for (var h = 0, hLen = table.config.hiddenInputs.$columns.length; h < hLen; h++) {

            if (table.config.hiddenInputs.$columns[h]) {

                var curValue = table.config.hiddenInputs.$columns[h].val();

                journal.log({type: 'info', owner: 'UI', module: 'table', submodule: 'selection', func: '_priv.extactColumnValues'}, 'Table hidden field: ' + table.config.hiddenInputs.$columnsTemp[h].attr('name') + ' set to => ' + ((curValue) ? curValue : ':empty-string:'));

                table.config.hiddenInputs.$columnsTemp[h].val(curValue);

                if (!row) {
                    table.config.hiddenInputs.$columns[h].val('');
                }
            }
        }
    };

    _priv.reverseFocus = function _remove_focus(table) {

        if (table && table.config) {

            for (var t = 0, tLen = table.config.hiddenInputs.$columnsTemp.length; t < tLen; t++) {

                var tempValue = table.config.hiddenInputs.$columnsTemp[t].val();

                // temp -> current
                table.config.hiddenInputs.$columns[t].val();

                // Clear temp field
                table.config.hiddenInputs.$columnsTemp[t].val('');

            }

        }

        if (table.config.hiddenInputs.$checked && table.config.hiddenInputs.$checkedIndexPrevious) {
            table.config.hiddenInputs.$checked.val(table.config.hiddenInputs.$checkedIndexPrevious.val());
        }

        if (table.config.hiddenInputs.$selected && table.config.hiddenInputs.$selectedPrevious) {
            table.config.hiddenInputs.$selected.val(table.config.hiddenInputs.$selectedPrevious.val());
        }

        journal.log({type: 'info', owner: 'UI', module: 'table', submodule: 'selection', func: '_priv.reverseFocus'}, 'Reversing table inputs and setting temp values back to current.');

    };

    // Function reviews the dataStore and verifys if all rows are checked or not and properly updates it.
    _priv.verifySelectAllState = function _verify_select_all_state(table) {

        // current state
        var selectAllState = (table.config.$headerCheckbox.is(':checked')) ? true : false;

        var allTrue = true;

        for (var r = 0, rLen = table.dataStore.body.rows.length; r < rLen; r++) {

            // Check for a check false value
            if (!table.dataStore.body.rows[r].selection || (table.dataStore.body.rows[r].selection && !table.dataStore.body.rows[r].selection.checked)) {

                if (selectAllState) {

                    table.config.$headerCheckbox.prop('checked', false);
                    break;
                }

                allTrue = false;
            }

        }

        if (!selectAllState && allTrue) {

            table.config.$headerCheckbox.prop('checked', true);
        }
    };

    _priv.getTableKeys = function (table) {

        var $tr = table.obj.$tbody.find('tr');

        var keys = [];

        for (var r = 0, rLen = $tr.length; r < rLen; r++) {

            keys.push($tr[r].getAttribute('data-key'));
        }

        return keys;

    };

    // =================
    // Events Functions
    // =================

    // Event handler for when some manual clicks on the check all control
    _events.headerCheckbox = function _header_checkbox(evt, table, $input) {

        var checkedState = $input.is(':checked');

        // Update the dataStore
        _priv.setAllCheckedStatesStore(table, checkedState);

        // Check for body inputs
        $bodyInputs = table.obj.$tbody.find('td.table-control-col > input[type="checkbox"]');

        if ($bodyInputs.length) {

            _priv.setAllCheckedStateScreen(table, checkedState, $bodyInputs);
        }
        else {

            journal.log({type: 'error', owner: 'UI', module: 'table', submodule: 'selection', func: '_events.headerCheckbox'}, 'Unable to find body checkbox columns and inputs in table: ' + table.id);
        }

        journal.log({type: 'info', owner: 'UI', module: 'table', submodule: 'selection', func: '_events.headerCheckbox'}, 'All checkboxes in table: ' + table.id + ' have been ' + ((checkedState) ? 'checked' : 'unchecked') + ' by the header control');
    };

    // Event handler for when someone manually clicks on a body selection contorl (left most checkbox or radio)
    _events.setRowSelection = function _set_row_selection(evt, table, $input) {

        // Get the row
        var $row = $input.parents('tr').eq(0);

        // Get the demographics
        var key = $row.attr('data-key');
        var index = $row.attr('data-row-index');
        var state = $input.is(':checked');

        _priv.setRowSelection(table, key, index, state);

        if (state) {
            $row.addClass(CLASSES.checked);
        }
        else {
            $row.removeClass(CLASSES.checked);
        }

    };

    // ================
    // Public Functions
    // ================

    // Function returns an array of checked index row keys
    _prototype.getCheckedIndex = function _get_checked_index() {

        var result = _priv.getCheckedIndex(this);

        if (result.length) {

            if (result.length > 1) {

                return result;
            }

            return result[0];
        }

        return false;
    };

    // Function returns an array of checked row indexs
    _prototype.getCheckedRow = function _get_checked_row() {

        return _priv.getCheckedRow(this);
    };

    _prototype.getCheckedColumnValues = function _get_checked_column_values() {

        if (this.dataStore.selectable && this.dataStore.selectionType === "single") {

            return _priv.getCheckedColumnValues(this);
        }

        return false;
    };

    _prototype.getHiddenInputValues = function _get_hidden_input_values() {

        return _priv.getHiddenInputValues(this);
    };

    // Function used to clear all checkboxes in the table.
    _prototype.setAllSelection = function _set_all_selection(state, table) {

        if (state === undefined || (state !== true || state !== false)) {

            if (table === undefined) {
                table = this;
            }

            // Clears out the dataStore checked states
            _priv.setAllCheckedStatesStore(table, state);

            $inputs = table.$self.find(CLASSES.allCheckRadio);

            _priv.setAllCheckedStateScreen(table, state, $inputs);
        }
        else {

            journal.log({type: 'error', owner: 'UI', module: 'table', submodule: 'selection', func: '_prototype.setAllSelection'}, 'Cannot set or clear row selections in table: ' + table.id + ' state must be provided `true|false`');
        }
    };

        // Shortcut functions for clearing and marking all items as selected
        _prototype.clearAllSelection = function _clear_all_selection() {

            _prototype.setAllSelection(false, this);
        };

        _prototype.markAllSelection = function _clear_all_selection() {

            _prototype.setAllSelection(true, this);
        };

    // Function used to set or clear a specific check state by row key
    _prototype.setRowSelection = function _row_selection(ref, state, table) {

        if (ref !== undefined && (state === true || state === false)) {

            if (table === undefined) {
                table = this;
            }

            var rowObj = _priv.findRow(table, ref);

            if (rowObj) {

                _priv.setRowSelection(table, rowObj.dataStore.key, rowObj.index, state, true);
            }
            else {

                journal.log({type: 'error', owner: 'UI', module: 'table', submodule: 'selection', func: '_prototype.setRowSelection'}, 'Cannot find row in table: ' + table.id + ' with provided reference: ' + ref);
            }
        }
        else {

            journal.log({type: 'error', owner: 'UI', module: 'table', submodule: 'selection', func: '_prototype.setRowSelection'}, 'Cannot set row selection in table: ' + table.id + ' must provided a row reference and bool state `true|false`');
        }
    };

        // Shortcut functions for clearing and marking one specific row items as selected
        _prototype.checkRow = function(ref) {

            _prototype.setRowSelection(ref, true, this);
        };

        _prototype.uncheckRow = function(ref) {

            _prototype.setRowSelection(ref, false, this);
        };

    _prototype.clearHiddenInputs = function _clear_hidden_inputs() {

        _priv.updateHiddenInputs(this);
    };

    _prototype.setFocus = function _set_focus(evt, keyIndex) {

        if (arguments.length) {

            var table = this;
            var rowObj = false;

            if (evt instanceof Event || evt instanceof jQuery) {

                var $source = false;

                if (evt instanceof jQuery) {

                    $source = evt;
                }
                else {

                    $source = $(evt.target);
                }

                console.log("Table focused control:", $source);

                $row = $source.parents('tr').eq(0);

                if ($row.length === 1) {

                    rowObj = _priv.findRow(table, $row);

                    _priv.setRowHighlight(table, rowObj.dataStore.key, rowObj.index);
                }
                else {

                    var $tableCheck = $source.parents('table');

                    if (!$tableCheck.length) {

                        if (keyIndex !== undefined) {

                            rowObj = _priv.findRow(table, keyIndex);

                            _priv.setRowHighlight(table, rowObj.dataStore.key, rowObj.index);
                        }
                        else {

                            var $buttonMenu = $source.parents('.emp-table-responsive-button-menu-pane').eq(0);

                            if ($buttonMenu.length === 1) {

                                var index = $buttonMenu.attr('data-row-index');
                                var key = $buttonMenu.attr('data-key');

                                rowObj = _priv.findRow(table, key);

                                _priv.setRowHighlight(table, rowObj.dataStore.key, rowObj.index);

                            }
                            else {

                                journal.log({type: 'error', owner: 'UI', module: 'table', submodule: 'selection', func: '_prototype.setFocus'}, 'When setting focuse from outside of table, key or index is required.');
                            }

                        }

                    }
                    else {

                        journal.log({type: 'error', owner: 'UI', module: 'table', submodule: 'selection', func: '_prototype.setFocus'}, 'Invalid internal table reference to set focus');
                    }

                }

            }
            else if ((keyIndex === undefined && (typeof evt === "string" || typeof evt === "number")) || (typeof keyIndex === "string" || typeof keyIndex === "number")) {

                keyIndex = evt;
                evt = false;

                rowObj = _priv.findRow(table, keyIndex);

                _priv.setRowHighlight(table, rowObj.dataStore.key, rowObj.index);

            }

        }
        else {

            journal.log({type: 'error', owner: 'UI', module: 'table', submodule: 'selection', func: '_prototype.setFocus'}, 'Unable to determine proper row from no arguments');
        }
    };

    _prototype.setTempFocus = function _set_temp_focus(evt, keyIndex) {

        if (arguments.length) {

            var table = this;
            var rowObj = false;

            if (evt instanceof Event || evt instanceof jQuery) {

                var $source = false;

                if (evt instanceof jQuery) {

                    $source = evt;
                }
                else {

                    $source = $(evt.target);
                }

                console.log("Table focused control:", $source);

                $row = $source.parents('tr').eq(0);

                if ($row.length === 1) {

                    rowObj = _priv.findRow(table, $row);

                }
                else {

                    var $tableCheck = $source.parents('table');

                    if (!$tableCheck.length) {

                        if (keyIndex !== undefined) {

                            rowObj = _priv.findRow(table, keyIndex);
                        }
                        else {

                            var $buttonMenu = $source.parents('.emp-table-responsive-button-menu-pane').eq(0);

                            if ($buttonMenu.length === 1) {

                                var index = $buttonMenu.attr('data-row-index');
                                var key = $buttonMenu.attr('data-key');

                                rowObj = _priv.findRow(table, key);

                            }
                            else {

                                journal.log({type: 'error', owner: 'UI', module: 'table', submodule: 'selection', func: '_prototype.setFocus'}, 'When setting focuse from outside of table, key or index is required.');
                            }

                        }

                    }
                    else {

                        journal.log({type: 'error', owner: 'UI', module: 'table', submodule: 'selection', func: '_prototype.setFocus'}, 'Invalid internal table reference to set focus');
                    }

                }

            }
            else if ((keyIndex === undefined && (typeof evt === "string" || typeof evt === "number")) || (typeof keyIndex === "string" || typeof keyIndex === "number")) {

                keyIndex = evt;
                evt = false;

                rowObj = _priv.findRow(table, keyIndex);

            }

            if (rowObj) {

                // Now place our current unfocused row values into the hidden field mapping
                _priv.extactColumnValues(this, rowObj.dataStore);
            }

        }
        else {

            journal.log({type: 'error', owner: 'UI', module: 'table', submodule: 'selection', func: '_prototype.setFocus'}, 'Unable to determine proper row from no arguments');
        }

    };

    _prototype.removeFocus = function _remove_focus(evt) {

        var table = this;

        _priv.removeFocus(table);
    };

    _prototype.reverseFocus = function _reverse_focus(evt) {

        _priv.reverseFocus(this);
    };

    // ===============
    // Setup Functions
    // ===============

    // For the base table requires of Empire (sticky headers or the resizer) to work additional wrapper layers are needed as well as a place to put client side controls.
    _setup.selection = function _selection(table, next) {

        var lowerFirstCharacter = function _lower_first_character(string) {

            return string.substring(0, 1).toLowerCase() + string.slice(1);
        };

        if (!table.config.empty) {

            _priv.setupHiddenInputs(table, lowerFirstCharacter(table.id));

            // Setup Event Bindings!
            // ========================

            // Check to see if we have a select all box;
            var $headerCheckbox = table.obj.$thead.find('.table-control-col input[type="checkbox"]');

            if ($headerCheckbox.length) {

                table.obj.$thead.on('click', $headerCheckbox, function (evt) {

                    evt.stopPropagation();

                    // Get the current selection information
                    var $input = $(evt.target);

                    if ($input[0].nodeName === 'TH' || $input[0].nodeName === 'DIV' || $input[0].nodeName === 'SPAN') {

                        $input = $input.find('input').eq(0);

                        if ($input.length) {

                            journal.log({type: 'info', owner: 'UI', module: 'table', submodule: 'selection', func: 'setup => headerClickHandler'}, 'Routing header cell click to control');

                            if ($input.is(':checked')) {

                                _prototype.setRowSelection(ref, false, this);
                            }
                            else {

                                _prototype.setRowSelection(ref, true, this);
                            }
                        }

                    }
                    else {

                        // Called only when we have a real input tag.
                        _events.headerCheckbox(evt, table, $input);
                    }
                });

                table.config.$headerCheckbox = $headerCheckbox;

            }
            else {

                table.config.$headerCheckbox = false;
            }

            // Setup the body checkmarks and radio
            if (table.dataStore.selectable) {

                table.obj.$tbody.on('click', 'td.table-control-col, th.table-control-col', function(evt) {

                    evt.stopPropagation();

                    // Get the current selection information
                    var $input = $(evt.target);

                    if ($input.length && ($input[0].nodeName === 'TH' || $input[0].nodeName === 'TD')) {

                        $input = $input.find('input');

                        if ($input.length) {

                            if ($input.length > 1) {

                                journal.log({type: 'error', owner: 'UI', module: 'table', submodule: 'selection', func: 'setup => bodyClickHandler'}, 'More than 1 selection column cell control found');
                            }
                            else {

                                journal.log({type: 'info', owner: 'UI', module: 'table', submodule: 'selection', func: 'setup => headerClickHandler'}, 'Routing body cell click to control');

                                var $row = $input.parents('tr').eq(0);

                                var checked = $input.is(':checked');

                                if (table.dataStore.selectionType === "single") {

                                    if (!checked) {
                                        _prototype.setRowSelection($row, true, table);
                                    }
                                }
                                else {

                                    if ($input.is(':checked')) {

                                        _prototype.setRowSelection($row, false, table);
                                    }
                                    else {

                                        _prototype.setRowSelection($row, true, table);
                                    }
                                }


                            }

                        }
                        else {

                            // There is nothing, so do nothing
                            return false;
                        }

                    }
                    else if ($input.length && $input[0].nodeName !== 'BUTTON') {

                        if ($input[0].nodeName === "INPUT") {

                           _events.setRowSelection(evt, table, $input);
                        }
                    }

                });
            }

        }

        next();
    };

    return {
    	_priv: _priv,
        _setup: _setup,
        _prototype: _prototype
    };
});
