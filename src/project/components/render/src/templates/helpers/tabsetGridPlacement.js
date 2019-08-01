var curColumn = 0;
var curRow = 1;

Handlebars.registerHelper('tabsetGridPlacement', function(options) {

    if (options.hash.pin) {

        curColumn = 5;
    }
    else {

        curColumn += 1;

        if (curColumn === 5) {
            curColumn = 1;
            curRow += 1;
        }
    }

    return "-ms-grid-column:" + curColumn + ";grid-column:" + curColumn + ";" + "-ms-grid-row:" + curRow + ";grid-row:" + curRow + ";"

});
