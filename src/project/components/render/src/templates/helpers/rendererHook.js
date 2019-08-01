Handlebars.registerHelper('rendererHook', function(context, scope) {

    if (window.emp && window.emp.render) {

        var returnHTML;

        if (scope === "table-column" && !context.type && context.template !== "icon") {


            if (!context.type && context.template !== "icon") {

                context.type = "span";

                emp.render.section(undefined, context, 'return', function(html) {

                    returnHTML = $('<div>').append(html).html();
                });

            }

        }
        else {

            if (scope === "tabs") {

                if (Array.isArray(context)) {
                    context = {"contents":context};
                }

                emp.render.section(undefined, context, 'return', function(html, data) {

                    returnHTML = $('<div>').append(html).html();
                });
            }
            else {

                emp.render.section(undefined, context, 'return', function(html) {

                    returnHTML = $('<div>').append(html).html();
                });

            }

        }

        return new Handlebars.SafeString(returnHTML);
    }
    else {

        console.error("Failed because renderer hook could not be found!");
    }

});
