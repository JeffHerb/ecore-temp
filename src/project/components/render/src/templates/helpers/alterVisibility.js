Handlebars.registerHelper("alterVisibility", function(context, options){

    if (context) {

        //make copy of JSON object
        var jsonObj = context;

        var jsonObjCopy = JSON.parse(JSON.stringify(jsonObj));

        if (jsonObjCopy.label.visibility) {

            delete jsonObjCopy.label.visibility;
        }

        return jsonObjCopy;
    }

    return context;

});
