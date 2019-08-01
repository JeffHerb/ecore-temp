Handlebars.registerHelper('columnTitle', function(context){

    var headerData = context.hash.headData;
    var index = context.hash.index;

    if (headerData.head.rows[0].columns[index].text) {

        return headerData.head.rows[0].columns[index].text.trim();
    }
    else {

        return "";
    }

});
