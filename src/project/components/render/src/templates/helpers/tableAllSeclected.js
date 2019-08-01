Handlebars.registerHelper('tableAllSeclected', function(context, options){

    if (context.rows && context.rows.length) {

        for (var i = 0, len = context.rows.length; i < len; i++) {

            if (!context.rows[i].selection) {

                return false;
            }
            else if (context.rows[i].selection && !context.rows[i].selection.checked) {

                return false;
            }

        }

    }
    else {

        return false;
    }

    return options.fn(this);

});
