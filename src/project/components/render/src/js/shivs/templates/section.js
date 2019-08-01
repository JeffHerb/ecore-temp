define(['dataStore', 'processTemplates', 'handlebars', 'handlebars-templates', 'handlebars-partials','handlebars-helpers'], function(ds, procTemplates, Handlebars, templates, partial) {

    var _priv = {};

    var data = function _section_data_shiv(data, parentList) {

        var isCollapsed = false;

        if (data.collapse) {
            isCollapsed = true;
        }

        if (data.contents && data.contents.length) {

            var firstChild = data.contents[0];

            if (firstChild.template && firstChild.template === "group") {

                data.contents[0].isCollapsed = isCollapsed;
            }

        }

        if (parentList.indexOf('section') !== -1) {

            var newData = {
                "template": "groupWrap",
                "contents": [ data ]
            };

            return newData;
        }

        return data;
    };


    return {
        'data': data
    };

});
