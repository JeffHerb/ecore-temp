Handlebars.registerHelper('readOnlyInputGroupInputs', function(array) {

    var displayedText = "";

    for (var i = 0, len = array.length; i < len; i++) {

        if (array[i].type === "text" || array[i].type === "textarea") {

            if (array[i].input.attributes.value && array[i].input.attributes.value !== "" && array[i].input.attributes.value !== undefined) {

                displayedText += " " + array[i].input.attributes.value;
            }

        }
        else if (array[i].type === "select") {

            var selected = array[i].input.value || false;

            if (selected !== undefined && selected !== false && selected !== "") {

                for (var o = 0, oLen = array[i].input.options.length; o < oLen; o++) {

                    if (array[i].input.options[o].value === selected) {

                        displayedText += " " + array[i].input.options[o].text;
                    }

                }

            }

        }

    }

    return displayedText.trim();

});
