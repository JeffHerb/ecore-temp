Handlebars.registerHelper('commaSplit', function (context) {

    if (context.length) {

        var arr = context.split(",").map(function (item) {
            return item.trim();
        });

        return arr;
    }

    return false;

});
