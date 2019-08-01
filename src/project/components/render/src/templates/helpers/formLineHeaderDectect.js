Handlebars.registerHelper("formLineHeaderDetect", function(context, options) {

    var data = context;

    if (data && Array.isArray(data)) {

        var newData = {
            contents: data
        };

        data = newData;
    }

    if (data && data.contents && Array.isArray(data.contents)) {

        data = data.contents;

        var adjustment = false;
        var reason = false;

        for (var d = 0, dLen = data.length; d < dLen; d++) {

            if ((data[d].adjustments) || (data[d].parts && data[d].parts.adjustments)) {
                adjustment = true;
            }

            //if (data[d].parts && data[d].parts.reason) {
            if (data[d].parts && data[d].parts.reason) {
                reason = true;

            }

            if (adjustment && reason) {
                break;
            }
        }

        var className = "";

        if (adjustment) {
            className += " form-line-header-has-adjustment";
        }
        else {
            className += " form-line-header-no-adjustment";
        }

        if (reason) {
            className += " form-line-header-has-reason";
        }
        else {
            className += " form-line-header-no-reason";
        }

        return {
            "className": className.trim()
        }

    }

    return {};

});
