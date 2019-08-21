define(['jquery', 'cui'], function ($, cui) {
    ///////////////
    // Constants //
    ///////////////
    var VERSION = '0.1.0';

    var CLASSES = {
                // Global classes
                hidden: 'cui-hidden',
                animateShake: 'cui-animate-shake',

                // Plugin-specific classes
                badge: 'cui-badge',
                indeterminateState: 'cui-badge-indeterminate',
            };

    var PADDING = -2;

    var priv = {};
    var badges = [];
    var $body = $('body');
    var $window = $(window);

    /////////////////
    // Constructor //
    /////////////////

    var Badge = function (elem, options) {
        // Create a jQuery version of the element
        this.$target = $(elem);
        // Store the options
        this.options = options;

        // Extract data attribute options
        this.metadata = this.$target.data('badge-options');

        return this;
    };

    //////////////////////
    // Plugin prototype //
    //////////////////////

    Badge.prototype = {};

    // Default user options
    Badge.prototype.defaults = {
        value: 0,
        display: {
            css: {
            },
            className: '',
            offset: {
                top: 0,
                left: 0,
            },
        },
        location: 'above-right',
        increment: null,
        decrement: null,
    };

    /**
     * Initializes the plugin
     * May be called multiple times
     */
    Badge.prototype.init = function () {
        var badge;

        // Introduce defaults that can be extended either globally or using an object literal
        if (typeof this.options === 'string') {
            this.config = $.extend(true, {}, this.defaults);
            this.config.value = this.options;
        }
        else {
            this.config = $.extend(true, {}, this.defaults, this.options, this.metadata);
        }

        // Create new badge object using this instance
        badge = this;

        badge.isOpen = false;

        // Create the badge element
        badge.$badge = priv.createBadge(badge);

        // Apply the value
        priv.applyValue(badge);

        // Adds this badge instance to our array so we can track all of them
        badges.push(badge);

        // Keep the badge aligned properly when window is resized
        $window.on('resize', function (evt) {
            priv.onWindowResize(evt, badge);
        }.bind(badge));

        // Return this instance of the plugin
        return badge;
    };

    /**
     * Set a badge's value
     *
     * @param   {Function}  callback  Optional function to run after closing the badge. It will receive the badge instance as an argument.
     */
    Badge.prototype.set = function _set (newValue, callback) {
        this.config.value = newValue;

        priv.applyValue(this);

        if (typeof callback === 'function') {
            callback(this);
        }
    };

    /**
     * Increments a badge's value
     *
     * @param   {Function}  callback  Optional function to run after closing the badge. It will receive the badge instance as an argument.
     */
    Badge.prototype.increment = function _increment (options, callback) {
        if (options && typeof options === 'object') {
            priv.incrementValue(this, options);
        }
        else {
            priv.incrementValue(this);
        }

        // Check to see if the caller included a callback function as the first/only argument
        if (typeof options === 'function' && typeof callback !== 'function') {
            options(this);
        }

        // Check to see if the caller included a callback function
        if (typeof callback === 'function') {
            callback(this);
        }
    };

    /**
     * Decrements a badge's value
     *
     * @param   {Function}  callback  Optional function to run after closing the badge. It will receive the badge instance as an argument.
     */
    Badge.prototype.decrement = function _decrement (options, callback) {
        if (options && typeof options === 'object') {
            priv.decrementValue(this, options);
        }
        else {
            priv.decrementValue(this);
        }

        // Check to see if the caller included a callback function as the first/only argument
        if (typeof options === 'function' && typeof callback !== 'function') {
            options(this);
        }

        if (typeof callback === 'function') {
            callback(this);
        }
    };

    /**
     * (Re)position the badge
     *
     * @param   {Function}  callback  Optional function to run after closing the badge. It will receive the badge instance as an argument.
     */
    Badge.prototype.position = function _position (callback) {
        priv.positionBadge(this);

        if (typeof callback === 'function') {
            callback(this);
        }
    };

    /**
     * Destroy the badge
     *
     * @param   {Function}  callback  Optional function to run after closing the badge. It will receive the badge instance as an argument.
     */
    Badge.prototype.destroy = function _destroy (callback) {
        if (typeof callback === 'function') {
            callback(this);
        }
    };

    /////////////////////
    // Private methods //
    /////////////////////

    // Opens a new badge window
    priv.openBadge = function openBadge (badge) {
        // Position it
        priv.positionBadge(badge);

        // Reveal it
        badge.$badge
            .animate(
                {opacity: 1},
                400
            );

        badge.isOpen = true;

        badge.$badge.trigger('show.badge');
    };

    // Handles the window resize event
    priv.onWindowResize = function onWindowResize (evt, badge) {
        if (badge.isOpen) {
            priv.positionBadge(badge);
        }
    };

    // Create the badge container element
    priv.createBadge = function createBadge (badge) {
        // Defines the badge window div and makes it fade in
        var $badge = $('<div/>')
                            .addClass(CLASSES.badge)
                            .addClass(badge.config.display.className)
                            .attr('tabindex', '0')
                            .css(badge.config.display.css)
                            .css('opacity', '0') // Keep it hidden for now
                            .appendTo(document.body);

        return $badge;
    };

    // Function that will position the badge on the page - Aligned to right side of Notifications button
    priv.positionBadge = function positionBadge (badge) {
        var position = {
            top: 0,
            left: 0,
        };
        var addedRightMargin = false;
        var windowWidth;
        var badgeWidth;
        var badgeHeightActual;
        var badgeHeightWithPadding;
        var buttonOffset;
        var buttonWidth;
        var buttonHeight;
        var buttonLineHeight;
        var difference;

        /**
         * Determines the position based on the requested location, detects boundary collisions, and falls back to other locations if necessary
         *
         * @param   {String}  location  Location of the badge
         * @param   {Object}  position  Position definition
         *
         * @return  {Object}            Updated position definition
         */
        var __determinePosition = function __determinePosition (location, position) {
            /**
             * Determines the top and left positioning for the badge
             * This is a very simple, nearly logic-less function that does not do boundary testing or fallbacks
             */
            var __getTopAndLeft = function __getTopAndLeft (placement) {
                // Returns the `top` value when the badge is above the button
                var __getTopWhenAbove = function __getTopWhenAbove () {
                    return buttonOffset.top; // - (buttonLineHeight / 8);
                };

                // Returns the `top` value when the badge is below the button
                var __getTopWhenBelow = function __getTopWhenBelow () {
                    return buttonOffset.top + buttonHeight + PADDING;
                };

                if (placement === 'below-left') {
                    position.left = buttonOffset.left;
                    position.top = __getTopWhenBelow();
                }
                else if (placement === 'above-left') {
                    position.left = buttonOffset.left;
                    position.top = __getTopWhenAbove();
                }
                else if (placement === 'below-right') {
                    position.left = buttonOffset.left + buttonWidth - badgeWidth + (PADDING / 2) - (buttonLineHeight / 8);
                    position.top = __getTopWhenBelow();
                }
                else if (placement === 'above-right') {
                    position.left = buttonOffset.left + buttonWidth - badgeWidth + (badgeWidth / 2);
                    position.top = __getTopWhenAbove();
                }
                else if (/^(above|below)\-center$/.test(placement)) {
                    // Vertical position is different for each `center` location
                    if (placement === 'below-center') {
                        position.top = __getTopWhenBelow();
                    }
                    else if (placement === 'above-center') {
                        position.top = __getTopWhenAbove();
                    }

                    // Horizontal position is the same for both `center` locations

                    // To determine the `left` value, start at the left edge of the button...
                    position.left = buttonOffset.left;

                    // ...then add half of the difference between the button's width and the badge's width
                    // If the badge is wider than the button, the difference will be a negative number which will actually pull the badge to the right (which is what we'd want to happen)
                    position.left += ((buttonWidth - badgeWidth) / 2);
                }
                else if (/^inline\-(right|left)$/.test(placement)) {
                    // Horizontal position is different for each `inline` location
                    if (placement === 'inline-left') {
                        position.left = buttonOffset.left - badgeWidth - PADDING;
                    }
                    else if (placement === 'inline-right') {
                        position.left = buttonOffset.left + buttonWidth + PADDING;
                    }

                    // Vertical position is the same for both `inline` locations

                    // To determine the `top` value, start at the top edge of the button...
                    position.top = buttonOffset.top;

                    // ...then add half of the difference between the button's height and the badge's height
                    // If the badge is taller than the button, the difference will be a negative number which will actually pull the badge upward (which is what we'd want to happen)
                    position.top += ((buttonHeight - badgeHeightActual) / 2);
                }
            };

            // Start off with a simple guess at the top and left values
            __getTopAndLeft(location);

            // Perform boundary detection and fallbacks based on the requested location
            // Note that not all locations have fallbacks. If they did, then we might create an infinite loop as each test fails and calls another fallback in turn. Instead, some of the locations merely tweak the positioning to find the most practical position for the badge. These locations are marked with a 'safe' comment -- falling back to a safe location will avoid infinite looping. Do not use a 'not safe' location as a fallback.

            // Safe (no recursive fallback)
            if (location === 'below-left') {
                // Clipped by the left edge of the screen
                if (position.left < 0) {
                    // Determine how far it is from the left edge (a negative value means it's being clipped)
                    difference = windowWidth - (position.left + badgeWidth + PADDING);

                    // Shift the badge to the right just enough to fit on-screen
                    position.left = 0;

                    // Add a margin to prevent the badge from butting up against the edge of the screen. We cannot simply change the `left` value to create this gap because if the badge contains wrapping text the text will simply reflow and keep using as much width as possible.
                    badge.$badge.css('margin-right', PADDING + 'px');
                    addedRightMargin = true;
                }
            }
            // Not safe (includes recursive fallback)
            else if (location === 'above-left') {
                // We need to verify two things in conjunction: that it's not clipped by the top of the window, and that it's not running off the left edge of the screen

                // Condition: clipped by the top edge of the window
                if (position.top < 0) {
                    // It does not matter whether the badge is also clipped by the left edge. While we can fix the `left` value easily (see next condition), our only recourse for `top` is to fallback to a safe location
                    position = __determinePosition('below-left', position);
                }
                // Condition: clipped by the left edge of the window only
                else if (position.left < 0) {
                    // Shift the badge to the right just enough to fit on-screen
                    position.left = 0;

                    // Add a margin to prevent the badge from butting up against the edge of the screen. We cannot simply change the `left` value to create this gap because if the badge contains wrapping text the text will simply reflow and keep using as much width as possible.
                    badge.$badge.css('margin-right', PADDING + 'px');
                    addedRightMargin = true;
                }
            }
            // Safe (no recursive fallback)
            else if (location === 'below-right') {
                // Determine how far it is from the right edge (a negative value means it's being clipped)
                difference = windowWidth - (position.left + badgeWidth + PADDING);

                // Clipped by the right edge
                if (difference < 0) {
                    // Shift the badge to the right just enough to fit on-screen
                    position.left += difference;
                    position.left -= PADDING;

                    // But make sure we didn't just push it off the left edge of the screen
                    if (position.left < 0) {
                        position.left = 0;

                        // Add a margin to prevent the badge from butting up against the edge of the screen. We cannot simply change the `left` value to create this gap because if the badge contains wrapping text the text will simply reflow and keep using as much width as possible.
                        badge.$badge.css('margin-right', PADDING + 'px');
                        addedRightMargin = true;
                    }
                }
            }
            // Not safe (includes recursive fallback)
            else if (location === 'above-right') {
                // We need to verify two things inconjunction: that it's not clipped by the top of the window, and that it's not running off the left edge of the screen

                // Determine how far it is from the right edge (a negative value means it's being clipped)
                difference = windowWidth - (position.left + badgeWidth + PADDING);

                // Condition: clipped by the top of the window
                if (position.top < 0) {
                    // It doesn't matter if it is also clipped by the right edge. While we could fix the `left` value easily (see next condition), our only recourse for `top` is to fallback to a safe location
                    position = __determinePosition('below-right', position);
                }
                // Condition: clipped by the right edge of the window only
                else if (difference < 0) {
                    // Shift the badge to the right just enough to fit on-screen
                    position.left += difference;
                    position.left -= PADDING;

                    // But make sure we didn't just push it off the left edge of the screen
                    if (position.left < 0) {
                        position.left = 0;

                        // Add a margin to prevent the badge from butting up against the edge of the screen. We cannot simply change the `left` value to create this gap because if the badge contains wrapping text the text will simply reflow and keep using as much width as possible.
                        badge.$badge.css('margin-right', PADDING + 'px');
                        addedRightMargin = true;
                    }
                }
            }
            // Not safe (includes recursive fallback)
            else if (location === 'inline-left') {
                // Condition: clipped by the left edge of the screen
                if (position.left < 0) {
                    position = __determinePosition('below-left', position);
                }
            }
            // Not safe (includes recursive fallback)
            else if (location === 'inline-right') {
                // Condition: clipped by the right edge of the screen
                if (position.left + badgeWidth > windowWidth) {
                   __determinePosition('below-right', position);
                }
            }
            // Not safe (includes recursive fallback) unless only the `top` is broken
            else if (location === 'below-center') {
                // There are two bad scenarios: the badge is clipped by the right edge of the screen, or it's clipped by the left edge

                // Condition: clipped by the left edge of the screen
                if (position.left < 0) {
                    // Shift it to the right just enough to be on-screen
                    position.left = 0;

                    // Add a margin to prevent the badge from butting up against the edge of the screen. We cannot simply change the `left` value to create this gap because if the badge contains wrapping text the text will simply reflow and keep using as much width as possible.
                    badge.$badge.css('margin-right', PADDING + 'px');
                    addedRightMargin = true;
                }
                // Clipped by the right edge
                else if (position.left + badgeWidth > windowWidth) {
                   __determinePosition('below-right', position);
                }
            }
            // Not safe (includes recursive fallback) when the `top` is broken
            else if (location === 'above-center') {
                // There are three bad scenarios we need to check for. The badge can be clipped by these edges of the screen:
                // 1. top
                // 2. left
                // 3. right
                // We do not need to check for combinations (e.g. clipped by the right and top edges) because our fallback for `top` will handle any horizontal issues

                // 1. Clipped by the top edge
                if (position.top < 0) {
                    // If the top is broken we are forced to move the badge below the button. There's no point looking into whether it also fails the left or right edge since our fallback will take care of that.
                    __getTopAndLeft('below-center');
                    position = __determinePosition('below-center', position);
                }
                // 2. Clipped by the left edge, but not the top
                else if (position.left < 0) {
                    // Shift it to the right just enough to be on-screen
                    position.left = 0;

                    // Add a margin to prevent the badge from butting up against the edge of the screen. We cannot simply change the `left` value to create this gap because if the badge contains wrapping text the text will simply reflow and keep using as much width as possible.
                    badge.$badge.css('margin-right', PADDING + 'px');
                    addedRightMargin = true;
                }
                // 3. Clipped by the right edge, but not the top
                else if (position.left + badgeWidth > windowWidth) {
                    // Determine how far it is from the left edge (a negative value means it's being clipped)
                    difference = windowWidth - (position.left + badgeWidth + PADDING);

                    // Shift the badge to the right just enough to fit on-screen
                    position.left += difference;
                    position.left -= PADDING;

                    // But make sure we didn't just push it off the left edge of the screen
                    if (position.left < 0) {
                        position.left = 0;

                        // Add a margin to prevent the badge from butting up against the edge of the screen. We cannot simply change the `left` value to create this gap because if the badge contains wrapping text the text will simply reflow and keep using as much width as possible.
                        badge.$badge.css('margin-right', PADDING + 'px');
                        addedRightMargin = true;
                    }
                }
            }
            else {
                console.error('UI [badge] Unsupported location "' + badge.config.location + '" ', badge);

                return null;
            }

            return position;
        };

        // Gather measurements about key elements

        buttonOffset = badge.$target.offset();
        buttonWidth = badge.$target.outerWidth();
        buttonHeight = badge.$target.outerHeight();
        buttonLineHeight = getComputedStyle(badge.$target.get(0)).lineHeight;

        if (/px$/.test(buttonLineHeight)) {
            buttonLineHeight = parseInt(buttonLineHeight, 10);
        }
        else if (/em$/.test(buttonLineHeight)) {
            buttonLineHeight = parseInt(buttonLineHeight, 10) * 16;
        }
        else {
            buttonLineHeight = buttonHeight;
        }

        badgeWidth = badge.$badge.outerWidth() + (PADDING / 2);
        badgeHeightActual = badge.$badge.outerHeight(); // For inline positioning we want the actual height of the badge
        badgeHeightWithPadding = badgeHeightActual + (PADDING / 2); // Above and below the button we want to account for padding, but only half of it because the button already has some visual padding built in

        windowWidth = window.innerWidth;

        // Get the positioning values for the requested location
        // Hint: this is the "main" operation of this function and a good place to start for debugging. Most of the real work is done in `__determinePosition()`.
        position = __determinePosition(badge.config.location, position);

        // No position found (e.g. the location was invalid)
        if (position === null) {
            return false;
        }

        // Remove the margin that may have been added earlier in the page's lifecycle (e.g. before the window was resized)
        if (!addedRightMargin) {
            badge.$badge.get(0).style.removeProperty('margin-right');
        }

        // Apply user-specified offsets
        if (badge.config.display.offset) {
            if (badge.config.display.offset.top) {
                position.top += badge.config.display.offset.top;
            }

            if (badge.config.display.offset.left) {
                position.left += badge.config.display.offset.left;
            }
        }

        // Apply the positioning styles
        badge.$badge
            .css({
                left: position.left,
                top: position.top,
            });
    };

    /**
     * Increases the badge's current value
     *
     * @param   {Object}  badge    Badge instance
     * @param   {Object}  options  Optional settings
     *
     * @return  {Boolean}          The new value
     */
    priv.incrementValue = function _incrementValue (badge, options) {
        var valueType;

        // User-defined function for incrementing the value
        if (typeof badge.config.increment === 'function') {
            badge.config.value = badge.config.increment(badge.config.value, badge, options);
        }
        // Automatic incrementing
        else {
            // Ignore the indeterminate state
            if (priv.isIndeterminateState(badge)) {
                return false;
            }

            valueType = typeof badge.config.value;

            // Number, either an actual number like `2` or a string equivalent like `"2"`
            if (valueType === 'number' || (valueType === 'string' && ('' + parseFloat(badge.config.value)) === badge.config.value)) {
                badge.config.value = parseFloat(badge.config.value) + 1;
            }
            // String
            else if (valueType === 'string') {
                // Single letter
                if (badge.config.value.length === 1) {
                    // Increase by one
                    badge.config.value = String.fromCharCode(badge.config.value.charCodeAt(0) + 1);
                }
                // No other strings are supported yet
                else {
                    console.error('[Badge] Cannot increment string value: "' + badge.config.value + '"');

                    return false;
                }
            }
            // Boolean
            else if (valueType === 'boolean') {
                // Toggle to the opposite state
                badge.config.value = !!badge.config.value;
            }
            // Nothing else is supported yet
            else {
                console.error('[Badge] Cannot increment value of type ' + (valueType) + ': "', badge.config.value, '"');

                return false;
            }
        }

        // Apply the value
        priv.applyValue(badge, options);

        return badge.config.value;
    };

    /**
     * Decreases the badge's current value
     *
     * @param   {Object}  badge    Badge instance
     * @param   {Object}  options  Optional settings
     *
     * @return  {Boolean}          The new value
     */
    priv.decrementValue = function _decrementValue (badge, options) {
        var valueType;

        // User-defined function for decrementing the value
        if (typeof badge.config.decrement === 'function') {
            badge.config.value = badge.config.decrement(badge.config.value, badge, options);
        }
        // Automatic decrementing
        else {
            // Ignore the indeterminate state
            if (priv.isIndeterminateState(badge)) {
                return false;
            }

            valueType = typeof badge.config.value;

            // Number, either an actual number like `2` or a string equivalent like `"2"`
            if (valueType === 'number' || (valueType === 'string' && ('' + parseFloat(badge.config.value)) === badge.config.value)) {
                badge.config.value = parseFloat(badge.config.value) - 1;
            }
            // String
            else if (valueType === 'string') {
                // Single letter
                if (badge.config.value.length === 1) {
                    // Decrease by one
                    badge.config.value = String.fromCharCode(badge.config.value.charCodeAt(0) - 1);
                }
                // No other strings are supported yet
                else {
                    console.error('[Badge] Cannot decrement string value: "' + badge.config.value + '"');

                    return false;
                }
            }
            // Boolean
            else if (valueType === 'boolean') {
                // Toggle to the opposite state
                badge.config.value = !!badge.config.value;
            }
            // Nothing else is supported yet
            else {
                console.error('[Badge] Cannot decrement value of type ' + (valueType) + ': "', badge.config.value, '"');

                return false;
            }
        }

        // Apply the value
        priv.applyValue(badge, options);

        return badge.config.value;
    };

    /**
     * Updates the displayed value on the badge
     *
     * @param   {Object}  badge    Badge instance
     * @param   {Object}  options  Optional settings
     *
     * @return  {Boolean}          Success/failure
     */
    priv.applyValue = function _applyValue (badge, options) {
        // Display the new value
        if (badge.config.value instanceof $) {
            badge.$badge.append(badge.config.value);
        }
        else {
            badge.$badge.html(badge.config.value);
        }

        // Hide if there's no value
        if ([null, 0, undefined, ''].indexOf(badge.config.value) !== -1) {
            badge.$badge.addClass(CLASSES.hidden);
            badge.isOpen = false;
        }
        else {
            badge.$badge.removeClass(CLASSES.hidden);
            badge.isOpen = true;

            if (priv.isIndeterminateState(badge)) {
                badge.$badge.addClass(CLASSES.indeterminateState);
            }
            else {
                badge.$badge.removeClass(CLASSES.indeterminateState);
            }

            // Display the badge
            if (!badge.$badge.hasClass(CLASSES.hidden)) {
                priv.openBadge(badge);
            }

            // Animate the change, unless told not to
            if (!options || options.animation !== false) {
                // Start the animation
                badge.$badge.addClass(CLASSES.animateShake);

                // Stop the animation after a brief period
                setTimeout(function () {
                    badge.$badge.removeClass(CLASSES.animateShake);
                }, 200);
            }
        }

        return true;
    };

    /**
     * Determines whether the badge is currently in an indeterminate state
     *
     * @param   {Object}   badge  Badge instance
     *
     * @return  {Boolean}         The result
     */
    priv.isIndeterminateState = function _isIndeterminateState (badge) {
        return (badge.config.value === -1);
    };

    //////////////////////////////////////////
    // Expose public properties and methods //
    //////////////////////////////////////////

    Badge.defaults = Badge.prototype.defaults;

    Badge.version = VERSION;

    // Define jQuery plugin
    window.$.fn.badge = function (options) {
        return this.each(function () {
            new Badge(this, options).init();
        });
    };

    window.$.badge = function (target, options) {
        return new Badge(target, options).init();
    };
});
