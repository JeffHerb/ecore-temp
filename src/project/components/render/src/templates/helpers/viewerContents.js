Handlebars.registerHelper('viewerContents', function(context, options){

    var contentsArray = context.hash.contents

    var results = {
        contents: contentsArray[context.hash.index],
        controls: context.hash.controls,
        index: context.hash.index,
        total: contentsArray.length,
        current: context.hash.index + 1
    };

    return results;

});
