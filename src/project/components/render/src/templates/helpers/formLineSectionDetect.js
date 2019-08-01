Handlebars.registerHelper("formLineSectionDetect", function(context, options) {

    var data = options.data.root;

    var hasAdjust = false;
    var hasReason = false;

    if (data.properties) {

        if (data.properties.forceAdjust) {

            hasAdjust = true;
        }

        if (data.properties.forceReason) {

            hasReason = true;
        }
    }

    if (!hasAdjust || !hasReason) {

        if (data.parts && data.parts.lines && data.parts.lines) {

            for (var i = 0, len = data.parts.lines.length; i < len; i++) {

                if (!hasAdjust && data.parts.lines[i].parts && data.parts.lines[i].parts.adjustments) {
                    hasAdjust = true;
                }

                if (!hasReason && data.parts.lines[i].parts && data.parts.lines[i].parts.reason) {
                    hasReason = true;
                }

                if (hasAdjust && hasReason) {
                    break;
                }
            }

            var className = "";

            if (hasAdjust) {
                className += "form-lines-force-adjust";
            }

            if (hasReason) {

                if (className.length >=1) {
                    className += " form-lines-force-reason";
                }
                else {
                    className += "form-lines-force-reason";
                }
            }

            if (className.length) {

                return {
                    "className": className
                };
            }

        }

    }
    else {

        return {
            "className": "form-lines-force-adjust form-lines-force-reason"
        };
    }

});
