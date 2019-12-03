Handlebars.registerHelper('tableHiddenInputs', function(context, options) {

  var tableDS = context;

  var colMap = {};
  var values = false;
  var checkedKeys = [];
  var selectedKeys = [];

  var finalOutput = "";

  var tableId = tableDS.attributes.id.substring(0, 1).toLowerCase() + tableDS.attributes.id.substring(1).replace(/\s+/g, '');

    // First verify that we have a table head to work with.
    if (tableDS.head && tableDS.body && tableDS.body.rows.length) {

        var head = tableDS.head.rows[0].columns.slice();

        var defaultValues = [];

        // Loop the header and generate the colMaps
        for (var i = 0, len = head.length; i < len; i++) {

            if (head[i].attributes && head[i].attributes['data-colmap']) {

                var mapName = head[i].attributes['data-colmap'];

                mapName = mapName.substring(0, 1).toLowerCase() + mapName.substring(1).replace(/\s+/g, '');

                colMap[mapName] = i;
            }

            if (head[i] && head[i].defaultValue) {

                defaultValues.push(head[i].defaultValue);
            }
            else {

                defaultValues.push(head[i].defaultValue);
            }

        }

        // Loop through the body
        for (var k = 0, kLen = tableDS.body.rows.length; k < kLen; k++) {

            var row = tableDS.body.rows[k];

            // Check to see if selection is even in place
            if (row.selection) {

                if (row.selection.checked) {
                    checkedKeys.push(row.key);

                    if (tableDS.selectionType === "single") {
                        values = row.columns.slice();
                    }
                }
            }

            if (row.highlight) {

                selectedKeys.push(row.key);

                values = row.columns.slice();
            }
        }

        if (values.length && Object.keys(colMap).length) {

            for (var col in colMap) {

                var valColObj = values[colMap[col]];
                var colValue = "";

                if (valColObj && (valColObj.text || (valColObj.contents && valColObj.contents.length))) {

                    if (valColObj.text) {

                        colValue = valColObj.text;
                    }
                    else {

                        var totalContents = "";

                        for (var c = 0, cLen = valColObj.contents.length; c < cLen; c++) {

                            var content = valColObj.contents[c];

                            switch (content.template) {

                                case 'field':

                                    if (content.type !== "select") {

                                        if (content.input && content.input.attributes && content.input.attributes.value) {
                                            totalContents += " " + content.input.attributes.value;
                                        }

                                    }
                                    else {

                                        if (content.input && content.input.value) {
                                            totalContents = " " + content.input.value;
                                        }

                                    }

                                    break;

                                case 'link':
                                case 'notifier':

                                    if (content.text) {
                                        totalContents = " " + content.text;
                                    }

                                    break;
                            }
                        }

                        colValue = totalContents.trim();
                    }

                }
                else if (colValue === "" && defaultValues[colMap[col]] !== "" && defaultValues[colMap[col]] !== undefined) {

                    colValue = defaultValues[colMap[col]];

                }

                // Create initial hidden field
                finalOutput += '<input type="hidden" name="' + col + '" id="' + col + '" value="' + colValue + '"/>';

                // Create temp/backup hidden field
                finalOutput += '<input type="hidden" name="' + col + '_temp" id="' + col + '_temp" value=""/>';

            }

        }
        else if (Object.keys(colMap).length) {

            for (var col in colMap) {

                var noSelectColValue = "";

                if (defaultValues.length && defaultValues[colMap[col]] !== "" && defaultValues[colMap[col]] !== undefined) {
                    noSelectColValue = defaultValues[colMap[col]];
                }

                // Create initial hidden field
                finalOutput += '<input type="hidden" name="' + col + '" id="' + col + '" value="' + noSelectColValue + '"/>';

                // Create temp/backup hidden field
                finalOutput += '<input type="hidden" name="' + col + '_temp" id="' + col + '_temp" value=""/>';

            }
        }

    }

    var checkedDelimiated = (checkedKeys.length) ? checkedKeys.join(',') : "";
    var selectedDelimiated = (selectedKeys.length) ? selectedKeys.join(',') : "";

    // Current values!
    finalOutput += '<input type="hidden" name="' + tableId + '_checked_index" id="' + tableId + '_checked_index" value="' + checkedDelimiated + '"/>';

    finalOutput += '<input type="hidden" name="' + tableId + '_selected_index" id="' + tableId + '_selected_index" value="' + selectedDelimiated + '"/>';

    // Previous value
    finalOutput += '<input type="hidden" name="' + tableId + '_checked_index_previous" id="' + tableId + '_checked_index_previous" value=""/>';

    finalOutput += '<input type="hidden" name="' + tableId + '_selected_index_previous" id="' + tableId + '_selected_index_previous" value=""/>';

    //page view limit/size
    finalOutput += '<input type="hidden" name="' + tableId + '_paging_view_limit" id="' + tableId + '_page_view_limit" value=""/>';

    return new Handlebars.SafeString(finalOutput);

});
