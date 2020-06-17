define(['render', 'keepAlive', 'store'], function (render, keepAlive, store) {

    var _priv = {};

    _priv.currentModal = false;
    _priv.currentModalTimer = false;
    _priv.currentSessionExpired = false;

    _priv.sessionHasParent = false;

    _priv.parentLastVisit = false;
    _priv.parentTimeout = false;
    _priv.currentSessionTimeout = false;

    _priv.parentRefreshTimer = false;

    _priv.fiveMinutes = 300000;

    _priv.refreshParent = function _refresh_parent(newTime) {

        if (!newTime) {
            newTime = Date.now();
        }

        function cb(result, pltfrm){

            var pltfrmTimeout = (typeof pltfrm.timeout === "string") ? parseInt(pltfrm.timeout) : pltfrm.timeout;
    
            if (!result) {

                journal.log({ type: 'error', owner: 'UI', module: 'session', submodule: '', func: 'refreshParent' }, 'Failed to refresh ' + pltfrm.name + ' session!');

            }
            else {

                store.set(pltfrm.name+'LastVisit', newTime);

                journal.log({ type: 'info', owner: 'UI', module: 'session', submodule: '', func: 'refreshParent' }, pltfrm.name + ' localstorage value was refreshed');

                // Re-setup the parent(s) timer to kick up in the expected number of miliseconds
                _priv.parentRefreshTimer = setTimeout(_priv.refreshParent, pltfrmTimeout);

                journal.log({ type: 'info', owner: 'UI', module: 'session', submodule: '', func: 'refreshParent' }, pltfrm.name + ' Session extended for another ' + pltfrmTimeout + ' miliseconds');
            }
        }

        if (!_priv.currentSessionExpired) {

            //Check for parent(s) - Prevously visited platform(s)
            if(_priv.sessionHasParent){

                for(var sPrnt in fwData.context.session.parent){

                    keepAlive.platform(fwData.context.session.parent[sPrnt].keepAlive, cb, fwData.context.session.parent[sPrnt]);
                }

            }else{

                journal.log({ type: 'info', owner: 'UI', module: 'session', submodule: '', func: 'refreshParent' }, 'Attempted to refresh parent sessions - No parents found.');
            }
        }

    };

    _priv.warningModal = function _warning_modal() {

        emp.load('modal', function _empire2_warning_modal() {

            var warningModal = {
                "contents": [
                    {
                        "type": "row",
                        "template": "grid",
                        "contents": [
                            {
                                "type": "column",
                                "template": "grid",
                                "contents": [
                                    {
                                        "template": "output",
                                        "text": "You session will expire in 5 minutes. Would you like to extend it?"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "type": "row",
                        "template": "buttonGroup",
                        "style": "session-modal",
                        "contents": [
                            {
                                "type": "column",
                                "template": "buttonGroup",
                                "style": "align-right",
                                "width": "full",
                                "contents": [
                                    {
                                        "type": "button",
                                        "template": "field",
                                        "input": {
                                            "attributes": {
                                                "id": "extendSessionCancel",
                                            },
                                            "text": "No",
                                        },
                                        "noFieldWrap": true
                                    },
                                    {
                                        "type": "button",
                                        "template": "field",
                                        "input": {
                                            "attributes": {
                                                "id": "extendSession",
                                            },
                                            "text": "Yes, Extend Session",
                                            "primary": true,
                                        },
                                        "noFieldWrap": true
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            render.section(undefined, warningModal, 'return', function(htmlContents) {

                var warningModal = $.modal({
                        html: htmlContents,
                        hideDestroy: false,
                        buildInvisible: true,
                        autoOpen: true,
                        onCreate: function(modal) {

                            _priv.currentModal = modal;

                            var extendSessionButton = document.querySelector('#extendSession');
                            var extendSessionCancelButton = document.querySelector('#extendSessionCancel');

                            clearInterval(_priv.currentModalTimer);

                            _priv.currentModalTimer = setTimeout(_priv.timeoutModal, _priv.fiveMinutes);

                            extendSessionCancelButton.addEventListener('click', function() {

                                _priv.currentModal.destroy();

                                journal.log({ type: 'warning', owner: 'UI', module: 'session', submodule: '', func: 'warningModal' }, 'User decided to not extend their session.');
                            });

                            extendSessionButton.addEventListener('click', function() {

                                //Current session
                                keepAlive.platform(fwData.context.session.current.keepAlive, function(result) {

                                    _priv.currentModal.destroy();

                                    clearInterval(_priv.currentModalTimer);

                                    if (!result) {

                                        journal.log({ type: 'error', owner: 'UI', module: 'session', submodule: '', func: 'warningModal' }, 'Session failed to be extended!');
                                    }
                                    else {

                                        //refresh parent(s) - Keep parents in sync
                                        if(_priv.sessionHasParent){

                                            _priv.refreshParent();
                                        }

                                        //sync localstorage - Is this needed? localStorage is being set by _priv.refreshParent function, but only if request successful.
                                        if(_priv.sessionHasParent){

                                            for(var sP in fwData.context.session.parent){

                                                if(store.get(fwData.context.session.parent[sP].name+'LastVisit')){

                                                    store.set(fwData.context.session.parent[sP].name+'LastVisit', Date.now());
                                                }
                                            }
                                        }

                                        _priv.currentModalTimer = setTimeout(_priv.warningModal, _priv.currentSessionTimeout);

                                        journal.log({ type: 'info', owner: 'UI', module: 'session', submodule: '', func: 'warningModal' }, 'Session extended for another ' + _priv.currentSessionTimeout + ' miliseconds');
                                    }

                                }, fwData.context.session.current);

                            });

                        }

                });

                currentTimeoutModal = warningModal;

            });

        });
    };

    _priv.timeoutModal = function _timeout_modal() {

        var timeoutModal = {
            "contents": [
                {
                    "type": "row",
                    "template": "grid",
                    "contents": [
                        {
                            "type": "column",
                            "template": "grid",
                            "contents": [
                                {
                                    "template": "output",
                                    "text": "Your Empire session has expired. You can close this modal, but any other action buttons on this page will no longer work."
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "row",
                    "template": "buttonGroup",
                    "contents": [
                        {
                            "type": "column",
                            "template": "buttonGroup",
                            "style": "align-right",
                            "contents": [
                                {
                                    "type": "button",
                                    "template": "field",
                                    "input": {
                                        "attributes": {
                                            "id": "sessionExpired",
                                        },
                                        "text": "OK",
                                        "primary": true
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    
        render.section(undefined, timeoutModal, 'return', function(htmlContents) {
    
            var timeoutModal = $.modal({
                    html: htmlContents,
                    hideDestroy: false,
                    buildInvisible: true,
                    autoOpen: true,
                    onCreate: function(modal) {
    
                        journal.log({ type: 'error', owner: 'UI', module: 'session', submodule: '', func: 'timeoutModal' }, 'Session expired!');
    
                        _priv.currentModal.destroy();
    
                        _priv.currentModal = modal;
    
                        _priv.currentSessionExpired = true;
    
                        var sessionExpiredButton = document.querySelector('#sessionExpired');
    
                        sessionExpiredButton.addEventListener('click', function() {
    
                            modal.destroy();

                            //redirect to logout page
                            if(fwData && fwData.context && fwData.context.session && fwData.context.session.current && fwData.context.session.current.logout){

                                if(fwData.context.session.current.logout !== ""){

                                    window.location = fwData.context.session.current.logout;

                                    journal.log({ type: 'info', owner: 'UI', module: 'session', submodule: '', func: 'timeoutModal' }, 'Redirected user to logout page.');
                                
                                }else{

                                    journal.log({ type: 'error', owner: 'UI', module: 'session', submodule: '', func: 'timeoutModal' }, 'Logout url not found!');
                                }

                            }else{

                                journal.log({ type: 'error', owner: 'UI', module: 'session', submodule: '', func: 'timeoutModal' }, 'Logout property not found!');
                            }
                            
                        });
    
                    }
    
            });
    
            _priv.currentTimeoutModal = timeoutModal;
    
        });    
    };


    var init = function _session_setup(){

        _priv.currentTime = Date.now();

        var remainingParentTime = false;

        //Get session parents 
        if(fwData && fwData.context && fwData.context.session && fwData.context.session.parent && fwData.context.session.parent.length > 0){

            _priv.sessionHasParent = true;

            for(var sessionParent in fwData.context.session.parent){
                
                // Take care of issue where parents lastVisited data becomes null as user jumps from different platforms.
                if(fwData.context.session.parent[sessionParent].lastVisited){

                    var parentLastVisitedLST = store.get(fwData.context.session.parent[sessionParent].name+'LastVisit');

                    if(parentLastVisitedLST){

                        //Assign lStorage value
                        fwData.context.session.parent[sessionParent].lastVisited = parentLastVisitedLST;
                    }
                }
            }
        }

        if(fwData && fwData.context && fwData.context.session && fwData.context.session.current && fwData.context.session.current.timeout && fwData.context.session.current.keepAlive){

            journal.log({ type: 'info', owner: 'UI', module: 'session', submodule: '', func: 'refreshParents' }, 'Attempting to setup session management.');

            // ----------------- Parent(s) session -----------------
            if(_priv.sessionHasParent === true){

                for(var sParent in fwData.context.session.parent){

                    if(fwData.context.session.parent[sParent].lastVisited && fwData.context.session.parent[sParent].timeout){

                        //Sanitize lastVisited and timeout values
                        _priv.parentLastVisit = (typeof fwData.context.session.parent[sParent].lastVisited === "string") ? parseInt(fwData.context.session.parent[sParent].lastVisited) : fwData.context.session.parent[sParent].lastVisited;
                        _priv.parentTimeout = (typeof fwData.context.session.parent[sParent].timeout === "string") ? parseInt(fwData.context.session.parent[sParent].timeout) : fwData.context.session.parent[sParent].timeout;

                        // Start by checking to see if we have parent(s) LastVisited Information in localStorage
                        _priv.parentLastVisitedLStorage = store.get(fwData.context.session.parent[sParent].name+'LastVisit');

                        if(!_priv.parentLastVisitedLStorage){

                            journal.log({ type: 'info', owner: 'UI', module: 'session', submodule: '', func: 'init' }, 'No local storage value was found for ' + fwData.context.session.parent[sParent].name);

                            // Defaulting local storage value to current fwdata value
                            _priv.parentLastVisitedLStorage = _priv.parentLastVisit;

                            // Because we dont know how long a user may have been on the last parent page we need to compute remaining time from provided timeout duration
                            remainingParentTime = _priv.currentTime - _priv.parentLastVisit;

                            // Check to see if the parent timer is already withing 5 minutes or less
                            if (remainingParentTime <= _priv.fiveMinutes) {

                                journal.log({ type: 'info', owner: 'UI', module: 'session', submodule: '', func: 'init' }, 'Forcing ' + fwData.context.session.parent[sParent].name + ' refresh as it will expire in less than 5 minutes');

                                _priv.refreshParent(_priv.currentTime);

                            }else if (remainingParentTime > _priv.parentTimeout) {

                                journal.log({ type: 'info', owner: 'UI', module: 'session', submodule: '', func: 'init' }, 'Forcing ' + fwData.context.session.parent[sParent].name + ' refresh though it might be too late');
            
                                _priv.refreshParent(_priv.currentTime);
                                
                            }else {

                                journal.log({ type: 'info', owner: 'UI', module: 'session', submodule: '', func: 'init' }, fwData.context.session.parent[sParent].name + ' set to refresh in ' + (remainingParentTime - _priv.fiveMinutes) + ' milliseconds');
            
                                // Parent does not need to be refreshed just yet but it will require refresh sooner than current session.
                                _priv.parentRefreshTimer = setTimeout(_priv.refreshParent, (remainingParentTime - _priv.fiveMinutes));
                            }


                        }else{

                            journal.log({ type: 'info', owner: 'UI', module: 'session', submodule: '', func: 'init' }, 'Local storage value was found for ' + fwData.context.session.parent[sParent].name);

                            var workingLastVisit = false;

                            // We have a local storage value so we need to compare
                            // If the localStorage value is bigger than the value in the fwData we will run with that number
                            if (_priv.parentLastVisitedLStorage > _priv.parentLastVisit) {

                                // Work of the current local storage value
                                workingLastVisit = _priv.parentLastVisitedLStorage;
                            }
                            else if (_priv.parentLastVisitedLStorage === _priv.parentLastVisit) {

                                // Work off the fwData
                                workingLastVisit = _priv.parentLastVisit;
                            }

                            remainingParentTime = _priv.currentTime - workingLastVisit;

                            // Check to see if the parent timer is already withing 5 minutes or less
                            if (remainingParentTime <= _priv.fiveMinutes) {

                                journal.log({ type: 'info', owner: 'UI', module: 'session', submodule: '', func: 'init' }, 'Forcing ' + fwData.context.session.parent[sParent].name + ' refresh as it will expire in less than 5 minutes');

                                _priv.refreshParent(_priv.currentTime);

                            }else if(remainingParentTime > _priv.parentTimeout) {

                                journal.log({ type: 'info', owner: 'UI', module: 'session', submodule: '', func: 'init' }, 'Forcing ' + fwData.context.session.parent[sParent].name + ' refresh though it might be too late');
            
                                _priv.refreshParent(_priv.currentTime);
                            
                            }else {

                                journal.log({ type: 'info', owner: 'UI', module: 'session', submodule: '', func: 'init' }, fwData.context.session.parent[sParent].name  + ' set to refresh in ' + (remainingParentTime - _priv.fiveMinutes) + 'milliseconds');
            
                                // Parent does not need to be refreshed just yet but it will require refresh sooner than current session.
                                _priv.parentRefreshTimer = setTimeout(_priv.refreshParent, (remainingParentTime - _priv.fiveMinutes));
                            }
                        }
                    }
                }           
            }else{

                journal.log({ type: 'info', owner: 'UI', module: 'session', submodule: '', func: 'init' }, 'Attempted to address parent sessions - No parents found.');
            }

            //----------------- Current session -----------------
            _priv.currentSessionTimeout = (typeof fwData.context.session.current.timeout === "string") ? parseInt(fwData.context.session.current.timeout ) : fwData.context.session.current.timeout;

            //Set timer for current session
            _priv.currentModalTimer = setTimeout(_priv.warningModal, (_priv.currentSessionTimeout - _priv.fiveMinutes));
        
        }else{

            journal.log({ type: 'error', owner: 'UI', module: 'session', submodule: '', func: 'init' }, 'Session timeout not able to be setup!');
        }
        
    };

    return {
        setup: init
    };

});