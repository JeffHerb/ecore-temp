Handlebars.registerHelper('attribute', function(context, options){

    var attributes = "";

    // Check to see if we have a comma deliminated string array
    var skip = (options.hash && options.hash.skip) ? options.hash.skip.split(',') : [];

    var byPassSafeRetrun = false;

    function objectParser(obj) {

        var returnString = "";

        for (var key in obj) {

            var value = obj[key];

            returnString += "\"" + key + "\":";

            switch (typeof value) {

                case "number":
                case "boolean":
                    returnString += value;
                    break;

                case "string":
                    returnString += " \"" + value + "\"";
                    break;

            }

        }

        return returnString;
    }

    // Loop all attributes
    (function nextAttribute(attrs) {

        var attribute = attrs.shift();

        // Double check to make sure we are not trying to skip this particular attribute type.
        if (skip.indexOf(attribute) === -1) {


            if (attribute !== undefined && attribute.indexOf("data-") !== -1) {

                // Check to see if a string is being passed in
                if (typeof context[attribute] !== "object") {

                    // String get the normal double quote treatment.
                    attributes += " " + attribute + "=\"" + context[attribute] + "\"";

                } else {

                    attributes += attribute + "=" + JSON.stringify(context[attribute]);

                }

            } else {

                // Handle special attribute structure
                switch(attribute) {

                    // No value attributes
                    case 'required':
                    case 'selected':
                    case 'multiple':
                    case 'checked':
                        attributes += " " + attribute;
                        break;

                    // Convert the classname attribute to HTML5 class
                    case 'className':
                        attributes += " class=\"" + context[attribute] + "\"";
                        break;

                    // attribute that we want to ignore
                    case 'class': // now a reserved work in ES6/ES2015
                    case undefined:
                        break;

                    // Extends only attributes
                    default:
                        attributes += " " + attribute + "=\"" + context[attribute] + "\"";
                        break;
                }

            }

        }

        // Move to the next attribute or return
        if (attrs.length !== 0) {
            nextAttribute(attrs);
        }
    })(Object.keys(context));

    return new Handlebars.SafeString(attributes);
});
