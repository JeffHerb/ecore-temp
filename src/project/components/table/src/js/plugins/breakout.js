define([], function() {

    var _priv = {};
    var _setup = {};
    var _events = {};
    var _prototype = {};
    var _defaults = {
        'setup': {
            'breakout': true
        },
        'plugins': {
            'breakout': {
                fullView: false,
                columnsHidden: false
            }
        }
    };

    _priv.checkColumnStatus = function(table) {

        for (var i = 0, len = table.config.plugins.responsive.columns.length; i < len; i++) {

            var colDef = table.config.plugins.responsive.columns[i];

            // Filter out all of the columns that are hidden but can be showen
            if (!colDef.visibility && colDef.togglable) {

                table.config.plugins.breakout.columnsHidden = true;
                return true;
            }

        }

        table.config.plugins.breakout.columnsHidden = false;

    };

    _priv.showHideWarning = function _show_hide_warning(table) {

        if (table.config.plugins.breakout.columnsHidden) {
            table.obj.$breakOutWarning[0].classList.remove('cui-hide-from-screen');
        }
        else {
            table.obj.$breakOutWarning[0].classList.add('cui-hide-from-screen');
        }

    };

    _priv.showHideBreakoutControl = function _show_hidw_breakout(table) {


        if (table.config.plugins.breakout.fullView) {

        }
        else {

            if (table.obj.$breakOutControl && table.config.plugins.breakout.columnsHidden) {
                table.obj.$breakOutControl[0].classList.remove('cui-hide-from-screen');
            }
            else if (table.obj.$breakOutControl && !table.config.plugins.breakout.columnsHidden) {
                table.obj.$breakOutControl[0].classList.add('cui-hide-from-screen');
            }

        }

    };

    _events.breakout = function _resize_pivot(evt, table) {

        if (table.config.plugins.breakout.fullView) {

            evt.data = {
                table: table
            };

            table.config.plugins.responsive.automatic = true;

            setTimeout(function() {

                if (table.config.setup.pivot) {

                    table.pivot(false, table);
                }

                table.revertResponsiveView(evt);

                table.obj.$breakOutControl.text("Show All Columns");
            }, 200);

        }
        else {

            var tableColumns = [];

            table.config.plugins.responsive.automatic = false;

            if (table.$self[0].classList.contains('emp-pivot-table')) {
                table.$self[0].classList.add('unpivot');
            }

            for (var i = 0, len = table.config.plugins.responsive.columns.length; i < len; i++) {

                var colDef = table.config.plugins.responsive.columns[i];

                // Filter out all of the columns that are hidden but can be showen
                if (!colDef.visibility && colDef.togglable) {

                    tableColumns.push(colDef.originalPos);
                }

            }

            if (table.config.setup.pivot) {
                table.obj.$viewWrapper[0].classList.remove('emp-remove-overflow');
            }

            table.showAllColumns(tableColumns);

            table.obj.$breakOutControl.text("Hide Columns");

        }

        table.config.plugins.breakout.fullView = !table.config.plugins.breakout.fullView;
    };

    _events.resize = function _resize_breakout(evt) {

        var table = evt.data.table;
        var resized;

        clearTimeout(resized);

        resized = setTimeout(
            function () {

                _priv.checkColumnStatus(table);

                _priv.showHideWarning(table);
                _priv.showHideBreakoutControl(table);
            },
            200
        );

    };

    _setup.breakout = function _breakout(table, next) {

        if ((table.dataStore && table.dataStore.attributes['data-type'] && (table.dataStore.attributes['data-type'] === "breakout" || table.dataStore.attributes['data-type'] === "breakout-priority")) || (table.dataStore.attributes['data-breakout'] === "true") ) {

            setTimeout(function() {

                table.obj.$breakOutControl = table.obj.$tableWrapper.find('.emp-table-breakout-control');
                table.obj.$tableLegend = table.obj.$tableWrapper.find('.emp-table-legend');

                table.obj.$MessageContainer = $('<div>', { class: 'cui-messages'});
                table.obj.$breakOutWarning = $('<p>', {class:'cui-warning cui-hide-from-screen'}).text('Table columns have been hidden due to the size of your display. To see all columns press the "Show All Columns" button.');

                table.obj.$MessageContainer.append(table.obj.$breakOutWarning);

                //display breakout message below table legend
                if(table.obj.$tableLegend[0] !== undefined){

                    table.obj.$tableWrapper.prepend(table.obj.$MessageContainer);
                }else{

                    table.obj.$controlRow.prepend(table.obj.$MessageContainer);
                }
                

                if (table.obj.$breakOutControl && table.obj.$breakOutControl.length) {

                    table.obj.$breakOutControl.on('click', function(evt) {

                        _events.breakout(evt, table);
                    });

                    // do an initial check
                    _priv.checkColumnStatus(table);

                    // Execute the first initial show hides
                    _priv.showHideWarning(table);
                    _priv.showHideBreakoutControl(table);

                    table.$self.on('reflow.table', { table: table }, _events.resize);
                }

                next();
            }, 500);


        }
        else {

            next();
        }

    };

    return {
        _priv: _priv,
        _setup: _setup,
        _defaults: _defaults
    };

});
