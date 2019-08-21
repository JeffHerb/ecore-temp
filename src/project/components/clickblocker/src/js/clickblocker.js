define(['spin'], function(spin) {

	var CLASSES = {
		iconControl: 'emp-icon-hide-icon',
		textControl: 'emp-no-icon-hide-text'
	};

	var _priv = {};

	_priv.blocker = false;
	_priv.active = false;
	_priv.source = false;
    _priv.lastFocus = false;

    _priv.errorTimer = false;
    _priv.errorTimerTime = 60000;
    _priv.currentErrorWaitCount = 0;
    _priv.errorCheckCounter = 3;

    _priv.$body = $('body');

    // Private check function that will put a message up after 3 minutes
    _priv.checkForNoResponse = function() {

        if (_priv.currentErrorWaitCount !== _priv.errorCheckCounter) {

            _priv.currentErrorWaitCount += 1;

            journal.log({ type: 'info', owner: 'UI', module: 'clickblocker', func: 'checkForNoResponse' }, (_priv.errorCheckCounter - _priv.currentErrorWaitCount) + ' minutes before click blocker errors out!');

            _priv.errorTimer = setTimeout(_priv.checkForNoResponse, _priv.errorTimerTime);
        }
        else {

            emp.empMessage.createMessage({ text: "Something has gone wrong. Please contact the help desk!", type: "error" }, {scroll: true});

            blocker.remove();
        }
    };

    var blocker = function _blocker () {};

    // Extend the base
    blocker.prototype = {};

	blocker.check = function _check() {

		if (_priv.blocker) {

			return true;
		}

		return false;
	};

	blocker.add = function _add($source, skipErrorCheck, lockMsg) {

		//if ($source && $source.is(':visible')) {
        if ($source) {

			var spinnerOpts = {};
			var spinner = false;
			var controlWidth = false;
			var properClass = false;

			var sourceClasses = $source.attr('class') || false;

			if (sourceClasses && sourceClasses.indexOf('emp-icon') !== -1) {


                spinnerOpts = {
                    lines: 7,      // The number of lines to draw
                    length: 3,     // The length of each line
                    width: 2,      // The line thickness
                    radius: 3,     // The radius of the inner circle
                    corners: 0.5,  // Corner roundness (0..1)
                    rotate: 75,    // The rotation offset
                    color: '#000', // #rgb or #rrggbb
                    speed: 1,      // Rounds per second
                    trail: 75,     // Afterglow percentage
                    shadow: false, // Whether to render a shadow
                    hwaccel: true, // Whether to use hardware acceleration
                    className: 'spinner', // The CSS class to assign to the spinner
                    zIndex: 900,   // The z-index (defaults to 2000000000)
                    left: '12px'
                };

                properClass = CLASSES.iconControl;

			}
			else {

                spinnerOpts = {
                    lines: 7,      // The number of lines to draw
                    length: 3,     // The length of each line
                    width: 2,      // The line thickness
                    radius: 3,     // The radius of the inner circle
                    corners: 0.5,  // Corner roundness (0..1)
                    rotate: 75,    // The rotation offset
                    color: '#000', // #rgb or #rrggbb
                    speed: 1,      // Rounds per second
                    trail: 75,     // Afterglow percentage
                    shadow: false, // Whether to render a shadow
                    hwaccel: true, // Whether to use hardware acceleration
                    className: 'spinner', // The CSS class to assign to the spinner
                    zIndex: 900,   // The z-index (defaults to 2000000000)
                    left: '50%'
                };

                properClass = CLASSES.textControl;

			}

			spinner = new spin(spinnerOpts).spin();

            fastdom.measure(function() {

            	controlWidth = $source.outerWidth();

            	fastdom.mutate(function() {

            		$source.css('width', controlWidth + 'px');

                	$source.addClass(properClass);
                	$source[0].appendChild(spinner.el);

            	});
            });

			_priv.source = {
				$source: $source,
				width: controlWidth,
				class: properClass
			};

		}

		// Check to see if the blocker has even been created yet
		if (!_priv.blocker) {

			_priv.blocker = $('<div/>', {
				'class': 'emp-click-blocker',
				'id': 'emp-click-blocker',
                'tabindex': '0'
			}).on('keydown keyup mouseup', function(e) {

                if(e.which == 9) {
                    e.preventDefault();
                }

            });

            if (lockMsg) {

                var blockMessage = $('<div/>', {
                    'class': 'emp-click-blocker-message'
                });

                blockMessage.append(
                    $('<span/>').text("Page is locked until popup is closed.")
                );

                _priv.blocker.append(blockMessage);

            }

			journal.log({type: 'info', owner: 'UI', module: 'blocker', func: 'add'}, 'Created the blocker div!');

		}

		if (!_priv.active) {

            // Get the currently focused element
            _priv.lastFocus = $(document.activeElement);

			_priv.$body.append(_priv.blocker);

            _priv.blocker.focus();

			_priv.active = true;

			journal.log({type: 'info', owner: 'UI', module: 'blocker', func: 'add'}, 'Blocker div has been added to the DOM.');
		}
        else {

            journal.log({type: 'error', owner: 'UI', module: 'blocker', func: 'add'}, 'Can not add blocker as it already is active.');
        }

        if (!skipErrorCheck) {

            journal.log({type: 'info', owner: 'UI', module: 'blocker', func: 'add'}, 'Click blocker error timer started');

            // Add delay message for error
            _priv.errorTimer = setTimeout(_priv.checkForNoResponse, _priv.errorTimerTime);
        }

	};

	blocker.remove = function _remove() {

		if (_priv.active) {

            _priv.blocker.remove();
            _priv.blocker = false;

            // Remove possible error before it can happen
            clearInterval(_priv.errorTimer);


			journal.log({type: 'info', owner: 'UI', module: 'blocker', func: 'remove'}, 'Blocker div removed from DOM.');


			if (_priv.source) {

				fastdom.mutate(function() {

					//var $spinner = _priv.source.$source.find('.spinner');

					fastdom.mutate(function() {

						_priv.source.$source.find('.spinner').remove();
						_priv.source.$source.removeClass(_priv.source.class);
						_priv.source.$source.removeAttr('style');

						_priv.source = false;

                        if (_priv.lastFocus) {

                            _priv.lastFocus.focus();

                            _priv.lastFocus = false;
                        }
					});
				});

			}


			_priv.active = false;

		}
	};

	return blocker;

});
