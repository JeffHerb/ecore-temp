Handlebars.registerHelper('legendRequired', function(context, options){

    var requiredInput = false;
    var visibleLabel = false;

    var optionList = context.options

    // Start by looping the context (options) and look for an occurange were a label is visible and a input is required.
    for (var i=0, len=optionList.length; i < len; i++) {

        // Pull the array object
        var inputObj = optionList[i];

        // Check to see if we have a required field.
        if (inputObj.input && inputObj.input.required && !inputObj.input.readOnly) {
            requiredInput = true;
        }

        // Check to see if there is even a label (not all inputs in the group might need them)
        if (inputObj.label) {

            // Make sure to exclude radio and checkbox inputs as they need to show the label
            if (inputObj.input.type !== "radio" && inputObj.input.type !== "checkbox") {

                // Check to see if the label is visible
                if (inputObj.label.hasOwnProperty('visibility') && inputObj.label.visibility !== "hidden") {
                    visibleLabel = true;
                }

            }

        }

        // Break out of the loop as soon as both equal.
        if (requiredInput && visibleLabel) {
            break;
        }

    }

    // Now based on the final results
    if (requiredInput && !visibleLabel) {

        context['ignoreRequired'] = true;

        // We have labels that need to be shown, so hide then
        return true;

    } else {

        // Some other stange combinations, so do nothing.
        return false;
    }


});
