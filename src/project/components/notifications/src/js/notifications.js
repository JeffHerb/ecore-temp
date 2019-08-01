define(['jquery', 'cui', 'kind', 'getIndex', 'shortcut', 'withinviewport', 'clickblocker'], function ($, cui, kind, getIndex, shortcut, withinviewport, clkblocker) {
    ///////////////
    // Constants //
    ///////////////

    var VERSION = '0.1.0';
    var DATE_LOCALE = 'en-US';

    var CLASSES = {
            // High-level elements
            toggleLink: 'emp-header-notifications', // Link that the user clicks to open the notifications UI
            popover: 'emp-ntf-popover', // Added to the standard popover element
            tooltip: 'emp-tooltip',
            tooltipStyle: 'emp-tooltip-style',
            ntfTooltip: 'emp-ntf-entry-timestamp-tooltip',

            // General plugin elements
            wrapper: 'emp-ntf-wrapper',
            closeWrapper: 'emp-ntf-closeWrapper',
            closeButton: 'emp-ntf-close-button',
            linkToPage: 'emp-ntf-link-to-page',
            globalControls: 'emp-ntf-controls',
            hasNoMessages: 'emp-ntf-has-no-messages',
            entryWrapper: 'emp-ntf-entry-wrapper', // Single message
            entryTitle: 'emp-ntf-entry-title',
            entryTimestamp: 'emp-ntf-entry-timestamp',
            lineWrapper: 'emp-ntf-line-wrapper',
            lineLabel: 'emp-ntf-line-label',
            lineData: 'emp-ntf-line-data',
            noMessages: 'emp-ntf-no-messages',
            markedAsRead: 'emp-ntf-marked-as-read',
            markedAsReadLink: 'emp-ntf-marked-as-read',
            priority: 'emp-ntf-priority',
        };

    var globals = {
        ntfPopover: null,  // Popover instance
        badge: null,       // Badge instance
        deleteQueue: [],   // Items marked as read that will be removed when the popover is closed
        isOpen: false,
        messages: false
    };

    /////////////////
    // Constructor //
    /////////////////

    var Notifications = function _Notifications (elem, messages) {
        // Store the element upon which the component was called
        if (elem instanceof $) {
            this.$elem = elem;

            // Get a reference to the actual (non-jQuery) element
            this.elem = elem.get(0);
        }
        else if (elem) {
            this.elem = elem;
            this.$elem = $(elem);
        }

        // Save off the id
        this.id = this.$elem.attr('id');

        this.messages = messages || [];

        return this;
    };

    //////////////////////
    // Plugin prototype //
    //////////////////////

    Notifications.prototype = {};

    ////////////////////
    // Setup and Init //
    ////////////////////

    /**
     * Initializes the plugin
     * May be called multiple times
     */
    Notifications.prototype.init = function _init () {
        var ntf = this;

        if (!ntf.$elem) {
            ntf.$elem = $('.' + CLASSES.toggleLink);
        }

        // Pre-load the popover plugin
        cui.load('popover');

        // Initialize badge
        //globals.badge = $.badge(ntf.$elem, {value: 0});

        // Setup the UI
        _updateView(ntf);

        // Wait for clicks on the toggle link
        ntf.$elem.on('click', {notifications: ntf}, _handleToggleClick);

        shortcut.register({
            keys: 'shift+n',
            callback: function _notifications_shortcut_callback (/* evt */) {
                if (globals.ntfPopover) {
                    globals.ntfPopover.show();
                }
                else {
                    _handleToggleClick({data: {notifications: ntf}});
                }
            },
            description: 'Display notifications',
            type: 'keydown',
        });

        $('body').on('close.popover', function() {

            if (globals.isOpen) {
                _onPopoverClose();
            }

        });

        return ntf;
    };

    /////////////////////////////
    // General private methods //
    /////////////////////////////

    /**
     * Updates the badge and popover with the current set of messages
     *
     * @param   {Object}  ntf  Notifications instance
     */
    var _updateView = function _updateView (ntf) {

        if (fwData.context.urls && fwData.context.urls.notifications && fwData.context.urls.notifications.fetch) {

            var req = {
                url: fwData.context.urls.notifications.fetch
            };

            var res = {
                "done": function (data) {
                    //journal.log({ type: 'error', owner: 'FW', module: 'notifications', func: 'updateView' }, 'Requested data!: ');

                    if (data.status && data.status === "success") {

                        data = data.result;

                        if (data.length && data[0].body && data[0].body.notifications) {
                            data = data[0].body.notifications;

                            globals.messages = data;
                        }

                    }
                    else {
                        journal.log({ type: 'error', owner: 'FW', module: 'notifications', func: 'updateView' }, 'Error returned successfully from request.');
                    }

                },
                "fail": function (err) {

                    journal.log({ type: 'error', owner: 'FW', module: 'notifications', func: 'updateView' }, 'Error occured when fetching data or after. Error Msg: ' + err);
                }
            };

            emp.fw.request(req, res);
        }
    };

    // Remove a specific message when the popover closes
    // var _markAsRead = function _markAsRead ($link, evtData) {
    //     // Update the UI
    //     evtData.$listItem.addClass(CLASSES.markedAsRead);

    //     // Change the link
    //     $link
    //         .text('Mark as unread')
    //         .off('click.markAsRead')
    //         .on('click.markAsUnread', evtData, _onMarkAsUnreadClick);

    //     globals.deleteQueue.push(evtData.message);
    //     globals.badge.decrement({animation: false});
    // };

    // // Undo the pending removal of a specific message when the popover closes
    // var _markAsUnread = function _markAsUnread ($link, evtData) {
    //     var index = getIndex(globals.deleteQueue, evtData.message.id);

    //     // Update the UI
    //     evtData.$listItem.removeClass(CLASSES.markedAsRead);

    //     // Change the link
    //     $link
    //         .text('Mark as read')
    //         .off('click.markAsUnread')
    //         .on('click.markAsRead', evtData, _onMarkAsReadClick);

    //     // Remove the message from the delete queue
    //     globals.deleteQueue.splice(index, 1);

    //     globals.badge.increment({animation: false});
    // };

    // Remove all messages that were marked as read
    // var _processDeleteQueue = function _processDeleteQueue (ntf) {
    //     var msg;
    //     var index;

    //     if (globals.deleteQueue.length) {
    //         // console.warn('Deleting ' + globals.deleteQueue.length + ' messages');
    //         // Get the first message to be deleted
    //         msg = globals.deleteQueue.pop();

    //         // Remove messages that were marked as read
    //         while (msg) {
    //             // console.log('Removing message: "' + msg.title + '" ', msg);
    //             index = getIndex(ntf.messages, msg.id);

    //             // Remove the message from the list
    //             ntf.messages.splice(index, 1);

    //             // Get the next message to be deleted
    //             msg = globals.deleteQueue.pop();
    //         }

    //         // Recreate popover with the updated message list so it's accurate next time it's opened
    //         globals.ntfPopover = _generateUI(ntf);
    //         // console.log('Remaining messages: ', ntf.messages);
    //         globals.badge.set(ntf.messages.length);
    //     }
    // };

    ////////////////////
    // User Interface //
    ////////////////////

    /**
     * Creates the user interface for viewing the messages
     *
     * @param   {Array}   messages  Message list
     *
     * @return  {jQuery}            Popover element
     */
    var _generateUI = function _generateUI (target) {

        console.log("generate UI Called");
        console.log(target);

        $tiggerElm = $(target);

        var messages = globals.messages;
        var messageRefs = [];
        var $wrapper;
        var $messageList;
        var $footer;
        var $globalControls;
        var $markAllRead;

        // Destroy the previous DOM if one was already created
        if (globals.ntfPopover) {
            globals.ntfPopover.destroy();
        }

        // Outer container
        $wrapper = $('<div/>', {
                            'class': CLASSES.wrapper,
                        });

        var $closeButtonWrapper = $('<div/>', {
            'class': CLASSES.closeWrapper
        });

        var $closeButton = $('<button/>', {
            'role': 'button',
            'class': CLASSES.closeButton,
            'title': 'Close Notifications'
        }).text('Close Notifications');

        $closeButton.on('click', function() {

            //globals.ntfPopover.$popover.trigger('close.popover');

            globals.ntfPopover.hide();

            _onPopoverClose();

        });

        $closeButtonWrapper.append($closeButton);

        $wrapper.append($closeButtonWrapper);

        if (!messages.length) {
            $wrapper
                .addClass(CLASSES.hasNoMessages)
                .append(
                    $('<p/>', {
                            'class': CLASSES.noMessages,
                        })
                        .text('You have no unread notifications')
                 );
        }
        else {
            // Create list
            $messageList = $('<ul/>');

            // Add messages to the list
            messages.forEach(function _generateUI_messages (msg) {
                var $listItem;
                var $header;
                var $controls;
                var $time;
                var $markAsReadLink;

                $listItem = $('<li/>', {
                                    'class': CLASSES.entryWrapper,
                                });

                // Header
                if (msg.title || msg.timestamp) {
                    $header = $('<header/>');

                    // Title
                    if (msg.title) {
                        $header
                            .append(
                                $('<span/>',
                                    {
                                        'class': CLASSES.entryTitle + ' ' + 'emp-bold',
                                        'href': msg.url,
                                        'tabindex': '1',
                                    })
                                    .html(msg.title)
                            );
                    }

                    console.log("timestamp");
                    console.log(msg.timestamp);

                    // Time stamp
                    if (msg.timestamp) {
                        $time = $('<time/>',
                                    {
                                        'class': CLASSES.entryTimestamp, //+ ' ' + CLASSES.tooltip,
                                        //'title': new Date(msg.timestamp * 1000),
                                    })
                                    .html(_prettyPrintTime(msg.timestamp));

                        $header.append($time);

                        // $time.popover({
                        //     display: {
                        //         className: CLASSES.tooltipStyle + ' ' + CLASSES.ntfTooltip,
                        //     },
                        //     isModal: false, // Prevent the main popover from being closed when this is clicked
                        // });
                    }

                    // Add to DOM
                    $listItem.append($header);
                }

                // Add each field in the entry
                msg.fields.forEach(function _generateUI_messages_fields (field) {
                    var $line;
                    var $label;
                    var $data;

                    $label = $('<label/>', {
                                    'class': CLASSES.lineLabel,
                                })
                                .html(field.label);

                    $data = $('<div/>', {
                                    'class': CLASSES.lineData,
                                })
                                .html(field.data);

                    $line = $('<div/>', {
                                    'class': CLASSES.lineWrapper,
                                })
                                .append($label)
                                .append($data);

                    $listItem.append($line);
                });

                $listItem.append($controls);

                // High priority
                if (msg.priority) {
                    $listItem.addClass(CLASSES.priority);
                }

                // Add it all to the `<ul>`
                $messageList.append($listItem);

                // Store references to the message and its DOM elements so `_onMarkAllAsReadClick()` doesn't need to crawl the DOM to find them
                messageRefs.push({
                    message: msg,
                    $listItem: $listItem,
                    $link: $markAsReadLink,
                });
            });

            // Add list to the outer container
            $wrapper.append($messageList);
        }

        // Footer
        $footer = $('<footer/>');

        $footer.html('<div class="' + CLASSES.linkToPage + '"><a href="' + fwData.context.urls.notifications.page + '">View all notifications</a></div>');

        // Global controls that apply to all messages
        if (messages.length) {
            $globalControls = $('<div/>', {
                                        'class': CLASSES.globalControls,
                                    });

            // $markAllRead = $('<a/>', {
            //                         'tabindex': '1',
            //                     })
            //                     .text('Mark all as read')
            //                     .on('click.markAllAsRead', {messageRefs: messageRefs}, _onMarkAllAsReadClick);

            // $globalControls.append($markAllRead);
            $footer.append($globalControls);
        }

        $wrapper.append($footer);

        // Create popover
        globals.ntfPopover = $.popover($tiggerElm, {
            html: $wrapper,
            display: {
                className: CLASSES.popover,
                offset: {
                    left: -10,
                },
            },
            location: 'below-center',
            gainFocus: true,
        });

        // Scroll the popover into view when it appears
        globals.ntfPopover.$popover.on('show.popover', function (evt) {
            if (!withinviewport(globals.ntfPopover.$popover.get(0))) {
                globals.ntfPopover.$popover.get(0).scrollIntoView();
            }
        });

        globals.ntfPopover.$popover.on('close.popover', _onPopoverClose);

        return globals.ntfPopover;
    };

    /**
     * Creates human-friendly "how long ago" text for between a given time and right now
     *
     * Examples, in order of increasing past-ness: `28min ago`, `3h 4m ago`, `7:45` (i.e. today), `12/31 7:45`
     *
     * @param   {Number}  timestamp  Unix time stamp
     *
     * @return  {String}             Friendly time indication
     */
    var _prettyPrintTime = function _prettyPrintTime (timestamp) {
        var now = new Date();
        var then = new Date(timestamp * 1000);

        //console.log(difference);

        //var difference = parseInt((now.getTime() / 1000) - timestamp, 10); // In seconds, not milliseconds
        var prettyPrint = '';
        var dateOptions;

        // In the past hour
        // if (difference <= 3600) {
        //     // Display the minutes since then
        //     prettyPrint = parseInt(difference / 60, 10) + 'min ago';
        // }
        // // In the past 4 hours
        // else if (difference <= 14400) {
        //     // Display the hours and minutes since then
        //     prettyPrint = parseInt(difference / 3600, 10) + 'h ';
        //     prettyPrint += parseInt((difference % 3600) / 60, 10) + 'm ago';
        // }
        // // In the past 12 hours
        // else if (difference <= 43200) {
        //     // Display the time only, no date
        //     dateOptions = { hour12: true, hour: '2-digit', minute: '2-digit' };
        //     prettyPrint += then.toLocaleDateString(DATE_LOCALE, dateOptions).replace(/\d+\/\d+\/\d+\,\s/, '');
        // }
        // // More than 12 hours ago
        // else {
        //     // Display full date and time
        //     dateOptions = { month: 'numeric', day: '2-digit', hour12: true, hour: '2-digit', minute: '2-digit' };
        //     prettyPrint += then.toLocaleDateString(DATE_LOCALE, dateOptions).replace(/\d+\/\d+\/\d+\,\s/, '');
        // }

        dateOptions = { month: 'numeric', day: '2-digit', hour12: true, hour: '2-digit', minute: '2-digit' };
        //prettyPrint += then.toLocaleDateString(DATE_LOCALE, dateOptions); //.replace(/\d+\/\d+\/\d+\,\s/, '');

        var ampm = "AM";

        var hours = then.getHours();
        var minutes = then.getMinutes();

        if (hours > 12) {
            hours = hours - 12;
            ampm = "PM";
        }

        if (minutes < 10) {
            minutes = "0" + minutes;
        }

        prettyPrint = (then.getMonth() + 1) + '/' + then.getDate() + '/' + then.getFullYear() + ' ' + hours + ':' + minutes + ' ' + ampm;

        return prettyPrint;
    };

    ////////////
    // Events //
    ////////////

    var _handleToggleClick = function _handleToggleClick (evt) {
        // Make sure the plugin has loaded
        if (!$.popover) {
            // Call this same function when the plugin is done loading
            cui.load('popover', function _handleToggleClick_loadPopover () {
                _handleToggleClick(evt);
            });
        }
        // Create and open the popover if it doesn't exist yet
        else if (!globals.ntfPopover) {
            globals.ntfPopover = _generateUI(evt.target);
            globals.ntfPopover.show();
            globals.isOpen = true;
        }
        // Else, the popover plugin will handle the click on the toggler and open it for us
    };

    // Remove the specific message when the popover closes
    // var _onMarkAsReadClick = function _onMarkAsReadClick (evt) {
    //     _markAsRead($(this), evt.data);
    // };

    // Undo removal of the specific message when the popover closes
    // var _onMarkAsUnreadClick = function _onMarkAsUnreadClick (evt) {
    //     _markAsUnread($(this), evt.data);
    // };

    // Remove all message when the popover closes
    // var _onMarkAllAsReadClick = function _onMarkAllAsReadClick (evt) {
    //     evt.data.messageRefs.forEach(function (ref) {
    //         _markAsRead(ref.$link, {$listItem: ref.$listItem, message: ref.message});
    //     });
    // };

    var _onPopoverClose = function _onPopoverClose (evt) {

        globals.isOpen = false;

        // Remove the event listener so the message doesn't get removed
        globals.ntfPopover.$popover.off('close.popover');

        clkblocker.remove();
       // _processDeleteQueue(evt.data.notifications);
    };

    ////////////////////
    // Public methods //
    ////////////////////

    Notifications.prototype.push = function _push (newMessages) {
        if (kind(newMessages) === 'array') {
            this.messages = this.messages.concat(newMessages);
        }
        else {
            this.messages.push(newMessages);
        }

        _updateView(this);
    };

    ///////////////////////////
    // Expose public methods //
    ///////////////////////////

    Notifications.version = VERSION;

    // Define and expose the component to jQuery
    window.$.fn.notifications = function $_fn_notifications (options) {
        return this.each(function $_fn_notifications_each () {
            new Notifications(this, options).init();
        });
    };

    window.$.notifications = function $_notifications (options) {
        return new Notifications(options).init();
    };
});
