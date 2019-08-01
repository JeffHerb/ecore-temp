Handlebars.registerHelper("splitString", function(context) {

    if (typeof context.hash.hiddenValue === "string") {
        return context.hash.hiddenValue.split(',');
    }
    else {
        return [];
    }

});