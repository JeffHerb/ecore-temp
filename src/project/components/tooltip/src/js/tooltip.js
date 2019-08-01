/*global feta */
define(['jquery', 'popover'], function ($, popover) {
    ///////////////
    // Constants //
    ///////////////
    var VERSION = '0.0.1';

    var NAMESPACE = 'tooltip';

    var _priv = {};
    var _events = {};

    _priv.createTooltip = function(tooltip) {

        var tooltipSource = tooltip.getAttribute('data-tooltip-source');
        var tooltipContentContainer = tooltip.querySelector('.cui-hide-from-screen');

        var firstHeader = false;

        var newTooltip = document.createElement('div');
            newTooltip.classList.add('emp-tooltip-itag');

        if (tooltipSource) {

            var cloneSource = document.querySelector('#' + tooltipSource);

            if (cloneSource) {

                cloneSource = cloneSource.cloneNode(true);

                while (cloneSource.firstChild) {

                    var child = cloneSource.firstChild;

                    if (child.nodeType === 1) {


                        if (child.nodeName !== "HEADER") {

                            newTooltip.appendChild(child);
                        }
                        else {
                            if (!firstHeader) {
                                firstHeader = true;
                            }
                            else {
                                newTooltip.appendChild(child);
                            }
                        }

                    }

                    cloneSource.removeChild(cloneSource.firstChild);
                }

                return newTooltip;

            }
            else {

            }

        }
        else if(tooltipContentContainer) {

            var tooltipContent = tooltipContentContainer.firstElementChild;

            if(tooltipContent && tooltipContent.nodeType === 1){

                newTooltip.appendChild(tooltipContent);
            }

            return newTooltip;

        }
        else{

        }

    };

    _events.click = function _clicked_tooltit(evt) {

        var defualts = {
            html: '',
            display: {
                css: {
                },
                className: '',
                offset: {
                    top: -5,
                    left: 0,
                },
            },
            location: 'below-right',
            hideOnResize: false,
            hideOnEscape: true,
            gainFocus: true,
            isModal: true,
            useArrow: true,
            showOnCreate: false,
            resizeMobile: false,
        };

        var tooltip = evt.data.tooltip;
        var tooltipContents = _priv.createTooltip(tooltip.tooltip);

        if (!tooltip.popover) {

            if (tooltip.tooltip.getAttribute('data-tooltip-source') && !tooltip.tooltip.classList.contains('emp-page-tooltips')) {

                defualts.html = tooltipContents;

                tooltip.popover = $.popover(tooltip.$tooltip, defualts);

                tooltip.popover.show(tooltip);

            }else{

                defualts.html = tooltipContents;

                tooltip.popover = $.popover(tooltip.$tooltip, defualts);

                tooltip.popover.show(tooltip);
            }

        }
        else{

            //console.log("Tooltip already created!");
        }

    };

    /////////////////
    // Constructor //
    /////////////////

    var Tooltip = function _Tooltip (elem, options) {
        // Create both a jQuery copy and a regular DOM copy of the element
        if (elem instanceof $) {
            this.$tooltip = elem;
            this.tooltip = elem.get(0);
        }
        else if (elem instanceof HTMLElement) {
            this.tooltip = elem;
            this.$tooltip = $(elem);
        }
        else {
            //FIXME: Not sure if these two lines are a good idea or not. I just want to prevent things from failing when the tooltip is not associated with a link. (CP 8/8/16)
            this.$tooltip = $();
            this.tooltip = document.createElement('a');
        }

        // Store the options
        this.options = options;

        // Extract data attribute options
        this.metadata = this.$tooltip.data('tooltip-options');

        return this;
    };

    //////////////////////
    // Plugin prototype //
    //////////////////////

    Tooltip.prototype = {};

    // Default user options
    // This mirrors the config for the popover component
    Tooltip.prototype.defaults = {};

    /**
     * Initializes the plugin
     * May be called multiple times
     */
    Tooltip.prototype.init = function _Tooltip_init () {

        var tooltip = this;

        tooltip.$tooltip.on('click', { tooltip: tooltip }, _events.click);

        // Return this instance of the plugin
        return tooltip;
    };

    /**
     * Hides the tooltip
     *
     * @param   {function}  callback         Optional function to run after closing the tooltip. It will receive the Tooltip instance as an argument.
     */
    Tooltip.prototype.hide = function _Tooltip_hide (callback) {
        var tooltip = this;

        tooltip.popover.hide(this);

        // Check to see if the caller included a callback function
        if (typeof callback === 'function') {
            callback(this);
        }
    };

    /**
     * Display the tooltip
     *
     * @param   {function}  callback  Optional function to run after closing the tooltip. It will receive the Tooltip instance as an argument.
     */
    Tooltip.prototype.show = function _Tooltip_show (callback) {
        var tooltip = this;

        tooltip.popover.show(this);

        // Check to see if the caller included a callback function
        if (typeof callback === 'function') {
            callback(this);
        }
    };

    /**
     * (Re)position the tooltip
     *
     * @param   {function}  callback  Optional function to run after closing the tooltip. It will receive the Tooltip instance as an argument.
     */
    Tooltip.prototype.position = function _Tooltip_position (callback) {
        var tooltip = this;

        tooltip.popover.position(this);

        // Check to see if the caller included a callback function
        if (typeof callback === 'function') {
            callback(this);
        }
    };

    /**
     * Destroy the tooltip
     *
     * @param   {function}  callback  Optional function to run after closing the tooltip. It will receive the Tooltip instance as an argument.
     */
    Tooltip.prototype.destroy = function _Tooltip_destroy (callback) {
        var tooltip = this;

        tooltip.popover.hide(this, true);

        // Check to see if the caller included a callback function
        if (typeof callback === 'function') {
            callback(tooltip);
        }

        return tooltip;
    };

    //////////////////////////////////////////
    // Expose public properties and methods //
    //////////////////////////////////////////

    Tooltip.defaults = Tooltip.prototype.defaults;

    Tooltip.version = VERSION;

    // Define jQuery plugin
    window.$.fn.tooltip = function $_fn_tooltip (options) {
        return this.each(function $_fn_tooltip_each () {
            var tooltip = new Tooltip(this, options).init();

        });
    };

    window.$.tooltip = function $_tooltip (toggler, options) {
        return new Tooltip(toggler, options).init();
    };
});
