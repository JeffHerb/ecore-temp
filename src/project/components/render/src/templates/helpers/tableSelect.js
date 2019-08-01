Handlebars.registerHelper('tableSelect', function(context, options){

    if (context === "single") {
        return "radio"
    }

    if (context === "multiple") {
        return "checkbox"
    }
});
