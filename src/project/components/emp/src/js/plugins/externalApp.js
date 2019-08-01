define(['render'], function (render) {

    var _priv = {};
    var _events = {};

    _priv.$userPopover = false;

    _events.userAccountPopover = function(userAcctJSON) {

        var generatePopver = function() {

            var $userAccountButton = $('#userAcct');

            // Generate the contents
            render.section(undefined, userAcctJSON.userAcct.contents[0], 'return', function(html) {
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

                var dUserAccountButton = document.querySelector('#userAcct');
                var userAccountJSON = fwData.header.contents[1];
    
                if (dUserAccountButton && userAccountJSON) {
    
                    dUserAccountButton.addEventListener('click', _events.userAccountPopover.bind(null, userAccountJSON));
    
                }
            }


            _priv.isInit = true;
        }

    };

    return {
        init: _priv.init
    };

});
