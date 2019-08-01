define(['jquery', 'kind', 'cui', 'shortcut', 'store'], function ($, kind, cui, shortcut, store) {
    ///////////////
    // Constants //
    ///////////////

    var VERSION = '0.1.0';

    var CLASSES = {
            toggleLink: 'emp-header-preferences', // Link that the user clicks to open the preferences UI
            modal: 'emp-prefs-modal', // Added to the standard modal element

            // High-level elements
            wrapper: 'emp-prefs-wrapper',

            // Sections and generic containers
            section: 'emp-prefs-section',
            field: 'emp-prefs-field',
            legend: 'emp-prefs-legend',

            // Specific sections
            fontSize: 'emp-prefs-fontsize',
            fontSizeLegend: 'emp-prefs-fontsize-legend',
            fontSizeLegendRight: 'emp-prefs-fontsize-legend-right',
            fontSizeLegendLeft: 'emp-prefs-fontsize-legend-left',
            fontSizeLegendSmallA: 'emp-prefs-fontsize-legend-smallA',
            fontSizeLegendLargeA: 'emp-prefs-fontsize-legend-largeA',

            theme: 'emp-prefs-theme',
            themeItem: 'emp-prefs-theme-item',

            tables: 'emp-prefs-tables',
        };

    // Default user options
    var DEFAULT_GLOBAL_PREFS = {
            fontSize: 14,
            tabsetPinned: false,
            theme: 'teal',
            timestamp: 0, // Unix timestamp (in seconds, not milliseconds)
        };

    var DEFAULT_TABSET_PREFS = {
            pages: {},
        };

    var DEFAULT_PAGE_PREFS = {
            tables: {},
        };

    var DEFAULT_TABLE_PREFS = {
            columns: {},
        };

    // This object is used to validate the preference values to avoid bad values (like a font size of one million or a theme for which we have no style sheet).
    // For example, the font size must be between the `min` and `max` listed below, and the chosen theme must be listed in the array.
    var ACCEPTABLE_VALUES = {
            fontSize: {
                min: 8,
                max: 32,
                standard: [8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32], // List of options that we present to the user. We accept values other than those in this list, although we don't provide a UI to choose any other value.
            },
            theme: [
                'cobalt',
                'eggplant',
                'lilypad',
                'teal',
                'hazel',
                'contrast',
            ],
            tableIndex: {
                min: 0,
                max: 200, // Arbitrary value, but a reasonable one. The idea is to avoid storing `Infinity` or other obviously incorrect values.
            },
            timestamp: {
                min: 1451624400, // A semi-arbitrary date from before preferences were implemented; this one happens to be 01/01/2016
                max: (parseInt((new Date().getTime())/1000, 10) * 3600), // An hour after the page loads, at which point the server session should be invalidated anyway
            }
        };

    // List of theme names formatted for display (capitalized, etc) but not to be used for validation
    // Must match up with `ACCEPTABLE_VALUES.theme`
    var THEME_NAMES = [
            'Cobalt',
            'Eggplant',
            'Lilypad',
            'Teal',
            'Hazel',
            'High Contrast',
        ];

    var SERVER_THROTTLE = 5000; // How long to wait before calling the server after receiving the last local update (in milliseconds)

    var $prefsModal = null;
    var $toggleLink = null;
    var $tabset = $('.emp-tabset');
    var $tabsetPin = $('.emp-tabset-pin');
    var hasBeenInitialized = false;
    var globalUpdateCallbacks = [];
    var pageUpdateCallbacks = [];
    var _pendingGlobalUpdateData = null;
    var _pendingGlobalUpdateTimer = null;
    var _pendingTabsetUpdateData = null;
    var _pendingTabsetUpdateTimer = null;

    /////////////////////////
    // Constructor & setup //
    /////////////////////////

    var Prefs = function (elem, param1, param2) {

        // Store the element upon which the component was called
        this.elem = elem;

        // Create a jQuery version of the element
        this.$self = $(elem);

        // Save off the id
        this.id = $(elem).attr('id');

        // Store the preferences, if they were provided
        this.globalPrefs = param1;
        this.tabsetPrefs = param2;
    };

    Prefs.prototype = {};

    /**
     * Initializes the plugin
     * May be called multiple times
     */
    Prefs.prototype.init = function _init ($elem, globalLocal, tabsetLocal) {

        if (globalLocal === undefined && this.globalPrefs) {
            globalLocal = this.globalPrefs;
        }

        if (tabsetLocal === undefined && this.tabsetPrefs) {
            tabsetLocal = this.tabsetPrefs;
        }

        var global = {};

        var globalPage = false;

        var globalUpdate = false;
        var globalSkipServer = false;
        var globalTimestamp = false;

        if (fwData.context.urls && !fwData.context.urls.errorReport) {

            // Detect Global Preferences in local storage
            if (globalLocal) {
                journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Global Preferences were discovered in localstorage.');
            }
            else {
                journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Global Preferences are missing in localstorage');

                globalLocal = false;
            }

            // Detect Global Prefences in the page framework object
            if (fwData.preferences.global && fwData.preferences.global.data) {

                journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Global Preferences were discovered in framework page object');

                globalPage = fwData.preferences.global.data;
            }
            else {
                journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Global Preferences are missing in framework page object');
            }

            if (!globalLocal && !globalPage) {

                journal.log({type: 'warning', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Global Preferences are missing in framework page object and localStorage. Using defaults!');

                global = $.extend(true, {}, DEFAULT_GLOBAL_PREFS);

                globalUpdate = true;
            }
            else {

                if (globalLocal && !globalPage) {

                    journal.log({type: 'warning', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Global Preferences are only in localstorage. Update server!');

                    global = globalLocal;

                    globalUpdate = true;
                }
                else if (!globalLocal && globalPage) {

                    journal.log({type: 'warning', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Global Preferences are only in framwork page object. Update localStorage only!');

                    global = globalPage;

                    globalUpdate = true;
                    globalSkipServer = true;
                    globalTimestamp = globalPage.timestamp;
                }
                else {

                    journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Global Preferences exist in localstorage and framework page object.');

                    if (globalLocal.timestamp !== globalPage.timestamp) {

                        journal.log({type: 'warning', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Global Preferences timestamp mis-match; Local:', globalLocal.timestamp, 'Global:', globalPage.timestamp, '.');

                        if (globalLocal.timestamp > globalPage.timestamp) {

                            journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Global Preferences in localstorage are more up-to-date. Updating server.');

                            global = globalLocal;

                            globalUpdate = true;

                            // Prevent update on localhost
                            if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
                                globalSkipServer = true;
                            }
                        }
                        else {

                            journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Global Preferences in framework page are more up-to-date. Updating localstorage only!');

                            global = globalPage;

                            globalUpdate = true;
                            globalSkipServer = true;
                            globalTimestamp = globalPage.timestamp;
                        }

                    }
                    else {
                        journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Global Preferences timestamps match. No update required.');

                        global = globalLocal;
                    }
                }
            }

            global = _validateGlobalPrefs(global);

            if (globalUpdate) {

                _updateGlobalPrefsStore(global, globalSkipServer);
            }

            // Save off the final preferences
            this.globalPrefs = global;

        }
        else {

            this.globalPrefs = _validateGlobalPrefs(fwData.preferences.global.data);
        }

        // ================
        // TABSET
        // ================

        var tabset = {};
        var tabsetSkipServer = false;
        var tabsetUpdate = false;
        var tabsetTimestamp = false;

        var tabsetFWPage = false;
        var tabsetFWScreen = false;
        var tabsetLocalTabset = false;
        var tabsetLocalScreen = false;

        if (fwData.context.urls.errorReport) {

            // Find all localstorage information for the tabset
            if (tabsetLocal === false || tabsetLocal === undefined) {

                journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Tabset preferences are missing from in localStorage.');

                tabsetLocal = false;
            }
            else {

                journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Tabset preferences were discovered in localStorage.');

                var tabsetIndex = -1;

                tabsetLocal.some(function(tabset, index) {

                    if (tabset.id === fwData.context.tabset.id) {
                        tabsetIndex = index;
                    }

                });

                if (tabsetIndex !== -1) {

                    journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Tabset preferences in localStorage has a reference for this tabset.');

                    tabsetLocalTabset = tabsetLocal[tabsetIndex].prefs;

                    // Check for the page
                    if (tabsetLocalTabset && tabsetLocalTabset.pages && tabsetLocalTabset.pages.hasOwnProperty(fwData.context.screen.id)) {

                        journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Tabset preferences in localStorage has a reference for this screen in the tabset.');

                        tabsetLocalScreen = tabsetLocalTabset.pages[fwData.context.screen.id];
                    }
                    else {

                        journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Tabset preferences in localStorage do not have a reference for this page in the tabset.');
                    }

                }
                else {

                    journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Tabset preferences in localStorage do not have a reference for this tabset.');
                }
            }

            // Find all page level information for the tabset
            if (fwData.preferences.tabset && fwData.preferences.tabset.data && fwData.preferences.tabset.data.pages) {

                journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Tabset preferences were part of the framework page object.');

                tabsetFWPage = fwData.preferences.tabset.data;

                if (tabsetFWPage.pages[fwData.context.screen.id]) {

                    journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Tabset preferences found a screen reference in the framework page object.');

                    tabsetFWScreen = tabsetFWPage.pages[fwData.context.screen.id];

                }
                else {
                    journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Tabset preferences missing screen reference in the framework page object.');
                }
            }
            else {

                journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Tabset preferences are missing from framework page object.');
            }

            // Preform the high-level check for local or page level structure
            if (!tabsetLocal && !tabsetFWPage) {

                journal.log({type: 'warning', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Tabset preferences are missing from framework page and localstorage, creating default object.');

                tabset = $.extend(true, {}, DEFAULT_TABSET_PREFS);
            }
            else {

                // If localstorage doesnt exist, but the page level does
                if (!tabsetLocalTabset && tabsetFWPage) {

                    journal.log({type: 'warning', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Tabset preferences from page are being used to update missing localStorage. Skipping Server update!');

                    tabset = tabsetFWPage;

                    tabsetUpdate = true;
                    tabsetSkipServer = true;
                    tabsetTimestamp = tabsetFWPage.timestamp;

                }
                // If localstorage exists and the page level doesnt
                else if (tabsetLocalTabset && !tabsetFWPage) {

                    journal.log({type: 'warning', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Tabset preferences from localstorage exist, but we have none at the framework page. Updating Server!');

                    tabset = tabsetLocalTabset;
                    tabsetUpdate = true;

                }
                // We have both local storage and framework page definition
                else if (tabsetLocalTabset && tabsetFWPage) {

                    journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Tabset preferences exist in both localStorage and the frawmework page');

                    if (tabsetLocalTabset.timestamp !== tabsetFWPage.timestamp) {

                        journal.log({type: 'warning', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Tabset Preferences timestamp mis-match; Local:', tabsetLocalTabset.timestamp, 'Global:', tabsetFWPage.timestamp, '.');

                        if (tabsetLocalTabset.timestamp > tabsetFWPage.timestamp) {

                            journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Tabset preferences in localStorage are more up-to-date than the page. Updating Server!');

                            tabset = tabsetLocalTabset;
                            tabsetUpdate = true;
                        }
                        else if (tabsetFWPage.timestamp > tabsetLocalTabset.timestamp) {

                            journal.log({type: 'warning', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Tabset preferences the page are more up-to-date than the localStorage. Skipping Server update!');

                            tabset = tabsetFWPage;

                            tabsetUpdate = true;
                            tabsetSkipServer = true;
                            tabsetTimestamp = tabsetFWPage.timestamp;
                        }
                    }
                    else {

                        journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'preferences', func: 'init'}, 'Tabset preferences timestamps match. No update required.');
                    }
                }
            }

            tabset = _validateTabsetPrefs(tabset);

            if (tabsetUpdate) {

                _updateTabsetPrefsStore(tabset, tabsetSkipServer, tabsetTimestamp);
            }

            this.tabsetPrefs = tabset;

            //tabset = this.tabsetPrefs;

            // Make sure we don't run this code more than once. This plugin is called many times, e.g. when updating favorites.
            if (!hasBeenInitialized) {
                hasBeenInitialized = true;

                // Pre-load the modal plugin
                cui.load('modal');

                $toggleLink = $('.' + CLASSES.toggleLink);

                // Wait for clicks on the toggle link
                $toggleLink.on('click', {globalPrefs: global, tabsetPrefs: tabset}, _handleToggleClick);

                //Register the keyboard shortcut
                shortcut.register({
                    keys: 'ctrl+,',
                    callback: function _prefs_shortcut () { _handleToggleClick({data: {globalPrefs: global, tabsetPrefs: tabset}}); },
                    description: 'Display preferences',
                    type: 'keydown',
                });
            }

        }
        else {

            this.tabsetPrefs = _validateTabsetPrefs(fwData.preferences.tabset.data);

        }

        _applyGlobalPreferences(this.globalPrefs);
        _applyTabsetPreferences(this.tabsetPrefs);

        return this;
    };

    /////////////////////
    // Private methods //
    /////////////////////

    /**
     * Applies current global preferences to the user interface
     *
     * @param   {Object}  prefs  Preferences instance
     */
    var _applyGlobalPreferences = function _applyGlobalPreferences (prefs) {

        journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'preferences', func: '_applyGlobalPreferences'}, 'Global Preferences Applied!');

        _applyFontSize(prefs, undefined, false);
        _applyTheme(prefs, undefined, false);
        _applyTabsetPinning(prefs);
    };

    /**
     * Applies current tabset preferences to the user interface
     *
     * @param   {Object}  prefs  Preferences instance
     */
    var _applyTabsetPreferences = function _applyTabsetPreferences (prefs) {
        // There's nothing to do here, really. Table prefs are handled by the responsive table plugin, and we don't currently store any other tabset- or page-level prefs.

        journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'preferences', func: '_applyTabsetPreferences'}, 'Tabset Preferences Applied!');
    };

    /**
     * Sets the tabset to be open or closed based on pinning preference
     */
    var _applyTabsetPinning = function _applyTabsetPinning (prefs) {

        var isTabsetCurrentlyOpen = $tabset.hasClass('emp-selected');
        var isTabsetCurrentlyPinned = $tabsetPin.hasClass('emp-selected');

        // Preference is 'open' and current state is 'closed'
        if (prefs.tabsetPinned && (!isTabsetCurrentlyPinned || !isTabsetCurrentlyOpen)) {
            emp.tabset.pin();
        }
        // Preference is 'closed' and current state is 'open'
        else if (!prefs.tabsetPinned && isTabsetCurrentlyPinned) {
            emp.tabset.unpin();
        }
    };

    /**
     * Applies a font size and updates the preferences
     *
     * @param   {Object}  globalPrefs  Preferences object
     * @param   {Mixed}   newSize      Font size (preferably an integer, otherwise a string that can be parsed)
     *
     * @return  {Mixed}                Result of updating the preferences object
     */
    var _applyFontSize = function _applyFontSize (globalPrefs, newSize, apply, skipEvt) {
        // Get size from prefs object if it wasn't sent directly
        if (typeof newSize === 'undefined') {
            newSize = globalPrefs.fontSize;
        }

        // Check whether the size is a string that's actually a number
        if (typeof newSize === 'string') {
            newSize = parseInt(newSize, 10);
        }

        // Make sure it's a number
        if (isNaN(newSize) || kind(newSize, true) !== 'integer') {
            journal.log({type: 'error', owner: 'UI', module: 'preferences', func: '_applyFontSize'}, 'Cannot update font size, second parameter should be an integer but instead it is of type "' + (typeof newSize) + '": ', newSize);

            return false;
        }

        // Validate the value

        if (newSize < ACCEPTABLE_VALUES.fontSize.min) {
            journal.log({type: 'error', owner: 'UI', module: 'preferences', func: '_applyFontSize'}, 'Cannot update font size because it is too small: "' + newSize + '"');

            return false;
        }

        if (newSize > ACCEPTABLE_VALUES.fontSize.max) {
            journal.log({type: 'error', owner: 'UI', module: 'preferences', func: '_applyFontSize'}, 'Cannot update font size because it is too large: "' + newSize + '"');

            return false;
        }

        // Update the class on the root element
        ACCEPTABLE_VALUES.fontSize.standard.forEach(function (size) {
            if (size === newSize) {
                document.documentElement.classList.add('emp-fontsize-' + size);
                globalPrefs.fontSize = newSize;
            }
            else {
                document.documentElement.classList.remove('emp-fontsize-' + size);
            }
        });

        if (!apply) {
            return globalPrefs;
        }
        else {
            return _updateGlobalPrefsStore(globalPrefs, false);
        }
    };

    /**
     * Applies a theme and updates the preferences
     *
     * @param   {Object}  globalPrefs  Preferences object
     * @param   {String}  newTheme     Name of the theme
     *
     * @return  {Mixed}                Result of updating the preferences object
     */
    var _applyTheme = function _applyTheme (globalPrefs, newTheme, apply) {

        // Get theme from prefs object if it wasn't sent directly
        if (typeof newTheme === 'undefined') {
            newTheme = globalPrefs.theme;
        }

        // Update class
        ACCEPTABLE_VALUES.theme.forEach(function (theme) {
            // Add this theme's class
            if (theme === newTheme) {
                document.documentElement.classList.add('theme-' + theme);
                globalPrefs.theme = newTheme;
            }
            // Remove any other theme class
            else {
                document.documentElement.classList.remove('theme-' + theme);
            }
        });

        if (!apply) {
            return globalPrefs;
        }
        else {
            return _updateGlobalPrefsStore(globalPrefs, false);
        }
    };

    /**
     * Clears all tabset preferences
     *
     * @param   {Object}  tabsetPrefs  Preferences
     *
     * @return  {Mixed}              Success/failure
     */
    var _clearAllTabsetPrefs = function _clearAllTabsetPrefs () {
        var returnVal = true;

        // Clear the local copy for this tabset
        if (store.get('tabsetPrefs')) {
            store.set('tabsetPrefs', undefined);
        }

        // Update server
        //if (_pendingGlobalUpdateData && /\.gov$/.test(document.location.hostname)) {
        //if (_pendingGlobalUpdateData) {
            if (fwData.preferences.tabset.url && fwData.preferences.tabset.url.delete) {


                $.ajax({
                    url: fwData.preferences.tabset.delete,
                    method: 'POST',
                    cache: false,
                    data: {
                        data: JSON.stringify({})
                    },
                    done: function _clearAllTabsetPrefs_ajax_done (jqXHR, textStatus) {

                        if (jqXHR.status && jqXHR.status === "status") {

                            _processUpdateCallbacks(globalUpdateCallbacks, true, jqXHR);
                        }
                        else {

                            journal.log({type: 'error', owner: 'UI', module: 'preferences', submodule: '_clearAllTabsetPrefs', func: 'ajax_fail'}, 'Tabset preferences failed to delete on the server.\n`textStatus` = ', textStatus, '\n`jqXHR` = ', jqXHR);
                            _processUpdateCallbacks(globalUpdateCallbacks, true, jqXHR);
                        }

                    },
                    fail: function _clearAllTabsetPrefs_ajax_fail (jqXHR, textStatus) {
                        journal.log({type: 'error', owner: 'UI', module: 'preferences', submodule: '_clearAllTabsetPrefs', func: 'ajax_fail'}, 'Tabset preferences failed to delete on the server.\n`textStatus` = ', textStatus, '\n`jqXHR` = ', jqXHR);
                        _processUpdateCallbacks(globalUpdateCallbacks, false, jqXHR);
                    },
                });
            }
            else {
                journal.log({ type: 'error', owner: 'UI', module: 'preferences', submodule: '_clearAllTabsetPrefs' }, 'Could not initiate an ajax request because `fwData.preferences.tabset.url.delete` is not defined.\n`fwData.preferences.tabset` = ', fwData.preferences.tabset);
                returnVal = false;
            }
        //}

        return returnVal;
    };

    /**
     * Creates the user interface for viewing and updating the preferences
     *
     * @param   {Object}  prefs  Preferences object
     *
     * @return  {jQuery}         Modal element
     */
    var _generateUI = function _generateUI (globalPrefs, tabsetPrefs) {
        var $wrapper;
        var $header;
        var $section;
        var $sectionHeader;
        var $field;
        var $label;
        var $input;
        var $legend;
        var id;

        // Outer container for all preference sections
        $wrapper = $('<div/>')
                    .addClass(CLASSES.wrapper);

        $header = $('<h1/>')
                    .text('User Preferences');

        $wrapper.append($header);

        // Font size

        $section = $('<div/>')
                        .addClass(CLASSES.section)
                        .addClass(CLASSES.fontSize);

        $sectionHeader = $('<h2/>')
                            .text('Font Size');

        $section.append($sectionHeader);

        $field = $('<div/>');
        $label = $('<label/>');
        $input = $('<input/>');
        id = 'emp-pref-font-size';

        $label
            .attr('for', id)
            .addClass('cui-hide-from-screen')
            .text('Font size');

        $input
            .attr('type', 'range')
            .attr('id', id)
            .attr('value', globalPrefs.fontSize)
            .attr('step', 2)
            .attr('min', ACCEPTABLE_VALUES.fontSize.min)
            .attr('max', ACCEPTABLE_VALUES.fontSize.max)
            .on('change', {globalPrefs: globalPrefs}, _onFontSizeChange);

        // Put all of the pieces of the field together
        $field
            .addClass(CLASSES.field)
            .append($label)
            .append($input);

        // Add field to its section
        $section.append($field);

        // Legend
        $legend = $('<div/>');

        (function () {
            var $smallA = $('<div/>');
            var $largeA = $('<div/>');
            var $right = $('<div/>');
            var $left = $('<div/>');

            $smallA
                .addClass(CLASSES.fontSizeLegendSmallA)
                .text('Aa');

            $largeA
                .addClass(CLASSES.fontSizeLegendLargeA)
                .text('Aa');

            $right
                .addClass(CLASSES.fontSizeLegend)
                .addClass(CLASSES.fontSizeLegendRight);

            $left
                .addClass(CLASSES.fontSizeLegend)
                .addClass(CLASSES.fontSizeLegendLeft);

            $legend
                .addClass(CLASSES.legend)
                .append($smallA)
                .append($right)
                .append($left)
                .append($largeA);
        }());

        // Add legend to the section
        $section.append($legend);

        // Add section to the outer container
        $wrapper.append($section);

        // Theme

        $section = $('<div/>')
                        .addClass(CLASSES.section)
                        .addClass(CLASSES.theme);

        $sectionHeader = $('<h2/>')
                            .text('Theme');

        $section.append($sectionHeader);

        $field = $('<fieldset/>');
        $legend = $('<legend/>');
        $fields = $('<ul/>');

        ACCEPTABLE_VALUES.theme.forEach(function (theme, index) {
            var $item = $('<li/>');
            var name = 'emp-pref-theme';
            var id = 'emp-pref-theme-' + theme;

            $input = $('<input/>')
                        .attr('type', 'radio')
                        .attr('id', id)
                        .attr('name', name)
                        .attr('value', theme)
                        .on('change', {globalPrefs: globalPrefs}, _onThemeChange);

            if (globalPrefs.theme === theme) {
                $input.attr('checked', 'checked');
            }

            $label = $('<label/>')
                        .attr('for', id)
                        .text(THEME_NAMES[index])
                        .addClass(CLASSES.themeItem);

            $item
                .append($input)
                .append($label);

            $fields.append($item);
        });

        $legend.text('Choose a color scheme');

        // Put all of the pieces of the fieldset together
        $field
            .addClass(CLASSES.field)
            .append($legend)
            .append($fields);

        // Add field to its section
        $section.append($field);

        // Add section to the outer container
        $wrapper.append($section);

        // Tables

        $section = $('<div/>')
                        .addClass(CLASSES.section)
                        .addClass(CLASSES.tables);

        $sectionHeader = $('<h2/>')
                            .text('Tables');

        $section.append($sectionHeader);

        $field = $('<div/>')
            .addClass(CLASSES.field)
            .append(
                $('<p/>')
                    .html('When you select which table columns to display or hide your choices can be saved. Those selections apply only to that specific table on that specific screen.')
            )
            .append(
                $('<p/>')
                    .html('You may revert your selections to restore tables to their default view. This will apply to <strong>all</strong> tables on <strong>all</strong> screens in <strong>all</strong> tabsets.')
            )
            .append(
                $('<button/>', {
                        'id': 'emp-prefs-tables-button',
                    })
                    .text('Revert all tables')
                    .on('click', _onTableRevertClick)
            );

        // Add field to its section
        $section.append($field);

        // Add section to the outer container
        $wrapper.append($section);

        // Footer
        $wrapper.append(
                        $('<footer/>')
                            .text('Preferences are saved automatically')
                    );

        // Create modal
        $prefsModal = $.modal({
            html: $wrapper,
            display: {
                width: '90%',
                height: 'auto',
                className: CLASSES.modal,
            },
            overlay: {
                opacity: 0,
            },
            hideOnEscape: true,
            focusOnHide: $toggleLink,
        });

        return $prefsModal;
    };

    ///////////////////////////////////
    // Preferences object management //
    ///////////////////////////////////

    /**
     * Updates the global preferences in local storage and requests a future server update
     *
     * @param   {Object}   globalPrefs  The preferences object to be stored
     * @param   {Boolean}  skipServer   Whether to skip the server update and only store locally
     *
     * @return  {Object}                The preferences object
     */
    var _updateGlobalPrefsStore = function _updateGlobalPrefsStore (globalPrefs, skipServer, timestamp) {

        if (!timestamp) {
            timestamp = parseInt((new Date().getTime())/1000, 10);
        }

        // Update the local copy in memory
        globalPrefs.timestamp = timestamp;

        // Update local storage in case the user leaves this page before an ajax request is made
        store.set('globalPrefs', globalPrefs);

        // Save this data so it can be sent to the server later
        // If `_pendingGlobalUpdateData` was already set we want to replace it so only the most recent data is used
        _pendingGlobalUpdateData = globalPrefs;

        // Reset the timer
        // We want to wait a full second after the last update to the data store
        clearTimeout(_pendingGlobalUpdateTimer);
        _pendingGlobalUpdateTimer = null;

        if (!skipServer) {

            if (window.location.host !== "localhost:8888") {

                // Push the update in one second
                _pendingGlobalUpdateTimer = setTimeout(_updateGlobalPrefsToServer, SERVER_THROTTLE);
            }
            else {

                journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'preferences', func: '_updateGlobalPrefsStore'}, 'Global Preference server update skipped on UI localhosts');
            }

        }
        else {

            journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'preferences', func: '_updateGlobalPrefsStore'}, 'Global Preference server update skipped.');
        }

        return _pendingGlobalUpdateData;
    };

    /**
     * Updates the tabset preferences in local storage and request a future update to the server
     *
     * @param   {Object}   tabsetPrefs  The preferences object to be stored
     * @param   {Boolean}  skipServer   Whether to skip the server update and only store locally
     *
     * @return  {Object}                The preferences object
     */
    var _updateTabsetPrefsStore = function _updateTabsetPrefsStore (tabsetPrefs, skipServer, timestamp) {

        var localStore;
        var existingStoreIndex = -1;

        // Update the local copy in memory
        if (!timestamp) {
            timestamp = parseInt((new Date().getTime())/1000, 10);
        }

        // Retrieve local storage
        localStore = store.get('tabsetPrefs');

        // Look for an existing object for this tabset
        if (localStore) {
            localStore.some(function _updateTabsetPrefsStore_localStore_loop (tabset, i) {
                if (tabset.id === fwData.context.tabset.id) {
                    existingStoreIndex = i;

                    // Quit the loop
                    return true;
                }
            });
        }

        // Add this tabset to the store
        if (existingStoreIndex === -1) {

            // If nothing was in `localStorage` this var wouldn't be defined yet
            if (!localStore) {
                localStore = [];
            }

            var newTabsetObject = {
                id: fwData.context.tabset.id,
                prefs:{
                    pages: {}
                }
            };

            newTabsetObject.prefs.pages = tabsetPrefs.pages;

            newTabsetObject.prefs.timestamp = timestamp;

            localStore.push(newTabsetObject);
        }
        // Update this tabset's existing store
        else {

            var currentLocalStore = localStore[existingStoreIndex];

            if (tabsetPrefs.pages) {

                var update = false;

                if (currentLocalStore.prefs) {

                    update = $.extend(true, currentLocalStore.prefs, tabsetPrefs);
                }
                else {

                    update = tabsetPrefs;
                }

                if (update) {

                    localStore[existingStoreIndex].prefs = update;

                    tabsetPrefs.timestamp = timestamp;
                }
                else {

                    journal.log({type: 'error', owner: 'UI', module: 'emp', submodule: 'preferences', func: '_updateTabsetPrefsStore'}, 'Tabset Preferences update variable was false!');
                }

            }
            else {
                journal.log({type: 'error', owner: 'UI', module: 'emp', submodule: 'preferences', func: '_updateTabsetPrefsStore'}, 'Tabset Preferences set but pages object is missing');
            }

        }

        // Update local storage in case the user leaves this page before an ajax request is made
        store.set('tabsetPrefs', localStore);

        // Save this data so it can be sent to the server later
        // If `_pendingTabsetUpdateData` was already set we want to replace it so only the most recent data is used
        _pendingTabsetUpdateData = tabsetPrefs;

        // Reset the timer
        // We want to wait a full second after the last update to the data store
        clearTimeout(_pendingTabsetUpdateTimer);
        _pendingTabsetUpdateTimer = null;

        if (!skipServer) {

            if (window.location.host !== "localhost:8888") {

                // Push the update in one second
                _pendingTabsetUpdateTimer = setTimeout(_updateTabsetPrefsToServer, SERVER_THROTTLE);
            }
            else {

                journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'preferences', func: '_updateTabsetPrefsStore'}, 'Tabset Preferences server update skipped on UI localhosts');
            }
        }

        return _pendingTabsetUpdateData;
    };

    /**
     * Updates the global preferences on the server
     *
     * @return  {Boolean}  Whether an ajax request was initiated
     */
    var _updateGlobalPrefsToServer = function _updateGlobalPrefsToServer () {
        var returnVal = true;

        // Update server
        //if (_pendingGlobalUpdateData && /\.gov$/.test(document.location.hostname)) {
        if (_pendingGlobalUpdateData) {
            if (fwData.preferences.global.url && fwData.preferences.global.url.update) {

                //_pendingGlobalUpdateData.timestamp = Math.floor(new Date().getTime() / 1000);

                $.ajax({
                    url: fwData.preferences.global.url.update,
                    method: 'POST',
                    cache: false,
                    data: {
                        data: JSON.stringify(_pendingGlobalUpdateData)
                    },
                    done: function _updateGlobalPrefsToServer_ajax_done (jqXHR, textStatus) {

                        if (jqXHR.status && jqXHR.status === "status") {

                            _processUpdateCallbacks(globalUpdateCallbacks, true, jqXHR);
                        }
                        else {

                            journal.log({type: 'error', owner: 'UI', module: 'preferences', submodule: '_updateGlobalPrefsToServer', func: 'ajax_fail'}, 'Global preferences failed to update on the server.\n`textStatus` = ', textStatus, '\n`jqXHR` = ', jqXHR);
                            _processUpdateCallbacks(globalUpdateCallbacks, false, jqXHR);
                        }
                    },
                    fail: function _updateGlobalPrefsToServer_ajax_fail (jqXHR, textStatus) {
                        journal.log({type: 'error', owner: 'UI', module: 'preferences', submodule: '_updateGlobalPrefsToServer', func: 'ajax_fail'}, 'Global preferences failed to update on the server.\n`textStatus` = ', textStatus, '\n`jqXHR` = ', jqXHR);
                        _processUpdateCallbacks(globalUpdateCallbacks, false, jqXHR);
                    },
                });
            }
            else {
                journal.log({type: 'error', owner: 'UI', module: 'preferences', submodule: '_updateGlobalPrefsToServer'}, 'Could not initiate an ajax request because `fwData.globalPrefs.url.update` is not defined. `fwData.globalPrefs` = ', fwData.globalPrefs);
                returnVal = false;
            }
        }

        // Clear the pending data and timer
        _pendingGlobalUpdateData = null;
        clearTimeout(_pendingGlobalUpdateTimer);
        _pendingGlobalUpdateTimer = null;

        return returnVal;
    };

    /**
     * Updates the tabset preferences in both local storage and on the server
     *
     * @return  {Boolean}  Whether an ajax request was initiated
     */
    var _updateTabsetPrefsToServer = function _updateTabsetPrefsToServer () {
        var returnVal = true;

        //if (_pendingTabsetUpdateData && /\.gov$/.test(document.location.hostname)) {
        if (_pendingTabsetUpdateData) {

            if (fwData.preferences.tabset.url && fwData.preferences.tabset.url.update) {

                //_pendingTabsetUpdateData.timestamp = Math.floor(new Date().getTime() / 1000);

                $.ajax({
                    url: fwData.preferences.tabset.url.update,
                    method: 'POST',
                    cache: false,
                    data: {
                        data: JSON.stringify(_pendingTabsetUpdateData),
                        tabsetId: encodeURIComponent(fwData.tabset.id)
                    },
                    done: function _updateTabsetPrefsToServer_ajax_done (jqXHR, textStatus) {

                        if (jqXHR.status && jqXHR.status === "status") {

                            _processUpdateCallbacks(globalUpdateCallbacks, true, jqXHR);
                        }
                        else {

                            journal.log({type: 'error', owner: 'UI', module: 'preferences', submodule: '_updateTabsetPrefsToServer', func: 'ajax_fail'}, 'Tabset preferences failed to update on the server.\n`textStatus` = ', textStatus, '\n`jqXHR` = ', jqXHR);
                            _processUpdateCallbacks(globalUpdateCallbacks, false, jqXHR);
                        }
                    },
                    fail: function _updateTabsetPrefsToServer_ajax_fail (jqXHR, textStatus) {
                        journal.log({type: 'error', owner: 'UI', module: 'preferences', submodule: '_updateTabsetPrefsToServer', func: 'ajax_fail'}, 'Tabset preferences failed to update on the server.\n`textStatus` = ', textStatus, '\n`jqXHR` = ', jqXHR);
                        _processUpdateCallbacks(pageUpdateCallbacks, false, jqXHR);
                    },
                });
            }
            else {
                journal.log({type: 'error', owner: 'UI', module: 'preferences', submodule: '_updateTabsetPrefsToServer'}, 'Could not initiate an ajax request because `fwData.tabsetPrefs.url.update` is not defined. `fwData.tabsetPrefs` = ', fwData.tabsetPrefs);
                returnVal = false;
            }
        }

        // Clear the pending data and timer
        _pendingTabsetUpdateData = null;
        clearTimeout(_pendingTabsetUpdateTimer);
        _pendingTabsetUpdateTimer = null;

        return returnVal;
    };

    /**
     * Call all registered callback functions, i.e. when an ajax request has completed
     *
     * Callbacks are provided the following arguments:
     *     1) a boolean denoting whether the ajax request succeeded
     *     2) an array containing the arguments that the caller sent to this plugin's update function
     *     3) the jQuery XHR object from the ajax response (see: http://api.jquery.com/jQuery.ajax/#jqXHR)
     *
     * @param   {Array}    callbackQueue  An array of objects containing information about the callbacks
     * @param   {Boolean}  isSuccess      Whether the ajax request succeeded
     * @param   {Object}   jqXHR          jQuery XHR object
     */
    var _processUpdateCallbacks = function _processUpdateCallbacks (callbackQueue, isSuccess, jqXHR) {

        // Call all queued callback functions
        callbackQueue.forEach(function (item) {
            item.func(isSuccess, item.args, jqXHR);
        });

        // Clear the queue
        callbackQueue = [];
    };

    /**
     * Ensures a global preferences object contains all of the correct properties with valid values and types
     *
     * @param   {Object}  globalPrefs  Preferences object
     *
     * @return  {Object}               The updated object
     */
    var _validateGlobalPrefs = function _validateGlobalPrefs (globalPrefs) {

        // Manually check each property:

        // Font size

        // Verify its existence
        if (!globalPrefs.hasOwnProperty('fontSize')) {
            globalPrefs.fontSize = DEFAULT_GLOBAL_PREFS.fontSize;
        }
        else {
            // The value should be an integer, but if we have a string try converting it to a number first
            if (typeof globalPrefs.fontSize !== 'string') {
                globalPrefs.fontSize = parseInt(globalPrefs.fontSize, 10);
            }

            if (kind(globalPrefs.fontSize, true) !== 'integer') {
                console.warn('UI [preferences] Font size was the wrong type: "' + globalPrefs.fontSize + '"');
                globalPrefs.fontSize = DEFAULT_GLOBAL_PREFS.fontSize;
            }
            // Verify that the value is within the acceptable range
            else if (globalPrefs.fontSize < ACCEPTABLE_VALUES.fontSize.min || globalPrefs.fontSize > ACCEPTABLE_VALUES.fontSize.max) {
                console.warn('UI [preferences] Font size was outside the allowed range: "' + globalPrefs.fontSize + '"');
                globalPrefs.fontSize = DEFAULT_GLOBAL_PREFS.fontSize;
            }
        }

        // Theme

        // Verify its existence
        if (!globalPrefs.hasOwnProperty('theme') || !globalPrefs.theme || typeof globalPrefs.theme !== 'string') {
            console.warn('UI [preferences] Theme was unset or the wrong type: "', globalPrefs.theme, '"');
            globalPrefs.theme = DEFAULT_GLOBAL_PREFS.theme;
        }
        // Verify the validity of the value
        else if (ACCEPTABLE_VALUES.theme.indexOf(globalPrefs.theme) === -1) {
            // Check if the name was valid but the case was wrong
            if (ACCEPTABLE_VALUES.theme.indexOf(globalPrefs.theme.toLowerCase()) !== -1) {
                globalPrefs.theme = globalPrefs.theme.toLowerCase();
            }
            else {
                console.warn('UI [preferences] Theme was invalid: "', globalPrefs.theme, '"');
                globalPrefs.theme = DEFAULT_GLOBAL_PREFS.theme;
            }
        }

        // Tabset pinning
        if (!globalPrefs.hasOwnProperty('tabsetPinned') || typeof globalPrefs.tabsetPinned !== 'boolean') {
            console.warn('UI [preferences] tabsetPinned was unset or the wrong type: "', globalPrefs.tabsetPinned, '"');
            globalPrefs.tabsetPinned = DEFAULT_GLOBAL_PREFS.tabsetPinned;
        }

        // Time stamp

        // Verify the timestamp value. It must be an integer and within the acceptable range.
        if (!globalPrefs.hasOwnProperty('timestamp') || kind(globalPrefs.timestamp, true) !== 'integer') {
            console.warn('UI [preferences] timestamp object was unset or the wrong type: "' + globalPrefs.timestamp + '"');
            globalPrefs.timestamp = parseInt((new Date().getTime())/1000, 10);
        }

        return globalPrefs;
    };

    /**
     * Ensures a tabset preferences object contains all of the correct properties with valid values and types
     *
     * @param   {Object}  tabsetPrefs  Preferences object
     *
     * @return  {Object}               The updated object
     */
    var _validateTabsetPrefs = function _validateTabsetPrefs (tabsetPrefs) {

        var tableIDsToDelete = [];
        var tablesToKeep = {};
        var currentTabsetId = '';
        var currentScreenId = '';
        var localStore;

        // Get current tabset and page IDs
        currentTabsetId = fwData.context.tabset.id;
        currentScreenId = fwData.context.screen.id;

        // Continue validating only if sure this page has an object
        if (fwData.preferences.tabset.pages && fwData.preferences.tabset.pages.hasOwnProperty(fwData.context.screen.id)) {

            // Tables
            if (fwData.preferences.tabset.pages[fwData.context.screen.id].tables) {

                // Verify each tables's validity
                $.each(fwData.preferences.tabset.pages[fwData.context.screen.id].tables, function (tableId, tablePref) {
                    // ID
                    // Make sure it's a real ID (e.g. it contains letters) and not a numeric index inserted by jQuery. The latter could happen if the object was not properly stored with a table ID as its property name (i.e. a simply object was added by itself).
                    if (!tableId || !/[a-zA-Z]+/.test(tableId)) {
                        journal.log({type: 'error', owner: 'UI', module: 'preferences', func: '_validateTabsetPrefs'}, 'Invalid table ID: "', tableId, '". The preferences for the table with ID "' + tableId + '" will be removed.');
                        tableIDsToDelete.push(tableId);

                        // Skip to the next table in the array
                        return true;
                    }

                    // Columns
                    // While this property does not necessarily need to exist, it is currently the only table preference we store. Therefore, if it is missing we just erase the entire table's preferences to avoid storing empty data.
                    if (!tablePref.hasOwnProperty('columns') /*|| kind(tablePref.columns) !== 'object'*/) {
                        journal.log({type: 'error', owner: 'UI', module: 'preferences', func: '_validateTabsetPrefs'}, 'Table object has missing or invalid `columns` property: "', tablePref.columns, '". The preferences for the table with ID "' + tableId + '" will be removed.');
                        tableIDsToDelete.push(tableId);

                        // Skip to the next table in the array
                        return true;
                    }

                    // Visible columns
                    // This does not need to be present, but if it is defined then it must be an array
                    if (tablePref.columns.hasOwnProperty('visible') && kind(tablePref.columns.visible) !== 'array') {
                        journal.log({type: 'error', owner: 'UI', module: 'preferences', func: '_validateTabsetPrefs'}, 'Table object has a `visible` property which is not an array: "', tablePref.columns.visible, '". The preferences for the table with ID "' + tableId + '" will be removed.');
                        tableIDsToDelete.push(tableId);

                        // Skip to the next table in the array
                        return true;
                    }

                    // Hidden columns
                    // This does not need to be present, but if it is defined then it must be an array
                    if (tablePref.columns.hasOwnProperty('hidden') && kind(tablePref.columns.hidden) !== 'array') {
                        journal.log({type: 'error', owner: 'UI', module: 'preferences', func: '_validateTabsetPrefs'}, 'Table object has a `hidden` property which is not an array: "', tablePref.columns.hidden, '". The preferences for the table with ID "' + tableId + '" will be removed.');
                        tableIDsToDelete.push(tableId);

                        // Skip to the next table in the array
                        return true;
                    }

                    // Check that both arrays are not empty
                    // While empty arrays are valid, it means we're not storing any real data so we might as well clear out the entire table preference.
                    if (tablePref.columns.hasOwnProperty('visible') && tablePref.columns.hasOwnProperty('hidden') && tablePref.columns.visible.length === 0 && tablePref.columns.hidden.length === 0) {
                        // An empty array is not invalid, however there's no reason to keep the object in the user's preferences
                        journal.log({type: 'warn', owner: 'UI', module: 'preferences', func: '_validateTabsetPrefs'}, 'Both columns arrays for table "' + tableId + '" are empty so there is no need to store it. The preferences for the table with ID "' + tableId + '" will be removed.');
                        tableIDsToDelete.push(tableId);

                        // Skip to the next table in the array
                        return true;
                    }

                    // Check each column value:

                    // Visible columns
                    if (tablePref.columns.hasOwnProperty('visible')) {
                        $.each(tablePref.columns.visible, function (arrayIndex, colIndex) {
                            if (kind(colIndex, true) !== 'integer' || colIndex < ACCEPTABLE_VALUES.tableIndex.min || colIndex > ACCEPTABLE_VALUES.tableIndex.max) {
                                // Remove the value from the array
                                journal.log({type: 'error', owner: 'UI', module: 'preferences', func: '_validateTabsetPrefs'}, 'Invalid visible table column index for table with ID "' + tableId + '": ', colIndex, '. This index will be removed from the array.');
                                tablePref.columns.visible.splice(arrayIndex, 1);
                            }
                        });
                    }

                    // Hidden columns
                    if (tablePref.columns.hasOwnProperty('hidden')) {
                        $.each(tablePref.columns.hidden, function (arrayIndex, colIndex) {
                            if (kind(colIndex, true) !== 'integer' || colIndex < ACCEPTABLE_VALUES.tableIndex.min || colIndex > ACCEPTABLE_VALUES.tableIndex.max) {
                                // Remove the value from the array
                                journal.log({type: 'error', owner: 'UI', module: 'preferences', func: '_validateTabsetPrefs'}, 'Invalid hidden table column index for table with ID "' + tableId + '": ', colIndex, '. This index will be removed from the array.');
                                tablePref.columns.hidden.splice(arrayIndex, 1);
                            }
                        });
                    }

                    // Check whether we just emptied the whole array; if so, remove the whole table object since there's no other reason to have it
                    if (tablePref.columns.hasOwnProperty('visible') && tablePref.columns.hasOwnProperty('hidden') && tablePref.columns.visible.length === 0 && tablePref.columns.hidden.length === 0) {
                        journal.log({type: 'warn', owner: 'UI', module: 'preferences', func: '_validateTabsetPrefs'}, 'Table columns array for table "' + tableId + '" is now empty because all invalid indices were removed. This table preference will be removed.');
                        tableIDsToDelete.push(tableId);
                    }
                }); // End of loop through tables

                // Remove invalid tables
                if (tableIDsToDelete.length) {
                    // Loop through our data store, which at this point contains both good and bad objects
                    $.each(tabsetPrefs.pages[fwData.context.screen.id].tables, function (tableId, tablePref) {
                        // Make sure this table wasn't marked for deletion
                        if (tableIDsToDelete.indexOf(tableId) === -1) {
                            // Keep a copy of the column
                            tablesToKeep[tableId] = tablePref;
                        }
                    });

                    // Replace our data store with only the valid prefs
                    tabsetPrefs.pages[fwData.context.screen.id].tables = tablesToKeep;
                }
            }
        }

        return tabsetPrefs;
    };

    /**
     * Retrieves a table's settings with the list of columns that are visible
     *
     * @param   {Object}  tabsetPrefs  Tabset preferences object
     * @param   {String}  tableId      ID of the table
     *
     * @return  {Array}                List of indices of the visible columns
     */
    var _getTablePrefs = function _getTablePrefs (tabsetPrefs, prop) {
        var pagesData;
        var pageId;
        var value;

        // Verify arguments
        if (typeof prop !== 'string' || !prop) {
            journal.log({type: 'error', owner: 'UI', module: 'preferences', func: 'getTablePrefs'}, 'Invalid property given: "' + prop + '"');

            return null;
        }

        // Check for a valid property format: `tables.{TABLE_ID}.{PROPERTY_NAME_1}.{PROPERTY_NAME_2}...`
        if (!/^tables\.[\w\-]+\.[\w\-]+$/.test(prop)) {
            journal.log({type: 'error', owner: 'UI', module: 'preferences', func: 'getTablePrefs'}, 'Invalid table property provided: "' + prop + '"');

            return null;
        }

        // Extract the table ID
        tableId = /^tables\.([\w\-]+)\.[\w\-]+$/.exec(prop)[1];

        // Extract the sub-property
        subprop = /^tables\.[\w\-]+\.([\w\-]+)$/.exec(prop)[1];

        if (!DEFAULT_TABLE_PREFS.hasOwnProperty(subprop)) {
            journal.log({type: 'error', owner: 'UI', module: 'preferences', func: 'getTablePrefs'}, 'Invalid table sub-property provided: "' + subprop + '"');

            return null;
        }

        // Fallback to the default value for the requested subproperty in case we don't find the page & table
        value = DEFAULT_TABLE_PREFS[subprop];

        tabsetPrefs = store.get('tabsetPrefs');

        if (tabsetPrefs) {

            var tabsetSpecificPrefs = false;
            var pagePrefs = false;

            // Create a couple of references to make the next block of code more readable
            pagesData = tabsetPrefs.pages;
            tabsetID = fwData.context.tabset.id;
            pageId = fwData.context.screen.id;

            for (var i = 0, len = tabsetPrefs.length; i < len; i++) {

                if (tabsetPrefs[i].id === tabsetID) {

                    tabsetSpecificPrefs = tabsetPrefs[i];
                    break;
                }
                else {
                    continue;
                }
            }

            if (tabsetSpecificPrefs && tabsetSpecificPrefs.prefs && tabsetSpecificPrefs.prefs.pages && tabsetSpecificPrefs.prefs.pages[pageId]) {

                if (tabsetSpecificPrefs.prefs.pages[pageId].tables && tabsetSpecificPrefs.prefs.pages[pageId].tables[tableId]) {

                    if (tabsetSpecificPrefs.prefs.pages[pageId].tables[tableId][subprop]) {

                        return tabsetSpecificPrefs.prefs.pages[pageId].tables[tableId][subprop];
                    }

                }
            }
        }
        else {

            return value;
        }

    };

    /**
     * Updates a table's settings
     *
     * It is assumed that the table is on the current page
     *
     * @param   {Object}  tabsetPrefs  Tabset preferences object
     * @param   {String}  tableId      Full page-level property string, which should begin with "table.{table ID}"
     * @param   {Mixed}   value        The value to assign to the property
     *
     * @return  {Object}               The updated tabset preferences object
     */
    var _setTablePrefs = function _setTablePrefs (tabsetPrefs, prop, value) {
        var screenId = fwData.context.screen.id;
        var tableId;
        var tableObj;
        var subprop;


        // Verify arguments
        if (!tabsetPrefs || typeof prop !== 'string' || !prop || typeof value === 'undefined') {
            journal.log({type: 'error', owner: 'UI', module: 'preferences', func: 'setTablePrefs'}, 'Invalid argument(s). Property: "' + prop + '", value: ', value);

            return tabsetPrefs;
        }

        // Ensure there's an object for this page
        if (!tabsetPrefs.pages[screenId]) {
            tabsetPrefs.pages[screenId] = $.extend(true, {}, DEFAULT_PAGE_PREFS);
            tabsetPrefs.pages[screenId].id = screenId;
        }

        // Check for a valid format
        if (!/^tables\.(?:[a-zA-Z0-9_-])+\.\w+\b/.test(prop)) {
            journal.log({type: 'error', owner: 'UI', module: 'preferences', func: 'setTablePrefs'}, 'Invalid table property provided: "' + prop + '"');

            return tabsetPrefs;
        }

        if (!tabsetPrefs.pages[screenId].tables) {
            tabsetPrefs.pages[screenId].tables = {};
        }

        // Extract the table ID
        //tableId = /^tables\.(?:[a-zA-Z_-])+\.\w+\b/.exec(prop)[1];
        tableId = prop.split('.')[1];

        // Ensure there's an object for this table
        if (!tabsetPrefs.pages[screenId].tables.hasOwnProperty(tableId)) {
            tabsetPrefs.pages[screenId].tables[tableId] = $.extend(true, {}, DEFAULT_TABLE_PREFS);
        }

        tableObj = tabsetPrefs.pages[screenId].tables[tableId];

        // Extract the sub-property
        subprop = prop.replace(/^tables\.(?:[a-zA-Z0-9_-])+\./, '');

        if (!DEFAULT_TABLE_PREFS.hasOwnProperty(subprop)) {
            journal.log({type: 'error', owner: 'UI', module: 'preferences', func: 'setTablePrefs'}, 'Invalid table sub-property provided: "' + subprop + '"');

            return tabsetPrefs;
        }

        // Update the table object
        tableObj = _setObjectProperty(tableObj, subprop, value);

        return tabsetPrefs;
    };

    ////////////
    // Events //
    ////////////

    /**
     * Handles clicks on the Preferences button that toggles the modal UI
     *
     * @param   {Event}  evt  Click event on a button
     */
    var _handleToggleClick = function _handleToggleClick (evt) {
        // Make sure the plugin has loaded
        if (!$.modal) {
            // Call this same function when the plugin is done loading but pass along this event
            cui.load('modal', function () {
                _handleToggleClick(evt);
            });
        }
        else {
            // Check whether the modal exists yet
            if (!$prefsModal) {
                // Create the modal and show it
                $prefsModal = _generateUI(evt.data.globalPrefs, evt.data.tabsetPrefs);
                $prefsModal.show();
            }
            else {
                // Show the existing modal
                $prefsModal.show();
            }
        }
    };

    /**
     * Handles changes to the font size slider
     *
     * @param   {Event}  evt  Change event on a range input
     */
    var _onFontSizeChange = function _onFontSizeChange (evt) {
        _applyFontSize(evt.data.globalPrefs, evt.target.value, true);

        setTimeout(function() {
            $(window).trigger('font-change-slider');
        }, 200);
    };

    /**
     * Handles changes to theme selection
     *
     * @param   {Event}  evt  Change event on a radio button
     */
    var _onThemeChange = function _onThemeChange (evt) {
        _applyTheme(evt.data.globalPrefs, evt.target.value, true);
    };

    /**
     * Handles clicks to the Revert All Tables button
     *
     * @param   {Event}  evt  Click event on a button
     */
    var _onTableRevertClick = function _onTableRevertClick (evt) {
        _clearAllTabsetPrefs();
    };

    /**
     * Gets the value for a nested property within an object, for example `foo.bar.baz` would return `123` from the object `{foo: {bar: {baz: 123} } }`
     *
     * @param   {Object}  obj           Object to be updated
     * @param   {String}  propertyPath  Path to the sub-property
     *
     * @return  {Object}                Updated object
     */
    var _getObjectProperty = function _getObjectProperty (obj, propertyPath) {
        var parts;
        var pointer;
        var index;
        var lastIndex;
        var value;

        // Top-level property
        if (propertyPath.indexOf('.') === -1) {
            // Check if the property exists
            if (!obj.hasOwnProperty(propertyPath)) {
                journal.log({type: 'error', owner: 'UI', module: 'preferences', func: '_getObjectProperty'}, 'Unknown property name provided: "' + propertyPath + '"');

                return undefined;
            }

            // Get the value
            value = obj[propertyPath];
        }
        // Sub-property
        else {
            // The `propertyPath` given is actually a path to a nested property, for example `foo.bar.baz` equates to `{foo: {bar: {baz: 123} } }`
            // We need to crawl through each part of the path to find the property that needs to be updated
            parts = propertyPath.split('.');
            pointer = obj; // Live reference to the objec that will move through its sub-properties
            index = 0;
            lastIndex = parts.length - 1;

            // Loop through the parts of the path
            while (index < lastIndex) {
                if (parts[index] && pointer.hasOwnProperty(parts[index])) {
                    pointer = pointer[parts[index]];
                }
                else {
                    journal.log({type: 'error', owner: 'UI', module: 'preferences', func: '_getObjectProperty'}, 'Unknown sub-property name provided: "' + parts[index] + '"');

                    return undefined;
                }

                index++;
            }

            // Get the value
            value = pointer[parts[lastIndex]];
        }

        return obj;
    };

    /**
     * Sets the value for a nested property within an object, for example `foo.bar.baz` would equate to `123` in the object `{foo: {bar: {baz: 123} } }`
     *
     * @param   {Object}  obj           Object to be updated
     * @param   {String}  propertyPath  Path to the sub-property
     * @param   {Mixed}   value         Value to assign to the sub-property
     *
     * @return  {Object}                Updated object
     */
    var _setObjectProperty = function _setObjectProperty (obj, propertyPath, value) {
        var parts;
        var pointer;
        var index;
        var lastIndex;

        // Top-level property
        if (propertyPath.indexOf('.') === -1) {
            // Check if the property exists
            if (!obj.hasOwnProperty(propertyPath)) {
                journal.log({type: 'error', owner: 'UI', module: 'preferences', func: '_setObjectProperty'}, 'Unknown property name provided: "' + propertyPath + '"');

                return undefined;
            }

            // Set the preference
            obj[propertyPath] = value;
        }
        // Sub-property
        else {
            // The `propertyPath` given is actually a path to a nested property, for example `foo.bar.baz` equates to `{foo: {bar: {baz: 123} } }`
            // We need to crawl through each part of the path to find the property that needs to be updated
            parts = propertyPath.split('.');
            pointer = obj; // Live reference to the objec that will move through its sub-properties
            index = 0;
            lastIndex = parts.length - 1;

            // Loop through the parts of the path
            while (index < lastIndex) {
                if (parts[index] && pointer.hasOwnProperty(parts[index])) {
                    pointer = pointer[parts[index]];
                }
                else {
                    journal.log({type: 'error', owner: 'UI', module: 'preferences', func: '_setObjectProperty'}, 'Unknown sub-property name provided: "' + parts[index] + '"');

                    return undefined;
                }

                index++;
            }

            // Set the preference
            pointer[parts[lastIndex]] = value;
        }

        return obj;
    };

    ////////////////////
    // Public methods //
    ////////////////////

    /**
     * Set the value for some properties
     *
     * Notes:
     *     - Similar to the `jQuery.css()` function, arguments may be supplied in two ways:
     *         - Single argument: an object of keys and values
     *         - Two arguments: the property name and value as strings `prefs.set('foo', 'bar')`. This is a shorthand way of updating a global preference.
     *     - To set a sub-property, use dots in the key name. For example, to change 123 in `{foo: {bar: {baz: 123}}}` you would call `prefs.set('foo.bar.baz', 456)`
     *     - Only known properties may be set. You cannot add a new property with this function.
     *
     * @param  {Mixed}   param1  An object of key-value pairs to be set, or a string representing a property
     * @param  {String}  param2  Optional, value for the property defined in `param1`
     *
     * @return                   The updated preferences object
     */
    Prefs.prototype.setGlobal = function _setGlobal (param1, param2, callback) {
        var prefs;
        var temp;

        // Shorthand: only two arguments are provided which represent the name and value, respectively
        if (typeof param1 === 'string' && typeof param2 !== 'undefined') {
            // Normalize the arguments into an object
            temp = {};
            temp[param1] = param2;
            param1 = temp;
        }

        // Verify arguments
        if (kind(param1) !== 'object') {
            journal.log({type: 'error', owner: 'UI', module: 'preferences', func: 'setGlobal'}, 'Invalid parameter provided: ', param1);

            return false;
        }

        prefs = this.globalPrefs;

        // Make sure there's a container object
        if (!prefs) {
            prefs = $.extend(true, {}, DEFAULT_GLOBAL_PREFS);
        }

        // Loop through the properties and values
        Object.keys(param1).forEach(function _setGlobal_loop (prop) {
            var value = param1[prop];
            var parts;
            var pointer;
            var index;
            var lastIndex;

            // Check the value
            if (typeof value === 'undefined') {
                journal.log({type: 'error', owner: 'UI', module: 'preferences', func: 'setGlobal'}, 'Invalid value provided for "' + prop + '": ', value);

                return false;
            }

            // Set the preference
            prefs = _setObjectProperty(prefs, prop, value);
        });

        // Update the data store and server
        _applyGlobalPreferences(prefs);

        if (typeof callback === 'function') {
            globalUpdateCallbacks.push({
                args: [param1, param2],
                func: callback,
            });
        }

        return _updateGlobalPrefsStore(prefs);
    };

    /**
     * Set the value for page properties
     *
     * Notes:
     *     - Similar to the `jQuery.css()` function, arguments may be supplied in two ways:
     *         - Single argument: an object of keys and values
     *         - Two arguments: the property name and value as strings `prefs.set('foo', 'bar')`. This is a shorthand way of updating a global preference.
     *     - To set a sub-property, use dots in the key name. For example, to change 123 in `{foo: {bar: {baz: 123}}}` you would call `prefs.set('foo.bar.baz', 456)`
     *     - Only known properties may be set. You cannot add a new property with this function.
     *
     * @param  {Mixed}   param1  An object of key-value pairs to be set, or a string representing a property
     * @param  {String}  param2  Optional, value for the property defined in `param1`
     *
     * @return                   The updated preferences object
     */
    Prefs.prototype.setPage = function _setPage (param1, param2, callback) {

        var prefs;
        var temp;
        var table;

        // Shorthand: only two arguments are provided which represent the name and value, respectively
        if (typeof param1 === 'string' && typeof param2 !== 'undefined') {
            // Normalize the arguments into an object
            temp = {};
            temp[param1] = param2;
            param1 = temp;
        }

        // Verify arguments
        if (kind(param1) !== 'object') {
            journal.log({type: 'error', owner: 'UI', module: 'preferences', func: 'setPage'}, 'Invalid parameter provided: ', param1);

            return false;
        }

        prefs = this.tabsetPrefs;

        // Ensure there's an object for this tabset
        if (!prefs || !prefs.pages) {
            prefs = $.extend(true, {}, DEFAULT_TABSET_PREFS);
        }

        // Ensure there's an object for this page
        if (!prefs.pages.hasOwnProperty(fwData.context.screen.id) || !prefs.pages[fwData.context.screen.id]) {
            prefs.pages[fwData.context.screen.id] = $.extend(true, {}, DEFAULT_PAGE_PREFS);
        }

        // Loop through the properties and values
        Object.keys(param1).forEach(function _setPage_loop (prop) {
            var value = param1[prop];

            // Check the value
            if (typeof value === 'undefined') {
                journal.log({type: 'error', owner: 'UI', module: 'preferences', func: 'setPage'}, 'Invalid value provided for "' + prop + '": ', value);

                return false;
            }

            // Tables
            if (/^tables\b/.test(prop)) {
                prefs = _setTablePrefs(prefs, prop, value);
            }
            // Other properties
            else {
                prefs = _setObjectProperty(prefs, prop, value);
            }
        });

        // Update the data store and server
        _applyTabsetPreferences(prefs);

        if (typeof callback === 'function') {
            pageUpdateCallbacks.push({
                args: [param1, param2],
                func: callback,
            });
        }

        return _updateTabsetPrefsStore(prefs);
    };

    /**
     * Gets the value of a particular global preference
     *
     * @param   {String}  prop  Name of the preference property (optional)
     *
     * @return  {Mixed}         The entire object if no property was specified, `null` if the property name was invalid or not set, or the propertie's actual value
     */
    Prefs.prototype.getGlobal = function _getGlobal (prop) {
        // If nothing was specified, return the entire object
        if (!prop || typeof prop !== 'string') {
            return this.globalPrefs;
        }

        // Make sure the property name is valid
        if (!DEFAULT_GLOBAL_PREFS.hasOwnProperty(prop) && !DEFAULT_TABSET_PREFS.hasOwnProperty(prop)) {
            journal.log({type: 'error', owner: 'UI', module: 'preferences', func: 'getGlobal'}, 'There is no preference named "' + prop + '"');

            return null;
        }

        // Make sure the property exists in this user's preferences
        if (!this.globalPrefs.hasOwnProperty(prop) && !this.tabsetPrefs.hasOwnProperty(prop)) {
            journal.log({type: 'warn', owner: 'UI', module: 'preferences', func: 'getGlobal'}, 'No preference has been set for "' + prop + '"');

            return null;
        }

        return this.globalPrefs[prop];
    };

    /**
     * Gets the value of a particular page-level preference
     *
     * @param   {String}  prop  Name of the preference property (optional)
     *
     * @return  {Mixed}         The entire object if no property was specified, `null` if the property name was invalid or not set, or the property's actual value
     */
    Prefs.prototype.getPage = function _getPage (prop) {

        // If nothing was specified, return the entire object
        if (!prop || typeof prop !== 'string') {
            return this.tabsetPrefs;
        }

        // Routing for special pref types
        if (/^tables\./.test(prop)) {

            if (this.tabsetPrefs){

                return _getTablePrefs(this.tabsetPrefs, prop);
            }
            else {

                return null;
            }
        }
        // Global preferences
        else {
            // Make sure the property name is valid
            if (!DEFAULT_PAGE_PREFS.hasOwnProperty(prop)) {
                journal.log({type: 'error', owner: 'UI', module: 'preferences', func: 'getPage'}, 'There is no preference named "' + prop + '"');

                return null;
            }

            // Make sure the property exists in this user's preferences
            if (!this.tabsetPrefs[fwData.context.screen.id].hasOwnProperty(prop)) {
                journal.log({type: 'warn', owner: 'UI', module: 'preferences', func: 'getPage'}, 'No preference has been set for "' + prop + '"');

                return null;
            }

            return this.tabsetPrefs[prop];
        }
    };

    ///////////////////////////
    // Expose public methods //
    ///////////////////////////

    Prefs.version = VERSION;

    // Define and expose the component to jQuery
    window.$.fn.prefs = function (param1, param2) {
        return this.each(function () {
            new Prefs(this, param1, param2).init();
        });
    };

    window.$.prefs = function (elem, param1, param2) {

        return new Prefs(elem, param1, param2).init();
    };
});
