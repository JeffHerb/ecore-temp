/*jshint loopfunc: true */
define([], function() {

    _priv = {};

    _priv.autoSize = function autoSize(elm) {

        setTimeout(function () {

            var scrollHeight = elm.scrollHeight;
            var currentHeight = parseInt(elm.style.height.replace('px', ''));

            if (scrollHeight !== currentHeight) {

                if (scrollHeight >= 38) {

                    elm.style.height = 'inherit';

                    var computed = window.getComputedStyle(elm);

                    var height = parseInt(computed.getPropertyValue('border-top-width'), 10) + parseInt(computed.getPropertyValue('padding-top'), 10) + elm.scrollHeight + parseInt(computed.getPropertyValue('padding-bottom'), 10) + parseInt(computed.getPropertyValue('border-bottom-width'), 10);

                    elm.style.height = height + 'px';
                }
                else {

                    elm.style.height = 'inherit';
                }
            }

        }, 0);
    };

    var setup = function _setup() {

        var expandingTextAreas = document.querySelectorAll('textarea.emp-expanding');

        for (var e = 0, eLen = expandingTextAreas.length; e < eLen; e++) {

            var expandintTextArea = expandingTextAreas[e];

            // Add an event listener
            expandintTextArea.addEventListener('keydown', function() {

                _priv.autoSize(this);
            });

            _priv.autoSize(expandintTextArea);

        }



    };

    return {
        setup: setup
    };

});
