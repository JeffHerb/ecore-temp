define([], function () {
    var _priv = {};
    var _setup = {};
    var _events = {};
    var _prototype = {};
    var _defaults = {
        setup: {
            changeReturn: false,
        },
        plugins: {
            changeReturn: {
                pane: false,
                $pane: false
            },
        },
    };

    var CLASSES = {
        pane: 'emp-table-selectable-return-pane',
        control: 'emp-icon-select-return',
        selected: 'emp-selected',
    };

    // =================
    // Private Functions
    // =================

    _priv.generatePane = function _generate_pane (table) {
        var columns = [];
        var toggleableColumns = {};
        var mapNames = Object.keys(table.config.plugins.changeReturn.mapping);
        var name;

        for (name in table.config.plugins.changeReturn.mapping) {
            columns.push(table.config.plugins.changeReturn.mapping[name]);
        }

        // Loop through each of the defined columns in the mapping and find the none hidden columns
        for (var i = 0, len = columns.length; i < len; i++) {
            var toggableCol = {};
            var colIndex = columns[i];
            var colDef = table.dataStore.head.rows[0].columns[colIndex -1];

            // Filter our columns that are hidden, we can only hide
            if ((!colDef.visibility) || (colDef.visibility && colDef.visibility !== 'hidden')) {

                toggleableColumns[columns[i]] = {};

                toggleableColumns[columns[i]].name = mapNames[i];
                toggleableColumns[columns[i]].text = colDef.text;
                toggleableColumns[columns[i]].selected = true;

            }
        }

        if (Object.keys(toggleableColumns).length) {
            var $pane = $('<ul/>').addClass(CLASSES.pane);
            var mapIndex = 0;
            var col;

            for (col in toggleableColumns) {
                // Create a list item
                var $col = $('<li>').addClass('emp-selected');

                // Create a button control
                var $control = $('<button/>')
                                    .attr('type', 'button')
                                    .text(toggleableColumns[col].text)
                                    .on('click', {table: table, index: col, mapIndex: mapIndex}, _events.updateReturnMapping);

                toggleableColumns[col].$li = $col;
                toggleableColumns[col].$control = $control;

                // Append control to the list item
                $col.append($control);

                // Append list item to the list
                $pane.append($col);

                mapIndex += 1;
            }

            // Now add the close control
            var $close = $('<a/>')
                            .attr('role', 'button')
                            .text('Close')
                            .on('click', {pane: $pane}, _events.closeReturnPane);

            $pane.append($('<li/>').append($close));

            // Save off the pane
            table.config.plugins.changeReturn.$pane = $pane;

            // Save off the mapping options
            table.config.plugins.changeReturn.toggleMap = toggleableColumns;

            // Add the pane to the page
            fastdom.mutate(function () {
                emp.$body.append(table.config.plugins.changeReturn.$pane);
            });
        }
        else {
            journal.log({type: 'error', owner: 'UI', module: 'table', submodule: '', func: 'changeReturn'}, 'Change return button had not toggleable columns to make a list out of');
        }
    };

    // ===============
    // Event Functions
    // ===============

    _events.showReturnPane = function _show_return_pane (evt, table)  {
        // Dont let events to bubble up from here
        evt.stopPropagation();

        // Check to see if the pane was ever created
        if (!table.config.plugins.changeReturn.$pane) {

            // We need to generate the pane.
            _priv.generatePane(table);

        }

        var $control = table.config.controls.reference.$changeReturn;

        // Now determine if the pane need to be shown or hidden
        if (table.config.plugins.changeReturn.$pane.hasClass('emp-active')) {
            table.config.plugins.changeReturn.$pane.removeClass('emp-active');
        }
        else {
            var columnButtonOffset = table.config.controls.reference.$changeReturn.offset();

            table.config.plugins.changeReturn.$pane
                .css({
                    top: (columnButtonOffset.top + $control.outerHeight() + 5),
                    right: (emp.$window.width() - columnButtonOffset.left - $control.outerWidth())
                })
                .addClass('emp-active');

            emp.$body.on('click', {pane: table.config.plugins.changeReturn.$pane}, _events.closeReturnPane);
        }
    };

    _events.closeReturnPane = function _close_return_pane (evt) {
        evt.stopPropagation();

        // Remove the clock event
        emp.$body.off('click', _events.closeReturnPane);

        var $pane = evt.data.pane;

        $pane.removeClass('emp-active');
    };

    _events.updateReturnMapping = function _update_return_mapping(evt) {

        evt.stopPropagation();

        var index = evt.data.index;
        var mapIndex = evt.data.mapIndex;
        var table = evt.data.table;

        // Figure out the index position
        var keys = Object.keys(table.config.plugins.changeReturn.toggleMap);

        // Determine the position where the user changed the check toggle state
        var toggleIndex = keys.indexOf(index);

        // Determine the new toggle state
        var toggleState = (table.config.plugins.changeReturn.toggleMap[index].selected) ? false : true;
        // var toggle = table.config.plugins.changeReturn.toggleMap[togglePos];

        for (var i = 0, len = keys.length; i < len; i++) {
            if (toggleState) {
                if (i <= toggleIndex && !table.config.plugins.changeReturn.toggleMap[keys[i]].selected) {
                    table.config.plugins.changeReturn.toggleMap[keys[i]].selected = true;
                    table.config.plugins.changeReturn.toggleMap[keys[i]].$li.addClass('emp-selected');
                }
            }
            else {
                if (i >= toggleIndex && table.config.plugins.changeReturn.toggleMap[keys[i]].selected) {
                    table.config.plugins.changeReturn.toggleMap[keys[i]].selected = false;
                    table.config.plugins.changeReturn.toggleMap[keys[i]].$li.removeClass('emp-selected');
                }
            }
        }
    };

    // ===============
    // Setup Functions
    // ===============

    // For the base table requires of Empire (sticky headers or the resizer) to work additional wrapper layers are needed as well as a place to put client side controls.
    _setup.changeReturn = function _return(table, next) {

        if (!table.config.empty) {

            // Check for the data-change-return attribuet to manually toggle the feature on.
            var enableOption = table.$self.attr('data-change-return');

            if (enableOption === "true" || enableOption === true) {

                table.config.setup.changeReturn = true;

                //_priv.changeControl(table);
            }

        }

        next();
    };

    return {
    	_priv: _priv,
        _setup: _setup,
        _defaults: _defaults
    };
});
