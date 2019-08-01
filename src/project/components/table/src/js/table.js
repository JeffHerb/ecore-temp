define(['jquery', 'dataStore', 'tableBase', 'tableSort', 'tableSelection', 'tableResponsive', 'tableFilter', 'tableChangeReturn', 'tableError', 'tableMobile', 'tableMenuButton', 'tablePivot', 'tableBreakout'], function ($, ds, base, sort, selection, responsive, filter, changeReturn, error, mobile, menuButton, pivot, breakout) {

    // Storage locations for private functions
    var _priv = {};

    // Storage locations for setup only functions (only get executed on tables when inited)
    var _setup = {};

    // Storage location for init functions, this is where items should be executed to extend table configurations
    var _inits = {};

    // Storage location for differnt types of events
    var _events = {};

    var Table = function (elem, options) {
        // Store the element upon which the component was called
        this.elem = elem;

        // Create a jQuery version of the element
        this.$self = $(elem);

        // Save off the id
        this.id = $(elem).attr('id');

        this.options = options;
    };

    Table.prototype = {};

    Table.prototype.version = 3;

    Table.prototype.defaults = {
        setup: {},
        controls: {},
    };

    // ========================
    // Initialization Functions
    // ========================

    Table.prototype.init = function _init (cb) {

        var table = this;

        // Set the id so its easier to find
        table.id = table.$self.attr('id');

        if (table.$self.attr('style')) {
            fastdom.mutate(function () {
                table.$self.removeAttr('style');
            });
        }

        // Go out and dins the datastore id and make a reference to it, if it exists.
        var dataStore = table.$self.attr('data-store-id');

        if (dataStore !== undefined && dataStore !== null) {
            table.dataStore = ds.getStore(dataStore);
        }
        else {
            table.dataStore = false;
        }

        var data = table.$self.data();

        var options = $.extend(true, {}, this.options, data);

        table.config = $.extend(true, {}, this.defaults, options);

        // Add object space were _extensions can define additional controls
        table.config.controls = {
            order: [],
            elements: {},
        };

        // Build a default table object of all the standard object parts
        // - thead
        // - tbody
        // - tfoot
        // - caption
        table.obj = {};

        // Look for table header
        table.obj.$thead = table.$self.children('thead');

        if (table.obj.$thead.length === 0) {
            table.obj.$thead = false;
        }

        // Look for table body
        table.obj.$tbody = table.$self.children('tbody');

        if (table.obj.$tbody.length === 0) {
            table.obj.$tbody = false;
        }
        else {

            if (table.obj.$tbody.hasClass('emp-empty-table')) {
                table.config.empty = true;
            }

            if (table.obj.$tbody.hasClass('emp-large-table')) {
                table.config.largeTable = true;
            }
        }

        // Look for table footer
        table.obj.$tfoot = table.$self.children('tfoot');

        if (table.obj.$tfoot.length === 0) {
            table.obj.$tfoot = false;
        }

        // Look for table caption
        table.obj.$caption = table.$self.children('caption');

        if (table.obj.$caption.length === 0) {
            table.obj.$caption = false;
        }

        // Look for the root table container
        table.obj.$tableContainer = table.$self.parents('.emp-table').eq(0);

        if (table.obj.$tableContainer.length === 0) {
            table.obj.$tableContainer = false;
        }

        // Check to see if the table has a body before
        if (table.obj.$tbody) {

            var setupSteps = Object.keys(_setup);

            if (setupSteps.length > 0) {

                (function _setupSteps (steps) {

                    var step = steps.shift();

                    _setup[step](table, function next() {

                        if (steps.length !== 0) {

                            _setupSteps(steps);
                        }
                        else {

                            var initSteps = Object.keys(_inits);

                            if (initSteps.length > 0) {

                                (function _initSteps(iSteps) {

                                    var step = iSteps.shift();

                                    _inits[step](table);

                                    if (iSteps.length > 0) {

                                        _initSteps(iSteps);
                                    }
                                    else {

                                        cb(table);
                                    }

                                })(initSteps);

                            }
                            else {

                                cb(table);
                            }

                        }

                    });

                })(setupSteps);
            }
            else {

                cb(table);
            }
        }
    };

    // Emits a debind event used to tell the other table plugins to debind there functions.
    Table.prototype.debind = function _debind() {
        this.$self.trigger('debind');
    };

    // =================
    // Private Functions
    // =================

    // Function will take extension plugins and merge the their functionality with this root moduel
    _priv.extend = function _extend(extension, cb) {
        var i;
        var len;

        function extendSection (base, extension, data) {
            if (typeof extension === 'object') {
                if (data) {
                    base = $.extend(true, {}, base, extension);

                    return base;
                }
                else {
                    var funcs = Object.keys(extension);

                    for (var i = 0, len = funcs.length; i < len; i++) {
                        base[funcs[i]] = extension[funcs[i]];
                    }

                    return base;
                }
            }
        }

        // Check to see if an array of extension was passed.
        if (Array.isArray(extension)) {
            for (i = 0, len = extension.length; i < len; i++) {
                _priv.extend(extension[i], cb);
            }
        }
        else {
            if (typeof extension === 'object') {
                var props = Object.keys(extension);

                for (i = 0, len = props.length; i < len; i++) {
                    switch (props[i]) {
                        case '_priv':
                            _priv = extendSection(_priv, extension[props[i]], false);

                            break;

                        case '_inits':
                            _inits = extendSection(_inits, extension[props[i]], false);

                            break;

                        case '_setup':
                            _setup = extendSection(_setup, extension[props[i]], false);

                            break;

                        case '_prototype':
                            // Loop through a add the new public prototype
                            for (var protots in extension[props[i]]) {
                                Table.prototype[protots] = extension[props[i]][protots];
                            }

                            break;

                        case '_defaults':
                            Table.prototype.defaults = extendSection(Table.prototype.defaults, extension[props[i]], true);

                            break;
                    }
                }
            }
        }
    };

    var externalCheck = (document.querySelector('html.external-app')) ? true : false;

    // Extend the table base
    if (!externalCheck) {
        // Load all the standard empire 2 plugins
        _priv.extend([base, sort, filter, responsive, menuButton, selection, changeReturn, error]);
    }
    else {

        _priv.extend([base, sort, filter, responsive, pivot, breakout, menuButton, mobile, selection, error]);
    }

    // Define and Expose the table component to jQeury
    window.$.fn.table = function (options, callback) {

        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        // Loop through all of the discovered tables
        return this.each(function () {

            var id = $(this).attr('id');

            new Table(this, options).init(function(tableConfig) {

                if (window.emp) {
                    emp.reference.tables[tableConfig.id] = tableConfig;
                }

                // Indicate that the table if fully setup.
                tableConfig.$self.trigger('setup.table');

                if (typeof callback === "function") {

                    callback(tableConfig);
                }

            });

        });
    };
});
