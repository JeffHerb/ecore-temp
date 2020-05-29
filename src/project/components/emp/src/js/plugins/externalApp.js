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

                if (_priv.$userPopover) {

                    _priv.setUpExpandables(_priv.$userPopover.$popover[0]);
                }

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

            var bInlineMenu = false;

            if (dUserAccountButton) {
                bInlineMenu = (dUserAccountButton.getAttribute('data-inlinemenu')) ? true : false;
            }

            var userAccountPopover = false;

            if (dUserAccountButton && (fwData.menus.system || fwData.menus.userAccount)) {

                userAccountPopover = {
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

                // Add the user account menu if it exists
                if (fwData && fwData.menus && fwData.menus.userAccount && fwData.menus.userAccount.items && fwData.menus.userAccount.items.length) {
                    userAccountPopover.popover.contents[0].contents.push(fwData.menus.userAccount);
                }

                // Add the system menu if it exists
                if (fwData && fwData.menus && fwData.menus.system && fwData.menus.system.items && fwData.menus.system.items.length) {

                    var logoutIndex = false;

                    for (var sm = 0, smLen = fwData.menus.system.items.length; sm < smLen; sm++) {
                        var menuItem = fwData.menus.system.items[sm];

                        if (menuItem.text.toLowerCase() === "logout") {
                            logoutIndex = sm;
                        }

                    }

                    if (logoutIndex > -1) {
                        fwData.menus.system.items.splice(logoutIndex, 1);
                    }

                    if (fwData.menus.system.items && fwData.menus.system.items.length) {

                        userAccountPopover.popover.contents[0].contents.push(fwData.menus.system);
                    }

                }

                if (userAccountPopover.popover.contents[0].contents.length) {
                    dUserAccountButton.addEventListener('click', _events.userAccountPopover.bind(null, userAccountPopover));
                }
                else {

                    dUserAccountButton.classList.add('emp-disabled-user-menu');
                }

                journal.log({ type: 'info', owner: 'UI', module: 'emp', function: 'externalApp' }, 'User Account Menu setup');
            }
            else if (dUserAccountButton && bInlineMenu) {

                var oAgencyHeader = false;

                for (var h = 0, hLen = fwData.header.contents.length; h < hLen; h++) {

                    var oHeader = fwData.header.contents[h];

                    if (oHeader && oHeader.template && oHeader.template === "agency-header") {
                        oAgencyHeader = oHeader;
                        break;
                    }

                }

                if (oAgencyHeader) {

                    userAccountPopover = {
                        popover: {
                            contents: false
                        }
                    };

                    userAccountPopover.popover.contents = oAgencyHeader.userAcct.popover.contents;

                    dUserAccountButton.addEventListener('click', _events.userAccountPopover.bind(null, userAccountPopover));
                }

                journal.log({ type: 'warn', owner: 'UI', module: 'emp', function: 'externalApp' }, 'User Account Menu setup, but is using the old spec via the agency header template!');

            }
            else {
                journal.log({ type: 'error', owner: 'UI', module: 'emp', function: 'externalApp' }, 'User Account Menu not setup because something is missing');
            }

            var bSupportMenuLinksExist = false;

            if (dSupportButton && (fwData.menus.supportContact || fwData.menus.appHelp)) {

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
                if (fwData && fwData.menus && fwData.menus.appHelp && fwData.menus.appHelp.items && fwData.menus.appHelp.items.length) {
                    supportPopover.popover.contents[0].contents.push(fwData.menus.appHelp);

                    bSupportMenuLinksExist = true;
                }

                // Add the account menu if it exists
                if (fwData && fwData.menus && fwData.menus.supportContact && fwData.menus.supportContact.items && fwData.menus.supportContact.items.length) {
                    supportPopover.popover.contents[0].contents.push(fwData.menus.supportContact);

                    bSupportMenuLinksExist = true;
                }

                if (bSupportMenuLinksExist) {

                    dSupportButton.addEventListener('click', _events.getSupportPopover.bind(null, supportPopover));
                    journal.log({ type: 'info', owner: 'UI', module: 'emp', function: 'externalApp' }, 'Support Menu setup');
                }
                else {

                    journal.log({ type: 'warning', owner: 'UI', module: 'emp', function: 'externalApp' }, 'Support Menu setup skipped, no items');
                }

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
