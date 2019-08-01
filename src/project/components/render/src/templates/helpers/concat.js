Handlebars.registerHelper('concat', function(){

    var stringArray = [];

    // Loop through all of the provided areguments and take all the defined string values our and use them to create a message
    for (var i = 0, len = arguments.length; i < len; i++) {

        if (typeof arguments[i] === "string") {

            stringArray.push(arguments[i]);
        }
    }

    // We are assuming that all of the arguments passed are strings, join them and return a singe string
    return stringArray.join('');

});