Handlebars.registerHelper('tableColumnCount', function(context, options) {

	var totalColumns = 0;
	var tableData = options.hash.tableData;
	var headerRows = context;

	for (var row in context) {

		var columns = context[row].columns;

        // Loop each column
        for (var c = 0 , len = columns.length; c < len; c++) {

            // Only count the column if the column does not have a visibility setting or if the visibility setting is not set to hidden
            if (!columns[c].hasOwnProperty('visibility')) {
                totalColumns++;
            } else if (columns[c].visibility !== "hidden") {
                totalColumns++;
            }

        }

	}

	if (tableData.hasOwnProperty('selectable') && tableData.selectable) {
		totalColumns += 1;
	}

    // Return count
    return totalColumns;

});