/*jshint loopfunc: true */
define(['render'], function (render) {

    var CLASSES = {
        openButtonMenu: '.emp-table-responsive-button-menu-pane.emp-selected'
    };

    var _priv = {};
    var _setup = {};
    var _events = {};
    var _prototype = {};
    var _defaults = {
        setup: {
            menuButton: true,
        },
        plugins: {
            menuButton: {
            }
        },
    };

    // Event will generate a menu on the fly or redisplay a menu that has already been created
    _events.buttonMenu = function _button_menu(evt, table) {

        var createMenu = true;

        $target = $(evt.target);

        // Start by looking for other open menus
        var $openMenus = $(CLASSES.openButtonMenu);

        // Close these menus before we continue
        if ($openMenus.length) {

            var buttonMenuLink = $target.attr('data-menu');

            // Check if we have a link
            if (buttonMenuLink) {

                $openMenus.each(function () {

                    var $menu = $(this);

                    var menuID = $menu.attr('id');

                    if (buttonMenuLink !== menuID) {

                        $menu.remove();
                    }
                    else {

                        $menu.remove();
                        $target.removeAttr('data-menu');

                        createMenu = false;

                        emp.$body.on('click', _events.buttonMenuBodyClick);
                    }

                });

            }
            else {

                $openMenus.remove();

                emp.$body.off('click', _events.buttonMenuBodyClick);
            }

        }

        if (createMenu) {

            var $button = $(evt.target);
            var $row = $button.parents('tr').eq(0);
            var rowKey = $row.attr('data-key');
            var rowIndex = $row.attr('data-row-index');
            var rowObject = false;

            var menuButtonLink = table.id + '_' + rowKey + '_' + rowIndex;

            if (table.dataStore.body.rows[rowIndex]) {

                rowObject = table.dataStore.body.rows[rowIndex];
            }

            if (rowObject !== false) {

                var menuColumn = table.config.plugins.responsive.menuColumnDS;
                var menuButtons = rowObject.columns[menuColumn].contents[0].options;

                // create the initial container
                var $menu = $('<ul/>', {
                    'id': menuButtonLink,
                    'data-key': rowKey,
                    'data-row-index': rowIndex,
                    'class': 'emp-table-responsive-button-menu-pane emp-table-popup'
                });

                // Loop through and add the buttons to the menu
                for (var i = 0, len = menuButtons.length; i < len; i++) {
                    render.section(undefined, menuButtons[i], 'return', function (button) {
                        var $listItem = $('<li/>').append(button);

                        $menu.append($listItem);
                    });
                }

                // Create the close list item
                var $close = $('<li/>')
                    .append(
                        $('<a/>', {
                            'href': '#',
                            'id': menuButtonLink + "_closeButton"
                        })
                            .text('Close')
                            .on('click', _events.buttonMenuClose)
                    );

                $menu.append($close);

                var buttonOffset = $button.offset();

                fastdom.mutate(function () {
                    // Append the menu to the page body
                    emp.$body.append($menu);

                    // Add the menu key to the button
                    $button.attr('data-menu', menuButtonLink);

                    var windowsWidth = emp.$window.width();
                    var menuWidth = $menu.width();
                    var buttonWidth = $button.outerWidth();

                    console.log(windowsWidth, menuWidth);
                    console.log(buttonOffset);

                    var menuPos = {
                        top: false,
                        left: false,
                        right: false,
                        bottom: false
                    };

                    // Try to the left of the button first
                    if (menuWidth < buttonOffset.left) {

                        // position the menu
                        menuPos.top = buttonOffset.top;
                        menuPos.right = (windowsWidth - buttonOffset.left + 5);
                    }
                    else if ((menuWidth + 5 + buttonOffset.left + buttonWidth) < (windowsWidth)) {

                        menuPos.top = buttonOffset.top;
                        menuPos.left = buttonOffset.left + buttonWidth + 5;
                        menuPos.right = "auto";

                    }

                    if (menuPos.top && menuPos.right && (menuPos.right !== "auto")) {

                        console.log("from right");

                        // position the menu
                        $menu.css({
                            top: (menuPos.top),
                            right: (menuPos.right)
                        });
                    }
                    else if (menuPos.top && menuPos.left) {

                        if (menuPos.right) {
                            $menu.css({
                                top: (menuPos.top),
                                left: (menuPos.left),
                                right: (menuPos.right)
                            });
                        }
                        else {

                            // position the menu
                            $menu.css({
                                top: (menuPos.top),
                                left: (menuPos.left)
                            });
                        }
                    }

                    $menu.addClass('emp-selected');

                    emp.$body.on('click', _events.buttonMenuBodyClick);
                });
            }
            else {

                journal.log({ type: 'error', owner: 'UI', module: 'table', submodule: 'responsive', func: 'buttonMenu' }, 'Could not find the proper row index');
            }
        }
    };

    // Generic event function shared that is used to close the button menu
    _events.buttonMenuClose = function _close_column_menu_button(evt) {

        if (evt) {
            evt.preventDefault();
            evt.stopPropagation();
        }

        // Look for any open button menus
        fastdom.measure(function () {
            var $openButtonMenus = $('.emp-table-responsive-button-menu-pane');

            // Check to see if we have anything to do
            if ($openButtonMenus.length) {
                fastdom.mutate(function () {

                    $openButtonMenus.remove();

                    // Remove the body click event
                    emp.$body.off('click', _events.buttonMenuBodyClick);
                });
            }
        });
    };

    // Event for body clicks that is just a passthrough function
    _events.buttonMenuBodyClick = function _button_menu_body_click(evt) {

        var $evtTarget = $(evt.target);

        // Check to make sure the button click did not come from within the button menu pane
        if ($evtTarget.closest('.emp-table-responsive-button-menu-pane, .emp-icon-responsive-table-menu').length === 0) {

            if ($('.emp-table-responsive-button-menu-pane.emp-selected').length) {

                if (!$evtTarget.hasClass('emp-icon-responsive-table-menu')) {

                    _events.buttonMenuClose();

                    emp.$body.off('click', _events.buttonMenuBodyClick);
                }

            }
        }
    };

    _setup.menuButton = function _responsive(table, next) {

        if (table.config.setup.menuButton) {

            table.$self.on('resize.table', function () {

                _events.buttonMenuClose();
            });

            table.$self.on('sort.table', function () {

                _events.buttonMenuClose();
            });

            table.$self.on('table.filter', function () {

                _events.buttonMenuClose();
            });

            table.obj.$tbody.on('click', 'tr td button.emp-icon-responsive-table-menu', function (evt) {

                _events.buttonMenu(evt, table);

            });

        }

        next();
    };

    return {
        _setup: _setup,
        _defaults: _defaults,
        _prototype: _prototype
    };

});
