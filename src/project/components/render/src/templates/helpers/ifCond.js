Handlebars.registerHelper('ifCond', function (options) {

    function cleanUpBools (bool) {

        if (typeof bool === 'string') {

            if (bool === "true") {
                bool = true;
            } else {
                bool = false;
            }

        }

        return bool;
    }

    var v1, v2, operator;

    v1 = options.hash.v1;
    v2 = options.hash.v2;
    operator  = options.hash.op;
    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);

        case 'hasProperty':

            if (v1 === undefined) {

               return options.inverse(this);
            }
            else {

                return (v1.hasOwnProperty(v2)) ? options.fn(this) : options.inverse(this);

            }

        // Checks to see if a given object has any of the included properties
        case 'hasAnyProperties':

            var array;

            if (v1 !== undefined) {

                if (v2 !== undefined) {

                    // Check to see if we already have an array
                    if (!Array.isArray(v2)) {

                        // Turn this string into an array
                        if (v2.constructor === String) {
                            array = v2.split(",");
                        }

                    } else {

                        // Just use the existing array.
                        array = v2;
                    }

                } else {
                    array = [];
                }

                if (array.length === 0) {

                    return options.inverse(this);
                }
                else {

                    for (var i = 0, len = array.length; i < len; i++) {

                        if (v1.hasOwnProperty(array[i])) {

                            return options.fn(this);
                        }
                    }

                    return options.inverse(this);
                }

            }
            else {

                return options.inverse(this);
            }

        case "emptyObject":

            if (v1 !== undefined) {

                var props = Object.keys(v1);

                if (props.length) {

                    return options.inverse(this);
                }
                else {

                    return options.fn(this);
                }

            }
            else {

                return option.inverse(this);
            }

        case "!emptyObject":

            if (v1 !== undefined) {

                var props = Object.keys(v1);

                if (props.length === 0) {

                    return options.fn(this);
                }
                else {

                    return options.inverse(this);
                }
            }
            else {

                return option.inverse(this);
            }

        case 'missingProperty':

            return (!v1.hasOwnProperty(v2)) ? options.fn(this) : options.inverse(this);

        case 'in':

            var array;

            if (v2 !== undefined) {

                // Check to see if we already have an array
                if (!Array.isArray(v2)) {

                    // Turn this string into an array
                    if (v2.constructor === String) {
                        array = v2.split(",");
                    }

                } else {

                    // Just use the existing array.
                    array = v2;
                }

            } else {
                array = [];
            }

            return (array.indexOf(v1) !== -1) ? options.fn(this) : options.inverse(this);

        case '!in':

            if (v2 !== undefined) {
                array = v2.split(",");
            } else {
                array = [];
            }

            return (array.indexOf(v1) === -1) ? options.fn(this) : options.inverse(this);

        case "boolCheck":

            v1 = cleanUpBools(v1);
            v2 = cleanUpBools(v2);

            return (v1 === v2) ? options.fn(this) : options.inverse(this);

        case "!boolCheck":

            v1 = cleanUpBools(v1);
            v2 = cleanUpBools(v2);

            return (v1 !== v2) ? options.fn(this) : options.inverse(this);

        case "hardBoolCheck":

            if (v1 === undefined) {
                v1 = false;
            }
            else {
                v1 = cleanUpBools(v1);
            }

            if (v2 === undefined) {
                v2 = false;
            }
            else {
                v2 = cleanUpBools(v2);
            }

            return (v1 === v2) ? options.fn(this) : options.inverse(this);

        case "!hardBoolCheck":

            if (v1 === undefined) {
                v1 = false;
            }
            else {
                v1 = cleanUpBools(v1);
            }

            if (v2 === undefined) {
                v2 = false;
            }
            else {
                v2 = cleanUpBools(v2);
            }

            return (v1 !== v2) ? options.fn(this) : options.inverse(this);

        case "hasLength":

            if (Array.isArray(v1) && v1.length > 0) {

                // Look for a contents object
                for (var i = 0, len = v1.length; i < len; i++) {

                    if (typeof v1[i] !== "object") {

                        return options.inverse(this);
                    }

                }

                return options.fn(this);

            }
            else {

                if (typeof v1 === "object") {

                }
                else {

                    return options.inverse(this);
                }

            }

        case "arrayLength":

            if (Array.isArray(v1) && v1.length === parseInt(v2)) {

                return options.fn(this);
            }
            else {

                return options.inverse(this);
            }

        case "typeCheck":

            if (typeof v1 === v2) {

                return options.fn(this);
            }
            else {

                return options.inverse(this);
            }

        case "testValue":

            return options.fn(this);

        case "typeof":

            var v1Type = typeof v1;

            if (v1Type === "object" && Array.isArray(v1)) {
                v1Type = "array";
            }

            if (v1Type === v2) {
                return options.fn(this);
            }

            return options.inverse(this);

        case "ratingIndex":

            if (v2 === undefined) {

                return options.inverse(this);
            }
            else {

                v1 = v1 + 1;

                return (v1 <= v2) ? options.fn(this) : options.inverse(this);

            }

        default:
            return options.inverse(this);
    }

});
