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

                console.log(html);
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

                _priv.$userPopover.show();
            }

        });

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

            if (fwData.header && fwData.header.contents) {

                // Find user and support controls
                var dUserAccountButton = document.querySelector('#userAcct');
                var dSupportButton = document.querySelector('#agencyHelp');

                var userAccountJSON = false;
                var supportJSON = false;

                for (var hc = 0, hcLen = fwData.header.contents.length; hc < hcLen; hc++) {

                    if (fwData.header.contents[hc].template && fwData.header.contents[hc].template === "agency-header") {
                        
                        // Save off the user account information
                        if (fwData.header.contents[hc].userAcct) {
                            userAccountJSON = fwData.header.contents[hc].userAcct;
                        }

                        // Save off the support button information
                        if (fwData.header.contents[hc].support) {
                            supportJSON = fwData.header.contents[hc].support;
                        }

                        break;
                    }

                }
    
                if (dUserAccountButton && userAccountJSON) {
    
                    dUserAccountButton.addEventListener('click', _events.userAccountPopover.bind(null, userAccountJSON));
                }

                if (dSupportButton && supportJSON) {
    
                    dSupportButton.addEventListener('click', _events.getSupportPopover.bind(null, supportJSON));
                }
            }


            _priv.isInit = true;
        }

    };

    return {
        init: _priv.init
    };

});
