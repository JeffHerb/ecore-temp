define(function () {
    // Value codes:

    // Tooltips:
    // 1 Off-target click
    // 2 Close button click
    // 3 Repeat icon click
    // 4 Escape key
    // 5 Tab key
    // 6 Shift-tab key

    // Confirm dialog:
    // 1 Display
    // 2 Accept
    // 3 Decline

    ///////////////
    // Constants //
    ///////////////

    var VERSION = '0.0.1';
    var GA_PROPERTY_ID = 'UA-47449816-22';
    var GTM_PROPERTY_ID = 'GTM-T4FP6H';
    var DEBUG_TRACKING = false;

    // Enumeration of valid categories, per iflow convention
    var CATEGORIES = {
        // Non-user actions
        client: 'Client', // Device-related info
        app:    'App',    // App- and page-related info

        // User actions
        banner:     'Banner',
        footer:     'Footer',
        extlink:    'External Link Click',
        intlink:    'Internal Link Click',
        tooltip:    'Tooltip',
        datepicker: 'Date Picker',
        removeitem: 'Remove Item',
        tablerows:  'Table Expandable Rows',
    };

    // Private API namespace
    var priv = {};

    // Queue of events to be processed (e.g. events that occur before the Google plugin has loaded)
    priv.queue = [];

    // Ensure we don't initalize twice
    priv.hasInitialized = false;

    ////////////////////
    // Public methods //
    ////////////////////

    /**
     * Initialize Google Analytics and start tracking items on the page
     */
    var _init = function _init () {
    	// Insert Google Analytics script
        // Note that this will only run on a server with a .gov domain. For local testing, a test version of `ga` will be defined in the uiMockup component.
        if (!priv.hasInitialized && typeof ga !== 'function' && /\.gov$/.test(document.location.host)) {
            // console.info('real analytics init');

            if(GA_PROPERTY_ID === '' || GTM_PROPERTY_ID === ''){
                journal.log({type: 'info', owner: 'UI', module: 'analytics', submodule: '_init'}, 'Property ID not defined');

                return false;
            }

            /* jshint ignore:start */
            (function (i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function (){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
            ga('create', GA_PROPERTY_ID, 'auto');
            ga('send', 'pageview');
            /* jshint ignore:end */
        }
        else if (!priv.hasInitialized && typeof ga !== 'function') {
            // console.warn('fake analytics init');
            DEBUG_TRACKING = true;
            // Define our own GA that just logs to the console
            window.ga = function _ga_test (a, b, category, action, label, value, isNonInteraction) {
                // Events
                if (a === 'send' && b === 'event') {
                    // Must have at least category and action
                    if (typeof category !== 'string' || typeof action !== 'string') {
                        journal.log({type: 'error', owner: 'UI', module: 'analytics', submodule: '_init'}, 'Bad event tracking! Must supply category and action. First arg: ', JSON.parse(JSON.stringify(a)), ', second arg: ', JSON.parse(JSON.stringify(b)));

                        return false;
                    }

                    category = category.trim().toLowerCase();
                    action = action.trim();

                    // Make sure the category and action are not empty strings
                    if (!category.length || !action.length) {
                        journal.log({type: 'error', owner: 'UI', module: 'analytics', submodule: '_init'}, 'Bad event tracking! Invalid category or action: "', category, '", "', action, '", "', label, '", ', value, ', ' + isNonInteraction);

                        if (DEBUG_TRACKING) {
                            console.error('Bad event tracking: "', category, '", "', action, '", "', label, '", ', value, ', ' + isNonInteraction);
                        }

                        return false;
                    }

                    // No label
                    if (typeof label !== 'string' || label.trim().length < 1) {
                        if (DEBUG_TRACKING) {
                            console.info('Tracked event: "' + category  + '", "' + action + '"');
                        }
                    }
                    else {
                        label = label.trim();

                        // All components
                        if (typeof value === 'number' && value > -1) {
                            if (DEBUG_TRACKING) {
                                console.info('Tracked event: "' + category + '", "' + action + '", "' + label + '", ' + value, + ', ' + isNonInteraction);
                            }
                        }
                        // No value
                        else {
                            if (DEBUG_TRACKING) {
                                console.info('Tracked event: "' + category + '", "' + action + '", "' + label + '", ' + isNonInteraction);
                            }
                        }
                    }

                    // Log event
                    if (DEBUG_TRACKING) {
                        console.info('[GA Event] ', Array.prototype.slice.call(arguments));
                    }
                }
                // Some other request
                else {
                    // console.error('[GA] First two arguments must be `send` and `event`: ', Array.prototype.slice.call(arguments));
                }
            };

            // Process queue
            if (priv.queue.length) {
                var ev = priv.queue.pop();
                var i = 0;

                while (ev && i < 100) {
                    ga('send', 'event', ev.category, ev.action, ev.label, ev.value, ev.isNonInteraction);

                    if (DEBUG_TRACKING) {
                        console.info('popped from queue ', ev);
                    }

                    ev = priv.queue.pop();
                    i++;
                }
            }
        }

        // Setup the page as long as some version of `ga` has been defined
        if (!priv.hasInitialized && typeof ga !== 'function') {
            priv.insertGoogleTagManager();
            priv.setupEventTracking();
            priv.processQueue();

            priv.hasInitialized = true;
        }
    };

    /**
     * Dispatch a tracked event to GA
     * Documentation: https://developers.google.com/analytics/devguides/collection/analyticsjs/events
     *
     * @param   {string}  category          Name of general category; required
     * @param   {string}  action            Name of action; required
     * @param   {string}  label             Associated label; optional
     * @param   {number}  value             Integer value; optional
     * @param   {boolean} isNonInteraction  Whether the event is not a user action (and should not affect the bounce rate)
     */
    var _trackEvent = function _trackEvent (category, action, label, value, isNonInteraction) {
        // Make sure GA is available (i.e. we're not on a test server)
        if (typeof ga !== 'function') {
            priv.queue.push({
                category: category,
                action: action,
                label: label,
                value: value,
                isNonInteraction: isNonInteraction
            });
            // console.warn('added to queue ', {category: category, action: action, label: label, value: value, isNonInteraction: isNonInteraction});

            return false;
        }

        priv.processQueue();

        // Must have at least category and action
        if (typeof category !== 'string' || typeof action !== 'string') {
            return false;
        }

        category = category.trim().toLowerCase();
        action = action.trim();

        // Make sure the category is a valid one, and check for empty strings
        if (!category.length || !action.length || !CATEGORIES.hasOwnProperty(category)) {
            journal.log({type: 'error', owner: 'UI', module: 'analytics', submodule: '_trackEvent'}, 'Bad tracking', category, action, label, value);

            return false;
        }

        // Use normalized category text
        category = CATEGORIES[category];

        // No label
        if (typeof label !== 'string' || label.trim().length < 1) {
            if (isNonInteraction) {
                ga('send', 'event', category, action, {'nonInteraction': 1});
            }
            else {
                ga('send', 'event', category, action);
            }

            // console.info(category, action);
        }
        else {
            label = label.trim();

            // No value
            if (typeof value !== 'number' || value > -1) {
                if (isNonInteraction) {
                    ga('send', 'event', category, action, label, {'nonInteraction': 1});
                }
                else {
                    ga('send', 'event', category, action, label);
                }
                // console.info(category, action, label);
            }
            // All components
            else {
                if (isNonInteraction) {
                    ga('send', 'event', category, action, label, value, {'nonInteraction': 1});
                }
                else {
                    ga('send', 'event', category, action, label, value);
                }
                // console.info(category, action, label, value);
            }
        }
    };

    var _getVersion = function _getVersion (callback, hideImmediately) {
        return VERSION;
    };

    /////////////////////
    // Private methods //
    /////////////////////

    /**
     * Processes queued tracking events
     *
     * @return  {boolean}  Whether the queue was processed
     */
    priv.processQueue = function _processQueue () {
        var ev;

        if (typeof ga !== 'function' || !priv.queue.length) {
            return false;
        }

        ev = priv.queue.pop();
        while (ev) {
            trackEvent(ev.category, ev.action, ev.label, ev.value, ev.isNonInteraction);
            // console.info('popped from queue ', ev);
            ev = priv.queue.pop();
        }

        return true;
    };

    /**
     * Setup tracking for specific items that are not generated by JavaScript
     */
    priv.setupEventTracking = function _setupEventTracking () {
        var progressBar = document.getElementById('progress-bar');
        var trackProgressBar;
        var elems;
        var numElems;

        // Progress bar links
        if (progressBar) {
            // Define tracking parameters
            trackProgressBar = function _trackProgressBar (evt) {
                trackEvent('ProgressBar', 'Link click', evt.target.innerHTML);
            };

            // Get links
            elems = progressBar.getElementsByTagName('a');
            numElems = elems.length;

            while (numElems--) {
                elems[numElems].addEventListener('click', trackProgressBar, false);
            }
        }
    };

    /**
     * Insert Google Tag Manager for the uNav
     */
    priv.insertGoogleTagManager = function _insertGoogleTagManager () {
        if (typeof window.dataLayer === 'undefined' && document.location.protocol !== 'file:') {
            (function (w, d, s, l, i) {
                w[l] = w[l] || [];
                w[l].push({
                    'gtm.start': new Date().getTime(),
                    event: 'gtm.js'
                });

                var f = d.getElementsByTagName(s)[0];
                var j = d.createElement(s);
                var dl = l !== 'dataLayer' ? '&l=' + l : '';

                j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
                j.type = 'text/javascript';
                j.async = true;
                f.parentNode.insertBefore(j, f);
            })(window, document, 'script', 'dataLayer', GTM_PROPERTY_ID);
        }
    };

    //////////////////////////////////////////
    // Expose public properties and methods //
    //////////////////////////////////////////

    return {
        init: _init,
        trackEvent: _trackEvent,
        getVersion: _getVersion,
    };
});
