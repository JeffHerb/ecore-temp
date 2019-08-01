// Create the attribute helper
Handlebars.registerHelper('formatString', function(context, options) {

    var value = context;

    if (options.hash.appendExtra) {
        value += options.hash.appendExtra;
    }

    // Make sure the first character is lower case
    value = value.substring(0, 1).toLowerCase() + value.substring(1);

    return value.replace(/\s+/g, '');;

});
