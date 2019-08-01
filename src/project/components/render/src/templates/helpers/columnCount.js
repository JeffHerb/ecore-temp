Handlebars.registerHelper('columnCount', function(context){

    var head = context.hash.head[0].columns;
    var limit = context.hash.limit;

    if (limit === undefined) {
        limit = 15;
    }

    // Check to see if the table is even at the limit
    if (head.length <= limit) {

        return false;
    }
    else {

        var showable = 0;

        for (var i = 0, len = head.length; i < len; i++) {

            if (
                // Filter out hidden columns
                (head[i].hasOwnProperty('visibility') && head[i].visibility === "hidden") ||
                // Filter out Button Columns
                ((head[i].attributes && head[i].attributes['data-type'] === "button") || (head[i].attributes && head[i].attributes['data-type'] === "buttonMenu") || (head[i].attributes && head[i].attributes['data-columnType'] === "button")) ||
                // Filter out Notifier Columns
                ((head[i].attributes && (head[i].attributes['data-type'] === "notifier" || head[i].attributes['data-columntype'] === "notifier")) || (head[i].attributes && head[i].attributes['data-type'] === "alpha" && head[i].style && head[i].style.indexOf('min-width') !== -1 && head[i].hideLabel))
                ) {

                continue;
            }

            showable = showable + 1;

        }

        if (showable > limit) {

            return true;
        }
        else {

            return false;
        }
    }
});
