define(['render', 'guid'], function(render, guid) {

    var _priv = {};
    var _events = {};

    _priv.isGenerated = false;
    _priv.isOpen = false;
    _priv.inputTimeout = false;
    _priv.filterTolerance = 400;
    _priv.oCatalogMenu = false;
    _priv.$generatedCatalogMenu = false;
    _priv.oOriginalMenu = false;
    _priv.bMenuChanged = false;
    _priv.init = false;

    // Menu currently used in rendering
    _priv.aCurrentMenu = false;

    _priv.CLASSLIST = {
        "changeCatalogToggle": "emp-active-catalog"
    };

    _priv.generateMenuContents = function _generate_menu_contents(fragment, menuItems, level) {

        if (!level) {
            level = 1;
        }

        if (_priv.aCurrentMenu === false && level === 1) {
            _priv.currentMenu = [].concat(menuItems);
        }

        var menuSection = document.createElement('ul');
        menuSection.setAttribute('id', guid() + "_menu_section" );

        for (var i = 0, len = menuItems.length; i < len; i++) {

            var menuItem = menuItems[i];

            if (menuItem.hasOwnProperty('skip') && menuItem.skip) {
                continue;
            }

            var dMenuItem = document.createElement('li');
            var dMenuControlText = document.createTextNode(menuItem.text);
            var dMenuControl = false;

            if (menuItem.href || (menuItem.attributes && menuItem.attributes.href)) {

                var href = (menuItem.href) ? menuItem.href : menuItem.attributes.href;

                dMenuControl = document.createElement('a');
                dMenuControl.setAttribute('href', href);
                
                if (menuItem.attributes && menuItem.attributes['data-appId']) {

                    dMenuControl.setAttribute('data-appId', menuItem.attributes['data-appId']);

                    if (fwData && fwData.context && fwData.context.app && fwData.context.app.id)

                    if (menuItem.attributes['data-appId'] === fwData.context.app.id) {
                        dMenuControl.classList.add('emp-active-menu-item');
                    }

                }

                if (menuItem.attributes && menuItem.attributes.target) {
                    dMenuControl.setAttribute('target', menuItem.attributes.target);
                }

                if (menuItem.onclick) {
                    dMenuControl.setAttribute('onclick', menuItem.onclick);
                }
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

                _priv.generateMenuContents(dMenuItem, menuItem.items, (level + 1));

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

    _priv.generate = function _generate(full, data) {

        var outerMenuWrapper = false;
        var globaMenuControlWrapper = false;
        var globalMenuCloseControl = false;
        var menuContensWrapper = false;

        if (full) {

            outerMenuWrapper = document.createElement('nav');
            outerMenuWrapper.setAttribute('id', 'emp-global-menu-wrapper');
            outerMenuWrapper.setAttribute('tabindex', '0');
            outerMenuWrapper.classList.add('emp-global-menu-wrapper');

            // #=====================
            // Global Menu Control
            // #=====================

            globaMenuControlWrapper = document.createElement('div');
            globaMenuControlWrapper.classList.add('emp-menu-control-container');

            globalMenuCloseControl = document.createElement('button');
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
                    clearTimeout(_priv.inputTimeout);
                }

                _priv.inputTimeout = setTimeout(function() {

                    _events.filterInput(evt);
                }, _priv.filterTolerance);

            });

            // Add Filter to wrapper
            globalFilterWrapper.appendChild(globalFilterInput);

            // #=====================
            // Catagory Control
            // #=====================

            var catalogWrapper = false;

            if (fwData.menus.global && fwData.menus.global.catalogs) {

                catalogWrapper = document.createElement('div');
                catalogWrapper.classList.add('emp-catalog-outer-wrapper');

                var catalogInnerWrapper = document.createElement('div');
                catalogInnerWrapper.classList.add('emp-catalog-inner-wrapper');

                if (fwData.menus.global.catalogs.length === 1) {

                    catalogInnerWrapper.classList.add('emp-static-catalog-title');

                    var staticCatalogTitle = document.createElement('span');
                    staticCatalogTitle.classList.add(_priv.CLASSLIST.changeCatalogToggle);

                    var staticCatalogText = document.createTextNode(fwData.menus.global.catalogs[0].text);

                    staticCatalogTitle.appendChild(staticCatalogText);

                    catalogInnerWrapper.appendChild(staticCatalogTitle);
                }
                else {

                    var oActiveCatalog = false;

                    for (var c = 0, cLen = fwData.menus.global.catalogs.length; c < cLen; c++) {

                        if (fwData.menus.global.catalogs[c].active) {
                            oActiveCatalog = fwData.menus.global.catalogs[c];
                            break;
                        }

                    }

                    catalogInnerWrapper.classList.add('emp-interactive-catalog-title');

                    var interCatalogControl = document.createElement('button');
                    interCatalogControl.setAttribute('role', 'button');
                    interCatalogControl.classList.add('emp-active-catalog');

                    var interCatalogIcon = document.createElement('div');
                    interCatalogIcon.classList.add('emp-active-catalog-icon');
                    interCatalogControl.appendChild(interCatalogIcon);

                    for (var i = 1, len = 5; i < len; i++) {

                        var interIconPart = document.createElement('span');
                        interIconPart.classList.add('sqr-'+ i);

                        interCatalogIcon.appendChild(interIconPart);
                    }


                    var interCatalogTitleWrapper = document.createElement('div');
                    interCatalogTitleWrapper.classList.add('emp-active-catalog-title-wrapper');

                    var interCatalogTitle = document.createTextNode(oActiveCatalog.text);
                    interCatalogTitleWrapper.appendChild(interCatalogTitle);

                    interCatalogControl.addEventListener('click', _events.catalogClick);

                    interCatalogControl.appendChild(interCatalogTitleWrapper);
                    catalogInnerWrapper.appendChild(interCatalogControl);
                }

                catalogWrapper.appendChild(catalogInnerWrapper);
            }

            // #=====================
            // Menu Wrapper
            // #=====================

            menuContensWrapper = document.createElement('div');
            menuContensWrapper.classList.add('emp-menu-contents');

            menuContensWrapper.addEventListener('click', function (evt) {

                _events.expandMenuLevel(evt);
            });

            _priv.generateMenuContents(menuContensWrapper, window.fwData.menus.global.items);

            // Append everything to the outerwrapper
            outerMenuWrapper.appendChild(globaMenuControlWrapper);
            outerMenuWrapper.appendChild(globalFilterWrapper);
            if (fwData.menus.global && fwData.menus.global.catalogs) {
                outerMenuWrapper.appendChild(catalogWrapper);
            }
            outerMenuWrapper.appendChild(menuContensWrapper);

            // Add the menu to the body wrapper
            var dBodyWrapper = document.querySelector('#body-wrapper');

            dBodyWrapper.appendChild(outerMenuWrapper);

            _priv.isGenerated = true;

            var menuElem = document.querySelector('#emp-global-menu-wrapper');

            _priv.menuElem = menuElem;
        }
        else {

            menuContensWrapper = document.querySelector('#emp-global-menu-wrapper .emp-menu-contents');

            // Flush the onld menu contents
            var child = menuContensWrapper.lastElementChild;

            while (child) {
                menuContensWrapper.removeChild(child);
                child = menuContensWrapper.lastElementChild;
            }

            _priv.generateMenuContents(menuContensWrapper, data);
        }

    };

    _priv.filterMenu = function _filter_menu(slug) {

        console.log(_priv.currentMenu);

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

        var customRegEx = new RegExp(slug.toLowerCase(), 'g');

        // Make a copy of the current menu
        var currentMenu = [].concat(_priv.currentMenu);

        var newMenu = searchItems(customRegEx, currentMenu);

        return newMenu;
    };

    _priv.closeMenu = function _close_global_menu (){

    	_priv.isOpen = false;
        _priv.menuControl.setAttribute('aria-expanded', _priv.isOpen);
        _priv.menuElem.classList.remove('active');

        if (_priv.bMenuChanged) {

            var dOldMenu = document.querySelector('#emp-global-menu-wrapper');

            dOldMenu.parentNode.removeChild(dOldMenu);

            fwData.menus.global = JSON.parse(JSON.stringify(_priv.oOriginalMenu));

            // Reset defaults
            _priv.isGenerated = false;
            _priv.bMenuChanged = false;
        }

        // Remove the body click event
        document.body.removeEventListener('click', _events.openMenuBodyClick, true);
    };

    _priv.openMenu = function _open_global_menu (){

    	_priv.isOpen = true;
		_priv.menuControl.setAttribute('aria-expanded', _priv.isOpen);
        _priv.menuElem.classList.add('active');

        document.body.addEventListener('click', _events.openMenuBodyClick, true);

    	// set focus
    	_priv.menuElem.focus();
    };

    _events.openMenuBodyClick = function _open_menu_body_click(evt) {

        var dClickedElement = evt.target;
        var dLastParent = false;

        var aDOMTree = [];

        var bForceClose = true;

        aDOMTree.push(dClickedElement);

        // Get all elements to parent
        while(true) {

            var dNextParent = false;

            if (dLastParent) {

                dNextParent = dLastParent.parentNode;
            }
            else {

                dNextParent = dClickedElement.parentNode;
            }

            if (dNextParent.nodeName !== "BODY") {

                aDOMTree.push(dNextParent);
                dLastParent = dNextParent;
            }
            else {

                break;
            }

        }

        for (var d = 0, dLen = aDOMTree.length; d < dLen; d++) {

            if (aDOMTree[d].classList.contains('emp-active-catalog') || aDOMTree[d].classList.contains('emp-cataloge-popup-container') || aDOMTree[d].classList.contains('emp-global-menu-wrapper') || aDOMTree[d].classList.contains('menu-button')) {

                bForceClose = false;
                break;
            }

        }


        if (_priv.isOpen && bForceClose) {
            _priv.closeMenu();
        }
        else if (!bForceClose) {

            //console.log("Force close stopped!");
        }
    };

    _events.menuClick = function _menu_click(evt) {

        if (fwData.menus && fwData.menus.global && Object.keys(fwData.menus.global).length) {

            if (!_priv.isGenerated) {

                _priv.generate(true);
            }

            // Toogle the expanded state
            _priv.isOpen = !_priv.isOpen;

            if (_priv.isOpen) {
                _priv.openMenu();
            }
            else {
                _priv.closeMenu();
            }
        }
        else {

            journal.log({ type: 'error', owner: 'FW', module: 'externalMenu', func: '_event.menuClick' }, 'Page JSON does not contain any global menu definition.');
        }
    };

    _events.closeMenu = function _close_global_menu_event(evt) {
    	var control = evt.target;
        if (control.classList.contains('emp-global-menu-close')) {
        	_priv.closeMenu();
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

        _priv.generate(false, updatedJSON);
    };

    _events.catalogClick = function _catalog_click(evt) {

        if (!_priv.$generatedCatalogMenu) {

            var dCatalogTrigger = evt.target;

            if(!dCatalogTrigger.classList.contains(_priv.CLASSLIST.changeCatalogToggle)){

                var $catalogToggle = $(dCatalogTrigger).closest("."+_priv.CLASSLIST.changeCatalogToggle);

                if($catalogToggle.length > 0){
                    dCatalogTrigger = $catalogToggle.get(0);
                }

            }

            var oCatalogPopover = {
                "template": "popover",
                "contents": [
                    {
                        "template": "output",
                        "raw": true,
                        "text": '<div class="emp-catalog-menu-title">Change Role:</div>'
                    },
                    {
                        "template": "tree",
                        "items": []
                    }
                ]
            };

            // Generate a list of catalogs that are not active
            for (var c = 0, cLen = fwData.menus.global.catalogs.length; c < cLen; c++) {

                var oCatalog = fwData.menus.global.catalogs[c];

                console.log(oCatalog);

                var oMenuButton = {
                    "template": "link",
                    "attributes": {
                        "href": false
                    },
                    "text": false
                };

                if (!oCatalog.active) {
                    oMenuButton.text = oCatalog.text;
                    oMenuButton.attributes.href = oCatalog.href;

                    oCatalogPopover.contents[1].items.push(oMenuButton);
                }
            }

            _priv.oCatalogMenu = oCatalogPopover;

            render.section(undefined, _priv.oCatalogMenu, 'return', function(html) {

                var catalogButtons = html.querySelector('a');

                _priv.$generatedCatalogMenu = $.popover($(dCatalogTrigger), {
                    html: html,
                    display: {
                        className: 'emp-cataloge-popup-container',
                        offset: {
                            left: -175
                        }
                    },
                    location: 'below-left',
                });

                catalogButtons.addEventListener('click', _events.catalogSelected);

                _priv.$generatedCatalogMenu.show();
            });
        }
    };

    _events.catalogSelected = function _catalog_selected(evt) {

        var dSelectedCatalog = evt.target;
        var sSelectedCatalog = dSelectedCatalog.getAttribute('data-catalog-selected');

        // // Find catalog menu
        for (var c = 0, cLen = fwData.menus.global.catalogs.length; c < cLen; c++) {

            if (fwData.menus.global.catalogs[c].name === sSelectedCatalog) {

                oCatalog = fwData.menus.global.catalogs[c];

                if(oCatalog.switchFunc){
                    emp.functionCall(oCatalog.switchFunc);
                }

            }

        }

    };

    var init = function _external_menu_init() {

        if (!_priv.init) {

            var menuControl = document.querySelector('.emp-global-header .application-header button.menu-button');

            if (menuControl) {

                _priv.menuControl = menuControl;

                menuControl.addEventListener('click', function(evt) {

                    // Save off an original copy of the menu.
                    _priv.oOriginalMenu = JSON.parse(JSON.stringify(fwData.menus.global));

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
