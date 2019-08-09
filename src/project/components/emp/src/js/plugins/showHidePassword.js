define([], function() {

    var init = function _password_init() {

        var documentBody = document.querySelector('body');

        documentBody.addEventListener('click', function(evt) {

            var source = evt.target;

            if (source.classList.contains('emp-password-toggle')) {

                var parentWrapper = evt.target;
                var currentInput = false;
                var currentValue = false;
                var newInput = false;
                //var inputCurrentValue = "";

                while(!parentWrapper.classList.contains('emp-password-wrapper')) {
                    parentWrapper = parentWrapper.parentNode;
                }

                currentInput = parentWrapper.querySelector('.emp-password-input');
                currentValue = currentInput.value;

                var inputAttributes = {};

                for (var i = 0, atts = currentInput.attributes, n = atts.length; i < n; i++){

                    if (atts[i].nodeName === "type") {

                        if (currentInput.getAttribute("type") === "text") {
                            inputAttributes.type = "password";
                            source.textContent = "Show";
                        }
                        else {
                            inputAttributes.type = "text";
                            source.textContent = "Hide";
                        }

                    }
                    else if (atts[i].nodeName === "value") {
                        inputAttributes.value = currentValue;
                    }
                    else {
                        inputAttributes[atts[i].nodeName] = currentInput.getAttribute(atts[i].nodeName);
                    }
                }

                // Generate the new input
                newInput = document.createElement('input');
                newInput.value = currentValue;

                for (var attrs in inputAttributes) {
                    newInput.setAttribute(attrs, inputAttributes[attrs]);
                }

                parentWrapper.removeChild(currentInput);
                parentWrapper.insertBefore(newInput, parentWrapper.childNodes[0]);

            }

        });

    };

    return {
        init: init
    };

});