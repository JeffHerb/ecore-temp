define(['dataStore', 'processTemplates', 'handlebars', 'handlebars-templates', 'handlebars-partials', 'handlebars-helpers'], function(ds, procTemplates, Handlebars, templates, partial) {

	var _priv = {};

	var data = function _agency_header_data_shiv(data, parentList) {

        if (!fwData.menus || (fwData.menus && !fwData.menus.global) || (fwData.menus && fwData.menus.global && Object.keys(fwData.menus.global).length === 0)) {
            data.showMenu = false;
        }
        else {
            data.showMenu = true;
        }

        if (!fwData.menus || (fwData.menus && !fwData.menus.global) || (fwData.menus && fwData.menus.userAcct && Object.keys(fwData.menus.userAcct).length === 0)) {
        	data.showUserAcct = false;
        }
        else {
        	data.showUserAcct = true;
        }

        if (!fwData.menus || (fwData.menus && !fwData.menus.global) || (fwData.menus && fwData.menus.support && Object.keys(fwData.menus.support).length === 0)) {
        	data.showSupportMenu = false;
        }
        else {
        	data.showSupportMenu = true;
        }

		return data;
	};


	return {
		'data': data
	};

});
