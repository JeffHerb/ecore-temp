/*
=======================================================================
 New York State Department of Taxation and Finance
 User Interface Team
 Menu plugin to be used across all projects (but first for eMPIRE)
=======================================================================

Next Steps:
    * Accept boundary definitions in JSON
    * Change the vertical menu expand/collapse animation. Currently the containing item merely changes its height. It would be better to simulate jQuery's slideDown/slideUp methods by simulataneously expanding the container item and sliding the child group downward into view -- i.e., the group's bottom edge is 'attached' to the container's bottom edge and it's revealed as if printed on a window shade. See http://codepen.io/patik/pen/mfzhw and http://n12v.com/css-transition-to-from-auto/
    * Slide-out animation for horizontal menu groups (down for top-level items, left/right for sub-level items)

Accessibility:
    * http://adobe-accessibility.github.io/Accessible-Mega-Menu/
    * http://www.w3.org/TR/wai-aria-practices/#menu

Validation concerns that have not yet been addressed:
    1. Item with no label
    2. Item with no URL, no JS action, and no child items
    3. Menu with no valid items
    4. Menu with some invalid items -- replace with filler?
    5. Group of items begins or ends with a divider
    6. Multiple dividers in a row
    7. Top-level dividers
*/

define(['jquery', 'cui', 'css!menujs'], function ($, cui) {
    // Private properties
    var VERSION = {
            name: 'menujs',
            version: '1.0.0',
            date: '20010101'
        };

    // Namespacing
    var VENDOR_NAMESPACE = 'cui';
    var NAMESPACE = VENDOR_NAMESPACE + '-menujs'; // This must match `$vendor` in the Sass
    var NAMESPACE_CAMEL = VENDOR_NAMESPACE + 'MenuJS'; // This must match the prefix used for `$fade-in-animation-name` and `$fade-out-animation-name` in the Sass
    var NAMESPACE_LOWER = NAMESPACE_CAMEL.toLowerCase();
    var NAMESPACE_PREFIX = NAMESPACE + '-';

    // Class names
    var CLASSES = {
            menu: {
                base: NAMESPACE,
                vertical: NAMESPACE_PREFIX + 'vertical',
                position: {
                    left: NAMESPACE_PREFIX + 'pull-left',
                    right: NAMESPACE_PREFIX + 'pull-right'
                },
                fixedWidth: NAMESPACE_PREFIX + 'fixed-width',
                naturalWidth: NAMESPACE_PREFIX + 'natural-width',
                wrapped: NAMESPACE_PREFIX + 'wrapped',
                recheckWidth: NAMESPACE_PREFIX + 'recheck-width'
            },
            group: {
                base: NAMESPACE_PREFIX + 'group',
                align: {
                    left: NAMESPACE_PREFIX + 'align-to-left',
                    right: NAMESPACE_PREFIX + 'align-to-right'
                },
                fadeOut: NAMESPACE_PREFIX + 'fade-out',
                fadeIn: NAMESPACE_PREFIX + 'fade-in',
                verticalExpand: NAMESPACE_PREFIX + 'vertical-expand',
                verticalCollapse: NAMESPACE_PREFIX + 'vertical-collapse',
                levelPrefix: NAMESPACE_PREFIX + 'group-level-',
                focusParentOnClose: NAMESPACE_PREFIX + 'focus-parent'
            },
            item: {
                base: NAMESPACE_PREFIX + 'item',
                hasGroup: NAMESPACE_PREFIX + 'has-group',
                hasGroupBelow: NAMESPACE_PREFIX + 'has-group-below',
                wrapper: NAMESPACE_PREFIX + 'item-wrapper',
                open: NAMESPACE_PREFIX + 'open',
                divider: {
                    base: NAMESPACE_PREFIX + 'item-divider',
                    blank: NAMESPACE_PREFIX + 'item-divider-blank',
                    line: NAMESPACE_PREFIX + 'item-divider-line'
                },
                states: {
                    disabled: NAMESPACE_PREFIX + 'item-disabled',
                    filler: NAMESPACE_PREFIX + 'item-filler'
                },
                link: NAMESPACE_PREFIX + 'item-link',
                label: NAMESPACE_PREFIX + 'item-label',
                levelPrefix: NAMESPACE_PREFIX + 'item-level-',
                wrapped: {
                    rowEnd: NAMESPACE_PREFIX + 'item-row-end',
                    rowBegin: NAMESPACE_PREFIX + 'item-row-begin',
                    rowBelow: NAMESPACE_PREFIX + 'item-row-below'
                }
            },
            hidden: NAMESPACE_PREFIX + 'hidden'
        };

    /**
     * Event names including namespacing
     * @type  {Object}
     */
    var EVENT_TYPES = {
            // Standard events
            click:   'click.' + NAMESPACE_LOWER,
            keydown: 'keydown.' + NAMESPACE_LOWER,
            hover:   'mouseenter.' + NAMESPACE_LOWER,
            resize:  'resize.' + NAMESPACE_LOWER,
            transitionEnd: 'transitionend.' + NAMESPACE_LOWER,
            animationEnd: 'animationend.' + NAMESPACE_LOWER,

            // Related CSS properties
            css: {
                animationDelay: 'animation-delay'
            },

            // Custom events
            groupClosed: 'groupclosed.' + NAMESPACE_LOWER,
            groupOpened: 'groupopened.' + NAMESPACE_LOWER
        };

    /**
     * Event names that correspond to names used in the CSS
     * @type  {Object}
     */
    var EVENT_NAMES = {
            animation: {
                fadeIn:  NAMESPACE_CAMEL + 'FadeIn',
                fadeOut: NAMESPACE_CAMEL + 'FadeOut'
            }
        };

    /**
     * Enumeration of various item and menu properties that may be set by JSON and their acceptable values
     * @property PROP_VALUES
     * @type  {Object}
     */
    var PROP_VALUES = {
            orientation: {
                horizontal: 'horizontal',
                vertical: 'vertical'
            },
            dividerType: {
                line: {
                    html: '<span></span>'
                },
                blank: {
                    html: '&nbsp;'
                }
            },
            alignType: {
                left: 'left',
                right: 'right'
            },
            state: {
                disabled: 'disabled',
                filler: 'filler'
            }
        };

    /**
     * Collection of keystrokes for interacting with the menu
     *     Keystrokes must be added after the plugin has been parsed (i.e. during `init()`)
     *     so they can assign private functions to their properties
     * @property KEYSTROKES
     * @type  {Object}
     */
    var KEYSTROKES = null;

    /**
     * Default properties and values for a menu object
     * @type  {Object}
     */
    var DEFAULT_MENU_OBJECT = {
            // Public properties - defined by the JSON
            id: '',                        // Will be generated if not provided
            display: {                     // Properties affecting the display of the menu
                container: 'body',         // Selector matching the parent container of the menu element
                className: '',             // Additional classes to be added to the outer menu element (space-separated)
                orientation: PROP_VALUES.orientation.horizontal, // Direction of item stacking
                borderWidth: 1,            // Must match CSS value (left/right)
                naturalWidth: true,        // Whether the menu should stretch to fill its container
                transition: {              // Transition settings for jQuery animations
                    timing: {
                        horizontal: 150,   // Fade timing in milliseconds. Should match `$fade-in-animation-duration` in the Sass
                        vertical: 150      // Expand timing in milliseconds. Should match `$vertical-animation-duration` in the Sass
                    }
                }
            },
            interaction: {                 // Properties affecting user interaction with the menu
                activationEvent: EVENT_TYPES.click // Type of event that activates items. Can include namespaces and/or custom events
            },
            items: [],          // Top-level items (children may be nested inside those items)

            // Private properties - defined by the plugin
            htmlData: null      // Tracks information needed to render the menu's HTML
        };

    /**
     * Default properties and values for an item
     * @type  {Object}
     */
    var DEFAULT_ITEM_OBJECT = {
            // Public properties - defined by the user
            id: '',
            label: '&nbsp;',    // Visible label text
            tooltip: '',        // `title` attribute value
            width: '',          // CSS value (px, %, etc), as a string
            display: {
                className: '',
                orientation: ''
            },
            align: PROP_VALUES.alignType.left, // `left` (default) or `right`
            jsAction: null,     // Function to be run when the item is clicked, or `null` for no action
            url: '',            // Link to be opened when the item is clicked
            target: '',      // Target for `url`, if provided (e.g. `_blank` for a new window)
            dividerType: '',    // Leave empty if not a divider, otherwise must be the name of a property of `PROP_VALUES.dividerType`
            state: '',          // `disabled` or empty (default)
            items: [],          // Direct child items (grandchildren may be nested inside those children)

            // Private properties - defined by the plugin
            widthFloat: -1,     // Width as a float, or `-1` if not defined
            level: 0,           // Depth of the group this item belongs to (i.e. level 1 items are always visible, level 2 items appear upon click/hover, etc)
            htmlData: {}        // Tracks information needed to render the item's HTML
        };

    ////////////////////////
    // Private namespaces //
    ////////////////////////

    var _priv = {};
    var _html = {};
    var _events = {};
    var _keystrokes = {};
    var _client = {};
    var _util = {};

    ///////////////
    // Variables //
    ///////////////

    /**
     * List of initialized menus
     * @property menuList
     * @type  {Object}
     */
    var menuList = {};

    /**
     * Cache of the `<body>` element
     * @property $body
     * @type  {jQuery}
     */
    var $body = null;

    /**
     * Cache of the `window` object
     * @property $window
     * @type  {jQuery}
     */
    var $window = null;

    /**
     * Style sheet for appending styles to the document
     * @type  {Element}
     */
    var styleSheet = null;

    /**
     * List of currently opened groups
     * @property openedItemIds
     * @type  {Array}
     */
    var openedItemIds = [];

    /////////////////
    // Constructor //
    /////////////////

    var Menujs = function (elem, menuDefinitions, options) {
        this.elem = elem;
        this.$elem = $(elem);
        this.menuDefinitions = menuDefinitions;
        this.options = options;

        // This next line takes advantage of HTML5 data attributes
        // to support customization of the plugin on a per-element
        // basis. For example,
        // <div class='item' data-plugin-options='{"message":"Goodbye World!"}'></div>
        this.metadata = this.$elem.data('menujs-options');
    };

    //////////////////////
    // Plugin prototype //
    //////////////////////

    Menujs.prototype = {};

    // Default user options
    Menujs.prototype.defaults = {};

    /**
     * Initializes the plugin and menu(s), and displays menu(s)
     * May be called multiple times. If no menus are provided, some general setup will be performed.
     * @param  {Array} menuArray  An array of menu objects, or a single object
     * @return {Boolean}          True if no problems were encountered
     */
    Menujs.prototype.init = function () {
        var menuArray;
        var $mountNode;

        // Introduce defaults that can be extended either
        // globally or using an object literal.
        this.config = $.extend({}, this.defaults, this.options, this.metadata);

        // Sample usage:
        // No options:
        //     $('#elem').plugin(menuDefinitionsArray);
        // Set options per instance:
        //     $('#elem').plugin(menuDefinitionsArray, { propName: 'value'});
        // or
        //     var p = new Menujs(document.getElementById('elem'), menuDefinitionsArray, { propName: 'value'}).init()
        // or, set the global default message:
        //     Menujs.defaults.propName = 'value'

        // General setup
        // Use the existence of `_client.supports` as a flag to make sure general setup is only done once
        if (!_client.supports) {
            $body = $('body');
            $window = $(window);

            // Initialize events
            _events._init();

            _client.init();
        }

        // Menu setup
        menuArray = this.menuDefinitions;
        $mountNode = this.$elem;

        // Must be an object or non-empty array
        if (typeof menuArray !== 'object' || !menuArray) {
            console.warn('UI [menu] No menu definition was provided');
            // Nothing more to do
            return false;
        }

        if (typeof menuArray === 'string') {
            menuArray = JSON.parse(menuArray);
        }

        if (!Array.isArray(menuArray)) {
            menuArray = [menuArray];
        }

        // Set up each menu
        $.each(menuArray, function (index, menu) {
            if (typeof menu === 'string') {
                menu = JSON.parse(menu);
            }

            // Validate menu
            menu = _validateMenu(menu);

            // Store menu
            menuList[menu.id] = menu;

            // Add menu to the page
            if ($mountNode) {
                $mountNode.html(_html.createMenu(menu));
            }
            else {
                $(menu.display.container).html(_html.createMenu(menu));
            }
        });

        // Adjust heights after all menus have been inserted since any given menu may cause other menus to reflow
        setTimeout(_priv.fixItemDimensions, 1);

        return this;
    };

    /////////////////////
    // Private methods //
    /////////////////////

    /**
     * Validate a menu object
     * @param  {Object} menu   Menu object
     * @return {Object}        Updated menu
     */
    _validateMenu = function _validateMenu(menu) {
        var dotIndex;

        // Fill in default values

        if (typeof menu !== 'object' || !menu || Array.isArray(menu)) {
            menu = DEFAULT_MENU_OBJECT;
        }

        // ID (don't allow underscores)
        if (!menu.id || typeof menu.id !== 'string') {
            menu.id = _util.generateId();
        }
        else {
            menu.id = $.trim(menu.id) ? $.trim(menu.id).replace(/_/g, '-') : _util.generateId();
        }

        // Display

        if (!menu.display || typeof menu.display !== 'object') {
            menu.display = DEFAULT_MENU_OBJECT.display;
        }

        if (!menu.display.container || typeof menu.display.container !== 'string') {
            menu.display.container = DEFAULT_MENU_OBJECT.display.container;
        }

        if (!menu.display.className || typeof menu.display.className !== 'string') {
            menu.display.className = DEFAULT_MENU_OBJECT.display.className;
        }

        if (typeof menu.display.naturalWidth !== 'boolean') {
            menu.display.naturalWidth = DEFAULT_MENU_OBJECT.display.naturalWidth;
        }

        // Orientation
        if (!menu.display.orientation || !PROP_VALUES.orientation.hasOwnProperty(menu.display.orientation)) {
            menu.display.orientation = PROP_VALUES.orientation.horizontal;
        }

        if (typeof menu.display.borderWidth === 'string') {
            if (menu.display.borderWidth.length > 0) {
                menu.display.borderWidth = parseFloat(menu.display.borderWidth);
            }
            else {
                menu.display.borderWidth = DEFAULT_MENU_OBJECT.display.borderWidth;
            }
        }
        // Must be numeric and positive
        else if (typeof menu.display.borderWidth !== 'number' || (typeof menu.display.borderWidth === 'number' && typeof menu.display.borderWidth < 1)) {
            menu.display.borderWidth = DEFAULT_MENU_OBJECT.display.borderWidth;
        }

        // Transition settings
        if (!menu.display.transition || typeof menu.display.transition !== 'object') {
            menu.display.transition = DEFAULT_MENU_OBJECT.display.transition;
        }
        else {
            if (!menu.display.transition.timing || typeof menu.display.transition.timing !== 'object') {
                menu.display.transition.timing = DEFAULT_MENU_OBJECT.display.transition.timing;
            }
            else {
                if (typeof menu.display.transition.timing.horizontal === 'string') {
                    menu.display.transition.timing.horizontal = parseFloat(menu.display.transition.timing.horizontal);
                }
                if (typeof menu.display.transition.timing.horizontal !== 'number' || isNaN(menu.display.transition.timing.horizontal)) {
                    menu.display.transition.timing.horizontal = DEFAULT_MENU_OBJECT.display.transition.timing.horizontal;
                }

                if (typeof menu.display.transition.timing.vertical === 'string') {
                    menu.display.transition.timing.vertical = parseFloat(menu.display.transition.timing.vertical);
                }
                if (typeof menu.display.transition.timing.vertical !== 'number' || isNaN(menu.display.transition.timing.vertical)) {
                    menu.display.transition.timing.vertical = DEFAULT_MENU_OBJECT.display.transition.timing.vertical;
                }
            }
        }

        // Interaction

        if (!menu.interaction || typeof menu.interaction !== 'object') {
            menu.interaction = DEFAULT_MENU_OBJECT.interaction;
        }

        if (!menu.interaction.activationEvent || typeof menu.interaction.activationEvent !== 'string') {
            menu.interaction.activationEvent = DEFAULT_MENU_OBJECT.interaction.activationEvent;
        }
        else {
            // Event name has a namespace (`click.abc`)
            dotIndex = menu.interaction.activationEvent.indexOf('.');
            if (dotIndex > -1) {
                // Make sure the event type segment is valid
                if (!EVENT_TYPES.hasOwnProperty(menu.interaction.activationEvent.substr(dotIndex))) {
                    // Set event type to `click`, but keep namespace
                    menu.interaction.activationEvent = EVENT_TYPES.click + '.' + menu.interaction.activationEvent.substr(0, dotIndex);
                }
            }
            else if (!EVENT_TYPES.hasOwnProperty(menu.interaction.activationEvent)) {
                menu.interaction.activationEvent = EVENT_TYPES.click;
            }
        }

        // Internal properties
        menu.htmlData = DEFAULT_MENU_OBJECT.htmlData;

        // Validate items
        if (!menu.items || !Array.isArray(menu.items)) {
            menu.items = [];
        }
        else {
            menu.items = _priv.validateItems(menu.items, menu.id, {menuOrientation: menu.display.orientation});
        }

        return menu;
    };

    /**
     * Validate each item in a menu
     * @param  {Array}  items
     * @param  {String} idPrefix Prefix to prepend to each item's ID
     * @param  {String} parentAlign Alignment of the item's parent
     * @return {Array}  Updated items (with only valid items)
     */
    _priv.validateItems = function _priv_validateItems(items, idPrefix, options) {
        var settings = {};

        if (typeof options !== 'object' || !options) {
            options = {};
        }

        settings.parentAlign = options.parentAlign || '';
        settings.menuOrientation = options.menuOrientation || PROP_VALUES.orientation.horizontal;

        $.each(items, function (index, itm) {
            var hasCustomValues = true;

            // Fill in all properties. Don't use `$.extend`, it's too slow in a loop that runs this many times

            if (typeof itm !== 'object' || !itm || Array.isArray(itm)) {
                itm = DEFAULT_ITEM_OBJECT;

                // Avoid rechecking most properties since we know they'll be valid
                hasCustomValues = false;
            }

            // ID
            itm.id = _util.generateId(idPrefix);

            // Level
            itm.level = itm.id.match(/_/g).length;

            // Only check these properties if the item didn't inherit them from the default object
            if (hasCustomValues) {
                // Label
                if (!itm.label || typeof itm.label !== 'string') {
                    itm.label = DEFAULT_ITEM_OBJECT.label;
                }
                else {
                    itm.label = $.trim(itm.label);
                }

                // Alignment
                if (!itm.align || typeof itm.align !== 'string' || !PROP_VALUES.alignType.hasOwnProperty(itm.align)) {
                    itm.align = PROP_VALUES.alignType.left;
                }

                // State
                if (!itm.state || typeof itm.state !== 'string') {
                    itm.state = '';
                }
                else if (!PROP_VALUES.state.hasOwnProperty(itm.state)) {
                    // Replace invalid state with the default
                    itm.state = DEFAULT_ITEM_OBJECT.state;
                }

                // Divider type
                if (!itm.dividerType || typeof itm.dividerType !== 'string') {
                    itm.dividerType = '';
                }
                else if (!PROP_VALUES.dividerType.hasOwnProperty(itm.dividerType)) {
                    itm.dividerType = DEFAULT_ITEM_OBJECT.dividerType;
                }

                // Display
                if (!itm.display || typeof itm.display !== 'object') {
                    itm.display = DEFAULT_ITEM_OBJECT.display;
                }

                if (!itm.display.className || typeof itm.display.className !== 'string') {
                    itm.display.className = DEFAULT_ITEM_OBJECT.display.className;
                }

                // Inherit from menu
                if (PROP_VALUES.orientation.hasOwnProperty(settings.menuOrientation)) {
                    itm.display.orientation = PROP_VALUES.orientation[settings.menuOrientation];
                }
                else if (!itm.display.orientation || typeof itm.display.orientation !== 'string') {
                    itm.display.orientation = DEFAULT_ITEM_OBJECT.display.orientation;
                }

                // Width
                if (itm.width) {
                    itm.width = $.trim(itm.width);

                    // Make sure it has a positive numeric value and a unit
                    if (/^(\d+|\d*\.\d+)(%|\w+)$/.test(itm.width)) {
                        itm.widthFloat = parseFloat(itm.width);
                    }
                    // If it's strictly numeric, use pixels
                    else if (typeof itm.width === 'number' || /^(\d+|\d*\.\d+)$/.test(itm.width)) {
                        itm.widthFloat = parseFloat(itm.width);
                        itm.width += 'px';
                    }
                    else {
                        itm.width = DEFAULT_ITEM_OBJECT.width;
                        itm.widthFloat = 0;
                    }
                }
                else {
                    itm.width = DEFAULT_ITEM_OBJECT.width;
                    itm.widthFloat = 0;
                }

                // URL

                if (!itm.url || typeof itm.url !== 'string') {
                    itm.url = DEFAULT_ITEM_OBJECT.url;
                }

                if (!itm.target || typeof itm.target !== 'string') {
                    itm.target = DEFAULT_ITEM_OBJECT.target;
                }

                // Miscellaneous
                if (!itm.tooltip || typeof itm.tooltip !== 'string') {
                    itm.tooltip = DEFAULT_ITEM_OBJECT.tooltip;
                }

                if (typeof itm.jsAction !== 'function') {
                    itm.jsAction = DEFAULT_ITEM_OBJECT.jsAction;
                }

                // Internal properties
                itm.htmlData = DEFAULT_ITEM_OBJECT.htmlData;
            }

            // Validate children
            if (_util.hasGroup(itm)) {
                settings.parentAlign = itm.align;
                itm.items = _priv.validateItems(itm.items, idPrefix + '_' + itm.id.replace(idPrefix + '_', ''), settings);
            }
        });

        return items;
    };

    /**
     * Create and display an item's group
     * @param  {Object}   item  item object which contains the group to be opened
     * @param  {jQuery}   $item item element
     * @return {Boolean}        True if no problems were encountered
     */
    _priv.openGroup = function _priv_openGroup(itm, $item) {
        // Create sub-group
        var $group;
        var group;
        var menu;

        if (!itm || typeof itm !== 'object') {
            return false;
        }

        if (!$item) {
            $item = $('#' + itm.id);
        }

        if (!$item || !$item.length) {
            return false;
        }

        menu = _util.getMenu(itm.id);

        // Remove any existing groups with the same ID
        // If the user closes a group and then quickly opens the same group before the fade out transition finishes, the first group element's presence will throw off the positioning of the second, so it must be destroyed before continuing
        $('#' + itm.id + '-group').remove();

        // Generate group HTML
        $group = $(_html.createGroup(itm));

        // Display and position the group
        $item.find('.' + CLASSES.item.wrapper).append($group);

        _priv.positionGroup(itm, $group);

        // Note that it's open
        openedItemIds.push(itm.id);

        // Display group

        // Horizontal, or vertical groups except the top level
        if (menu.display.orientation === PROP_VALUES.orientation.horizontal || itm.level > 1) {
            if (_client.supports.cssAnimation) {
                $group
                    .on(EVENT_TYPES.animationEnd, _events._horizGroupAnimationOpen)
                    .addClass(CLASSES.group.fadeIn);
            }
        }
        // Vertical level 1 groups
        else {
            // We need the DOM element (not jQuery element) for some things
            group = $group.get(0);

            // Use CSS for the animation
            if (_client.supports.cssAnimation) {
                // Transition height from 0 to `auto`
                // Since you cannot transition to/from `auto`, instead we get the group's
                //     absolute height X and transition from 0 to X
                // http://n12v.com/css-transition-to-from-auto/

                // Momentarily expand the group to allow it to reach its full height
                group.style.height = 'auto';

                // Measure the full height (`jQuery.height()` rounds this value)
                // Note: jQuery 3 the value will no longer be rounded; see https://github.com/jquery/jquery/issues/1724
                itm.htmlData.expandedHeight = window.getComputedStyle(group).height;

                // Re-collapse the group
                group.style.height = '0px';

                // It's actually the containing element that will appear to animate, so we need to clip the group to prevent it from spilling out of the container during the transition
                group.style.overflow = 'hidden';

                // Force the browser to repaint
                group.offsetHeight;

                // Pull transition details from the CSS
                group.style.transition = 'height ' +
                                         $group.css('transition-duration') + ' ' +
                                         $group.css('transition-timing-function');

                // Watch for the transition to end
                $group.on(EVENT_TYPES.transitionEnd, _events._verticalGroupTransitionOpen);

                // Finally, begin expanding the group
                group.style.height = itm.htmlData.expandedHeight;
            }
            // Use jQuery to fake the animation
            else {
                // Open the group
                group.style.height = 'auto';
            }
        }

        // Update classes and attributes
        $item
            .addClass(CLASSES.item.open)
            .find('> .' + CLASSES.item.wrapper + ' > a')
                .attr('aria-expanded', 'true');

        // Inform listeners that a group has opened
        $body.trigger(EVENT_TYPES.groupOpened);

        return true;
    };

    /**
     * Position a group
     * @param  {Object} item       item object which contains the group
     * @param  {jQuery} $group     Group element
     */
    _priv.positionGroup = function _priv_positionGroup(itm, $group) {
        var groupBoundingRect;
        var difference;
        var group;
        var originalVisibility;
        var menu;

        if (itm.align === PROP_VALUES.alignType.right) {
            $group.addClass(CLASSES.group.align.right);
        }

        // Horizontal, or vertical but not top-level
        if (itm.display.orientation === PROP_VALUES.orientation.horizontal || (itm.display.orientation === PROP_VALUES.orientation.vertical && itm.level > 1)) {

            // Get the space between the right edge of the parent and the window
            groupBoundingRect = $group.get(0).getBoundingClientRect();
            difference = $window.width() - groupBoundingRect.right;

            if (difference < 0) {
                $group.addClass(CLASSES.group.align.right);

                return true;
            }

            // If the difference is small, don't even bother checking the group will fit on the right, just position it to the left
            if (difference < 30 && difference > 0) {
                $group.addClass(CLASSES.menu.position.left);
            }
            else {
                // Give the group layout so we can find its width
                group = $group.get(0);
                originalVisibility = group.style.visibility;
                group.style.visibility = 'hidden';

                if (itm.level > 1) {
                    if (_util.getElemWidth(group) + 10 < difference) { // Enough room to put it on the right (default)
                        $group.addClass(CLASSES.menu.position.right);
                    }
                    else {
                        $group.addClass(CLASSES.menu.position.left);
                    }
                }

                // Reset the group's visibility
                group.style.visibility = originalVisibility;
            }
        }

        // Parent is a top-level item or a menu
        if (itm.level === 1) {
            menu = menuList[_util.getParentItem(itm.id).id];
            if (menu.display.orientation === PROP_VALUES.orientation.horizontal) {
                // Offset the top by the parent item's height minus the border width
                $group.css('top', ($('#' + itm.id).outerHeight() - menu.display.borderWidth) + 'px');
            }
        }

        return true;
    };

    /**
     * Close a particular group
     * @param  {String} itemId  ID of the group's parent item
     * @return {Boolean}        True if no problems were encountered
     */
    _priv.closeGroup = function _priv_closeGroup(itemId, doSetFocus) {
        if (typeof itemId !== 'string' || !itemId) {
            return false;
        }

        // Make sure the group is actually open
        if (!_util.isItemOpen(itemId)) {
            // This often happens when arrowing between items that have sub-groups
            return false;
        }

        // Show that group is now closed
        if (!_client.supports.cssAnimation || _util.getItemById(itemId).display.orientation !== PROP_VALUES.orientation.vertical) {
            // Vertical menus in animation-capable browsers will have this classes removed later so that if the user clicks again during the animation the plugin won't think the group is already closed
            $('#' + itemId).removeClass(CLASSES.item.open);
        }

        // Remove the group
        _priv.removeGroup(itemId, doSetFocus);

        openedItemIds.splice(openedItemIds.indexOf(itemId), 1);

        return true;
    };

    /**
     * Close groups that are not ancestors of the given item
     * @param  {String} openId  ID of the item whose child group(s) should stay open
     * @return {Boolean}        True if no problems were encountered
     */
    _priv.closeOtherGroups = function _priv_closeOtherGroups(openId) {
        var itemId;
        var i;

        if (typeof openId !== 'string' || !openId) {
            return _priv.closeAllGroups();
        }

        // Note: do not cache the length of `openedItemIds`, or use `jQuery.each()`, since the array may be modified within the loop by `_priv.closeGroup()`
        i = 0;
        while (i < openedItemIds.length) {
            itemId = openedItemIds[i];

            // Close any non-ancesters and siblings
            if (openId.indexOf(itemId) === -1 || _util.areSiblingIds(itemId, openId)) {
                _priv.closeGroup(itemId);
            }
            else {
                // Only increment the counter if nothing was removed
                i++;
            }
        }

        return true;
    };

    /**
     * Quasi-recursively closes all open groups (one group per call)
     * @return {Boolean}  True if no problems were encountered
     */
    _priv.closeAllGroups = function _priv_closeAllGroups(evt) {
        var itemId;
        var itm;

        if (!openedItemIds.length) {
            // Stop watching for groups to close
            $body.off(EVENT_TYPES.click, _events._bodyClick);

            _util.clearOrphans();

            return false;
        }

        // Make sure list is sorted so we close grandchildren, then children, then parents
        openedItemIds.sort();

        itemId = openedItemIds.pop();
        itm = _util.getItemById(itemId);

        // Show that group is now closed
        if (!_client.supports.cssAnimation || itm.display.orientation !== PROP_VALUES.orientation.vertical) {
            $('#' + itemId).removeClass(CLASSES.item.open);
        }

        // Use the `groupclosed` event to run recursively
        $body.one(EVENT_TYPES.groupClosed, _priv.closeAllGroups);

        // Remove the group
        if (_client.supports.cssAnimation) {
            // If the events are 'chained', all animations begin in parallel so only the first (youngest) group will have the fade effect and the parent groups will snap out of view. Using `setTimeout` separates the events so they can occur in serial.
            setTimeout(function(){ _priv.removeGroup(itemId); }, 1);
        }
        else {
            _priv.removeGroup(itemId);
        }

        return true;
    };

    /**
     * Removes a group from the DOM and sets the parent item to 'closed'
     * May run animations and perform other cleanup
     * @param   {String}  itemId  Parent item's ID
     * @return  {Boolean}         Whether it closed anything
     */
    _priv.removeGroup = function _priv_removeGroup(itemId, doSetFocus) {
        var itm = _util.getItemById(itemId);
        var menu = _util.getMenu(itemId);
        var $item;
        var $group;
        var group;

        $item = $('#' + itemId);

        // CSS animation
        if (_client.supports.cssAnimation) {
            $group = $('#' + itemId + '-group');

            if (doSetFocus) {
                $group.addClass(CLASSES.group.focusParentOnClose);
            }

            if (itm.level > 1 || (itm.display.orientation === PROP_VALUES.orientation.horizontal && menu.display.orientation !== PROP_VALUES.orientation.vertical)) {
                // Begin fade out animation
                $group
                    // Mitigate the visual delay of the `setTimeout` in `_priv.closeAllGroups()` by using a negative delay which makes the animation start part way through the effect
                    .css(EVENT_TYPES.css.animationDelay, '-100ms')
                    .on(EVENT_TYPES.animationEnd, _events._horizGroupAnimationClose)
                    .addClass(CLASSES.group.fadeOut);
            }
            else {
                // Transition the group's height from `auto` to 0
                // As explained in `_priv.openGroup()`, you cannot transition from `auto`, so instead assign the group an absolute height

                group = $group.get(0);

                // Give the group an absolute (non-`auto`) height
                group.style.height = window.getComputedStyle(group).height;

                // Force repaint
                group.offsetHeight;

                // Clip the group from view while the container is collapsing
                // Note that the item's overflow must be set before the group's transition is set due to a bug in Firefox not firing the `transitionend` event consistently, see http://stackoverflow.com/q/16222805/348995
                $item.css('overflow', 'hidden');

                // Setup transition
                group.style.transition = 'height ' +
                                         $group.css('transition-duration') + ' ' +
                                         $group.css('transition-timing-function');

                $group.on(EVENT_TYPES.transitionEnd, _events._verticalGroupTransitionClose);

                // Collapse group
                group.style.height = '0px';
            }
        }
        // No animation
        else {
            // Destroy DOM element
            $('#' + itemId + '-group').remove();

            if (doSetFocus) {
                _priv.setItemFocus(itemId);
            }

            // Some vertical groups need to have their widths rechecked
            if (itm.display.orientation === PROP_VALUES.orientation.vertical && itm.level === 1) {
                $group = $group.closest('.' + CLASSES.menu.base);

                if ($group.is('.' + CLASSES.menu.recheckWidth)) {
                    $group.removeClass(CLASSES.menu.recheckWidth);
                    setTimeout(function(){ _priv.fixItemDimensions({}, menu); }, 100);
                }
            }

            // Inform listeners that a group has closed
            $body.trigger(EVENT_TYPES.groupClosed);
        }

        $item.find('> .' + CLASSES.item.wrapper + '> a').attr('aria-expanded', 'false');

        // Remove group from list

        return true;
    };

    /**
     * Set focus to an item
     * @param  {String}  itemId  Item ID
     * @param  {Number}  delay   Timeout delay
     */
    _priv.setItemFocus = function _priv_setItemFocus(itemId, delay) {
        // Chrome & Firefox need the slightest delay before setting focus
        // See http://stackoverflow.com/a/7046837/348995 and http://stackoverflow.com/a/17384592/348995

        if (typeof delay !== 'number') {
            delay = 1;
        }

        setTimeout(function() {
            _util.focusItem(itemId);
        }, 1);
    };

    _priv.previousWindowWidth = -1;

    /**
     * Adjust the widths and heights of top-level menu items to match the menu container
     * @param   {Object}  ev   Event
     * @param   {Object}  m    Menu object to fix. If not provided, all menus will be fixed.
     * @return  {Number}       Number of menus affected
     */
    _priv.fixItemDimensions = function _priv_fixItemDimensions(ev, menus) {
        var isRechecking = (typeof ev === 'object' && ev);
        var menuArray = menus ? [menus] : menuList;
        var returnVal = 0;
        var hasOpenItem;

        // Nothing needs to be done unless the window's width changed
        if (isRechecking && _priv.previousWindowWidth === $window.width()) {
            return true;
        }

        $.each(menuArray, function (index, menu) {
            var $menu;
            var greatestHeight;
            var leastHeight;
            var $anchors;
            var totalWidth;
            var $filler;
            var $fillers;
            var difference;
            var doSetVerticalWidths;
            var count;

            // Ignore menus that:
            //     - are being rechecked, and
            //     - are horizontal, and
            //     - contain only items with pixel widths, and
            //     - do not have filler items
            if (isRechecking && menu.display.orientation === PROP_VALUES.orientation.horizontal && !menu.htmlData.hasFiller && menu.htmlData.allPixels) {
                // Continue loop with next menu
                return true;
            }

            // Get menu element
            $menu = $('#' + NAMESPACE_PREFIX + menu.id);

            // Vertical menu
            if (menu.display.orientation === PROP_VALUES.orientation.vertical) {
                doSetVerticalWidths = false;

                // Need to set the width so a wide sub-group won't expand the menu

                // Need to remove any previously set width to be able to determine the true width
                if (isRechecking) {
                    // But any opened top-level items may expand the menu's width, so make sure they're all closed
                    hasOpenItem = false;
                    $.each(menu.items, function(idx, itm) {
                        if (_util.isItemOpen(itm.id)) {
                            // Item is open
                            hasOpenItem = true;
                            // Quit loop
                            return false;
                        }
                    });

                    if (!hasOpenItem) {
                        $menu.css('width', 'auto');
                        $menu.css('width', $menu.width());
                    }
                    else {
                        // Need to recheck the width when the menu closes
                        $menu.addClass(CLASSES.menu.recheckWidth);
                    }
                }
                else {
                    $menu.css('width', $menu.width());
                }

                // Set new max-width for level 1 sub-groups so they don't spill out of the container

                // Create temporary sub-group with one item to measure any `min-width` set by CSS
                $filler = $('<ul/>')
                            .addClass(CLASSES.group.base)
                            .addClass(CLASSES.group.levelPrefix + '1')
                            .css('visibility', 'hidden')
                            .html('<li class="' + CLASSES.item.base + ' ' +
                                CLASSES.item.levelPrefix + '2">' +
                                '<div class="' + CLASSES.item.wrapper + '">' +
                                '<span class="' + CLASSES.item.label + '">i</span>' +
                                '</div></li>')
                            .appendTo($menu);

                // See if the dummy item is wider than the menu due to a `min-width` declaration
                totalWidth = $menu.width() - (menu.display.borderWidth * 2);

                if ($filler.find('li').width() > totalWidth) {
                    // Disable `min-width` and set `max-width` to the menu's width
                    _util.addStyle('#' + $menu.attr('id') + ' .' +
                                    CLASSES.group.base + '.' + CLASSES.group.levelPrefix + '1 { ' +
                                    'min-width: 0; max-width: ' + totalWidth + 'px; }');

                    count = $('#' + $menu.attr('id') + ' .' + CLASSES.group.base + '.' + CLASSES.group.levelPrefix + '1').length;
                }
                else {
                    count = $('#' + $menu.attr('id') + ' .' + CLASSES.group.base + '.' + CLASSES.group.levelPrefix + '1').length;
                }

                $filler.remove();

                // End of vertical menu adjustments
                return true;
            }

            // Width

            // Only check widths for pixel-sized menus with filler items
            if (menu.htmlData.widthUnit === 'px' && menu.htmlData.hasFiller) {
                // Evaluate top-level items
                totalWidth = 0;
                $.each(menu.items, function (idx, itm) {
                    var $item = $('#' + itm.id);
                    var width = _util.getElemWidth($item.get(0));

                    if (itm.state === PROP_VALUES.state.filler) {
                        $filler = $item;
                    }

                    if (itm.state !== PROP_VALUES.state.filler || !menu.htmlData.allPixels) {
                        totalWidth += width;
                    }
                });

                difference = _util.getElemWidth($menu.get(0)) - totalWidth;

                if (difference > 0) {
                    $filler.removeClass(CLASSES.hidden);

                    if (menu.htmlData.allPixels) {
                        //TODO: Shouldn't need to check `reliableWidths` here because `_util.getElemWidth()` should give us the right value
                        if (_client.supports.reliableWidths) {
                            // Subtract the outer borders and the borders for every non-filler item (i.e. all items except one)
                            $filler.width(difference - (menu.display.borderWidth * 2) - (2 * menu.display.borderWidth * (menu.items.length - 1)));

                            // IE9 will show a ~30px-wide filler when the difference is small, even though the items after it have wrapped. Above this threshold, the filler is the correct size (even if it's tiny, e.g. 0.01px).
                            if (difference <= 9.8 && _util.getElemWidth($filler.get(0)) === -1 && $filler.height() > 0) {
                                $filler.addClass(CLASSES.hidden);
                            }
                        }
                        else {
                            // Subtract the outer borders and the borders for every non-filler item (i.e. all items except one)
                            $filler.width(difference - menu.display.borderWidth);
                        }
                    }
                    else {
                        $filler.width(difference + (menu.display.borderWidth * 2));
                    }
                }
                // Hide the filler item when there's not enough room for one (difference <= 0) on pixel-defined menus
                else if (menu.htmlData.allPixels) {
                    $filler.addClass(CLASSES.hidden);
                }
            }

            // Height

            // Check whether the height has changed since it was last calculated
            $menu.find('.' + CLASSES.item.base + '-level-1 > .' + CLASSES.item.wrapper + ' > a').css('height', 'auto');

            // Evaluate top-level items
            $anchors = $();
            leastHeight = Infinity; // Start with a height that's guaranteed to be taller than the tallest item
            greatestHeight = 0;
            $fillers = $();

            $.each(menu.items, function (idx, itm) {
                var $item = $('#' + itm.id);
                var $anchor = $item.find('.' + CLASSES.item.wrapper + ' > a');
                var height = $anchor.outerHeight();

                // Keep track of fillers for later
                if (itm.state === PROP_VALUES.state.filler) {
                    $fillers = $fillers.add($anchor);
                }

                if (height > (greatestHeight * 1.2)) {
                    greatestHeight = height;
                }
                else if (height < leastHeight) {
                    leastHeight = height;
                }

                $anchors = $anchors.add($anchor);
            });

            // Only change the widths if there is a notable disparity
            if (greatestHeight - leastHeight > 5) {
                // Set `height`, not `outerHeight`. Unit `px` added automatically.
                $anchors.css('height', greatestHeight + 'px');

                // Fillers need a shorter height so the anchor's background color doesn't overlap the item's bottom border, unless all items have pixel widths
                if (!menu.htmlData.allPixels) {
                    $fillers.css('height', (greatestHeight - menu.display.borderWidth) + 'px');
                }
                else {
                    $fillers.css('height', greatestHeight + 'px');
                }

                returnVal++;
            }
        });

        // Store the current window dimensions for the next run
        _priv.previousWindowWidth = $window.width();

        return returnVal;
    };

    /////////////////////////////
    // HTML and DOM generation //
    /////////////////////////////

    /**
     * Create DOM for a menu
     * @param  {Object} menu
     * @return {String}
     */
    _html.createMenu = function _html_createMenu(menu) {
        var ul = document.createElement('ul');
        var classNames = [];

        // Make sure relevant data about rendering has been gathered
        if (!menu.htmlData) {
            menu = _html.collectMenuData(menu);
        }

        // Classes
        classNames.push(CLASSES.menu.base);

        if (menu.display.className) {
            classNames.push(menu.display.className);
        }

        if (menu.display.orientation === PROP_VALUES.orientation.vertical) {
            classNames.push(CLASSES.menu.vertical);
        }

        if (menu.htmlData.allPixels) {
            classNames.push(CLASSES.menu.fixedWidth);
        }

        if (menu.display.naturalWidth) {
            classNames.push(CLASSES.menu.naturalWidth);
        }

        ul.className = classNames.join(' ');
        ul.id = NAMESPACE_PREFIX + menu.id;

        // Insert items
        $.each(menu.items, function (index, itm) {
            ul.appendChild(_html.createItem(itm));
        });

        return ul;
    };

    /**
     * Gather HTML-specific knowledge about the menu and store it for future renderings
     * @param   {Object}  menu  A menu object
     * @return  {Object}        The updated menu
     */
    _html.collectMenuData = function _html_collectMenuData(menu) {
        var itemStats;
        var filler;

        // Create the property
        menu.htmlData = {
            hasFiller: false,
            widthUnit: '',    // `px` or `percent`
            allPixels: false
        };

        if (menu.display.orientation === PROP_VALUES.orientation.horizontal) {
            // Set baseline stats
            itemStats = {
                left: {
                    items: [],
                    numFixed: 0,
                    numFluid: 0,
                    totalWidth: 0
                },
                right: {
                    items: [],
                    numFixed: 0,
                    numFluid: 0,
                    totalWidth: 0
                },
                combinedWidth: 0
            };

            // Analyze the items
            $.each(menu.items, function (index, itm) {
                var store;

                // Where to store the data
                store = itemStats[itm.align];

                // Store the item
                store.items.push(itm);

                // Track width types
                if (itm.width) {
                    store.numFixed++;
                    store.totalWidth += itm.widthFloat;
                    itemStats.combinedWidth += itm.widthFloat;

                    if (!menu.htmlData.widthUnit) {
                        menu.htmlData.widthUnit = /\d%$/.test(itm.width) ? 'percent' : 'px';
                    }
                }
                else {
                    store.numFluid++;
                }
            });

            // Determine menu structure

            // 1. All items are fixed-width and the menu has both left-aligned & right-aligned items
            //    --> Add a filler item to fill the gap between the left and right items
            if (itemStats.left.numFixed > 0 && itemStats.right.numFixed > 0 &&
                itemStats.left.items.length === itemStats.left.numFixed &&
                itemStats.right.items.length === itemStats.right.numFixed) {

                // Create filler item
                filler = _priv.validateItems([{}], menu.id, {menuOrientation: menu.display.orientation})[0];
                filler.level = 1;
                filler.state = 'filler';

                // If the other item widths are defined as percentages, the filler item must have its width set to the remaining amount so they all add up to 100%
                // if (/\d%$/.test(menu.items[0].width)) {
                if (menu.htmlData.widthUnit === 'percent') {
                    // Items don't use up the entire width
                    if (itemStats.combinedWidth < 100) {
                        filler.width = 100 - itemStats.combinedWidth;
                        filler.widthFloat = filler.width;
                        filler.width += '%';
                        itemStats.left.totalWidth += filler.widthFloat;
                    }
                }
                // All widths are defined as pixels, so the menu may or may not need a filler item
                else {
                    menu.htmlData.allPixels = true;
                }

                // Add filler item after the last left-aligned item
                menu.items.splice(itemStats.left.items.length, 0, filler);

                menu.htmlData.hasFiller = true;
            }
            // 2. All items are fixed-width and are all either left-aligned or right-aligned
            //    --> Will use `display:inline-block` and may have jagged edges and wrap over multiple lines
            else if (menu.htmlData.widthUnit === 'px' &&
                     ((itemStats.left.numFixed > 0  && itemStats.left.items.length  === itemStats.left.numFixed) ||
                      (itemStats.right.numFixed > 0 && itemStats.right.items.length === itemStats.right.numFixed))
                    ) {
                menu.htmlData.allPixels = true;
            }
            // Nothing special to do in these cases:
            // 3. All items left-aligned (either fixed-width or fluid or mixed)
            // 4. All items right-aligned (either fixed-width or fluid or mixed)
            // 5. Both left-aligned & right-aligned, and at least some mixed items (either or both sides)
        }

        return menu;
    };

    /**
     * Creates HTML for an item
     * @param  {Object} itm
     * @return {String}
     */
    _html.createItem = function _html_createItem(itm) {
        var listItem = document.createElement('li');
        var classNames = [];
        var hasGroup = _util.hasGroup(itm);
        var wrapper;
        var anchor;
        var span;
        var icon;

        // Attributes

        // ID
        listItem.id = itm.id;

        // Classes

        // Base
        classNames.push(CLASSES.item.base);

        // Level
        classNames.push(CLASSES.item.levelPrefix + itm.level);

        // Contains group
        if (hasGroup) {
            classNames.push(CLASSES.item.hasGroup);

            // Group orientation
            if (itm.level === 1 && itm.display.orientation === PROP_VALUES.orientation.horizontal) {
                classNames.push(CLASSES.item.hasGroupBelow);
            }
        }

        // Divider
        if (itm.dividerType) {
            classNames.push(CLASSES.item.divider.base);

            // Specific divider type class
            if (CLASSES.item.divider.hasOwnProperty(itm.dividerType)) {
                classNames.push(CLASSES.item.divider[itm.dividerType]);
            }
        }

        // State
        if (CLASSES.item.states.hasOwnProperty(itm.state)) {
            classNames.push(CLASSES.item.states[itm.state]);
        }

        // Custom
        if (itm.display.className) {
            classNames.push(itm.display.className);
        }

        listItem.className = classNames.join(' ');

        // Width
        if (itm.width) {
            // Don't set the width if it's a top-level item in a vertical menu -- `_priv.fixItemDimensions()` will handle that
            if (itm.level !== 1 || (itm.level === 1 && itm.display.orientation === PROP_VALUES.orientation.horizontal)) {
                listItem.style.width = itm.width;
            }
        }

        // Wrapper
        wrapper = document.createElement('div');
        wrapper.className = CLASSES.item.wrapper;

        // Link
        anchor = document.createElement('a');

        if (hasGroup) {
            anchor.setAttribute('aria-haspopup', 'true');
            anchor.setAttribute('aria-owns', itm.id + '-group');
            anchor.setAttribute('aria-controls', itm.id + '-group');
            anchor.setAttribute('aria-expanded', 'false');
        }

        if (itm.url) {
            anchor.className = CLASSES.item.link;

            if (itm.target) {
                //anchor.target = itm.target;
                //onclick="window.open('print.html', 'newwindow', 'width=300,height=250'); return false;"

                anchor.setAttribute('onclick', "window.open('" + itm.url + "', 'newwindow', 'scrollbars=yes,menubar=no,resizable=yes,toolbar=no,width=925,height=700,titlebar=yes,status=no,location=no'); return false;");

            }
            else {

                anchor.href = itm.url;
            }
        }
        else if (hasGroup) {
            anchor.setAttribute('role', 'button');
        }

        // Tooltip
        if (itm.tooltip) {
            anchor.title = itm.tooltip;
        }

        if (!itm.dividerType && itm.state !== PROP_VALUES.state.disabled && itm.state !== PROP_VALUES.state.filler) {
            anchor.setAttribute('tabIndex', '1');
        }

        // Text wrap
        span = document.createElement('span');
        span.className = CLASSES.item.label;

        // Label
        if (PROP_VALUES.dividerType.hasOwnProperty(itm.dividerType)) {
            span.innerHTML = PROP_VALUES.dividerType[itm.dividerType].html;
        }
        else {
            span.innerHTML = itm.label;
        }

        // Icon
        // No icon for group-less items, dividers, or items with recognized states
        if (hasGroup && !itm.dividerType && !PROP_VALUES.state.hasOwnProperty(itm.state)) {
            icon = document.createElement('i');
            icon.setAttribute('aria-hidden', 'true');

            // Screen reader text. There is no need to change this when the group is opened/closed because selecting an opened parent item merely shifts focus back to the already-opened group. Changing this to "closed" at any point would be misleading because only a mouse click will close the group.
            icon.innerHTML = 'Open';
        }

        // Combine all elements
        anchor.appendChild(span);
        if (icon) {
            anchor.appendChild(icon);
        }
        wrapper.appendChild(anchor);
        listItem.appendChild(wrapper);

        return listItem;
    };

    /**
     * Creates HTML for a group
     * @param   {Object}  parentItem  item containing the group to be generated
     * @return  {String}              HTML for the list of items
     */
    _html.createGroup = function _html_createGroup(parentItem) {
        var ul = document.createElement('ul');

        ul.id = parentItem.id + '-group';
        ul.className = CLASSES.group.base + ' ' + CLASSES.group.levelPrefix + parentItem.level;
        ul.setAttribute('role', 'group');
        ul.setAttribute('aria-expanded', 'true');
        ul.setAttribute('aria-hidden', 'false');
        ul.setAttribute('aria-labelledby', parentItem.id);

        $.each(parentItem.items, function (index, itm) {
            ul.appendChild(_html.createItem(itm));
        });

        return ul;
    };

    ////////////
    // Events //
    ////////////

    /**
     * Initializes all events
     * @return {Boolean}  True if no problems were encountered
     */
    _events._init = function _events_init() {
        $body
            .on(EVENT_TYPES.groupClosed, _events._groupClosed)
            .on(EVENT_TYPES.groupOpened, _events._groupOpened)
            .on(EVENT_TYPES.click, '.' + CLASSES.menu.base, _events._itemClick)
            .on(EVENT_TYPES.keydown, _events._bodyKeydown);

        $window.on(EVENT_TYPES.resize, _events._windowResize);

        return true;
    };

    ////////////////////
    // Event handlers //
    ////////////////////

    /**
     * Handle a click on a menu item
     * @param  {Event}  ev       jQuery-normalized event
     * @param  {jQuery} $item    List item element containing the clicked element
     * @param  {jQuery} $target  Clicked element
     */
    _events._itemClick = function _events_itemClick(ev) {
        var $item = $(ev.target).closest('.' + CLASSES.item.base);
        var itm;
        var hasGroup;
        var isOpen;

        if (!$item.length) {
            // Clicked inside the container but not on a menu item or filler
            // For example, the leftover "ragged edge" space that appears when items wrap to mulitple lines
            return true;
        }

        itm = _util.getItemById($item.attr('id'));
        hasGroup = _util.hasGroup(itm);
        isOpen = _util.isItemOpen(itm.id);

        // Close other groups
        _priv.closeOtherGroups(itm.id);

        // Has child group and is currently closed
        if (hasGroup && !isOpen) {
            // Open child group
            _priv.openGroup(itm, $item);

            return false;
        }
        // Has child group and is currently opened
        else if (hasGroup) {
            // Close child group
            _priv.closeGroup(itm.id);
        }
        // Single item
        else {
            // Close all groups, unless the clicked item was disabled or a divider
            if (!itm.dividerType && !PROP_VALUES.state.hasOwnProperty(itm.state)) {
                _priv.closeAllGroups();
            }
        }

        // Call a function
        if (typeof itm.jsAction === 'function') {
            itm.jsAction(ev, itm, $item);
        }

        // Stop the event unless the item is a link
        if (!itm.url) {
            ev.preventDefault();
            return false;
        }
    };

    /**
     * Handle clicks on the entire document
     * @param   {event}  ev  jQuery-normalized event
     */
    _events._bodyClick = function _events_bodyClick(ev) {
        // Check if something other than a menu was clicked
        if (!$(ev.target).closest('.' + CLASSES.menu.base).length) {
            // Close the menu
            _priv.closeAllGroups(ev);
        }
    };

    /**
     * Handles the `keydown` event on the document
     * @param   {Event}    ev  jQuery-normalized event
     * @return  {Boolean}      True if this event is not applicable (e.g. focus was on an input field)
     */
    _events._bodyKeydown = function _events_bodyKeydown(ev) {
        var $target = $(ev.target);
        var keystrokeList = [];
        var itm;
        var $item;

        // Ignore inputs
        if ($target.closest('select, input, textarea').length) {
            return true;
        }

        // Check whether the event happened within a menu
        if ($target.closest('.' + CLASSES.menu.base).length) {
            keystrokeList = KEYSTROKES.withinMenu;
        }
        // Only check outside keystrokes if a menu is open
        else if (openedItemIds.length > 0) {
            keystrokeList = KEYSTROKES.outsideMenu;
        }
        // Else, `keystrokeList` will be empty so the loop below won't run

        $.each(keystrokeList, function (index, keystroke) {
            // Note that jQuery normalizes the value of `ev.which` across browsers
            if (keystroke.keyCodes.indexOf(ev.which) > -1) {
                // Check if it's necessary to run a function on the item
                if (keystroke.jsAction) {
                    // Define the item if not done already
                    if (!$item) {
                        $item = $(ev.target).closest('.' + CLASSES.item.base);
                    }
                    if (!itm) {
                        itm = _util.getItemById($item.attr('id'));
                    }

                    // Call a function directly
                    if (typeof keystroke.jsAction === 'function') {
                        keystroke.jsAction(ev, itm, $item);
                    }
                }
            }
        });
    };

    _events._groupClosed = function _events_groupClosed(ev) {
        // Check if all groups are closed
        if (openedItemIds.length < 1) {
            // Stop watching the document for clicks
            $body.off(EVENT_TYPES.click, _events._bodyClick);
            _util.clearOrphans();
        }
    };

    _events._groupOpened = function _events_groupOpened(ev) {
        // Check whether this was the first group to open to avoid adding the event listener multiple times
        if (openedItemIds.length === 1) {
            // Start watching for clicks on the body
            $body.on(EVENT_TYPES.click, _events._bodyClick);
        }
    };

    /**
     * Toggles events when a group fade in animation ends
     * @param   {Event}  ev   animationend event
     * @return  {Boolean}     Success/failure
     */
    _events._horizGroupAnimationOpen = function _events_horizGroupAnimationOpen(ev) {
        // Make sure the event fired for this particular animation
        if (ev.originalEvent.animationName === EVENT_NAMES.animation.fadeIn) {
            $(this)
                .off(EVENT_TYPES.animationEnd, _events._horizGroupAnimationOpen)
                .removeClass(CLASSES.group.fadeIn);
            return true;
        }
    };

    /**
     * Destroys a group when a fade out animation ends
     * @param   {Event}  ev   animationend event
     * @return  {Boolean}     Success/failure
     */
    _events._horizGroupAnimationClose = function _events_horizGroupAnimationClose(ev) {
        var $this;
        var itemId;

        // Make sure the event fired for this particular animation
        if (ev.originalEvent.animationName === EVENT_NAMES.animation.fadeOut) {
            $this = $(this);
            itemId = this.id.replace(/\-group$/, '');

            // Set focus back to the parent item
            if ($this.is('.' + CLASSES.group.focusParentOnClose)) {
                _priv.setItemFocus(itemId);
            }

            // $this.off(EVENT_TYPES.animationEnd);

            // Destroy group element and remove event listener
            $this.remove();

            // Inform listeners that a group has closed
            $body.trigger(EVENT_TYPES.groupClosed);
            return true;
        }
    };

    /**
     * Resets a group's height and overflow when a transition ends
     * @param   {Event}  ev   transitionend event
     * @return  {Boolean}     Success/failure
     */
    _events._verticalGroupTransitionOpen = function _events_verticalGroupTransitionOpen(ev) {
        if (ev.originalEvent.propertyName === 'height') {
            // Restore the group element's styles
            this.style.transition = '';
            this.style.height = 'auto';
            this.style.overflow = 'visible';

            $(this).off(EVENT_TYPES.transitionEnd, _events._verticalGroupTransitionOpen);

            return true;
        }
    };

    /**
     * Destroys a group when a transition ends
     * @param   {Event}  ev   transitionend event
     * @return  {Boolean}     Success/failure
     */
    _events._verticalGroupTransitionClose = function _events_verticalGroupTransitionClose(ev) {
        var $this;
        var itemId;
        var $elem;
        var itm;
        var menu;

        // Make sure the event was triggered for this particular transition (i.e. not for background-color)
        if (ev.originalEvent.propertyName === 'height') {
            $this = $(this);
            itemId = this.id.replace(/\-group$/, '');
            menu = _util.getMenu(itemId);

            // Set focus back to the parent item
            if ($this.is('.' + CLASSES.group.focusParentOnClose)) {
                _priv.setItemFocus(itemId);
            }

            $elem = $('#' + itemId);

            $elem
                // Mark group as closed
                .removeClass(CLASSES.item.open)
                // Removing clipping
                .css('overflow', 'visible');

            // Some vertical groups need to have their widths rechecked
            itm = _util.getItemById(itemId);
            if (menu.display.orientation === PROP_VALUES.orientation.vertical && itm.level === 1) {
                $elem = $elem.closest('.' + CLASSES.menu.base);

                if ($elem.is('.' + CLASSES.menu.recheckWidth)) {
                    $elem.removeClass(CLASSES.menu.recheckWidth);
                    setTimeout(function(){ _priv.fixItemDimensions({}, menu); }, 100);
                }
            }

            // Destroy group element and remove event listener
            $this.remove();

            // Inform listeners that a group has closed
            $body.trigger(EVENT_TYPES.groupClosed);

            return true;
        }
    };

    /**
     * Calls functions that need to be (re)run when the window is resized
     * @param   {Event}  ev   resize evnet
     * @return  {Boolean}     Success/failure
     */
    _events._windowResize = function _events_windowResize(ev) {
        _priv.fixItemDimensions(ev);
        return true;
    };

    ////////////////////////
    // Keystroke handlers //
    ////////////////////////

    /**
     * Handles the left arrow key being pressed on an item
     * @param   {Event}   ev     jQuery-normalized event
     * @param   {Object}  itm    item that had focus
     * @param   {jQuery}  $item   Element that had focus
     * @return  {Boolean}        Success/failure
     */
    _keystrokes._left = function _keystrokes_left(ev, itm, $item) {
        var hasGroup = _util.hasGroup(itm);
        var isOpened = _util.isItemOpen(itm.id);
        var parent;

        // Top-level item
        if (itm.level === 1) {
            // Check for a sibling to move to
            parent = _util.getPreviousSibling(itm);
            if (parent) {
                // Close other groups before moving on
                _priv.closeOtherGroups();

                // Focus on previous sibling
                _util.focusItem(parent.id);
            }
        }
        // Non-top-level item with its own children
        else if (hasGroup) {
            // Aligned left
            if (itm.align === PROP_VALUES.alignType.left) {
                // Opened
                if (isOpened) {
                    // Close group and leave the focus where it is
                    _priv.closeGroup(itm.id);
                }
                // Closed and level 3 or deeper
                else if (itm.level > 2) {
                    // Close this group and set focus on the parent item
                    parent = _util.getParentItem(itm.id);

                    if (parent) {
                        // Set focus to the parent item
                        _util.focusItem(parent.id);

                        // Close this group
                        _priv.closeGroup(parent.id);
                    }
                }
                // Closed: do nothing
            }
            // Aligned right
            else if (itm.align === PROP_VALUES.alignType.right) {
                // Opened
                if (isOpened) {
                    // Change focus to the first child item
                    _util.focusItem(itm.items[0].id);
                }
                // Closed
                else {
                    // Open this group
                    _priv.openGroup(itm, $item);

                    // Focus on first child
                    _util.focusItem(itm.items[0].id);
                }
            }
        }
        // Non-top-level item with no children
        else {
            // Aligned left
            if (itm.align === PROP_VALUES.alignType.left) {
                // Get parent item
                parent = _util.getParentItem(itm.id);

                if (parent && parent.level !== 1) {
                    // Set focus to the parent item
                    _util.focusItem(parent.id);

                    // Close this group
                    _priv.closeGroup(parent.id);
                }
            }
            // Aligned right: do nothing
        }

        // Prevent the page from scrolling
        ev.preventDefault();

        return true;
    };

    /**
     * Handles the right arrow key being pressed on an item
     * @param   {Event}   ev     jQuery-normalized event
     * @param   {Object}  itm    item that had focus
     * @param   {jQuery}  $item   Element that had focus
     * @return  {Boolean}        Success/failure
     */
    _keystrokes._right = function _keystrokes_right(ev, itm, $item) {
        var hasGroup = _util.hasGroup(itm);
        var isOpened = _util.isItemOpen(itm.id);
        var parent;

        // Top-level itm
        if (itm.level === 1) {
            _priv.closeOtherGroups();

            // Focus on next sibling
            parent = _util.getNextSibling(itm);
            if (parent) {
                _util.focusItem(parent.id);
            }
        }
        // Non-top-level item with its own child group
        else if (hasGroup) {
            // Aligned left
            if (itm.align === PROP_VALUES.alignType.left) {
                // Opened
                if (isOpened) {
                    // Change focus to the first child item
                    _util.focusItem(itm.items[0].id);
                }
                // Closed
                else {
                    // Open this group
                    _priv.openGroup(itm, $item);

                    // Focus on first child
                    _util.focusItem(itm.items[0].id);
                }
            }
            // Aligned right
            else if (itm.align === PROP_VALUES.alignType.right) {
                // Opened
                if (isOpened) {
                    // Close group and leave the focus where it is
                    _priv.closeGroup(itm.id);
                }
                // Closed: do nothing
            }
        }
        // Non-top-level item with no child group
        else {
            // Aligned right
            if (itm.align === PROP_VALUES.alignType.right) {
                // Get parent ID (remove last underscore section of the current item's ID)
                parent = _util.getParentItem(itm.id);

                if (parent.level !== 1) {
                    // Set focus to the parent itm
                    _util.focusItem(parent.id);

                    // Close this group
                    _priv.closeGroup(parent.id);
                }
            }
            // Aligned left: do nothing
        }

        // Prevent the page from scrolling
        ev.preventDefault();

        return true;
    };

    /**
     * Handles the down arrow key being pressed on an item
     * @param   {Event}   ev     jQuery-normalized event
     * @param   {Object}  itm    Item that had focus
     * @param   {jQuery}  $item   Element that had focus
     * @return  {Boolean}        Success/failure
     */
    _keystrokes._down = function _keystrokes_down(ev, itm, $item) {
        var hasGroup = _util.hasGroup(itm);
        var sibling;

        // Top level item
        if (itm.level === 1) {
            // Has group
            if (hasGroup) {
                // Group is open
                if (_util.isItemOpen(itm.id)) {
                    // Item has focus, so switch focus to the first child. (This can happen when the switches between mouse/arrows/tabbing, since any one of those on its own would have kept the focus in a consistent place.)
                    if ($item.find('.' + CLASSES.item.wrapper + ' > a').is(':focus')) {
                        _util.focusItem(itm.items[0].id);
                    }
                    // Item not focused
                    else {
                        // Close group
                        _priv.closeGroup(itm.id);
                    }
                }
                else {
                    // Open group
                    _priv.openGroup(itm, $item);

                    // Set focus to first child
                    _util.focusItem(itm.items[0].id);
                }
            }
            // If no children, do nothing
        }
        // Non-top-level item
        else {
            sibling = _util.getNextSibling(itm);

            // Make sure an item was found and that there is an "older" sibling to switch the focus to
            if (sibling) {
                // Close the current item's group
                if (hasGroup) {
                    _priv.closeGroup(itm.id);
                }

                _util.focusItem(sibling.id);
            }
        }

        // Prevent the page from scrolling
        ev.preventDefault();

        return true;
    };

    /**
     * Handles the up arrow key being pressed on an item
     * @param   {Event}   ev     jQuery-normalized event
     * @param   {Object}  itm    Item that had focus
     * @param   {jQuery}  $item   Element that had focus
     * @return  {Boolean}        Success/failure
     */
    _keystrokes._up = function _keystrokes_up(ev, itm, $item) {
        var hasGroup = _util.hasGroup(itm);
        var sibling;
        var parent;

        // Top level item
        if (itm.level === 1) {
            // Has group
            if (hasGroup) {
                // Opened
                if (_util.isItemOpen(itm.id)) {
                    // Close group
                    _priv.closeGroup(itm.id);
                }
                // If closed, then do nothing
            }
        }
        // Non-top-level item
        else {
            parent = _util.getParentItem(itm.id);
            sibling = _util.getPreviousSibling(itm, {parent: parent});

            // Make sure an item was found and that there is a "younger" sibling to switch the focus to
            if (sibling) {
                // Close the current item's group
                if (hasGroup) {
                    _priv.closeGroup(itm.id);
                }

                _util.focusItem(sibling.id);
            }
            else {
                // Parent is a top-down oriented menu
                if (parent.level === 1) {
                    // Close this group
                    _priv.closeGroup(parent.id);

                    // Set focus to parent
                    _util.focusItem(parent.id);
                }
            }
        }

        // Prevent the page from scrolling
        ev.preventDefault();

        return true;
    };

    /**
     * Handle the enter key when pressed on an item
     * @param   {Event}  ev      jQuery-normalized event
     * @param   {Object}  itm    Item that had focus
     * @param   {jQuery}  $item   jQuery element
     * @return  {Boolean}
     */
    _keystrokes._enter = function _keystrokes_enter(ev, itm, $item) {
        // Top-level items that have a group
        if (itm.level === 1 && _util.hasGroup(itm)) {
            // Opened
            if (_util.isItemOpen(itm.id)) {
                // Close it
                _priv.closeGroup(itm.id);
            }
            // Closed
            else {
                // Open it
                _priv.openGroup(itm, $item);

                // Set focus to first child
                _util.focusItem(itm.items[0].id);
            }
        }
        // Otherwise, pass the event to the equivalent arrow key handler
        else {
            if (itm.align === PROP_VALUES.alignType.left) {
                _keystrokes._right(ev, itm, $item);
            }
            else {
                _keystrokes._left(ev, itm, $item);
            }
        }

        return true;
    };

    /**
     * Handle the space bar key when pressed on an item
     * This function merely passes the arguments along to `_keystrokes._enter()` so the functionality is mimmicked
     * @param   {Event}   ev     jQuery-normalized event
     * @param   {Object}  itm    Item that had focus
     * @param   {jQuery}  $item   jQuery element
     * @return  {Boolean}
     */
    _keystrokes._space = function _keystrokes_space(ev, itm, $item) {
        var returnVal;

        returnVal = _keystrokes._enter(ev, itm, $item);

        // Prevent the page from scrolling down
        ev.preventDefault();

        return returnVal;
    };

    /**
     * Check if the user tabbed off one list onto another top-level item
     * Note that the parameters passed represent the item that was focused
     *     when the user pressed the key, not the item that will get focus
     *     next. Also, when closing a group a delay (`setTimeout`) must be
     *     used, otherwise the group will close before the focus has a
     *     chance to shift away from it.
     * @param   {Object}  ev     jQuery-normalized event
     * @param   {Object}  itm    Item that had focus
     * @param   {jQuery}  $item   Element that had focus
     */
    _keystrokes._tab = function _keystrokes_tab(ev, itm, $item) {
        var parent = _util.getParentItem(itm.id);
        var nextSibling = _util.getNextSibling(itm, {parent: parent});

        // Shift-tab
        if (ev.shiftKey) {
            // This item was top-level, so the next item must be top-level as well
            if (itm.level === 1) {
                // Close other groups
                setTimeout(function () {
                    _priv.closeGroup(itm.id);
                }, 1);
            }
        }
        // Tab
        else {
            // Make sure the last focused item was the end of its group
            if (!nextSibling) {
                // Check if parent is a menu, meaning this item was only one level deep and therefore the focus will shift to a top-level item
                if (itm.level === 1 || menuList.hasOwnProperty(_util.getParentItem(parent.id).id)) {
                    // Close other groups
                    setTimeout(_priv.closeAllGroups, 1);
                }
                else {
                    // Focus has shifted from an item in a sub-group to an item in the parent group which is not the sub-group's parent, so that sub-group needs to close. Do this by finding the newly-focused item and closing any unrelated groups.
                    // Example: Focus was on 1.2.3 (which is in a group under 1.2) and tab moves the focus to 1.3, so the group under 1.2 needs to close.
                    setTimeout(function () {
                        _priv.closeOtherGroups($('.' + CLASSES.item.wrapper + '> a:focus').closest('.' + CLASSES.item.base).attr('id'));
                    }, 1);
                }
            }
        }
    };

    /**
     * Closes the most recently opened group
     * @param   {Object}  ev     jQuery-normalized event
     * @param   {Object}  itm    Item that had focus
     * @param   {jQuery}  $item   Element that had focus
     * @return  {Boolean}        Whether a group was closed
     */
    _keystrokes._escapeInside = function _keystrokes_escapeInside(ev, itm, $item) {
        var numGroups = openedItemIds.length;
        var closeId;

        if (numGroups) {
            if (numGroups > 1) {
                closeId = openedItemIds[numGroups - 2];

                if (closeId) {
                    _util.focusItem(closeId);
                }
            }

            // Close the group and set focus to the parent
            _priv.closeGroup(openedItemIds[numGroups - 1], true);

            return true;
        }

        return false;
    };

    /**
     * Closes all opened menu groups
     * @param   {Object}  ev     jQuery-normalized event
     * @return  {[type]}         [description]
     */
    _keystrokes._escapeOutside = function _keystrokes_escapeOutside(ev) {
        return _priv.closeAllGroups();
    };

    ///////////////
    // Utilities //
    ///////////////

    /**
     * Check if an item contains a group
     * @param   {Object}   itm   Item
     * @return  {Boolean}        Whether it contains child items
     */
    _util.hasGroup = function _util_hasGroup(itm) {
        if (typeof itm === 'object' && itm) {
            return (itm.items && itm.items.length > 0);
        }

        return null;
    };

    /**
     * Finds an item by its ID
     * @param   {String}  id  Item ID
     * @return  {Object}      Item, or null if not found (and for filler items)
     */
    _util.getItemById = function _util_getItemById(id) {
        var returnItem = null;
        var itemToSearch;
        var findChildren;

        // Must provide an item ID
        if (!id && typeof id !== 'string') {
            return returnItem;
        }

        // The first piece is the menu ID
        // Begin searching in the menu itself
        itemToSearch = menuList[id.split('_')[0]];

        // Check if the item is the menu itself
        if (itemToSearch && itemToSearch.id === id) {
            return itemToSearch;
        }

        // This condition is only needed when `_util.generateId()` is guaranteeing uniqueness
        if (!itemToSearch || !itemToSearch.items || !itemToSearch.items.length) {
            return null;
        }

        // Find child item with at least a partial match of the target ID
        // Function is defined here to avoid re-defining it every time the `while` loop is run
        findChildren = function _findChildren(index, itm) {
            // Same ancestry as target id
            if (id.indexOf(itm.id) === 0) {
                // Exact item found
                if (id === itm.id) {
                    returnItem = itm;
                    itemToSearch = null; // quit `while` loop
                    return false; // quit this loop
                }

                // Not found, and no more  child items to search
                else if (!itm.items || !itm.items.length) {
                    itemToSearch = null; // quit `while` loop
                    return false; // quit this loop
                }

                // Need to search this sub-item next
                else {
                    itemToSearch = itm; // Continue `while` loop
                    return false; // quit this loop
                }
            }
            // Different ancestry
            else {
                // Continue with this loop since there may be more matches in this parent item,
                // but quit the `while` loop because we're drilling down, not up, and any potential matches
                // will be found by digging deeper in this this loop
                itemToSearch = null;
            }
        };

        while (itemToSearch) {
            if (!itemToSearch.items || !itemToSearch.items.length) {
                break;
            }

            // Find child item with at least a partial match of the target ID
            $.each(itemToSearch.items, findChildren);
        }

        return returnItem;
    };

    /**
     * Gets an item's parent
     * @param   {String}  childId  Child item's ID
     * @return  {Object}           itm
     */
    _util.getParentItem = function _util_getParentItem(childId) {
        var lastUnderscorePosition = childId.lastIndexOf('_');
        var parentId;

        // Check if the ID belongs to a menu
        if (lastUnderscorePosition < 0) {
            return menuList[childId];
        }

        // Get the parent's ID
        parentId = childId.substr(0, lastUnderscorePosition);

        return _util.getItemById(parentId);
    };

    _util.getMenu = function _util_getParentItem(childId) {
        return menuList[childId.substr(0, childId.indexOf('_'))];
    };

    /**
     * Default settings for getting a sibling item
     * @property _util.getSiblingDefaultOptions
     * @type  {Object}
     */
    _util.getSiblingDefaultOptions = {
        getPrevious: false,  // Look for the previous sibling instead of the next one
        parent: null,        // The item's parent object (optional, but it helps performance)
        allowDisabled: false // Return a sibling even if it is disabled
    };

    /**
     * Gets the next ("younger") sibling of an item
     * @param   {Object}  itm      Item to search from
     * @param   {Object}  options  Optional settings
     * @return  {Object}           Item, or null if no applicable sibling exists
     */
    _util.getNextSibling = function _util_getNextSibling(itm, options) {
        var settings = $.extend(true, {}, _util.getSiblingDefaultOptions, options);
        var returnItem = null;
        var siblingIndex = -1;
        var parent;
        var siblings;

        parent = settings.parent || _util.getParentItem(itm.id);
        siblings = parent.items;

        // Loop through siblings
        $.each(siblings, function (index, sibling) {
            // Found this item
            if (sibling.id === itm.id) {
                if (settings.getPrevious) {
                    // Get the previous sibling's index
                    siblingIndex = index - 1;
                }
                else {
                    // Get the next sibling's index
                    siblingIndex = index + 1;
                }

                // Quit loop
                return false;
            }
        });

        // Make sure the index is valid
        if (siblingIndex > -1 && siblingIndex < siblings.length) {
            returnItem = siblings[siblingIndex];

            // Check if item is a divider or disabled
            if (returnItem.dividerType.length || (!settings.allowDisabled && (returnItem.state === PROP_VALUES.state.disabled || returnItem.state === PROP_VALUES.state.filler))) {
                // Try the next sibling
                returnItem = _util.getNextSibling(returnItem, settings);
            }
        }

        return returnItem;
    };

    /**
     * Gets the previous ("older") sibling of an item
     * @param   {Object}  itm      Item to search from
     * @param   {Object}  options  Optional settings
     * @return  {Object}           itm, or null if no applicable sibling exists
     */
    _util.getPreviousSibling = function _util_getPreviousSibling(itm, options) {
        var settings = $.extend(true, {}, {getPrevious: true}, options);

        return _util.getNextSibling(itm, settings);
    };

    _util.areSiblingIds = function _util_areSiblingIds(a, b) {
        return (a.substr(0, a.lastIndexOf('_')) === b.substr(0, b.lastIndexOf('_')));
    };

    /**
     * Set focus to an item's link
     * @param   {String}  itemId  ID of the item to be focused
     * @return  {Boolean}         Success/failure
     */
    _util.focusItem = function _util_focusItem(itemId) {
        // IE will throw an error if the element is hidden
        //FIXME: Is this still a problem for IE 11+ ?
        try {
            // Make sure other groups are closed
            _priv.closeOtherGroups(itemId);

            return ($('#' + itemId).find(' > .' + CLASSES.item.wrapper).find(' > a').focus().length > 0);
        }
        catch(e) {
            return false;
        }
    };

    /**
     * Determine if an item's group is currently open
     * @param   {String}   itemId  ID of the parent item
     * @return  {Boolean}          Whether the item's group is open
     */
    _util.isItemOpen = function _util_isItemOpen(itemId) {
        return (openedItemIds.indexOf(itemId) !== -1);
    };

    /**
     * Generates a random ID
     * @param   {String}  idPrefix  Optional prefix to prepend to the ID
     * @return  {String}            Randomized ID
     */
    _util.generateId = function _util_generateId(idPrefix) {
        var id = '';
        var letterPool = 'abcdefghijklmnopqrstuvwxyz';
        var numLetters = letterPool.length;
        var i = 3;

        // Get three letters
        while (i--) {
            id += letterPool.charAt(Math.floor(Math.random() * numLetters));
        }

        // Add three digits
        id += Math.floor(Math.random()*1000);

        // Insert base ID, if provided
        if (idPrefix && typeof idPrefix === 'string') {
            id = idPrefix + '_' + id;
        }

        // Make sure it's unique
        //TODO: This makes initial item validation slow down by 3x (typically from 2ms to 6ms). Worth it? Better way to check uniqueness? During initial plugin development, with thousands of items and hundreds of page loads, it never generated the same ID.
        if (_util.getItemById(id)) {
            return _util.generateId(idPrefix);
        }

        return id;
    };

    /**
     * Removes all remaining group elements
     */
    _util.clearOrphans = function _util_clearOrphans() {
        $('.' + CLASSES.group.base).remove();
        $('.' + CLASSES.item.hasGroup).removeClass(CLASSES.item.open);
    };

    /**
     * Gets an element's width
     *
     * @param   {Object}  elem  DOM element
     *
     * @return  {Number}        Pixel value
     */
    _util.getElemWidth = function _util_getElemWidth (elem) {
        return $(elem).outerWidth();
    };

    /**
     * Add a CSS rule to the document
     * @param  {String}  rule  CSS text (selector, properties, and values)
     */
    _util.addStyle = function _util_addStyle(rule) {
        // Create element upon first use
        if (!styleSheet) {
            styleSheet = $('<style/>')
                            .attr('id', NAMESPACE_PREFIX + 'style')
                            .attr('type', 'text/css')
                            .appendTo('head');

            // Get the actual DOM element, not the jQuery object
            styleSheet = styleSheet.get(0);
        }

        // Modern browsers
        if (styleSheet.sheet) {
            styleSheet.appendChild(document.createTextNode(' ' + rule));
        }
        // IE8-
        else if (styleSheet.styleSheet) {
            styleSheet.styleSheet.cssText += ' ' + rule;
        }
    };

    // Client

    _client.init = function _client_init() {
        // Client setup
        _client.supports = {};

        // Since support for animations and transitions is effectively the same across browsers/versions, just check for one of them
        _client.supports.cssAnimation = (document.body.style.animationName !== undefined || document.body.style.WebkitAnimationName !== undefined);

        if (_client.supports.cssAnimation) {
            // Check for prefixed event names
            // This realistically only applies to Safari 6-6.1 (not 6.2+) and Android 4.2+ (not sure about 5+), as of 10/2013
            if (document.body.style.transition === undefined && document.body.style.webkitTransition !== undefined) {
                EVENT_TYPES.transitionEnd = 'webkitTransitionEnd.' + NAMESPACE_LOWER;
            }

            if (document.body.style.animationName === undefined && document.body.style.WebkitAnimationName !== undefined) {
                EVENT_TYPES.animationEnd = 'webkitAnimationEnd.' + NAMESPACE_LOWER;
                EVENT_TYPES.css.animationDelay = '-webkit-animation-delay';
            }
        }

        // See whether the client returns the correct element width using `getComputedStyle`
        // Note: jQuery 3, the `.width()` method will no longer round the value; see https://github.com/jquery/jquery/issues/1724
        _client.supports.reliableWidths = ('getComputedStyle' in window ) && (function () {
            var div = document.createElement('div');

            div.style.width = '123.16px';

            return (parseFloat(window.getComputedStyle(div).width) === 123.16);
        }());
    };

    // Define keystrokes

    // Add keystrokes now that all functions have been defined
    KEYSTROKES = {
        withinMenu: [
            {
                // Handles both Tab and Shift+Tab to avoid acting twice if the keys are pressed awkwardly and fire two events
                keyCodes: [9],
                label: 'Tab',
                jsAction: _keystrokes._tab
            },
            {
                keyCodes: [13],
                label: 'Enter',
                jsAction: _keystrokes._enter
            },
            {
                keyCodes: [27],
                label: 'Escape',
                jsAction: _keystrokes._escapeInside
            },
            {
                keyCodes: [32],
                label: 'Space',
                jsAction: _keystrokes._space
            },
            {
                keyCodes: [37],
                label: 'Left',
                jsAction: _keystrokes._left
            },
            {
                keyCodes: [38],
                label: 'Up',
                jsAction: _keystrokes._up
            },
            {
                keyCodes: [39],
                label: 'Right',
                jsAction: _keystrokes._right
            },
            {
                keyCodes: [40],
                label: 'Down',
                jsAction: _keystrokes._down
            }
        ],
        outsideMenu: [
            {
                keyCodes: [27],
                label: 'Escape',
                jsAction: _keystrokes._escapeOutside
            }
        ]
    };

    //////////////////////////////////////////
    // Expose public properties and methods //
    //////////////////////////////////////////

    Menujs.defaults = Menujs.prototype.defaults;

    Menujs.version = VERSION;

    // Define jQuery plugin
    $.fn.menujs = function (menuDefinitions, options) {
        return this.each(function () {
            new Menujs(this, menuDefinitions, options).init();
        });
    };

    $.menujs = function (menuDefinitions, options) {
        return new Menujs(menuDefinitions, options).init();
    };
});
