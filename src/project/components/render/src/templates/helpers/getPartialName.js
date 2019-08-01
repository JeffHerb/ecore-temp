Handlebars.registerHelper('getPartialName', function(context, options){

    if (options.hash.composite) {

        // Add the icon class prefix and return
        return new Handlebars.SafeString("_composite-" + context);

    } else {

        // Add the icon class prefix and return
        return new Handlebars.SafeString("_" + context);

    }

});
