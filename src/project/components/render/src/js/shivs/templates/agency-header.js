define(['dataStore', 'processTemplates', 'handlebars', 'handlebars-templates', 'handlebars-partials', 'handlebars-helpers'], function(ds, procTemplates, Handlebars, templates, partial) {

	var _priv = {};

	var data = function _agency_header_data_shiv(data, parentList) {

        console.log(fwData);
        console.log("Agency Data");
        console.log(data);

        if (!fwData.menus || (fwData.menus && !fwData.menus.global) || (fwData.menus && fwData.menus.global && Object.keys(fwData.menus.global).length === 0)) {
            data.showMenu = false;
        }
        else {
            data.showMenu = true;
        }

		return data;
	};


	return {
		'data': data
	};

});
