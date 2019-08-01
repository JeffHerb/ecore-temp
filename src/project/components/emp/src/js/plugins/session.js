define(['render', 'keepAlive'], function (render, keepAlive) {

    var _priv = {};

    _priv.currentModal = false;
    _priv.currentModalTimer = false;
    _priv.e2Expired = false;

    //_priv.e1Refresh = false;
    _priv.e1RefreshTimer = false;

    _priv.fiveMinutes = 300000;

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
                                    "text": "Your Empire session has expired. You can close this modal, but an other action buttons on this page will no longer work."
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

                        _priv.e2Expired = true;

                        var sessionExpiredButton = document.querySelector('#sessionExpired');

                        sessionExpiredButton.addEventListener('click', function() {
                                
                            modal.destroy();
                        });

                    }

            });

            _priv.currentTimeoutModal = timeoutModal;

        });

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
                                                "id": "extendSessionCancel",
                                            },
                                            "text": "No"
                                        }
                                    },
                                    {
                                        "type": "button",
                                        "template": "field",
                                        "input": {
                                            "attributes": {
                                                "id": "extendSession",
                                            },
                                            "text": "Yes, Extend Session",
                                            "primary": true
                                        }
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
                            });

                            extendSessionButton.addEventListener('click', function() {

                                keepAlive.e2(fwData.urls.keepAlive.e2, function() {

                                    _priv.currentModal.destroy();

                                    clearInterval(_priv.currentModalTimer);

                                    _priv.currentModalTimer = setTimeout(_priv.warningModal, fwData.screen.e2Timeout);

                                    journal.log({ type: 'info', owner: 'UI', module: 'session', submodule: '', func: 'pageSetup' }, 'Session extended for another ' + fwData.screen.timeout + ' miliseconds');

                                });

                            });

                        }

                });

                currentTimeoutModal = warningModal;

            });

        });
    };

    _priv.refreshE1 = function _refresh_E1() {

        if (!_priv.e2Expired) {

            keepAlive.e1(fwData.urls.keepAlive.e2, function(result) {
    
                if (!result) {
    
                }
                else {
    
                    // Re-setup the E1 timer to kick up in the expected number of miliseconds
                    _priv.e1RefreshTimer = setTimeout(_priv.refreshE1, fwData.screen.e1Timeout);
                }
    
            });
        }

    };

    var _setup = function _session_setup() {

        if (fwData && fwData.screen && fwData.screen.timeout && fwData.urls && fwData.urls.keepAlive && fwData.urls.keepAlive.e2) {

            journal.log({ type: 'info', owner: 'UI', module: 'session', submodule: '', func: 'pageSetup' }, 'Session timeout was setup to execute in ' + fwData.screen.timeout + ' miliseconds');

            _priv.currentModalTimer = setTimeout(_priv.warningModal, (fwData.screen.timeout - _priv.fiveMinutes));
        }
        else {
            journal.log({ type: 'warning', owner: 'UI', module: 'session', submodule: '', func: 'setup' }, 'Session timeout not able to be setup!');
        }

        if (fwData && fwData.screen && fwData.screen.e1Timeout && fwData.screen.e1LastVisit && fwData.urls && fwData.urls.keepAlive && fwData.urls.keepAlive.e1) {

            // Take the current unix time from the system
            var currentTime = new Date().getTime();

            // Check to see if a refreash already needs to occur
            if ((fwData.screen.e1LastVisit + fwData.screen.e1Timeout) <= currentTime) {

                // We need to execute a refresh, time setup will occu
                _priv.refreshE1();

                journal.log({ type: 'info', owner: 'UI', module: 'session', submodule: '', func: 'pageSetup' }, 'E1 Session needed to be restored right away!');

            }
            else {

                var remainingWait = (fwData.screen.e1LastVisit + fwData.screen.e1Timeout) - currentTime;

                _priv.e1RefreshTimer = setTimeout(_priv.refreshE1, remainingWait);

                journal.log({ type: 'info', owner: 'UI', module: 'session', submodule: '', func: 'pageSetup' }, 'Session timeout was setup to refresh in e1 in: ' + remainingWait + ' miliseconds');

            }

        }
        else {

            console.log("Missing e1 session info");
        }

        
    };

    return {
        setup: _setup
    };

});
