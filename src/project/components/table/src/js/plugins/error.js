define(['guid'], function (guid) {

    var _priv = {};
    var _setup = {};
    var _events = {};
    var _prototype = {};

    var ERROR_WRAP = $('<div/>', {
        'class': 'cui-messages'
    });

    var ERROR_MESSAGE = $('<div/>', {
        'class': 'cui-error'
    });

    // =================
    // Private Functions
    // =================

    _priv.addError = function _add_error(table, msg) {

        // Check to see if the table errors object exists
        if (table.config.errors === undefined) {

            table.config.errors = {};

            table.obj.$tableWrapper.prepend(ERROR_WRAP.clone());

            table.obj.$errorBlock = table.obj.$tableWrapper.find('.cui-messages');
        }

        var newMsg = ERROR_MESSAGE.clone();

        var guidID = guid();

        newMsg.text(msg).attr('data-errorid', guidID);

        // Add the error to the table
        table.obj.$errorBlock.append(newMsg);

        var $errors = table.obj.$errorBlock.children('div');

        // Safe off the guids
        table.config.errors[guidID] = $errors.eq($errors.length - 1);
    };

    _priv.removeError = function _remove_error(table, guid) {

        if (table.config.errors[guid]) {

            table.config.errors[guid].remove();

            delete table.config.errors[guid];
        }
    };

    _priv.removeAllErrors = function _remove_all_errors(table) {

        table.config.errors = {};

        if (table.obj.$errorBlock.children('div').length) {

            var tableError = table.obj.$errorBlock[0];

            while (tableError.firstChild) {
                tableError.removeChild(tableError.firstChild);
            }

        }
    };

    // ====================
    // Prototypes Functions
    // ====================

    // Exposes a public method for changing the table height
    _prototype.addError = function _resize_public(table, msg, cb) {

        if (typeof table === "string") {

            cb = msg;
            msg = table;
            table = this;
        }

        if (typeof msg === "string") {

            _priv.addError(table, msg);
        }
        else {

            // Error only support string messages
            return false;
        }
    };

    _prototype.removeError = function _resize_public(table, guid) {

        if (typeof table === "string") {
            guid = table;
            table = this;
        }

        _priv.removeError(table, guid);
    };

    _prototype.removeErrors = function _resize_public(table) {

        if (table === undefined) {
            table = this;
        }

        _priv.removeAllErrors(table);
    };

    return {
    	_priv: _priv,
        _prototype: _prototype
    };
});
