define(['dataStore'], function(ds) {

    var _priv = {};

    // Standard input types
    _priv.updateRatingDS = function _key_up(evt, dsID) {

        var store = ds.getStore(dsID);

        var currentElm = evt.target;

        if (currentElm.nodeName !== "A") {

            while (currentElm.nodeName !== "A") {
                currentElm = currentElm.parentNode;
            }
        }

        // Get the value from the clicked star
        var value = currentElm.getAttribute('data-starindex');

        store.parts.hidden.input.attributes.value = value;
    };

    var bind = function _bind(data, elm) {

        if (data.template === "composite") {

            switch (data.type) {

                case 'rating':

                    var stars = elm.querySelectorAll('.emp-rating-star');

                    for (var s = 0, sLen = stars.length; s < sLen; s++) {

                        stars[s].addEventListener("click", function(evt) {

                            var dsID = data.attributes['data-store-id'];

                            _priv.updateRatingDS(evt, dsID);

                        }, false);
                    }

                    break;

                default:

                    break;

            }
        }

    };

    return {
        'bind': bind
    };

});
