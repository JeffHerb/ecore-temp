define(['dataStore', 'processTemplates', 'handlebars', 'handlebars-templates', 'handlebars-partials','handlebars-helpers'], function(ds, procTemplates, Handlebars, templates, partial) {

	var _priv = {};

	_priv.skipColumns = [];

	_priv.fixData = function _fix_data(data, external) {

        // Ensure a type attribute is set on the table
        if (data.attributes && data.attributes['data-type'] && !data.type) {
            data.type = data.attributes['data-type'];
        }

        // Now explode out the style attributes
        if (data.style && data.style.length >= 1) {

            if (data.style.indexOf('noFilter') !== -1) {

                if (data.attributes && !data.attributes['data-filter']) {
                    data.attributes['data-filter'] = false;
                }
            }

            if (data.style.indexOf('noResize') !== -1) {

                if (data.attributes && !data.attributes['data-resize']) {
                    data.attributes['data-resize'] = false;
                }
            }

            if (data.style.indexOf('noColumns') !== -1) {

                if (data.attributes && !data.attributes['data-responsive']) {
                    data.attributes['data-responsive'] = false;
                }
            }

            if (data.style.indexOf('changeReturn') !== -1) {

                if (data.attributes && !data.attributes['data-changereturn']) {
                    data.attributes['data-changereturn'] = true;
                }
            }

            if (data.style.indexOf('noSticky') !== -1) {

                if (data.attributes && !data.attributes['data-sticky']) {

                    data.attributes['data-sticky'] = false;
                }
            }

        }
        else {

            // if (data.attributes && !data.attributes['data-filter']) {
            //     data.attributes['data-filter'] = false;
            // }

            // if (data.attributes && !data.attributes['data-resize']) {
            //     data.attributes['data-resize'] = false;
            // }

            // if (data.attributes && !data.attributes['data-responsive']) {
            //     data.attributes['data-responsive'] = false;
            // }

            // if (data.attributes && !data.attributes['data-changereturn']) {
            //     data.attributes['data-changereturn'] = true;
            // }

            // if (data.attributes && !data.attributes['data-sticky']) {

            //     data.attributes['data-sticky'] = false;
            // }
        }

        var buttonMenuIndex = false;
        var orderButtonIndex = false;

        // Fix function to add button menus to non update tables
        var fixButtonMenu = function _fix_button_menu(data, buttonIndex, primaryButtonIndex) {

            // Default header object
            var BUTTON_MENU_HEADER = {
                "attributes": {
                    "data-type": "buttonMenu",
                    "data-columnType": "button",
                    "data-columnEditable": false,
                    "title": "Button Menu"
                },
                "sort": false,
                "type": "header",
                "text": "Button Menu",
                "style": "min-width",
                "hideLabel": true
            };

            // Button Menu body cell with button
            var BUTTON_MENU_BODY = {
                "type": "data",
                "style": "min-width",
                "contents": [
                    {
                        "type": "button",
                        "template": "field",
                        "input": {
                            "attributes": {
                                "type": "button",
                                "title": "Button Menu"
                            },
                            "text": "Button Menu",
                            "icon": "responsive-table-menu"
                        },
                        "options": []
                    }
                ]
            };

            // Button Menu footer cell
            var BUTTON_MENU_FOOTER = {
                "type": "data",
                "text": ""
            };

            // Empty Button Menu cll
            var BUTTON_MENU_EMPTY = {
                "type": "data",
                "style": "min-width",
                "contents": []
            };

            // Make a message to the page stating that upgrades need to occur
            journal.log({type: 'warning', owner: 'DEV', module: 'render', submodule: 'tableShiv'}, 'Table ' + data.attributes.id + ' was detected as one that requires additional rendering to support the old table buttonMenu functionality. Please look to upgrading your tables button menus to support the new E2:TableButtonMenu.');

            var header = data.head.rows[0].column;

            // Determine the proper index to place the button menu
            var insertIndex = (primaryButtonIndex) ? primaryButtonIndex : data.head.rows[0].columns.length + 1;

            buttonMenuIndex = insertIndex;

            // Loop through and remove all of the header columns for the random table buttons.
            for (var h = 0, hLen = buttonIndex.length; h < hLen; h++) {

                data.head.rows[0].columns[buttonIndex[h]].skip = true;
            }

            // Add the button menu header
            data.head.rows[0].columns.splice(insertIndex, 0, BUTTON_MENU_HEADER);

            // If we have a table body, then we need to update it as well
            if (data.body && data.body.rows.length >= 1) {

                tableBodyRow:
                for (var b = 0, bLen = data.body.rows.length; b < bLen; b++) {

                    var buttonContents = [];

                    buttonIndex:
                    for(var bi = 0, biLen = buttonIndex.length; bi < biLen; bi++) {

                        if (data.body.rows[b].columns[buttonIndex[bi]].contents && Array.isArray(data.body.rows[b].columns[buttonIndex[bi]].contents) && data.body.rows[b].columns[buttonIndex[bi]].contents.length > 0) {

                            var buttonContent = data.body.rows[b].columns[buttonIndex[bi]].contents[0];

                            if (buttonContent.template === "field") {

                                if (buttonContent.input.text && buttonContent.input.text.indexOf('_BTN') !== -1) {

                                    if (buttonContent.input.attributes && buttonContent.input.attributes.title) {

                                        var title = buttonContent.input.attributes.title.replace('Go to', '').replace('Popup', '');

                                        title = title.trim();

                                        buttonContent.input.text = title;
                                    }

                                }

                                buttonContents.push(buttonContent);

                            }
                            else {

                                buttonContents.push(buttonContent);
                            }
                        }

                        data.body.rows[b].columns[buttonIndex[bi]].skip = true;
                    }

                    var newBodyMenu;

                    // Check to see if the button menu needs to exist or if a blank should be based in instead.
                    if (buttonContents.length > 0) {

                        newBodyMenu = $.extend(true, {}, BUTTON_MENU_BODY);

                        newBodyMenu.contents[0]['options'] = buttonContents;

                    }
                    else {

                        newBodyMenu = BUTTON_MENU_EMPTY;
                    }

                    // Update the body row to include the new column
                    data.body.rows[b].columns.splice(insertIndex, 0, newBodyMenu);
                }

            }

            // Loop through and fix the footer if it exists
            if (data.footer && data.footer.rows.length > 0) {

                for (var i = 0, len = data.footer.rows.length; i < len; i++) {

                    for (var j = 0, jLen = buttonIndex.length; j < jLen; j++) {

                        if (buttonIndex[j] !== primaryButtonIndex) {

                            data.footer.rows[i].columns[buttonIndex[j]].skip = true;
                        }

                    }

                    data.footer.rows[i].columns.splice(insertIndex, 0, BUTTON_MENU_FOOTER);

                }
            }

            return data;
        };

        if (!data.hasOwnProperty('optimize')) {
            data.optimize = true;
        }

        data.head.columnType = {};

        var buttonColIndex = [];
        var pimaryButtonIndex = false;

        if (!data.hasOwnProperty('enabledButtonMenu')) {
            data.enabledButtonMenu = true;
        }

        // Only bother to check if there is at least 1 header row
        if (data.head && data.head.rows.length === 1) {

            var renderTable = true;

            // Loop through all of the header columns to search for button indexs
            for (var i = 0, len = data.head.rows[0].columns.length; i < len; i++) {

                // Only care about columns that actually have attributes
                if (data.head.rows[0].columns[i].attributes) {

                    var dataType = data.head.rows[0].columns[i].attributes['data-type'] || false;
                    var responsive = data.head.rows[0].columns[i].responsive || false;

                    if (dataType) {

                        if (data.head.columnType[dataType]) {

                            data.head.columnType[dataType] += 1;
                        }
                        else {

                            data.head.columnType[dataType] = 1;
                        }

                        if (dataType === "button") {

                            if (data.head.rows[0].columns[i].attributes['data-columntype'] === "primaryButton") {

                                pimaryButtonIndex = i;

                                data.head.columnType["button"] -= 1;
                            }
                            else {

                                // Hook for older mockups!
                                if (data.head.rows[0].columns[i].attributes.hasOwnProperty["data-table-primary-button"]) {

                                    pimaryButtonIndex = i;

                                    data.head.columnType["button"] -= 1;

                                    data.head.rows[0].columns[i].attributes['data-type'] = "primaryButton";
                                }
                                else {
                                    buttonColIndex.push(i);
                                }

                            }
                        }
                        else if (dataType === "primaryButton") {

                            pimaryButtonIndex = i;
                        }
                        else if (dataType === "buttonMenu") {
                            buttonMenuIndex = i;
                        }

                        if (responsive && responsive.primaryButton) {

                            pimaryButtonIndex = i;
                        }
                    }

                }

                // Check for hidden columns
                if (data.head.rows[0].columns[i].visibility && data.head.rows[0].columns[i].visibility === "hidden") {

                    if (!data.head.columnType.hidden) {

                        data.head.columnType.hidden = 1;
                    }
                    else {

                        data.head.columnType.hidden += 1;
                    }

                }
            }

            if (buttonColIndex.indexOf(pimaryButtonIndex) !== -1) {

                buttonColIndex.splice( buttonColIndex.indexOf(pimaryButtonIndex), 1);

                data.head.columnType['button'] -= 1;
            }

            if ((!data.head.columnType['buttonMenu'] && data.head.columnType['button'] >= 1) && data.enabledButtonMenu) {

                data = fixButtonMenu(data, buttonColIndex, pimaryButtonIndex);

                data.metadata = {};

                data.metadata.renderButtonMenu = true;
            }

            if (emp.pageScripts && emp.pageScripts.preRenderHook) {
                data = emp.pageScripts.preRenderHook(data);
            }
        }

        if (!data.body || (data.body && (!data.body.rows || data.body.rows.length === 0)) ) {
            data.emptyTable = true;
        }
        else {

            data.emptyTable = false;

            data.body.rowStart = 0;

            if (data.optimize) {

                if (data.body.rows.length > 25) {
                    data.body.loadMore = true;
                }
                else {
                    data.body.loadMore = false
                }
            }
        }

        // Fix for external app tables
        if (external && data.type && data.type === "pivot") {

            if (!data.attributes) {
                data.attributes = {};
            }

            // Diable normal empire functionality!
            data.attributes['data-responsive'] = false;
            data.attributes['data-filter'] = false;
            data.attributes['data-resize'] = false;
            data.attributes['data-sticky'] = false;
            data.attributes['data-mobile'] = true;

            if (data.style) {
                data.style = data.style + ",mobile-responsive";
            }
            else {
                data.style = "mobile-responsive";
            }

            // Now find all of the responsive columns
            var primaryColumns = [];
            var secondayColumns = [];

            for (var hCol = 0, hColLen = data.head.rows[0].columns.length; hCol < hColLen; hCol++) {

                var headerCol = data.head.rows[0].columns[hCol];

                if (headerCol.responsive && headerCol.responsive.type) {

                    if (headerCol.responsive.type === "primary") {

                        primaryColumns.push(hCol);
                    }

                    if (headerCol.responsive.type === "secondary") {

                        secondayColumns.push(hCol);
                    }

                }
            }

            // Force fallback to first column no matter what!
            if (!primaryColumns.length) {
                primaryColumns.push(0);
            }

            if (!data.emptyTable) {

                var allColumns = primaryColumns.concat(secondayColumns);
                var PrimaryLength = primaryColumns.length;

                // Loop through each of the row
                for (var b = 0, bLen =  data.body.rows.length; b < bLen; b++) {

                    var bodyRowColumns = data.body.rows[b].columns;

                    var PrimaryValue = "";
                    var SecondaryValue = "";

                    var currentNewValue = ""
                    var inSecondary = false;

                    // Loop the defined primary and secondary values
                    for (var c = 0, cLen = allColumns.length; c < cLen; c++) {

                        var columnObj = bodyRowColumns[allColumns[c]];
                        var tempNewValue = "";

                        if (columnObj.text && columnObj.text.length) {
                            tempNewValue += columnObj.text.trim() + " ";
                        }

                        if (c < PrimaryLength) {

                            currentNewValue += tempNewValue;
                        }
                        else {

                            if (!inSecondary) {

                                PrimaryValue = currentNewValue;
                                currentNewValue = "";

                                inSecondary = true;

                                currentNewValue = tempNewValue;
                            }
                            else {

                                currentNewValue += tempNewValue;
                            }

                        }

                    }

                    if (currentNewValue.length) {

                        if (inSecondary) {
                            SecondaryValue = currentNewValue.trim();
                        }
                        else {
                            PrimaryValue = currentNewValue.trim();
                        }

                    }

                    // Set the Expand object
                    data.body.rows[b].columns.unshift({
                        "type": "header",
                        "attributes": {
                            "class": "emp-responsive-row-header"
                        },
                        "contents": [
                            {
                                "template": "responsiveTableToggleControl",
                                "primaryText": PrimaryValue,
                                "secondaryText": SecondaryValue
                            }
                        ]
                    });

                };

                data.head.rows[0].columns.unshift({
                    skip: true,
                    attributes: {
                        'data-type': 'hidden'
                    }
                });

            }

        }

        // Do not remove, this may still be needed, but can be disabled for naw - JAH - 08222019
        // if (external && data.type && data.type === "css") {

        //     //console.log("CSS Table!");

        //     data.attributes['data-responsive'] = false;
        //     data.attributes['data-filter'] = false;
        //     data.attributes['data-resize'] = false;
        //     data.attributes['data-sticky'] = false;

        //     for (var bRow = 0, bRowLen = data.body.rows.length; bRow < bRowLen; bRow++) {

        //         //console.log(data.body.rows[bRow]);

        //         for (var bCol = 0, bColLen = data.body.rows[bRow].columns.length; bCol < bColLen; bCol++) {

        //             var col = data.body.rows[bRow].columns[bCol];

        //             if (!col.attributes) {
        //                 col.attributes = {};
        //             }

        //             col.attributes['data-title'] = data.head.rows[0].columns[bCol].text;

        //         }

        //     }
        // }

        data.fixData = true;

        return data;
	};

    // These are shivs specific for contents inside of tables
    _priv.dataShivs = {
        "notifier": function _notifiers(data) {

            if (data.text && data.template !== "raw"){

                data = _priv.attributes(data, 'className', 'emp-indicator-' + data.text.length);
            }
            else {

                journal.log({type: 'error', owner: 'DEV|FW', module: 'render', submodule: 'tableShiv'}, 'Table notifier existed but did not contain a text property. Skipping!');
            }
        }
    };

    _priv.tableID = false;

	_priv.attributes = function(data, key, value) {

		if (!data.attributes) {

			data.attributes = {};
		}

		if (!data.attributes[key]) {

			data.attributes[key] = value;
		}
		else {

			data.attributes[key] += " " + value;
		}
	};

	_priv.mergeAttributes = function (elm, data) {

		for (var attr in data.attributes) {

            var dAttr = false;

            switch (attr) {

                case "colspan":
                case "colSpan":
                case "rowspan":
                case "rowSpan":

                    elm.setAttribute('colspan', data.attributes[attr], 0);

                    break;

                default:

                    dAttr = document.createAttribute(attr);

                    break;
            }

            if (dAttr) {

    			dAttr.value = data.attributes[attr];

    			elm.setAttributeNode(dAttr);
            }

		}
	};

	_priv.styles = function _styles(data) {

		if (!data.attributes) {

			data.attributes = {};
		}

        if (data.style) {

            var styles = data.style.split(',');

            for (var i = 0, len = styles.length; i < len; i++) {

                switch (styles[i]) {

                    case 'min-width':
                        _priv.attributes(data, 'class', 'emp-min-width');
                        break;

                    case 'no-wrap':
                        _priv.attributes(data, 'class', 'cui-no-wrap');
                        break;

                    case 'bold':
                        _priv.attributes(data, 'class', 'emp-bold');
                        break;

                    case 'negative-number':
                        _priv.attributes(data, 'class', 'emp-negative-number');
                        break;

                    case 'currency':
                        _priv.attributes(data, 'class', 'cui-currency');
                        break;

                    case 'align-right':
                        _priv.attributes(data, 'class', 'cui-align-right');
                        break;

                    case 'align-center':
                        _priv.attributes(data, 'class', 'cui-align-center');
                        break;

                    case 'manual-stripping':
                        _priv.attributes(data, 'class', 'cui-no-stripes');
                        break;

                    case 'mobile-row':
                        _priv.attributes(data, 'class', 'emp-external-mobile-row');
                        break;

                    case 'button-menu-column':
                        _priv.attributes(data, 'class', 'emp-button-menu-column');
                        break;

                    case 'uppercase':
                        _priv.attributes(data, 'class', 'emp-force-uppercase');
                        break;
                }
            }
        }

	};

    _priv.innerHTML = function _inner_html(string) {
        var doc = document.createElement("html");
        doc.innerHTML = string;
        return doc;
    };

    _priv.checkSelectAll = function _check_select_all(tableData) {

        if (tableData.body && tableData.body.rows && tableData.body.rows.length) {

            for (var r = 0, rLen = tableData.body.rows.length; r < rLen; r++) {

                if (!tableData.body.rows[r].selection || (tableData.body.rows[r].selection && !tableData.body.rows[r].selection.checked)) {

                    return false;
                }

            }

            return true;

        }
        else {

            return false;
        }
    };

    // Create the different table sections
    _priv.createSection = function _create_section(section, sectionAttr, data, tableData, tableElm, rowLimit, rowStart) {

        if (rowStart === undefined) {
            rowStart = 0;
        }

        if (rowLimit) {

            rowLimit -= 1;
        }

    	tableElm.appendChild(document.createElement(section));

    	var sectionElm = tableElm.querySelector('table ' + section);

        var rowCounter = 0;

    	// Loop through the section
    	for (var i = rowStart, len = data.rows.length; i < len; i++) {

    		// Check if this row needs to be skipped
    		if (data.rows[i].skip) {
    			continue;
    		}

    		var row = data.rows[i];
            var rowElm = document.createElement('tr');
            var expandRowElm = false;

            var rowKeyValue = (row.key) ? row.key : i ;
            var rowIndexValue = i;

    		// Classes that need to be applied to the row
    		var rowClasses = "";

    		if (section === "tbody") {

    			var rowKey = document.createAttribute('data-key');
    			var rowIndex = document.createAttribute('data-row-index');

    			rowKey.value = rowKeyValue;
    			rowIndex.value = rowIndexValue;

    			rowElm.setAttributeNode(rowKey);
                rowElm.setAttributeNode(rowIndex);

                if (row.selection && row.selection.checked) {
                    rowClasses += ' emp-checked-row';
                }

    			if (row.highlight) {
    				rowClasses += ' emp-highlight-row';
    			}
            }

            // Create selection is its a selectable table that is not empty
            if (tableData.selectable && !tableData.emptyTable && !tableData.largeTable) {

                selectionCellElm = document.createElement((section === "thead") ? 'th' : 'td');

                var selectColumnClass = document.createAttribute('class');
                selectColumnClass.value = "table-control-col emp-min-width";

                selectionCellElm.setAttributeNode(selectColumnClass);

                if (section !== "tfoot") {

                    if (section === "thead") {

                        if (tableData.selectionType === "single" || !tableData.selectAll) {

                            var headerText = (tableData.selectionType === "single") ? "Select Row" : "Select Rows";

                            var blankSelectionHeader = document.createElement('span');
                            var blankSelectionHeaderText = document.createTextNode(headerText);

                            selectionCellElm.appendChild(blankSelectionHeader);

                        }
                        else {

                            var selectionControl = document.createElement('input');
                            var selectionLabel = document.createElement('label');

                            var selectionControlAttr = {
                                "attributes": {}
                            };

                            var selectionControlLabelAttr = {
                                "attributes": {
                                    "class": 'cui-hide-from-screen'
                                }
                            };

                            var inputID = _priv.tableID + "_all";

                            var labelText = "Select All Rows";

                            var selectionLabelText = document.createTextNode(labelText);

                            selectionControlLabelAttr.attributes.for = inputID;

                            selectionControlAttr.attributes.id = inputID;
                            selectionControlAttr.attributes.name = _priv.tableID + "_all";

                            selectionControl.setAttribute('type', 'checkbox');

                            if (_priv.checkSelectAll(tableData)) {
                                selectionControlAttr.attributes.checked = "checked";
                            }

                            selectionControlAttr.attributes.value = (row.key) ? row.key : i;

                            // Add Label Text to Label
                            selectionLabel.appendChild(selectionLabelText);

                            _priv.mergeAttributes(selectionControl, selectionControlAttr);
                            _priv.mergeAttributes(selectionLabel, selectionControlLabelAttr);

                            // Add the selection control
                            selectionCellElm.appendChild(selectionLabel);
                            selectionCellElm.appendChild(selectionControl);
                        }

                    }
                    else {

                        if (!row.selection || (row.selection && !row.selection.empty)) {

                            if (!row.selection || (row.selection && !row.selection.readOnly)) {

                                var selectionBodyControl = document.createElement('input');
                                var selectionBodyLabel = document.createElement('label');

                                var selectionBodyControlAttr = {
                                    "attributes": {}
                                };

                                var selectionBodyControlLabelAttr = {
                                    "attributes": {
                                        "class": 'cui-hide-from-screen'
                                    }
                                };

                                var inputID = _priv.tableID + "_" + i;

                                var labelText = "Select Row " + i;

                                var selectionLabelText = document.createTextNode(labelText);

                                selectionBodyControlAttr.attributes.id = inputID;
                                selectionBodyControlLabelAttr.attributes.for = inputID;

                                if (tableData.selectionType === "single") {

                                    selectionBodyControl.setAttribute('type', 'radio');
                                    selectionBodyControlAttr.attributes.name = _priv.tableID;
                                }
                                else {

                                    selectionBodyControl.setAttribute('type', 'checkbox');
                                    selectionBodyControlAttr.attributes.name = _priv.tableID + "_" + i;
                                }

                                if (row.selection && row.selection.checked) {
                                    selectionBodyControlAttr.attributes.checked = "checked";
                                }

                                selectionBodyControlAttr.attributes.value = (row.key) ? row.key : i;

                                // Add Label Text to Label
                                selectionBodyLabel.appendChild(selectionLabelText);

                                _priv.mergeAttributes(selectionBodyControl, selectionBodyControlAttr);
                                _priv.mergeAttributes(selectionBodyLabel, selectionBodyControlLabelAttr);

                                // Add the selection control
                                selectionCellElm.appendChild(selectionBodyLabel);
                                selectionCellElm.appendChild(selectionBodyControl);

                            }
                            else if (row.selection && row.selection.readOnly) {

                                var readOnlyCheck = document.createElement('span');

                                var readOnlyCheckAttributes = {
                                    'attributes': {}
                                };

                                if (row.selection.checked) {

                                    readOnlyCheckAttributes.attributes.class = 'emp-table-select-true';
                                }

                                _priv.mergeAttributes(readOnlyCheck, readOnlyCheckAttributes);

                                selectionCellElm.appendChild(readOnlyCheck);
                            }

                        }

                    }
                }

                rowElm.appendChild(selectionCellElm);
            }

    		// Cells
    		for (var c = 0, cLen = row.columns.length; c < cLen; c++) {

    			var cell = row.columns[c];
                var cellElm = false;

                // Skip all columns with skipRender attribute
                if (cell.skip) {

                    continue;
                }

                if (!cell.attributes) {

                    cell.attributes = {};
                }

                if (section === "thead") {
                    cell.attributes.tabindex = 0;
                }

                // // Added tabindex of 0 for keyboard accessibility
                // if (!cell.attributes.tabindex) {
                //     cell.attributes.tabindex = 0;
                // }

                var headerColumn = tableData.head.rows[0].columns[c];
                var headerColumnText = false;

                if (!headerColumn.skip) {

                    if (headerColumn.text && headerColumn.text.length) {
                        headerColumnText = headerColumn.text;
                    }
                    else if (headerColumn.attributes && headerColumn.attributes.title && headerColumn.attributes.title.length) {
                        headerColumnText = headerColumn.attributes.title.length;
                    }
                    else {
                        headerColumnText = "Header Column " + c + " Title not set!";
                    }
                }

                var newCell = JSON.parse(JSON.stringify(cell));

    			if (newCell.type && newCell.type === "header") {

    				cellElm = document.createElement('th');

                    _priv.attributes(newCell, 'data-col-index', c);

    				if (newCell.sortable) {

                        _priv.attributes(newCell, 'class', 'emp-sortable');
    				}

                    if (!newCell.attributes['data-type']) {
                        newCell.attributes['data-type'] = 'alpha';
                    }
    			}
    			else {

    				cellElm = document.createElement('td');
    			}

                if (newCell.visibility === "hidden") {
                    _priv.attributes(newCell, 'class', 'cui-hidden');
                }

                if (tableData.type && tableData.type === "pivot" &&section === "tbody" && headerColumnText) {
                    var cellResponsiveColumnHeader = document.createElement('span');
                    cellResponsiveColumnHeader.appendChild(document.createTextNode(headerColumnText));
                    cellResponsiveColumnHeader.classList.add('emp-responsive-cell-header');

                    cellElm.appendChild(cellResponsiveColumnHeader);
                }

	    		if (newCell.text && (!newCell.contents || newCell.contents.length === 0)) {

	    			var cellTextWrapper = false;

	    			if (newCell.hideLabel) {

	    				cellTextWrapper = document.createElement('span');
	    				cellTextWrapperClass = document.createAttribute('class');
	    				cellTextWrapperClass.value = 'cui-hide-from-screen';

	    				cellTextWrapper.setAttributeNode(cellTextWrapperClass);

	    				if (!newCell.attributes || (newCell.attributes && !newCell.attributes.title)) {

	    					_priv.attributes(newCell, 'title', newCell.text);
	    				}

	    			}

                    var cellText = newCell.text.replace(/(^\s+|\s+$)/, '');

                    if (section === "tfoot") {

                        if (cellText && cellText.length) {

                            var footerTooltip = "Total " + tableData.head.rows[0].columns[c].text + ": " + newCell.text;

                            cellTextWrapper = document.createElement('span');

                            var cellFooterAttr = {
                                "attributes": {
                                    "title": footerTooltip
                                }
                            }

                            _priv.mergeAttributes(cellTextWrapper, cellFooterAttr);
                        }

                    }

                    if (cellText && cellText.length > 0) {

                        if (cellText.indexOf('\n') === -1) {

        	    			var text = document.createTextNode(newCell.text);

        	    			// Check and wrap the columns
        	    			if (cellTextWrapper) {

        	    				cellTextWrapper.appendChild(text);
        	    				cellElm.appendChild(cellTextWrapper);
        	    			}
        	    			else {

        	    				cellElm.appendChild(text);
        	    			}
                        }
                        else {

                            var splitText = cellText.split('\n');

                            for (var s = 0, sLen = splitText.length; s < sLen; s++) {

                                var sText = document.createTextNode(splitText[s]);

                                if (cellTextWrapper) {

                                    cellTextWrapper.appendChild(sText);
                                }
                                else {

                                    cellElm.appendChild(sText);
                                }

                                if ((s + 1) < sLen) {

                                    var newBreak = document.createElement('br');

                                    if (cellTextWrapper) {

                                        cellTextWrapper.appendChild(newBreak);
                                    }
                                    else {

                                        cellElm.appendChild(newBreak);
                                    }
                                }

                            }

                            if (cellTextWrapper) {
                                cellElm.appendChild(cellTextWrapper);
                            }

                        }

                    }

	    		}
	    		else if (newCell.contents) {

                    for (var ce = 0, ceLen = newCell.contents.length; ce < ceLen; ce++) {

                        if (_priv.dataShivs[newCell.contents[ce].template]) {

                            _priv.dataShivs[newCell.contents[ce].template](newCell.contents[ce]);
                        }

                        if (newCell.contents[ce].template === "raw") {

                            let tempDiv = document.createElement('div');

                            tempDiv.innerHTML = newCell.contents[ce].raw;

                            while (tempDiv.hasChildNodes) {

                                try {

                                    var node = tempDiv.removeChild(tempDiv.firstChild);

                                    if (node && node.nodeType) {

                                        cellElm.appendChild(node);
                                    }
                                }
                                catch(error) {

                                    break;
                                }

                            }

                        }
                        else if (newCell.contents[ce].template !== "field") {

                            procTemplates.render(newCell.contents[ce], 'table', function(cellContents) {

                                if (cellContents !== false) {

                                    cellElm.appendChild(cellContents);
                                }

                            });
                        }
                        else {

                            // Pull out buttons.
                            if (newCell.contents[ce].type === "button") {

                                if (newCell.contents[ce].input && (newCell.contents[ce].input.text === "Button Menu" || newCell.contents[ce].input.text === "Actions" )) {

                                    if (!newCell.style) {
                                        newCell.style = "button-menu-column";
                                    }
                                    else {
                                        newCell.style += ",button-menu-column";
                                    }

                                    // Check to see if a menu style is applied at the table level and push that style onto the button menu
                                    if (tableData && tableData.attributes && (tableData.attributes['data-menuStyle'] || tableData.attributes['data-menustyle']) ) {
                                        //console.log(newCell.contents[ce]);

                                        var menuStyle = false;

                                        if (tableData.attributes['data-menuStyle']) {
                                            menuStyle = tableData.attributes['data-menuStyle'];
                                        }

                                        if (tableData.attributes['data-menustyle']) {
                                            menuStyle = tableData.attributes['data-menustyle'];
                                        }

                                        newCell.contents[ce].input.style = menuStyle;
                                    }

                                    if (newCell.contents[ce].options && newCell.contents[ce].options.length) {

                                        procTemplates.render(newCell.contents[ce], 'table', function(cellContents) {

                                            if (cellContents !== false) {

                                                cellElm.appendChild(cellContents);
                                            }

                                        });
                                    }
                                    else {

                                        journal.log({type: 'warning', owner: 'DEV', module: 'render', submodule: 'tableShiv'}, 'Table ' + tableData.attributes.id + ' row ' + i + ' contained a button menu, but there were no menu options so rendering was skipped');

                                    }
                                }
                                else {

                                    procTemplates.render(newCell.contents[ce], 'table', function(cellContents) {

                                        if (cellContents !== false) {

                                            cellElm.appendChild(cellContents);
                                        }

                                    });

                                }

                            }
                            else {
                                procTemplates.render(newCell.contents[ce], 'table', function(cellContents) {

                                    if (cellContents !== false) {

                                        cellElm.appendChild(cellContents);
                                    }

                                });
                            }
                        }

                    }
	    		}
                else {

                    if (section === "tfoot") {
                        _priv.attributes(newCell, 'class', 'emp-no-cell-footer-borders');
                    }

                }

                if (newCell.style && (!newCell.visibility || newCell.visibility !== "hidden")) {

                    _priv.styles(newCell);
                }

	    		// Merge attribute into cell element
	    		_priv.mergeAttributes(cellElm, newCell);

    			rowElm.appendChild(cellElm);
    		}

            if (!row.attributes) {
                row.attributes = {};
            }

    		if (rowClasses.length) {

                row.attributes.class = rowClasses.trim();

            }

            _priv.styles(row);

            // Merge attribute into cell element
            _priv.mergeAttributes(rowElm, row);

            if (row.expand) {
                sectionElm.appendChild(expandRowElm);
            }

    		sectionElm.appendChild(rowElm);

            if (rowLimit) {

                if (rowCounter < rowLimit) {
                    rowCounter += 1;
                }
                else {
                    break;
                }
            }

    	}

        if (sectionAttr) {
            _priv.mergeAttributes(sectionElm, sectionAttr);
        }

    	tableElm.appendChild(sectionElm);
    };

	var render = function _render_table_shiv(data, parentList, external, cb) {

        if (!external && document.querySelector('html').classList.contains('external-app')) {
            external = true;
        }

        if (data.attributes && data.attributes['data-menuStyle']) {
            actionsMenu = true;
        }

        // Create docFragments
        var docFragement = document.createDocumentFragment();
        var lastReference = docFragement;

        if (!data.fixData) {
            data = _priv.fixData(data, external);
        }

        var fakeData = false;

        _priv.tableID = data.attributes.id.substring(0, 1).toLowerCase() + data.attributes.id.substring(1);

		if (!data.attributes) {
			data.attributes = {};
		}

		data.attributes['data-store-id'] = ds.createStore(data);

		var initialContainer = templates['table'](data).replace(/\s\s+/g, ' ');

        // Parse all of the returned handblebars string into actual DOM elements
        var parsed = _priv.innerHTML(initialContainer).querySelector('body');

        var children = parsed.childNodes;

        if (children.length !== 0) {

            // Loop through and filter out none html elements
            for (var i = 0, len = children.length; i < len; i++) {

                if (children[i] !== undefined && children[i].nodeType === 1) {

                    // Add the produced fragment
                    docFragement.appendChild(children[i]);
                }

            }

            // Update the last reference to the last child incase there are children
            lastReference = docFragement.lastChild;
        }

        var tableElm = docFragement.querySelector('div.emp-table table');

        // Now we need to build out the different table sections
        if (data.head && data.head.rows.length) {

        	_priv.createSection('thead', false, data.head, data, tableElm);
        }

        if (data.footer && data.footer.rows.length) {

        	_priv.createSection('tfoot', false, data.footer, data, tableElm);
        }

        if (data.emptyTable) {

            // Loop through the table header and get a row count (skipping hidden columns)
            var count = 0;

            for (var h = 0, hLen = data.head.rows[0].columns.length; h < hLen; h++) {

                var column = data.head.rows[0].columns[h];

                if (!column.skip && (!column.visibility || column.visibility !== "hidden")) {

                    count += 1;
                }
            }

            fakeData = {
                "rows": [
                    {
                        "columns": [
                            {
                                "attributes": {
                                    'colSpan': count,
                                    'class': 'cui-align-center'
                                },
                                "text": "There is no data to display."
                            }
                        ]
                    }
                ]
            };

            var emptyAttr = {
                "attributes": {
                    'class': 'emp-empty-table',
                    'data-empty': 'true'
                }
            };

            _priv.createSection('tbody', false, fakeData, data, tableElm);

        }
        else {

            var tableColumnLength = data.head.rows[0].columns.length;

            if (!data.limit) {
                data.limit = 15;
            }

            // Check table limit
            if ((tableColumnLength <= data.limit)) {

                // Check for optimize flag
                if (data.optimize) {

                    if (!data.rowLimit) {
                        data.rowLimit = 25;
                    }

                    var rowStart = (data.body.rowStart) ? data.body.rowStart : 0;

                    _priv.createSection('tbody', false, data.body, data, tableElm, data.rowLimit, rowStart);
                }
                else {

                    _priv.createSection('tbody', false, data.body, data, tableElm);
                }
            }
            else {

                // Loop through the table header and get a row count (skipping hidden columns)
                var count = 0;

                var nonToggableType = ['buttonMenu', 'primaryButton', 'notifier', 'button'];

                for (var h = 0, hLen = data.head.rows[0].columns.length; h < hLen; h++) {

                    var column = data.head.rows[0].columns[h];

                    if (column.attributes.hasOwnProperty('data-type')) {

                        if ((nonToggableType.indexOf(column.attributes['data-type'])) === -1) {


                            if (!column.skip && (!column.visibility || column.visibility !== "hidden")) {

                                count += 1;
                            }
                        }

                    }
                    else {

                        if (!column.skip && (!column.visibility || column.visibility !== "hidden")) {

                            count += 1;
                        }
                    }
                }

                if (count <= data.limit) {

                    // Check for optimize flag
                    if (data.optimize) {

                        if (!data.rowLimit) {
                            data.rowLimit = 25;
                        }

                        var rowStart = (data.body.rowStart) ? data.body.rowStart : 0;

                        _priv.createSection('tbody', false, data.body, data, tableElm, data.rowLimit, rowStart);
                    }
                    else {

                        _priv.createSection('tbody', false, data.body, data, tableElm);
                    }

                }
                else {

                    data.largeTable = true;

                    // Disable selectable
                    if (data.selectable) {
                        data.selection = false;
                    }

                    fakeData = {
                        "rows": [
                            {
                                "columns": [
                                    {
                                        "attributes": {
                                            'colspan': count,
                                            'class': 'cui-align-center'
                                        },
                                        "text": "There are too many to render this table!"
                                    }
                                ]
                            }
                        ]
                    }

                    var tooManyColumns = {
                        "attributes": {
                            'class': 'emp-large-table',
                            'data-large-table': 'true'
                        }
                    }

                    _priv.createSection('tbody', tooManyColumns, fakeData, data, tableElm);
                }
            }
        }

        cb(docFragement);
	};

	return {
		render: render
	};

});
