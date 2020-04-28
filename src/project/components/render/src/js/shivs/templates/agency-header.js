define(['dataStore', 'processTemplates', 'handlebars', 'handlebars-templates', 'handlebars-partials', 'handlebars-helpers'], function(ds, procTemplates, Handlebars, templates, partial) {

	var _priv = {};

	var data = function _agency_header_data_shiv(data, parentList) {

        if (!fwData.menus || (fwData.menus && !fwData.menus.global) || (fwData.menus && fwData.menus.global && Object.keys(fwData.menus.global).length === 0)) {
            data.showMenu = false;
        }
        else {
            data.showMenu = true;
        }

        if (fwData && fwData.menus && (fwData.menus.userAccount || fwData.menus.system) ) {
            data.showUserAcct = true;
        }
        else {
            data.showUserAcct = false;
        }

        if (fwData && fwData.menus && (fwData.menus.appHelp || fwData.menus.supportContact) ) {
            data.showSupportMenu = true;
        }
        else {
            data.showSupportMenu = false;
        }

		return data;
	};


	return {
		'data': data
	};

});
