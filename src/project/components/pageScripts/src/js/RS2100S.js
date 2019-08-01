define([], function() {

    var _events = {};

    _events.clear = function _clear() {

        var map = {
            "E_SPECIAL_DISTRICT_CODE": "",
            "E_SPECIAL_DISTRICT_PERCENTAGE": "100"
        };

        emp.processMap(map);

        var table = emp.reference.tables.specDistTableId;

        table.removeFocus();

        return true;
    };

    var init = function _init() {

        if (!fwData.readOnly) {

            var $clearButton = $('#E_JS_BTN_CLEAR_27');

            if ($clearButton.length) {

                $clearButton.on('click', _events.clear);
            }
            else {

                journal.log({ type: 'warning', owner: 'UI', module: 'pageScript - RS21035S', func: 'init' }, 'Init function could not find the clear button by the id of: E_JS_BTN_CLEAR_27');
            }
        }

    };

    return {
        init: init
    };

});
