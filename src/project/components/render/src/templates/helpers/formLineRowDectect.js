Handlebars.registerHelper("formLineRowDetect", function(context, options) {

    var data = context;

    var hasAdjust = false;
    var hasReason = false;

    if (data.adjustments) {
        hasAdjust = true;
    }

    if (data.reason) {
        hasReason = true;
    }

    var className = "";

    if (hasAdjust) {
        className += "form-line-has-adjustment";
    }
    else {
        className += "form-line-no-adjustment";
    }

    if (hasReason) {
        className += " form-line-has-reason";
    }
    else {
        className += " form-line-no-reason";
    }

    return {
        "className": className
    }

});