/*jshint loopfunc: true */
define(['render'], function (render) {

    var _priv = {};
    var _events = {};

    _priv.$userPopover = false;
    _priv.$supportPopover = false;

    _events.getSupportPopover = function(supportJSON, evt) {

        evt.preventDefault();

        var generatePopver = function() {

            var $supportButton = $('#agencyHelp');

            render.section(undefined, supportJSON.popover, 'return', function(html) {

                console.log(html);
                _priv.$supportPopover = $.popover($supportButton, {
                    html: html,
                    display: {
                        className: 'emp-support-popup'
                    }
                });
            });
        };

        emp.load('popover', function _load_support_popover() {

            if (!_priv.$supportPopover) {
                generatePopver();

                _priv.$supportPopover.show();
            }
        });

    };

    _events.userAccountPopover = function(userAcctJSON, evt) {

        evt.preventDefault();

        var generatePopver = function() {

            var $userAccountButton = $('#userAcct');

            // Generate the contents
            render.section(undefined, userAcctJSON.popover, 'return', function(html) {

                _priv.$userPopover = $.popover($userAccountButton, {
                    html: html,
                    display: {
                        className: 'emp-account-popup'
                    }
                });
            });

        };

        emp.load('popover', function _loadPopover() {

            if (!_priv.$userPopover) {
                generatePopver();

                _priv.setUpExpandables(_priv.$userPopover.$popover[0]);

                _priv.$userPopover.show();
            }

        });

    };

    _priv.expandToggle = function(dExpandControl) {

        var dCurrentNode = dExpandControl;

        while(true) {

            if (dCurrentNode.nodeName === "BODY") {
                dCurrentNode = false;
                break;
            }

            if (dCurrentNode.nodeType === 1) {

                if (dCurrentNode.classList.contains('emp-expandable-control')) {
                    break;
                }

            }

            dCurrentNode = dCurrentNode.parentNode;
        }

        if (dCurrentNode) {

            dSpan = dCurrentNode;
    
            if (dSpan.classList.contains('emp-collapse-children')) {
                dSpan.classList.remove('emp-collapse-children');
            }
            else {
                dSpan.classList.add('emp-collapse-children');
            }
        }
    };

    _priv.setUpExpandables = function(dContents) {

        var dnExpandables = dContents.querySelectorAll('.emp-expandable-control');

        if (dnExpandables && dnExpandables.length) {

            for (var e = 0, eLen = dnExpandables.length; e < eLen; e++) {

                dnExpandables[e].addEventListener('click', function(evt, dElem) {
                    _priv.expandToggle(evt.target);
                });
            }
        }

    };

    _priv.isInit = false;

    _priv.init = function _init(dSelectElem) {

        var dHTML = document.querySelector('html');

        if (dHTML.classList.contains('external-app') && !_priv.isInit) {
            journal.log({ type: 'info', owner: 'UI', module: 'emp', function: 'externalApp' }, 'Page is running in external app mode!');

            var dUnavBannerToggle = document.querySelector('#banner-toggle button');
            var dUnavBannerMobileToggle = document.querySelector('.unav-header .unav-primary-bar .unav-toggle-arrow a');

            var dBodyWrapper = document.querySelector('#body-wrapper');
            var dHeaderWrapper = document.querySelector('#header-wrapper');
            var dUniversalBar = document.querySelector('#header-wrapper .unav-header');

            if (dUnavBannerToggle) {

                dUnavBannerToggle.addEventListener('click', function() {

                    if (dUnavBannerToggle.classList.contains('active')) {
                        dHeaderWrapper.classList.remove('active-unav-bar');
                        dUnavBannerToggle.classList.remove('active');
                    }
                    else {
                        dHeaderWrapper.classList.add('active-unav-bar');
                        dUnavBannerToggle.classList.add('active');
                    }

                });

            }
            else {
                journal.log({ type: 'error', owner: 'UI', module: 'emp', function: 'externalApp' }, 'Banner toogle event not setup because element is missing.');
            }

            if (dUnavBannerMobileToggle) {

                dUnavBannerMobileToggle.addEventListener('click', function(e) {

                    event.preventDefault();

                    if (dHeaderWrapper.classList.contains('active-unav-menu')) {
                        dHeaderWrapper.classList.remove('active-unav-menu');
                        dUnavBannerMobileToggle.classList.remove('active');
                    }
                    else {
                        dHeaderWrapper.classList.add('active-unav-menu');
                        dUnavBannerMobileToggle.classList.add('active');
                    }

                });
            }
            else {
                journal.log({ type: 'error', owner: 'UI', module: 'emp', function: 'externalApp' }, 'Banner mobile toogle event not setup because element is missing.');
            }

            // Find user and support controls
            var dUserAccountButton = document.querySelector('#userAcct');
            var dSupportButton = document.querySelector('#agencyHelp');

            console.log(fwData.menus);

            if (dUserAccountButton && fwData.menus.userAccount) {

                var userAccountPopover = {
                    "popover": {
                        "contents": [                                
                            {
                                "template": "popover",
                                "contents": [
                                ]
                            }
                        ]
                    }
                };

                // Construct the user info section if it exists
                if (fwData && fwData.context && fwData.context.screen && fwData.context.screen.userInfo) {
                    
                    var oUserInfo = {
                        "type": "external-auth-user",
                        "template": "composite",
                        "properties": {
                            "realName": fwData.context.screen.userInfo.realName,
                            "companyName": fwData.context.screen.userInfo.companyName,
                            "userid": fwData.context.screen.userInfo.userid
                        }
                    };

                    userAccountPopover.popover.contents[0].contents.push(oUserInfo);
                }

                // Construct the account info section if it exists
                if (fwData && fwData.context && fwData.context.screen && fwData.context.screen.accountInfo) {
                    
                    var oUserAcctInfo = {
                        "type": "external-account-demo",
                        "template": "composite",
                        "properties": {
                            "account": fwData.context.screen.accountInfo.account,
                            "role": fwData.context.screen.accountInfo.role
                        }
                    };

                    userAccountPopover.popover.contents[0].contents.push(oUserAcctInfo);
                }

                // Add the account menu if it exists
                if (fwData && fwData.menus && fwData.menus.userAccount) {
                    userAccountPopover.popover.contents[0].contents.push(fwData.menus.userAccount);
                }

                // Add the system menu if it exists
                if (fwData && fwData.menus && fwData.menus.system) {
                    userAccountPopover.popover.contents[0].contents.push(fwData.menus.system);
                }

                dUserAccountButton.addEventListener('click', _events.userAccountPopover.bind(null, userAccountPopover));

                journal.log({ type: 'info', owner: 'UI', module: 'emp', function: 'externalApp' }, 'User Account Menu setup');
            }
            else {
                journal.log({ type: 'error', owner: 'UI', module: 'emp', function: 'externalApp' }, 'User Account Menu not setup because something is missing');
            }

            if (dSupportButton && fwData.menus.supportContact) {

                // {
                //     "template": "tree",
                //     "items": [
                //         {
                //             "template": "link",
                //             "attributes": {
                //                 "href": "[LINK DEFINED BY HELO LINKS INPUT]"
                //             },
                //             "text": "Help Link"
                //         }
                //     ]
                // },
                // {
                //     "template": "tree",
                //     "items": [
                //         {
                //             "template": "link",
                //             "attributes": {
                //                 "href": "[LINK DEFINED BY SUPPORT LINK INPUT]"
                //             },
                //             "text": "Support"
                //         },
                //         {
                //             "template": "link",
                //             "attributes": {
                //                 "href": "[LINK DEFINED BY CONTACT US LINK INPUT]"
                //             },
                //             "text": "Contact Us"
                //         }
                //     ]
                // }

                var supportPopover = {
                    "popover": {
                        "contents": [
                            {
                                "template": "popover",
                                "contents": [
                                ]
                            }
                        ]
                    }
                };

                // Add the account menu if it exists
                if (fwData && fwData.menus && fwData.menus.addHelp) {
                    supportPopover.popover.contents[0].contents.push(fwData.menus.addHelp);
                }

                // Add the account menu if it exists
                if (fwData && fwData.menus && fwData.menus.supportContact) {
                    supportPopover.popover.contents[0].contents.push(fwData.menus.supportContact);
                }

                dSupportButton.addEventListener('click', _events.getSupportPopover.bind(null, supportPopover));

                journal.log({ type: 'info', owner: 'UI', module: 'emp', function: 'externalApp' }, 'Support Menu setup');
            }
            else {
            	journal.log({ type: 'error', owner: 'UI', module: 'emp', function: 'externalApp' }, 'Support Menu not setup because something is missing');
            }

            _priv.isInit = true;
        }

    };

    return {
        init: _priv.init
    };

});
