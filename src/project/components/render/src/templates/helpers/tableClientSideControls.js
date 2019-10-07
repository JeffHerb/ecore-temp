Handlebars.registerHelper('tableClientSideControls', function(attributes){

    var buttons = "";

    // Change Return
    if (attributes.hasOwnProperty('data-changereturn') && attributes['data-changereturn'] === "true") {
        buttons += '<button type="button" title="Selection Return" class="emp-icon-select-return" id="' + attributes.id + '_changeReturn">Selection Return</button>'
    }

    // Responsive Columns Control
    if ((!attributes.hasOwnProperty('data-responsive') || attributes['data-responsive'] === "true") || (attributes['data-type'] && (attributes['data-type'] === "breakout" || attributes['data-type'] === "breakout-priority"))) {

        // Check if breakout was defined an place that button in instead
        if (attributes['data-type']  && (attributes['data-type'] === "breakout" || attributes['data-type'] === "breakout-priority")) {

            buttons += '<button type="button" class="emp-table-breakout-control cui-button-primary">Show All Columns</button>';
        }
        else {

            if (!attributes.hasOwnProperty('data-responsive-columns') || attributes['data-responsive-columns'] === "true") {
                buttons += '<button type="button" title="Column Selection" class="emp-table-responsive-column-control" id="' + attributes.id + '_columns">Columns</button>'
            }
        }
    }

    // if (attributes['data-type'] && (attributes['data-type'] === "breakout" || attributes['data-type'] === "breakout-priority")) {
    //     buttons += '<button type="button" title="View all columns regardless of device width" class="emp-icon-table-breakout"></button>';
    // }

    // Filter Control
    if (!attributes.hasOwnProperty('data-filter') || attributes['data-filter'] === "true") {
        buttons += '<button type="button" title="Open Filter Row" class="emp-icon-table-filter-toggle" id="' + attributes.id + '_filter">Filter Table</button>'
    }

    // Resize Control
    if (!attributes.hasOwnProperty('data-resize') || attributes['data-resize'] === "true") {
        buttons += '<button type="button" title="Resize Table" class="emp-icon-table-resizer" id="' + attributes.id + '_resize">Resize Table</button>'
    }

    return new Handlebars.SafeString(buttons);

});
