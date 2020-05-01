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
        else if (fwData.header && fwData.header.contents && fwData.header.contents.length) {

            var oAgencyHeader = false;

            for (var a = 0, aLen = fwData.header.contents.length; a < aLen; a++) {

                var oHeader = fwData.header.contents[a];

                if (oHeader && oHeader.template && oHeader.template === "agency-header") {

                    oAgencyHeader = oHeader;

                }

            }

            if (oAgencyHeader) {

                if (oAgencyHeader.userAcct) {
                    if (oAgencyHeader.userAcct.popover) {
                        data.showUserAcct = true;
                        data.inlineUserAcctMenu = true;
                    }
                }

            }

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
