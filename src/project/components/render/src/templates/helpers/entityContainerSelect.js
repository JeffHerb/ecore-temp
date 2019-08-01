Handlebars.registerHelper('entityContainerSelect', function(data, context){

    if (data.value) {

        return data.value;
    }
    else {

        return data.options[0].value;
    }

});
