Handlebars.registerHelper('readOnlyInputGroup', function(array) {

    var displayedText = "";

    for (var i = 0, len = array.length; i < len; i++) {

        if (array[i].input.attributes.checked) {

            if (displayedText === "") {

                displayedText += array[i].label.text;
            }
            else {

                displayedText += ", " + array[i].label.text;
            }

        }

    }

    return displayedText;

});
