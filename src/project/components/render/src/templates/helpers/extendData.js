Handlebars.registerHelper('extendData', function(data, context){

    if (typeof context.hash === "object") {

        for (var item in context.hash) {
            data[item] = context.hash[item];
        }
    }

    return data;

});
