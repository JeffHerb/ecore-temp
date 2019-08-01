define(['render', 'spin'], function (render, spin) {

    var _priv = {};
    var _inits = {};
    var _setup = {};
    var _events = {};
    var _prototype = {};
    var _defaults = {
        setup: {
            resize: true,
            sticky: true,
        },
        plugins: {
            resize: {
                heights: [3, 10, 50],
                position: false,
                next: 0,
                control: false,
                noControl: false, // Used to hide the control but run the plugin.
                threshold: 10,
                rowOffset: 0,
                manualHeight: false,
                minimumFilteredRows: 11,
            },
            sticky: {
                mouseWheelLock: false,
                mouseWheelLockTimer: null,
                lastScrollPos: 0,   // used for scroll events to track sticky header
                lastScrollbarPos: 0,
                scrollCall: 0,
                maxScroll: false,
                skipEvent: false,
                rowHeight: 0,
            },
            lazyRecords: {
                timer: 0,
                lastPos: 0, // used for loading additional records
            }
        },
    };

    var CLASSES = {
        paging: 'table-paging-control-row'
    };

    // =================
    // Private Functions
    // =================

    // Function executes other functions the different functions that should happen ever time the table is resized because of browser window changes size
    _priv.reflow = function _reflow(evt, table, source, changeHeight) {

        // Check of only table is being returned
        if ( !(evt instanceof Event) && evt !== undefined ) {

            changeHeight = source;
            source = table;
            table = evt;
            evt = null;
        }

        if (typeof source === "string") {

            journal.log({type: 'info', owner: 'UI', module: 'table', submodule: 'base', func: 'reflow'}, 'Table ' + table.id + ' reflow called by ' + source);
        }

        // Fix the max height as it will now be different.
        table.config.plugins.sticky.maxScroll = table.obj.$viewWrapper[0].scrollHeight - table.obj.$viewWrapper[0].clientHeight;

        // Fix the table height so it lines up correctly
        if (changeHeight !== false) {
            _priv.resetHeight(table);
        }

        fastdom.measure(function() {

            // Fix the style headers
            _priv.stickyHeaderHeight(table);

            fastdom.mutate(function() {

                table.$self.trigger('reflow.table');

            });

        });

    };

    // This function resizes the table per specified height or predetermined amount
    _priv.resize = function _resize (table, height, self, init) {

        function applyHeight (height) {

            journal.log({type: 'info', owner: 'UI', module: 'table', submodule: 'base', func: 'resize => applyHeight'}, 'Table ' + table.id +  'being resized to have a height of: "', (height !== "") ? height : "natural element height" , '"');

            fastdom.measure(function () {
                if (height) {
                    fastdom.mutate(function () {
                        var tableViewWrapper = table.obj.$viewWrapper[0];

                        tableViewWrapper.style.height = height + 'px';
                    });
                }
                else {
                    fastdom.mutate(function () {
                        // 100% should be the scrollHeight of the table
                        table.obj.$viewWrapper[0].style.height = '';

                    });
                }
            });

            // Only trigger events on user clicks
            if (!self) {
                table.$self.trigger('resize.table');
            }
        }

        function getTotalHeight (rows, rowCount) {

            //if filter is being applied set total height minimum to the minimum filtered rows variable
            if(filterApplied && percentageHeight && rowCount < table.config.plugins.resize.minimumFilteredRows){
                rowCount = table.config.plugins.resize.minimumFilteredRows;
            }

            if (rows.length >= rowCount) {
                fastdom.measure(function (){
                    var totalHeight = 0;

                    rows.each(function(i) {

                        if (i < rowCount) {

                            var $row = $(this);

                            totalHeight += $row.height();

                        }

                    });

                    // Add the table header height
                    totalHeight += table.obj.$thead[0].offsetHeight + 1;

                    fastdom.mutate(function () {
                        applyHeight(totalHeight);
                    });
                });
            }
            else {
                fastdom.mutate(function () {
                    applyHeight();
                });
            }
        }

        function isFloat(n){

            return Number(n) === n && n % 1 !== 0;
        }

        function determineHeight(height) {

            if (height === "full") {

                applyHeight();
            }
            else {

                if (typeof height !== "string") {

                    if (isFloat(height)) {
                        percentageHeight = true;
                        // Figure out the count based on the current height position
                        rowCount = Math.round((rowCount - uiRowCount) * table.config.plugins.resize.heights[table.config.plugins.resize.position]);

                        // Double check, 0 should never be a valid row count size
                        if (rowCount === 0) {
                            rowCount = $rows.length;
                        }

                        if (table.config.plugins.resize.rowOffset !== 0) {

                            rowCount += table.config.plugins.resize.rowOffset;
                        }

                        getTotalHeight($rows, rowCount);
                    }
                    else {

                        if (table.config.plugins.resize.rowOffset !== 0) {

                            height += table.config.plugins.resize.rowOffset;
                        }

                        getTotalHeight($rows, height);
                    }

                }

            }
        }

        function updatePosition() {

            if (table.config.plugins.resize.position === false) {

                table.config.plugins.resize.position = 0;
            }
            else {

                table.config.plugins.resize.position = table.config.plugins.resize.next;
            }

            // Update next position to be the next position
            if (table.config.plugins.resize.position < table.config.plugins.resize.heights.length - 1) {
                table.config.plugins.resize.next = table.config.plugins.resize.position + 1;
            }
            else {
                table.config.plugins.resize.next = 0;
            }

            // Check to see if the position selected will be full height
            if (table.config.plugins.resize.heights[table.config.plugins.resize.position] === "full" && (table.obj.$tbody.children('tr').length < table.dataStore.body.rows.length )) {

                // We are assuming we have unloadded rows
                updatePosition();
            }
        }

        // Pull this extensions configs closer
        var $rows = table.obj.$tbody.children('tr');
        var rowCount = $rows.length;
        var uiRowCount = $rows.filter('.cui-ui-only').length;

        $rows = table.obj.$tbody.children('tr:not(.cui-ui-only)');

        //Determine if a filter is being applied to the table, if so set filterApplied variable to true. This is used in the getTotalHeight function to set the minimum number of displayed rows.
        var filterApplied = false;
        var percentageHeight = false;

        //Check if filter rows are defined
        if(table.config && table.config.plugins && table.config.plugins.filter && table.config.plugins.filter.filterRow){

            //For each filter row determine if a filter is being applied
            for(var i = 0; i < table.config.plugins.filter.filterRow.length; i++){

                // Check if a filter is being applied by looking at the comparison value
                if(table.config.plugins.filter.filterRow[i].compareValue !== ""){

                    filterApplied = true;
                }
            }
        }

        // Start by looking for a defined height.
        if (height === undefined) {

            table.config.plugins.resize.manualHeight = false;

            // Check if init, if so then we need to check the table hieght by default
            if (init) {

                // Hook to determine if the table has enough rows to even do an initial height reset.
                if ($rows.length >= table.config.plugins.resize.threshold) {

                    //determineHeight(table.config.plugins.resize.heights[table.config.plugins.resize.position]);
                    determineHeight(10);

                }
                else{

                    table.config.plugins.resize.heights.unshift(10);
                }
            }
            else {

                if (self) {

                    var currentLoop = 0;

                    var foundValue = false;

                    var lastSize = (table.config.plugins.resize.heights[table.config.plugins.resize.position]) ? table.config.plugins.resize.heights[table.config.plugins.resize.position] : table.config.plugins.resize.heights[0];

                    do {

                        currentLoop += 1;

                        updatePosition();

                        if (table.config.plugins.resize.heights[table.config.plugins.resize.position] <= rowCount) {

                            foundValue = true;
                        }
                        else if ((table.config.plugins.resize.heights[table.config.plugins.resize.position] > rowCount) && (lastSize < rowCount)) {

                            foundValue = true;
                        }

                    }
                    while (!foundValue && currentLoop <= table.config.plugins.resize.heights.length);


                    if (foundValue) {

                        determineHeight(table.config.plugins.resize.heights[table.config.plugins.resize.position]);
                    }

                    //console.log(table.config.plugins.resize.heights[table.config.plugins.resize.position]);

                }
                else {

                    //console.log("nothing defined and not self");

                }

                // Bomb out.... this should have been defined!
                return false;
            }
        }
        else {

            table.config.plugins.resize.manualHeight = true;

            journal.log({type: 'info', owner: 'UI', module: 'table', submodule: 'base', func: 'resize'}, 'Manual height being requested: "', height, '" for ' + table.id);

            if (typeof height === "string" && height.indexOf('px') !== -1) {

            }
            else {

                var rowNumber;

                // Check if the height is a string and convert it.
                if (typeof height === "string" && height === "full") {

                    // Just apply height.
                    applyHeight();
                }
                else {

                    // Assume height is number of rows
                    determineHeight(height);

                }
            }
        }
    };

    // Function is used to recalculate the proper table height based on resize value.
    _priv.resetHeight = function _reset_height(table) {

        // Use the current position to determine if this is an inital state request
        if (table.config.plugins.resize.position) {

            _priv.resize(table, table.config.plugins.resize.heights[table.config.plugins.resize.position], false, true);
        }
        else {

            _priv.resize(table, table.config.plugins.resize.heights[table.config.plugins.resize.position], false, false);
        }
    };

    // Function setups the table sticky header
    _priv.sticky = function _sticky (table, init) {

        // Function is used to search header classes to determine if it should attempt to modifie a sepcific header or not.
        function classSearch (haystack, needles) {
            // Loop through the differnt haystack special callses
            for (var i = 0, len = haystack.length; i < len; i++) {
                // Check if this class is in the heade classes (needles), return true if so.
                if (needles.indexOf(haystack[i]) !== -1) {
                    return false;
                }
            }

            return true;
        }

        // Define the default padding
        var TOP_BOTTOM_PADDING = 10;
        var LEFT_RIGHT_PADDING = 6;

        // These are columns that have special meaning or contents
        var SPECIAL_HEADER_CLASSES = [
            'cui-hidden', // Hidden colum
            'table-control-col', // Selectable column
        ];

        // New header we will be replacing with
        var $newHeader = $('<thead/>');

        // New header row.
        var $newRow = $('<tr/>');

        // Get all of the header cells from the first row (normal Empire table should only have 1 header row)
        var $headers = table.obj.$thead.children('tr').eq(0).children('th');

        // Loop through all of the headers
        for (var i = 0, len = $headers.length; i < len; i++) {

            var $newHeaderCell = false; // Flag to determine if we need to create a new header cell
            var headerAttributes = {}; // Object to hold any possible th attributes
            var headerText = false;

            // Get a copy of the header from the loop.
            var $headerCell = $($headers[i]);

            // Save off the text
            headerText = $headerCell.text().trim();

            var $spanCheck = $headerCell.children('span');
            var spanText = ($spanCheck.length === 1) ? $spanCheck.text() : "";

            // Get all the attributes off of the current header cell
            var attributeMap = $headerCell[0].attributes;

            // Loop through all of the header
            for (var j = 0, jLen = attributeMap.length; j < jLen; j++) {
                var attr = attributeMap[j];
                headerAttributes[attr.name] = attr.value;
            }

            if (!headerAttributes.class) {
                headerAttributes.class = '';
            }

            // Check for keywords for special headers
            if (headerAttributes.class && classSearch(SPECIAL_HEADER_CLASSES, headerAttributes.class)) {

                // Add the special table-structure-cell class that removes the normal base padding.
                headerAttributes.class += ' table-structure-cell';

                $newHeaderCell = $('<th/>', headerAttributes);

                if (headerAttributes.class.indexOf('emp-min-width') !== -1) {

                    $('<div/>', {
                            'class': 'sticky-cell',
                            'title': headerText,
                            'style': 'padding: ' + TOP_BOTTOM_PADDING + 'px ' + LEFT_RIGHT_PADDING + 'px;',
                        })
                        .append(
                            $('<span/>', {
                                'class': 'cui-hide-from-screen',
                            })
                            .text(headerText)
                        )
                        .appendTo($newHeaderCell);
                }
                else {

                    if ($spanCheck.length === 0) {

                        $('<div/>', {
                                'class': 'sticky-cell',
                                'style': 'padding: ' + TOP_BOTTOM_PADDING + 'px ' + LEFT_RIGHT_PADDING + 'px;'
                            })
                            .append(
                                $('<span/>', {
                                    'title': headerText
                                })
                                .text(headerText)
                            )
                            .appendTo($newHeaderCell);
                    }
                    else {

                        // This is your most common table header handler
                        $headerCell.wrapInner($('<div/>', {
                                'class': 'sticky-cell',
                                'title': headerText,
                                'style': 'padding: ' + TOP_BOTTOM_PADDING + 'px ' + LEFT_RIGHT_PADDING + 'px;'
                            })
                        ).children('div').eq(0).appendTo($newHeaderCell);
                    }

                }
            }
            // This is a special column, just wrap it for now.
            else {

                if ($spanCheck.length === 0) {

                    $headerCell.wrapInner('<span/>');
                }

                if (spanText !== "") {

                    $headerCell.wrapInner($('<div/>', {
                            'class': 'sticky-cell',
                            'title': spanText,
                            'style': 'padding: ' + TOP_BOTTOM_PADDING + 'px ' + LEFT_RIGHT_PADDING + 'px;'
                        })
                    );
                }
                else {

                    $headerCell.wrapInner($('<div/>', {
                            'class': 'sticky-cell',
                            'style': 'padding: ' + TOP_BOTTOM_PADDING + 'px ' + LEFT_RIGHT_PADDING + 'px;'
                        })
                    );
                }


                $newHeaderCell = $headerCell.addClass('table-structure-cell');
            }

            if ($newHeaderCell) {
                $newHeaderCell.appendTo($newRow);
            }
        }

        // Add in the new row
        $newRow.appendTo($newHeader);

        fastdom.mutate(function () {
            // Add the sticky class to the table to cause proper reflowing
            table.$self.addClass('sticky');

            // Replace the header
            table.obj.$thead.replaceWith($newHeader);

            fastdom.measure(function () {
                // Call the function that sets the headers height
                _priv.stickyHeaderHeight(table, true);
            });
        });

        // Replace the header
        table.obj.$thead.replaceWith($newHeader);
    };

    // Function cleans up and redefined table header row hieght
    _priv.stickyHeaderHeight = function _sticky_header_height(table, init) {

        // Start by getting the width of all the table cells by looking at the div.stickyCell > span.
        fastdom.measure(function () {
            var headerCellHeights = [];

            var empTableParentElem = table.obj.$tableContainer.parent();

            for (var i = 0, len = table.obj.$stickyCells.length; i < len; i++) {
                var $header = $(table.obj.$stickyCells[i]).children('span');

                var height = ($header[0].offsetHeight) ? $header[0].offsetHeight : $header[0].clientHeight;
                    headerCellHeights.push(height + 20);
            }

            // Save of this measurement
            table.config.plugins.sticky.newHeight = Math.max.apply(null, headerCellHeights) + 'px';

            // Check to see if we need to mutate the DOM
            fastdom.mutate(function () {

                // If the new height does not match the old on, update
                if (table.config.plugins.sticky.rowHeight !== table.config.plugins.sticky.newHeight) {
                    // Update the header row height
                    table.obj.$thead.children('tr')[0].style.height = table.config.plugins.sticky.newHeight;
                    // Update the config
                    table.config.plugins.sticky.rowHeight = table.config.plugins.sticky.newHeight;
                }

            });
        });
    };

    _priv.setScrollInfo = function(table) {
        var scrollHeight = table.obj.$viewWrapper[0].scrollHeight;
        var clientHeight = table.obj.$viewWrapper[0].clientHeight;

        // Get the tables current totals
        table.config.plugins.sticky.maxScroll = scrollHeight - clientHeight;
        table.config.plugins.sticky.scrollHeight = scrollHeight;
        table.config.plugins.sticky.clientHeight = clientHeight;
    };

    _priv.getTableKeys = function(table) {

        var $tr = table.obj.$tbody.find('tr');

        var keys = [];

        for (var r = 0, rLen = $tr.length; r <rLen; r++) {

            keys.push($tr[r].getAttribute('data-key'));
        }

        return keys;
    };

    // ================
    // Events Functions
    // ================

    // Function used to call the default implmentation/action that should be taken when the user clicks the resize control
    _events.resizeButton = function _resize_button_click(evt, table) {

        _priv.resize(table, undefined, true);
    };

    _events.scroll = function _table_scroll(evt, table, mousewheel) {

        var scrollTop = 0;
        var newPos = 0;
        var i = false;

        if (!table.dataStore.emptyTable && !table.dataStore.largeTable) {

            if (!table.config.plugins.sticky.maxScroll) {
                _priv.setScrollInfo(table);
            }

            if (mousewheel) {
                table.config.plugins.sticky.mouseWheelLock = true;

                clearTimeout(table.config.plugins.sticky.mouseWheelLockTimer);

                table.config.plugins.sticky.mouseWheelLockTimer = setTimeout(function() {

                    table.config.plugins.sticky.mouseWheelLock = false;
                    table.config.plugins.sticky.mouseWheelLockTimer = null;

                }, 500);

                var delta = (evt.originalEvent.deltaY) ? evt.originalEvent.deltaY : evt.originalEvent.wheelDelta;

                // IE (negative is down, and positive is up)
                // Chrome (positive is down and negative is up) [EDGE FLIPS TO CHROME SPEC?!?!?! WTF]
                if (emp.isIE) {

                    // Swap back to the good browser standard if its edge.
                    if (emp.isEdge) {
                        scrollTop = (delta < 0) ? -20 : 20;
                    }
                    else {
                        scrollTop = (delta < 0) ? 20 : -20;
                    }

                }
                else {

                    scrollTop = (delta < 0) ? -20 : 20;
                }

                newPos = table.config.plugins.sticky.lastScrollPos + scrollTop;

                if (newPos < 0) {
                    newPos = 0;
                }
                else if (newPos > table.config.plugins.sticky.maxScroll) {
                    newPos = table.config.plugins.sticky.maxScroll;
                }

                table.config.plugins.sticky.lastScrollPos = newPos;

                for (i = 0, len = table.obj.$stickyCells.length; i < len; i++) {

                    table.obj.$stickyCells[i].style.transform = 'translate3d(0px, ' + newPos + 'px,0px)';
                }

                // Hardset the view container
                table.obj.$viewWrapper[0].scrollTop = newPos;
            }
            else {

                // Check to see if the mouse wheel locker is not in place
                if (!table.config.plugins.sticky.mouseWheelLock) {

                    scrollTop = evt.target.scrollTop;

                    for (i = 0, len = table.obj.$stickyCells.length; i < len; i++) {

                        table.obj.$stickyCells[i].style.transform = 'translate3d(0px, ' + scrollTop + 'px,0px)';
                    }

                    // Update the last scroll for mousewheel
                    table.config.plugins.sticky.lastScrollPos = scrollTop;
                }
            }

            if ((!table.dataStore.hasOwnProperty('optimize') || table.dataStore.optimize) && !table.dataStore.emptyTable && table.dataStore.body.loadMore) {

                clearTimeout(table.config.plugins.lazyRecords.timer);

                table.config.plugins.lazyRecords.timer = setTimeout(function() {

                    var pos = (table.obj.$viewWrapper[0].scrollTop + table.obj.$viewWrapper[0].clientHeight);

                    if ((pos + 300) >= table.obj.$viewWrapper[0].scrollHeight) {
                        table.requestMoreRecords();
                    }

                }, 500);
            }

        }
    };

    _events.moveRow = function _move_row(evt, table, direction) {

        var $targetButton = $(evt.target);
        var $targetRow = $targetButton.parents('tr').eq(0);

        if (direction === "up") {

            var $previousRow = $targetRow.prev();

            if ($previousRow.length) {
                $targetRow.remove();
                $targetRow.insertBefore($previousRow);
            }

        }
        else {

            var $nextRow = $targetRow.next();

            if ($nextRow.length) {
                $targetRow.remove();
                $targetRow.insertAfter($nextRow);
            }
        }

        // Now we need to update the order-hidden input
        var keyValues = _priv.getTableKeys(table);

        table.config.hiddenInputs.$orderIndex.val(keyValues.join(','));
    };

    // ====================
    // Prototypes Functions
    // ====================

    // Exposes a public method for changing the table height
    _prototype.resize = function _resize_public(height, cb) {

        _priv.resize(this, height, true);

        if (typeof cb === "function") {

            cb();
        }
    };

    // Exposes the base reflow function for other modules or developers to call
    _prototype.reflow = function _reflow(table, source, changeHeight, cb) {

        if (table === undefined) {
            table = this;
        }
        else if (typeof table === "string") {

            cb = changeHeight;
            changeHeight = source;
            source = table;
            table = this;

        }
        else if (typeof table === "function") {

            cb = changeHeight;
            changeHeight = source;
            source = "Undefined reflow";
            table = this;
        }

        if (typeof table === "object" && typeof source === "function") {

            cb = changeHeight;
            changeHeight = source;
            source = "Undefined reflow";
            table = this;
        }

        _priv.reflow(table, source, changeHeight);

        if (typeof cb === "function") {

            cb(table);
        }
    };

    // Expose a method to change the number of rows that gets returns
    _prototype.resizeOffset = function _resize_offset(offset) {

        // Only attempt to set the value if resize is enabled.
        if (this.config.setup.resize && !isNaN(offset)) {

            this.config.plugins.resize.rowOffset = offset;
        }
    };

    // Function is exposed to other plugins which will re-render the table body upon request.
    _prototype.renderBody = function _render_body() {

        table = this;

        // Check to see if there is a start number associated with the table, and reset it on re-renders
        table.dataStore.body.start = 0;
        table.config.lastScrollPos = 0;
        table.dataStore.body.loadMore = true;

        // Rerender the table
        render.section(null, table.dataStore, 'return', function (html) {

            if (html && html !== undefined && html !== null) {

                // Get reference to the new body
                var newBody = html.querySelector('tbody');

                // Remove all the currrent children in the table
                table.obj.$tbody.find('tr:not(.cui-ui-only)').remove();

                // Add the rows for newBody
                while (newBody.firstChild) {

                    // Get a copy of the row
                    var row = newBody.firstChild;

                    // Remove the row just in case
                    newBody.removeChild(newBody.firstChild);

                    // Add the copy of the row to the table
                    $(row).appendTo(table.obj.$tbody);

                    table.obj.$tbody = table.$self.find('tbody');

                }

                table.$self.trigger('table.rebuilt');

            }
            else {

                console.error('New version of filtered table failed to return.');
                return false;
            }

        });
    };

    _prototype.requestMoreRecords = function _request_more_records () {

        var table = this;
        var recordDelay;

        if (table.dataStore.body.loadMore) {

            // Check to see if we really need to do something
            fastdom.measure(function () {

                var $bodyRows = table.obj.$tbody.children('tr:not(.cui-ui-only)');
                var bodyRowCount = $bodyRows.length;
                var $lastCreatedRow = $($bodyRows[bodyRowCount - 1]);
                var lastRowIndex = parseInt($lastCreatedRow.attr('data-row-index'));
                var totalKnownRows = table.dataStore.body.rows.length;

                // Check to see if the last known rendered index is less then the total number of rows we know exist.
                if (lastRowIndex + 1 < totalKnownRows) {

                    fastdom.mutate(function () {

                        // This time start with the last known index
                        table.dataStore.body.rowStart = lastRowIndex + 1;

                        // Go render the next set of data
                        render.section(null, table.dataStore, 'return', function (html) {
                            if (html !== undefined) {
                                // Get reference to the new body
                                var newBody = html.childNodes[0].querySelector('tbody');
                                var rowCount = html.childNodes[0].querySelectorAll('tbody > tr').length;

                                if (rowCount < 25) {
                                    table.dataStore.body.loadMore = false;
                                }

                                // // Add the rows for newBody
                                fastdom.mutate(function () {
                                    while (newBody.firstChild) {
                                        // Get a copy of the row
                                        var row = newBody.firstChild;

                                        // Remove the row just in case
                                        newBody.removeChild(newBody.firstChild);

                                        // Add the copy of the row to the table
                                        $(row).appendTo(table.obj.$tbody);
                                    }

                                    fastdom.measure(function() {

                                        _priv.setScrollInfo(table);

                                        table.responseiveReflow();

                                        //_priv.reflow(table, 'scroll', false);
                                    });

                                });
                            }
                            else {
                                clearTimeout(recordDelay);

                                console.error('New version of filtered table failed to return.');
                                return false;
                            }
                        });
                    });
                }
            });
        }
    };

    _prototype.setScrollInfo = function _set_scroll_info () {

        var table = this;

        _priv.setScrollInfo(table);
    };

    _prototype.resetLoadRecord = function _reset_load_record() {

        var table = this;

        if (table.dataStore.optimize && table.dataStore.body.loadMore) {

            table.dataStore.body.rowStart = 0;
            table.dataStore.body.loadMore = true;

        }
    };

    _prototype.removeHeight = function _remove_height() {

        var table = this;

        table.obj.$viewWrapper[0].style.height = "";
    };

    // ===============
    // Setup Functions
    // ===============

    // For the base table requires of Empire (sticky headers or the resizer) to work additional wrapper layers are needed as well as a place to put client side controls.
    _setup.base = function _base (table, next) {

        // Add a default scroll position to hold onto incase we have data that loads on scroll.
        table.config.lastScrollPos = 0;

        // First check to see the table has the required structure. First get the parent
        var $parent = table.$self.parent();

        // First look for view wrapper, if misisng adde it and reset the parent;
        if (!$parent.hasClass('view-wrapper')) {
            table.$self.wrap($('<div/>', {'class':'view-wrapper'}));

            $parent = table.$self.parent();
        }

        // Save off the scrolling wrapper.
        table.obj.$viewWrapper = $parent;

        $parent = table.obj.$viewWrapper.parent();

        // Check to see if the outer wrapper exists
        if (!$parent.hasClass('emp-table-wrapper')) {

            table.obj.$viewWrapper.wrap($('<div/>', {'class':'emp-table-wrapper'}));

            $parent = table.obj.$viewWrapper.parent();
        }

        table.obj.$tableWrapper = $parent;

        // Check to see if the table-control row is already beeing added.
        var $controlRowPrev = table.obj.$viewWrapper.prev();

        if (!$controlRowPrev.hasClass('table-control-row')) {

            $('<div/>', {'class': 'table-control-row'}).insertBefore(table.obj.$viewWrapper);

            $controlRowPrev = table.obj.$viewWrapper.prev();
        }

        table.obj.$controlRow = $controlRowPrev;

        if (table.dataStore.paging) {

            $('<div/>', {'class': CLASSES.paging}).insertAfter(table.obj.$viewWrapper);

            table.obj.$footerControlRow = table.obj.$viewWrapper.next();
        }


        table.config.controls = {
            order: [],
            elems: {},
        };

        var stickyOption = table.$self.attr('data-sticky');

        if (stickyOption === "false") {

            table.config.setup.sticky = false;
        }

        // Now setup the actual sticky headers.
        if (table.config.setup.sticky) {

            // Setup the sticky header
            _priv.sticky(table);

            // Update the table header reference
            table.obj.$thead = table.$self.children('thead');

            // Add new object reference for sticky cells
            table.obj.$stickyCells = table.obj.$thead.find('.sticky-cell');

            // Lastly setup reflow that should occure on window resize
            $(window).on('resize', null, {table: table}, function (evt) {
                var table = evt.data.table;
                var resizeTimer;

                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function (e) {
                    _priv.reflow(e, table, false);
                }, 60);
            });

            // Setup hook to reflow table when font-size changes via preferences.
            $(window).on('font-change-slider', null, { table: table }, function (evt) {
                var table = evt.data.table;
                var resizeTimer;

                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function (e) {
                    _priv.reflow(e, table, false);
                }, 60);
            });

            table.obj.$viewWrapper.on('scroll', function(evt) {

                _events.scroll(evt, table, false);
            });

            table.obj.$viewWrapper.on('mousewheel', function(evt) {

                _events.scroll(evt, table, true);

                //Check if the table is scrollable, if not pass the event to the browser for page scrolling.
                if(table.obj.$viewWrapper[0].scrollHeight === table.obj.$viewWrapper[0].clientHeight){
                    return true;
                }
                else{
                    return false;
                }
            });

            table.obj.$viewWrapper.on('mouseenter', function(evt) {

                _priv.setScrollInfo(table);
            });
        }

        if (!table.config.empty && table.dataStore.body && table.dataStore.body.rows) {

            var resizeOption = table.$self.attr('data-resize');

            if (resizeOption === "false") {

                table.config.setup.resize = false;
            }

        }
        else {

            table.config.setup.resize = false;
        }

        // Next check and setup resize function
        if (table.config.setup.resize) {

            table.obj.$resizeControl = table.obj.$tableWrapper.find('.emp-icon-table-resizer');

            table.obj.$resizeControl.on('click', function() {
                _priv.resize(table, undefined, true, false);
            });

            // Check for resize option
            var resizeHeight = table.$self.attr('data-resizer-height');

            if (resizeHeight !== undefined) {

                // Check to make sure the resize high is a number
                if (!isNaN(resizeHeight)) {

                    // Append the new default height
                    table.config.plugins.resize.heights.unshift(parseFloat(resizeHeight));
                }
            }

            // Check for the resize option
            var resizeThreshold = table.$self.attr('data-resizer-threshold');

            if (resizeThreshold !== undefined) {

                // Check to make sure the resize high is a number
                if (!isNaN(resizeThreshold)) {

                    // Append the new default height
                    table.config.plugins.resize.threshold = parseInt(resizeHeight);
                }
            }

            if (!table.config.optimize) {

                if (table.dataStore.body.rows.length > 10) {

                    _priv.resize(table, undefined, true, true);
                }

            }
            else {

                if (!table.config.plugins.resize.manualHeight) {

                    // Resize the inital table to defaults
                    if (table.dataStore.body.rows.length > 10) {

                        _priv.resize(table, undefined, true, true);
                    }
                }
            }
        }

        if (table.elem.classList.contains('emp-order-table')) {

            table.config.type = "order";

            table.obj.$tbody.on('click', '.emp-icon-order-table-move-up', function (evt) {
                _events.moveRow(evt, table, "up");
            });

            table.obj.$tbody.on('click', '.emp-icon-order-table-move-down', function (evt) {
                _events.moveRow(evt, table, "down");
            });

            table.obj.$tbody.on('click', '.emp-icon-delete', function (evt) {

                emp.confirm(evt, "Are you sure you want to delete this record?", function() {

                    $row = $(evt.target).parents('tr').eq(0);

                    $row.remove();

                    var keyValues = _priv.getTableKeys(table);

                    table.config.hiddenInputs.$orderIndex.val(keyValues.join(','));

                });

            });

        }

        next();
    };

    return {
        _priv: _priv,
        _inits: _inits,
        _setup: _setup,
        _events: _events,
        _defaults: _defaults,
        _prototype: _prototype
    };
});
