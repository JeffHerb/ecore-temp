define([], function() {

    var _events = {};

    _events.clear = function _clear() {

    	var map = {
    		"E_NEW_DOS_ID": "",
    		"E_TAX_TYPE_DESC": ""
    	};

    	emp.processMap(map);

    };

    var init = function _init() {

    	if (!fwData.readOnly) {

	    	var $clearButton = $('#E_JS_BTN_CLEAR_9');

	    	if ($clearButton.length) {

	    		$clearButton.on('click', _events.clear);
	    	}
	    	else {

	    		journal.log({type: 'warning', owner: 'UI', module: 'pageScript - TB0725N', func: 'init'}, 'Init function could not find the clear button by the id of: E_JS_BTN_CLEAR_9');
	    	}
    	}

    };

    return {
    	init: init
    };

});
