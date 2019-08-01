Handlebars.registerHelper('federalMarker', function(context, options){

    var federalInput = false;

    var optionList = context.options

    // Start by looping the context (options) and look for an occurange were a label is visible and a input is required.
    for (var i=0, len=optionList.length; i < len; i++) {

        // Pull the array object
        var inputObj = optionList[i];

        // Check to see if we have a required field.
        if (inputObj.input && inputObj.input.federal && inputObj.input.federal === true) {
            federalInput = true;

            break;
        }

    }

    // Now based on the final results
    if (federalInput) {

        context['federal'] = true;

        // We have labels that need to be shown, so hide then
        return true;

    } else {

        // Some other stange combinations, so do nothing.
        return false;
    }


});