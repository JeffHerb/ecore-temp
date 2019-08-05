define(['render', 'guid'], function(render, guid) {

    var _priv = {};
    var _events = {};

    _priv.isGenerated = false;
    _priv.isOpen = false;
    _priv.inputTimeout = false;
    _priv.filterTolerance = 200;
    _priv.init = false;

    _priv.generateMenuContents = function _generate_menu_contents(fragment, menuItems, level) {

        if (!level) {
            level = 1;
        }

        var menuSection = document.createElement('ul');
        menuSection.setAttribute('id', guid() + "_menu_section" );

        for (var i = 0, len = menuItems.length; i < len; i++) {

            var menuItem = menuItems[i];

            var dMenuItem = document.createElement('li');
            var dMenuControlText = document.createTextNode(menuItem.text);
            var dMenuControl = false;

            if (menuItem.href) {
                dMenuControl = document.createElement('a');
                dMenuControl.setAttribute('href', menuItem.href);
            }
            else if (menuItem.items) {

                if (menuItem.isHeader) {
                    dMenuControl = document.createElement('header');
                }
                else {

                    dMenuControl = document.createElement('button');

                    if (menuItem.expanded) {

                        dMenuControl.setAttribute('aria-expanded', 'true');
                    }
                    else {
                        dMenuControl.setAttribute('aria-expanded', 'false');
                    }

                }
            }
            else {

                dMenuControl = document.createElement('span');
            }

            dMenuControl.appendChild(dMenuControlText);

            // Add the control before we deal with sub items
            dMenuItem.appendChild(dMenuControl);

            if (menuItem.items) {

                _priv.generateMenuContents(dMenuItem, menuItem.items, level++);

                // Now check to see if this menu should be expanded
                var subSpan = dMenuItem.querySelector('span');

                if (subSpan) {
                    dMenuControl.setAttribute('aria-expanded', 'true');
                }
            }

            menuSection.appendChild(dMenuItem);

        }

        fragment.appendChild(menuSection);

    };

    _priv.generate = function _generate(full) {

        if (full) {

            var outerMenuWrapper = document.createElement('nav');
            outerMenuWrapper.setAttribute('id', 'emp-global-menu-wrapper');
            outerMenuWrapper.classList.add('emp-global-menu-wrapper');

            // #=====================
            // Global Menu Control
            // #=====================

            var globaMenuControlWrapper = document.createElement('div');
            globaMenuControlWrapper.classList.add('emp-menu-control-container');

            var globalMenuCloseControl = document.createElement('button');
            globalMenuCloseControl.setAttribute('type', 'button');
            globalMenuCloseControl.classList.add('emp-global-menu-close');
            globalMenuCloseControl.innerHTML = '&times';

            globalMenuCloseControl.addEventListener('click', function(evt) {
                _events.closeMenu(evt);
            });

            globaMenuControlWrapper.appendChild(globalMenuCloseControl);

            // #=====================
            // Global Filter Control
            // #=====================

            var globalFilterWrapper = document.createElement('div');
            globalFilterWrapper.classList.add('emp-menu-filter-container');

            var globalFilterInput = document.createElement('input');
            globalFilterInput.setAttribute('type', 'text');
            globalFilterInput.setAttribute('placeholder', 'Filter');

            globalFilterInput.addEventListener('keyup', function(evt) {

                if (_priv.inputTimeout) {
                    clearInterval(_priv.inputTimeout);
                }

                _priv.inputTimeout = setTimeout(function() {

                    _events.filterInput(evt);
                }, _priv.filterTolerance);

            });

            // Add Filter to wrapper
            globalFilterWrapper.appendChild(globalFilterInput);

            // #=====================
            // Menu Wrapper
            // #=====================

            var menuContensWrapper = document.createElement('div');
            menuContensWrapper.classList.add('emp-menu-contents');


            menuContensWrapper.addEventListener('click', function (evt) {

                _events.expandMenuLevel(evt);
            });

            _priv.generateMenuContents(menuContensWrapper, window.fwData.menus.global.items);

            // Append everything to the outerwrapper
            outerMenuWrapper.appendChild(globaMenuControlWrapper);
            outerMenuWrapper.appendChild(globalFilterWrapper);
            outerMenuWrapper.appendChild(menuContensWrapper);

            // Add the menu to the body wrapper
            var dBodyWrapper = document.querySelector('#body-wrapper');

            dBodyWrapper.appendChild(outerMenuWrapper);

            _priv.isGenerated = true;
        }
        else {

        }

        var menuElem = document.querySelector('#emp-global-menu-wrapper');

        _priv.menuElem = menuElem;
    };

    _priv.filterMenu = function _filter_menu(slug) {

        function searchItems(regex, menuArray) {

            var newMenuLevelArray = [];

            for (var m = 0, mLen = menuArray.length; m < mLen; m++) {

                var item = menuArray[m];

                // Check to see if the current item has sub items;
                if (item.items) {

                    var subMenu = searchItems(regex, item.items);

                    // Since we had a subMenu we need to check to see if any falses were returned
                    for (var sm = 0, smLen = subMenu.length; sm < smLen; sm++) {

                        var smItem = subMenu[sm];

                        if (smItem.hasOwnProperty('skip') && smItem.skip === false) {
                            item.skip = false;

                            break;
                        }
                    }

                    if (!item.hasOwnProperty('skip')) {
                        item.skip = true;
                    }

                    newMenuLevelArray.push(item);

                }
                else {

                    // Check the text for possible slug match
                    if (item.text.toLowerCase().match(regex)) {
                        item.skip = false;
                    }
                    else {
                        item.skip = true;
                    }

                    newMenuLevelArray.push(item);

                }

            }

            return newMenuLevelArray;

        }

        var customRegEx = new RegExp(slug, 'g');

        // Make a copy of the current menu
        var currentMenu = [].concat(window.fwData.menus.global.items);

        var newMenu = searchItems(customRegEx, currentMenu);

    };

    _events.menuClick = function _menu_click(evt) {

        console.log("menu clicked!");


        if (fwData.menus && fwData.menus.global && Object.keys(fwData.menus.global).length) {

            if (!_priv.isGenerated) {

                _priv.generate(true);
            }

            var menuButton = evt.target;

            while (menuButton.nodeName !== 'BUTTON') {
                menuButton = menuButton.parentNode;
            }

            var appBar = menuButton.parentNode.parentNode;

            // Toogle the expanded state
            _priv.isOpen = !_priv.isOpen;

            if (_priv.isOpen) {
                // _priv.menuElem.style.top = appBar.offsetHeight + 'px';

                _priv.menuElem.style.transform = 'translateX(0)';
            }
            else {
                // setting transform to null is not supported by IE11, use "" instead
                _priv.menuElem.style.transform = "";
            }

            // Update the menu control
            menuButton.setAttribute('aria-expanded', _priv.isOpen);
        }
        else {

            journal.log({ type: 'error', owner: 'FW', module: 'externalMenu', func: '_event.menuClick' }, 'Page JSON does not contain any global menu definition.');
        }


    };

    _events.closeMenu = function _close_global_menu(evt) {

    	var control = evt.target;

        if (control.classList.contains('emp-global-menu-close')) {

            _priv.isOpen = false;

            _priv.menuControl.setAttribute('aria-expanded', _priv.isOpen);

			// setting transform to null is not supported by IE11, use "" instead
            _priv.menuElem.style.transform = "";
        }

        return;

    };

    _events.expandMenuLevel = function _expand_menu_level(evt) {

        var control = evt.target;
        var level = control.nextSibling;

        var controlExpanded = control.getAttribute('aria-expanded');

        if (controlExpanded === "false") {

            control.setAttribute('aria-expanded', 'true');
        }
        else {

            control.setAttribute('aria-expanded', 'false');
        }

    };

    _events.filterInput = function _filter_input(evt) {

        var inputValue = evt.target.value.trim();

        var updatedJSON = _priv.filterMenu(inputValue);

    };

    var init = function _external_menu_init() {

        if (!_priv.init) {

            var menuControl = document.querySelector('.emp-global-header .application-header button.menu-button');

            if (menuControl) {

                _priv.menuControl = menuControl;

                menuControl.addEventListener('click', function(evt) {

                    _events.menuClick(evt);

                });
            }

            _priv.init = true;
        }

    };

    return {
        init: init
    };

});
