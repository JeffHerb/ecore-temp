Handlebars.registerHelper('keyOrIndex', function (options) {

    if (options.hash.key !== undefined) {

        return options.hash.key;
    }
    else {

        return options.hash.index;
    }

});