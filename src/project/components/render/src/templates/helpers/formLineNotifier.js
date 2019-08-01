Handlebars.registerHelper("formLineNotifier", function(context, options) {
    
    var data = context;

    var notifierTemplate = {
        type: "static",
        template: "notifier",
        attributes: {
            alt: data.hash.tooltip
        },
        text: data.hash.text
    }

    if (data.hash.color) {
        notifierTemplate.color = data.hash.color;
    }
    
    return notifierTemplate;
    
});