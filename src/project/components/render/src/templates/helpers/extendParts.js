Handlebars.registerHelper('extendParts', function(params) {

    var parts = params.hash.parts
    var properties = params.hash.properties;
    var parentObj = params.hash.parentObj;
    var attributes = params.hash.attributes;
    var prefix = params.hash.prefix;

    if (parts === undefined) {
        parts = {};
    }

    if (properties === undefined) {
        properties = {};
    }

    // Special extend for attributes/prefix.
    if (attributes !== undefined) {
        parts['attributes'] = attributes;
    }

    if (prefix !== undefined) {
        parts.prefix = prefix;
    }

    if (typeof properties === "object") {

        for (prop in properties) {

            if (!parts.hasOwnProperty(prop)) {
                parts[prop] = properties[prop];
            }

        }
    }

    if (typeof parentObj === "object") {

        parts["parentObj"] = {};

        for (prop in parentObj) {

            if (!parts.hasOwnProperty(prop)) {
                parts["parentObj"][prop] = parentObj[prop];
            }

        }
    }

    return parts;

});
