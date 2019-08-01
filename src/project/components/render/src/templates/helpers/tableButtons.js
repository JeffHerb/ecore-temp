Handlebars.registerHelper('tableButtons', function(context, options){

    var tableHead = context.head.rows;

    // Loop through all of the rows
    for (var i = 0, len = tableHead.length; i < len; i++) {

        var tableRow = tableHead[i].columns;

        // Loop through all of the columns
        for (var j = 0, jLen = tableRow.length; j < jLen; j++) {

            var tableColumn = tableRow[j];

            if (tableColumn.hasOwnProperty("attributes")) {

                if (tableColumn.attributes.hasOwnProperty('data-type')) {

                    if (tableColumn.attributes['data-type'] === "button") {
                        return true;
                    }

                    if (tableColumn.attributes['data-type'] === "buttonMenu") {
                        return true;
                    }

                    if (tableColumn.attributes['data-type'] === "primaryButton") {
                        return true;
                    }

                    if (tableColumn.attributes['data-type'] === "link") {
                        return true;
                    }

                }

            }

        }

    }

    // Add the icon class prefix and return
    return false;

});
