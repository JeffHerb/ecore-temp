define(['guid', 'getCookie', 'clickblocker', 'store', 'utils'], function(guid, getCookie, clkblocker, store, utils) {

    var _priv = {};

    _priv.childWindowsBoilerPlate = '<!doctype html><html><head><meta http-equiv="X-UA-Compatible" content="IE=edge" /><meta http-equiv="pragma" content="no-cache" /><meta http-equiv="Cache-control" content="no-cache" /><meta name="expires" content="0" /><meta charset="utf-8"/><title>Loading Child Window</title></head><body onload="childInit()"><div id="message" class="message" style="z-index:900; height: 100%; width: 100%; position: fixed;"> <style type="text/css"> @-webkit-keyframes uil-default-anim{0%{opacity: 1}100%{opacity: 0}}@keyframes uil-default-anim{0%{opacity: 1}100%{opacity: 0}}.uil-default-css > div:nth-of-type(0){-webkit-animation: uil-default-anim 1s linear infinite; animation: uil-default-anim 1s linear infinite; -webkit-animation-delay: -0.5s; animation-delay: -0.5s;}.uil-default-css > div:nth-of-type(1){-webkit-animation: uil-default-anim 1s linear infinite; animation: uil-default-anim 1s linear infinite; -webkit-animation-delay: -0.5s; animation-delay: -0.5s;}.uil-default-css > div:nth-of-type(2){-webkit-animation: uil-default-anim 1s linear infinite; animation: uil-default-anim 1s linear infinite; -webkit-animation-delay: -0.4166666666666667s; animation-delay: -0.4166666666666667s;}.uil-default-css > div:nth-of-type(3){-webkit-animation: uil-default-anim 1s linear infinite; animation: uil-default-anim 1s linear infinite; -webkit-animation-delay: -0.33333333333333337s; animation-delay: -0.33333333333333337s;}.uil-default-css > div:nth-of-type(4){-webkit-animation: uil-default-anim 1s linear infinite; animation: uil-default-anim 1s linear infinite; -webkit-animation-delay: -0.25s; animation-delay: -0.25s;}.uil-default-css > div:nth-of-type(5){-webkit-animation: uil-default-anim 1s linear infinite; animation: uil-default-anim 1s linear infinite; -webkit-animation-delay: -0.16666666666666669s; animation-delay: -0.16666666666666669s;}.uil-default-css > div:nth-of-type(6){-webkit-animation: uil-default-anim 1s linear infinite; animation: uil-default-anim 1s linear infinite; -webkit-animation-delay: -0.08333333333333331s; animation-delay: -0.08333333333333331s;}.uil-default-css > div:nth-of-type(7){-webkit-animation: uil-default-anim 1s linear infinite; animation: uil-default-anim 1s linear infinite; -webkit-animation-delay: 0s;animation-delay: 0s;}.uil-default-css > div:nth-of-type(8){-webkit-animation: uil-default-anim 1s linear infinite; animation: uil-default-anim 1s linear infinite; -webkit-animation-delay: 0.08333333333333337s; animation-delay: 0.08333333333333337s;}.uil-default-css > div:nth-of-type(9){-webkit-animation: uil-default-anim 1s linear infinite; animation: uil-default-anim 1s linear infinite; -webkit-animation-delay: 0.16666666666666663s; animation-delay: 0.16666666666666663s;}.uil-default-css > div:nth-of-type(10){-webkit-animation: uil-default-anim 1s linear infinite; animation: uil-default-anim 1s linear infinite; -webkit-animation-delay: 0.25s; animation-delay: 0.25s;}.uil-default-css > div:nth-of-type(11){-webkit-animation: uil-default-anim 1s linear infinite; animation: uil-default-anim 1s linear infinite; -webkit-animation-delay: 0.33333333333333337s; animation-delay: 0.33333333333333337s;}.uil-default-css > div:nth-of-type(12){-webkit-animation: uil-default-anim 1s linear infinite; animation: uil-default-anim 1s linear infinite; -webkit-animation-delay: 0.41666666666666663s; animation-delay: 0.41666666666666663s;}.uil-default-css{position: relative; background:none; width:40px; height:40px; left: -16px; top: -16px;}</style> <div class="container" style="height: 65px;position:absolute;white-space: nowrap;display: inline-block;top: 50%;margin: -34.5px 0 0 -70px;width: 140px;left: 50%;"> <div class="spinner" style="height: 40px; width: 40px; margin: auto;"> <div class="uil-default-css" style="transform:scale(0.20);"> <div style="top:80px;left:93px;width:14px;height:40px;background:#000000;-webkit-transform:rotate(0deg) translate(0,-60px);transform:rotate(0deg) translate(0,-60px);border-radius:10px;position:absolute;"></div><div style="top:80px;left:93px;width:14px;height:40px;background:#000000;-webkit-transform:rotate(30deg) translate(0,-60px);transform:rotate(30deg) translate(0,-60px);border-radius:10px;position:absolute;"></div><div style="top:80px;left:93px;width:14px;height:40px;background:#000000;-webkit-transform:rotate(60deg) translate(0,-60px);transform:rotate(60deg) translate(0,-60px);border-radius:10px;position:absolute;"></div><div style="top:80px;left:93px;width:14px;height:40px;background:#000000;-webkit-transform:rotate(90deg) translate(0,-60px);transform:rotate(90deg) translate(0,-60px);border-radius:10px;position:absolute;"></div><div style="top:80px;left:93px;width:14px;height:40px;background:#000000;-webkit-transform:rotate(120deg) translate(0,-60px);transform:rotate(120deg) translate(0,-60px);border-radius:10px;position:absolute;"></div><div style="top:80px;left:93px;width:14px;height:40px;background:#000000;-webkit-transform:rotate(150deg) translate(0,-60px);transform:rotate(150deg) translate(0,-60px);border-radius:10px;position:absolute;"></div><div style="top:80px;left:93px;width:14px;height:40px;background:#000000;-webkit-transform:rotate(180deg) translate(0,-60px);transform:rotate(180deg) translate(0,-60px);border-radius:10px;position:absolute;"></div><div style="top:80px;left:93px;width:14px;height:40px;background:#000000;-webkit-transform:rotate(210deg) translate(0,-60px);transform:rotate(210deg) translate(0,-60px);border-radius:10px;position:absolute;"></div><div style="top:80px;left:93px;width:14px;height:40px;background:#000000;-webkit-transform:rotate(240deg) translate(0,-60px);transform:rotate(240deg) translate(0,-60px);border-radius:10px;position:absolute;"></div><div style="top:80px;left:93px;width:14px;height:40px;background:#000000;-webkit-transform:rotate(270deg) translate(0,-60px);transform:rotate(270deg) translate(0,-60px);border-radius:10px;position:absolute;"></div><div style="top:80px;left:93px;width:14px;height:40px;background:#000000;-webkit-transform:rotate(300deg) translate(0,-60px);transform:rotate(300deg) translate(0,-60px);border-radius:10px;position:absolute;"></div><div style="top:80px;left:93px;width:14px;height:40px;background:#000000;-webkit-transform:rotate(330deg) translate(0,-60px);transform:rotate(330deg) translate(0,-60px);border-radius:10px;position:absolute;"></div></div></div><p>Loading, Please Wait.</p></div></div>';

    // Place for storing all window references
    _priv.windows = {};

    _priv.windowsTrackStatus = {
        open: [],
        closed: []
    };

    _priv.lStorage = {};
    _priv.currentSession = false;

    _priv.openChildrenCheck = false;

    _priv.defaultWindowID = false;
    _priv.windowCheckInterval = false;

    _priv.windowMessageEvent = false;

    // Default window settings
    _priv.defaultWindowOptions = 'scrollbars=yes,menubar=no,resizable=yes,toolbar=no,width=925,height=700,titlebar=yes,status=no,location=no';

    _priv.defaultNewSettings = function _default_new_settings() {

        var settings = {};

        // Ensure the window options are set
        settings.windowOptions = _priv.defaultWindowOptions;

        return settings;
    };

    _priv.createWindowReference = function _create_windown_reference(name, settings, oldChild) {

        _priv.windows[name] = {
            name: name,
            windowOptions: settings.windowOptions,
            window: false,
            oldWindow: false,
            documentClosed: false
        };

        if (oldChild) {
            _priv.windows[name].oldWindow = true;
        }

        journal.log({ type: 'info', owner: 'UI', module: 'windows', func: 'createWindowReference' }, 'Creating window reference for: ' + name);

        return _priv.windows[name];
    };

    _priv.createWindow = function _create_window(name) {

        journal.log({ type: 'info', owner: 'UI', module: 'windows', func: 'createWindow' }, 'Creating new window: ' + name);
        journal.log({ type: 'info', owner: 'UI', module: 'windows', func: 'createWindow' }, 'Window is being created and opening a false child window.');

        var initGuid = guid();

        var blankPageInsert = _priv.childWindowsBoilerPlate + '<script>' + 'var childID = "' + initGuid + '";var origin="' + window.location.origin +  '";var windowName="' + name + '";';
            blankPageInsert += "var childInit=function(){};";
            blankPageInsert += '</script></body></html>';

        var newWindow = window.open('about:blank', name, _priv.windows[name].windowOptions);

        try {

            // Write the blank page HTML and close it to kick off the page messaging service
            newWindow.document.write(blankPageInsert);

            newWindow.document.close();

            _priv.windows[name].documentClosed = true;

            _priv.windows[name].window = newWindow;

            journal.log({ type: 'info', owner: 'UI', module: 'windows', func: 'createWindow' }, 'New child window created without issue.');

            // Check to see if we are running any open window checkers. if we are not, then we need to!
            if (!_priv.openChildrenCheck) {
                _priv.openChildrenCheck = setInterval(_priv.openWindowChecker, 500);
            }
            else {

            }

            return true;
        }
        catch(e) {

            _priv.windows[name].window = newWindow;

            _priv.windows[name].oldWindow = true;

            journal.log({ type: 'info', owner: 'UI', module: 'windows', func: 'createWindow' }, 'Exception occured when creating new window: ' + e.message);

            return false;
        }

    };

    _priv.updateWindowsLocalStorage = function _update_window_local_storage() {

        var knownOpenWindows = [];

        // Now get a list of all the known open windows asn save that into the _priv.lStorage windows array
        for (var win in _priv.windows) {

            if (_priv.windows[win].window && !_priv.windows[win].window.closed) {
                //_priv.lStorage[_priv.currentSession].windows.push(_priv.windows[win].name);
                // Save off the know open window
                knownOpenWindows.push(_priv.windows[win].name);
            }

        }

        if (knownOpenWindows.length) {

            if (!_priv.lStorage[_priv.currentSession]) {
                _priv.lStorage[_priv.currentSession] = {};
            }

            // Update the timestamp with the new window creation
            _priv.lStorage[_priv.currentSession].timestamp = Math.round(new Date().getTime() / 1000);

            _priv.lStorage[_priv.currentSession].windows = knownOpenWindows;
        }
        else {

            if (_priv.lStorage[_priv.currentSession]) {
                // Since we have no known open windows, remove this session object

                delete _priv.lStorage[_priv.currentSession];
            }

        }

        // Check to see if we are updating or removing the localStorage windows object.
        if (Object.keys(_priv.lStorage).length) {

            store.set('windows', _priv.lStorage);

            journal.log({ type: 'info', owner: 'UI', module: 'windows', func: 'updateWindowsLocalStorage' }, 'Updating logcal storage windows object to match current status');

        }
        else {

            store.remove('windows');

            journal.log({ type: 'info', owner: 'UI', module: 'windows', func: 'updateWindowsLocalStorage' }, 'Removing local storage windows object as no sessions exist that need tracking');
        }

    };

    _priv.checkWindow = function _check_window(childWin) {

        if (childWin && childWin.closed) {
            window.clearInterval(_priv.windowCheckInterval);

            if (clkblocker.check) {

                journal.log({ type: 'info', owner: 'UI', module: 'emp', submodule: 'windows' }, 'Click blocker being removed as locking pop was closed.');

                clkblocker.remove();
            }
        }
    };

    // This function checks to see if any windows are open and update the backing localstorage object
    _priv.openWindowChecker = function _open_window_checker() {

        var openedWindows = [];
        var closedWindows = [];

        for (var win in _priv.windows) {

            if (_priv.windows[win].window && !_priv.windows[win].window.closed) {
                openedWindows.push(_priv.windows[win].name);
            }
            else {
                closedWindows.push(_priv.windows[win].name);
            }

        }

        var openCheck = utils.arrayEqual(openedWindows, _priv.windowsTrackStatus.open);
        var closeCheck = utils.arrayEqual(closedWindows, _priv.windowsTrackStatus.closed);

        if (!openCheck || !closeCheck) {

            _priv.windowsTrackStatus.open = openedWindows;
            _priv.windowsTrackStatus.closed = closedWindows;

            _priv.updateWindowsLocalStorage();

            if (!_priv.windowsTrackStatus.open.length) {
                clearInterval(_priv.openChildrenCheck);
                _priv.openChildrenCheck = false;
            }
        }

    };

    // Generate a new window reference
    var createReference = function _create_windown_reference(name, settings, overwrite) {

        if (name) {

            // Check to verify the name is not already in use
            if (_priv.windows[name]) {

                if (!overwrite) {

                    journal.log({ type: 'error', owner: 'UI', module: 'windows', func: 'createWindowReference' }, 'The requested window reference: ' + name + ' already exists!');

                    return false;
                }
                else {

                    delete _priv.windows[name];
                }
            }

        }
        else {

            // Check if the default windows was created. If so set that as the defualt name
            if (_priv.windows[_priv.defaultWindowID]) {

                if (!overwrite) {

                    journal.log({ type: 'warning', owner: 'UI', module: 'windows', func: 'createWindowReference' }, 'The requested window default instance already exists!');
                }

                delete _priv.windows[name];
            }
            else {

                // No defined name and default is not currently in use, so enforce defaultID
                name = _priv.defaultWindowID;
            }
        }

        if (!settings || (settings && typeof settings !== "object")) {
            settings = _priv.defaultNewSettings();
        }
        else if (settings && typeof settings === "object") {

            // Verify window option settings
            if (!settings.windowOptions) {

                settings.windowOptions = _priv.defaultWindowOptions;
            }
        }

        // Create a window reference with provided settings
        return _priv.createWindowReference(name, settings, overwrite);
    };

    var getDefaultWindowName = function _get_default_window_name() {

        var sessionId = false;

        if (!_priv.defaultWindowID) {

            if (fwData && fwData.context && fwData.context.screen && fwData.context.screen.session) {

                sessionId = "win_" + fwData.context.screen.session.replace(/\:|\-|\_|\&|\$|\!|\%/g, '');

                journal.log({ type: 'info', owner: 'UI', module: 'windows', func: 'open' }, 'Using session id from framework for all unammed default windows');
            }
            else {

                sessionId = "win_" + guid();

                journal.log({ type: 'info', owner: 'UI', module: 'windows', func: 'open' }, 'No server-side session exists, generating page level default window name');
            }

            _priv.defaultWindowID = sessionId;
        }


        return _priv.defaultWindowID;

    };

    // Lookup the window reference
    var getReference = function _get_reference(name) {

        // Get a specific window
        if (name) {

            if (_priv.windows[name]) {

                return _priv.windows[name];
            }
            else {

                journal.log({ type: 'error', owner: 'UI', module: 'windows', func: 'getReference' }, 'The requested window reference: ' + name + ' does not exist');

                return false;
            }
        }
        else  {

            // Check for a defualt window instance
            if (_priv.windows[_priv.defaultWindowID]) {

                return _priv.windows[_priv.defaultWindowID];
            }
            else {

                journal.log({ type: 'info', owner: 'UI', module: 'windows', func: 'getReference' }, 'The window module is not currently tracking any default windows');

                return false;
            }

        }
    };

    var open = function _open(name, location, method, popup, lock, formID, readyCB) {

        var newWindow = false;

        console.log(arguments);

        // Check to see if the window name has been reference was reserved.
        if (_priv.windows[name]) {

            // Check to see if the window object is defined
            if (_priv.windows[name].window) {

                journal.log({ type: 'info', owner: 'UI', module: 'windows', func: 'open' }, 'Requested window reference already exists.');

                // Window reference exists, so we need to check to see if it is still open
                if (!_priv.windows[name].window.closed) {

                    journal.log({ type: 'info', owner: 'UI', module: 'windows', func: 'open' }, 'Window that is already open is being overwritten with another child window request!');


                    // Check to see if the lock was needed
                    if (lock) {

                        _priv.windowCheckInterval = window.setInterval(_priv.checkWindow, 500, _priv.windows[name].window);
                    }

                    // Update reference just in case
                    emp.reference.windows[name] =  _priv.windows[name].window;

                    if (typeof readyCB === "function") {
                        readyCB(_priv.windows[name].window);
                    }
                }
                else {

                    journal.log({ type: 'info', owner: 'UI', module: 'windows', func: 'open' }, 'Requested window reference was for a closed window. Requesting a new one');

                    // Create a window!
                    newWindow = _priv.createWindow(name);

                    // Save of popup flag
                    if (popup && method !== "GET") {
                        _priv.windows[name].window.isPopup = true;
                    }

                    // Check to see if the lock was needed
                    if (lock) {

                         _priv.windowCheckInterval = window.setInterval(_priv.checkWindow, 500, _priv.windows[name].window);
                    }

                    if (!emp.reference.windows) {
                        emp.reference.windows = {};
                    }

                    emp.reference.windows[name] =  _priv.windows[name].window;

                    //return _priv.windows[name].window;
                    if (typeof readyCB === "function") {
                        readyCB(_priv.windows[name].window);
                    }

                }

            }
            else {

                journal.log({ type: 'info', owner: 'UI', module: 'windows', func: 'open' }, 'Window does not exist, requesting it for the first time.');

                if (Object.keys(_priv.lStorage).length && _priv.lStorage[_priv.currentSession]) {

                    journal.log({ type: 'info', owner: 'UI', module: 'windows', func: 'open' }, 'Detected local storage window object');

                    if (_priv.lStorage[_priv.currentSession].windows.indexOf(name) !== -1) {

                        journal.log({ type: 'info', owner: 'UI', module: 'windows', func: 'open' }, 'It appears the windows name (' + name + ') was used to open up a screen in the past, but the parent was changed before the close was detected.');

                        try {

                            var existingWindowCheck = window.open('', name);

                            // check to see
                            if (existingWindowCheck.location && existingWindowCheck.location.href === "about:blank") {
                                existingWindowCheck.close();
                            }
                            else {

                                if (!emp.reference.windows) {
                                    emp.reference.windows = {};
                                }


                                if (!emp.reference.windows[name]) {
                                    emp.reference.windows[name] = {};
                                }

                                // Update reference just in case
                                emp.reference.windows[name] = _priv.windows[name].window;

                                if (typeof readyCB === "function") {
                                    readyCB(_priv.windows[name].window);
                                }

                                return true;
                            }

                        }
                        catch (e) {


                            journal.log({ type: 'error', owner: 'UI', module: 'windows', func: 'open' }, 'Windows (' + name + ') was created on a different parent as we get permission denied! just doing a blind form submit. This is really not good as we are not properly tracking!');

                            _priv.createWindowReference(name, _priv.defaultNewSettings, true);

                            // Since we failed we need to assume the popup already exists
                            if (typeof readyCB === "function") {
                                readyCB(false);
                            }

                            return false;
                        }

                    }

                }

                // Create a window!
                newWindow = _priv.createWindow(name);

                if (!newWindow) {
                    journal.log({ type: 'warning', owner: 'UI', module: 'windows', func: 'open' }, 'It appears a window may have already existed but no reference existed. This is like an old window from a prior page. Closeing existing window and attempting reopen.');

                    try {

                        // Try and close the window.
                        _priv.windows[name].window.close();
                    }
                    catch(e) {}

                    newWindow = _priv.createWindow(name);
                }

                // Save of popup flag
                if (popup && method !== "GET") {
                    _priv.windows[name].window.isPopup = true;
                }

                // Check to see if the lock was needed
                if (lock) {

                        _priv.windowCheckInterval = window.setInterval(_priv.checkWindow, 500, _priv.windows[name].window);
                }

                if (!emp.reference.windows) {
                    emp.reference.windows = {};
                }

                emp.reference.windows[name] =  _priv.windows[name].window;

                if (typeof readyCB === "function") {
                    readyCB(_priv.windows[name].window);
                }

            }

            return true;
        }
        else {

            journal.log({ type: 'error', owner: 'UI', module: 'windows', func: 'open' }, 'The requested window reference: ' + name + ' does not exist');
        }
    };

    var setup = function _setup() {

        var lStorage = store.get('windows');

        var todayUnix = Math.round(new Date().getTime() / 1000 );
        var yesterdayUnix = todayUnix - (24 * 3600);

        if (fwData && fwData.context && fwData.context.screen && fwData.context.screen.session) {
            _priv.currentSession = fwData.context.screen.session;
        }
        else {
            _priv.currentSession = "fake_session_" + guid();
        }

        if (lStorage) {

            var sessionsToRemove = [];

            // Since we have windows object, we need to loop through and remove anything over 24 hours old
            for (var winSession in lStorage) {

                if (lStorage[winSession].timestamp < yesterdayUnix) {

                    journal.log({ type: 'info', owner: 'UI', module: 'windows', func: 'setup' }, 'Windows session' + winSession + ' marked for removal because its over 24 hours old.');

                    sessionsToRemove.push(winSession);
                }
                else {

                    if (!lStorage[winSession].windows.length) {

                        journal.log({ type: 'info', owner: 'UI', module: 'windows', func: 'setup' }, 'Windows session' + winSession + ' marked for removal because has no open windows name links');

                        sessionsToRemove.push(winSession);
                    }
                    else {

                        journal.log({ type: 'info', owner: 'UI', module: 'windows', func: 'setup' }, 'Windows session' + winSession + ' has references to possible open windows.');

                    }
                }

            }

            if (sessionsToRemove.length) {

                for (var s = 0, sLen = sessionsToRemove.length; s < sLen; s++) {

                    delete lStorage[sessionsToRemove[s]];

                    journal.log({ type: 'info', owner: 'UI', module: 'windows', func: 'setup' }, 'Windows session' + sessionsToRemove[s] + ' removed from local storage!');
                }

                if (Object.keys(lStorage).length) {

                    store.set('windows', lStorage);

                    journal.log({ type: 'info', owner: 'UI', module: 'windows', func: 'setup' }, 'Updated the local storage windows container for now and saved working copy in memory.');

                    _priv.lStorage = lStorage;
                }
                else {

                    journal.log({ type: 'info', owner: 'UI', module: 'windows', func: 'setup' }, 'There is nothing in our local window storage container any longer, removing local storage property for now.');
                    store.remove('windows');
                }
            }

            _priv.lStorage = lStorage;

        }
        else {

            journal.log({ type: 'info', owner: 'UI', module: 'windows', func: 'setup' }, 'There is no local storage container to worry about at this time.');
        }

    };

    return {
        createReference: createReference,
        getDefaultWindowName: getDefaultWindowName,
        getReference: getReference,
        open: open,
        setup: setup
    };

});
