define([], function() {

    var _priv = {};
    var _setup = {};
    var _events = {};
    var _prototype = {};
    var _defaults = {
        'setup': {
            'sort': true
        },
        'plugins': {
            'sort': {}
        }
    };

    var parentRow = function _parent_row(source) {

        var currentParent = false;

        while (true) {

            if (!currentParent) {
                currentParent = source.parentNode;
            }
            else {
                currentParent = currentParent.parentNode;
            }

            if (currentParent.nodeName === 'BODY') {
                break;
            }
            else if (currentParent.nodeName === 'TR') {

                return currentParent;
            }

        }

        return false;

    };

    _setup.mobile = function _mobile_setup(table, next) {

        // Add class to remove overflow on pivot tabls
        if (table.dataStore.type === "pivot") {
            table.obj.$viewWrapper.addClass('emp-remove-overflow');
        }

        // Setup expandable click control
        table.$self[0].addEventListener('click', function(evt) {

            var evtTarget = evt.target;

            if (evtTarget.nodeName === "BUTTON" && evtTarget.classList.contains('emp-pivote-table-expand')) {

                var row = parentRow(evtTarget);

                if (row.classList.contains('emp-responsive-toggle-active')) {
                    row.classList.remove('emp-responsive-toggle-active');
                }
                else {
                    row.classList.add('emp-responsive-toggle-active');
                }
            }


        });

        next();
    };

    return {
        _priv: _priv,
        _setup: _setup,
        _defaults: _defaults
    };

});
