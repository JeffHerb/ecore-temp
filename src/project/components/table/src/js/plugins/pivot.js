define([], function() {

    var _priv = {};
    var _setup = {};
    var _events = {};
    var _prototype = {};
    var _defaults = {
        'setup': {
            'pivot': true
        },
        'plugins': {
            'pivot': {}
        }
    };

    _priv.tolerance = 25;

    _priv.wrap = function _wrap(toWrap, wrapper) {

        var wrapperElem = wrapper || document.createElement('div');
        wrapperElem.appendChild(toWrap);

        return wrapperElem;

    };

    _priv.insertAfter = function _insertAfter(toInsert, referenceNode) {

        referenceNode.parentNode.insertBefore(toInsert, referenceNode.nextSibling);
    };

    _priv.removeDOMElem = function _removeDOMElem(elmToRemove) {

        var parent = elmToRemove.parentNode;

        parent.removeChild(elmToRemove);

    };

    _priv.pivot = function _pivot(table, manual) {

        var tableWrapper = table.elem.parentNode.parentNode.parentNode;

        var tableWidth = tableWrapper.offsetWidth + 20;

        //if (!table.config.setup.breakout) {

            if (tableWidth >= (table.config.plugins.pivot.toggleWidth + _priv.tolerance)) {

                if (!table.elem.classList.contains('unpivot')) {
                    table.elem.classList.add('unpivot');
                }
            }
            else {

                if (table.elem.classList.contains('unpivot')) {
                    table.elem.classList.remove('unpivot');
                }
            }
        //}
        // else if (manual) {


        //     if (tableWidth >= (table.config.plugins.pivot.toggleWidth + _priv.tolerance)) {

        //         if (!table.elem.classList.contains('unpivot')) {
        //             table.elem.classList.add('unpivot');
        //         }
        //     }
        //     else {

        //         if (table.elem.classList.contains('unpivot')) {
        //             table.elem.classList.remove('unpivot');
        //         }
        //     }

        // }

    };

    _events.resize = function _resize_pivot(evt) {

        var table = evt.data.table;
        var resized;

        if (table.config.setup.breakout)

        clearTimeout(resized);

        resized = setTimeout(
            function () {

                if (!table.config.plugins.breakout.fullView) {

                    _priv.pivot(table);
                }

            },
            200
        );

    };

    _prototype.pivot = function _pivot(evt, table) {

        if (table === undefined) {
            table = this;
        }

        _priv.pivot(table, true);
    };

    _setup.pivot = function _pivot(table, next) {

        if (table.dataStore && table.dataStore.attributes['data-type'] && table.dataStore.attributes['data-type'] === "pivot") {

            var tableWrapper = table.elem.parentNode.parentNode.parentNode;

            var tableClone = table.elem.cloneNode(true);

            var tableCloneBody = tableClone.querySelector('tbody');

            while(true) {

                if (tableCloneBody.children.length > 100) {
                    tableCloneBody.removeChild(tableCloneBody.lastChild);
                }
                else {
                    break;
                }

            }

            // Wrapper for transparity
            var tableCloneWrapper = _priv.wrap(tableClone);
            var tablePosWrapper = _priv.wrap(tableCloneWrapper);

            // Add and remove classes
            tableCloneWrapper.classList.add('emp-pivot-table-clone');
            tablePosWrapper.classList.add('emp-pivot-table-pos-wrap');
            tableClone.classList.add('unpivot');
            tableClone.style.display = "inline-block";

            fastdom.mutate(function () {

                _priv.insertAfter(tablePosWrapper, tableWrapper);

                fastdom.measure(function() {
                    var offWidth = tableClone.offsetWidth;
                    var scrollWidth = tableClone.scrollWidth;

                    var totalWidth = offWidth + scrollWidth;

                    table.config.plugins.pivot.toggleWidth = totalWidth;

                    fastdom.mutate(function() {

                        if (window.innerWidth > (table.config.plugins.pivot.toggleWidth + _priv.tolerance)) {

                           _priv.pivot(table);
                        }

                        _priv.removeDOMElem(tablePosWrapper);

                        emp.$window.on('resize', {table: table}, _events.resize);

                    });

                });

            });

        }

        next();
    };

    return {
        _priv: _priv,
        _setup: _setup,
        _prototype: _prototype,
        _defaults: _defaults
    };

});
