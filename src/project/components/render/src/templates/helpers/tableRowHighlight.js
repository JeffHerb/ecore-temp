Handlebars.registerHelper('tableCheckHighlight', function(options) {

    var current = options.hash.current;
    var array = options.hash.array;

    if (array !== undefined) {

        if (array.indexOf(current) !== -1) {
            return true;
        }

    }

    // Add the icon class prefix and return
    return false;

});
