define(['dataStore'], function(ds) {

    var _priv = {};

    // Standard input types
    _priv.updateDS = function _key_up(evt, dsID) {

        var store = ds.getStore(dsID);

        var value = evt.target.value;

        store.input.attributes.value = value;
    };

    _priv.updateSelectDS = function _key_up(evt, dsID) {

        var store = ds.getStore(dsID);

        var value = evt.target.value;

        store.input.value = value;
    };

    var bind = function _bind(data, elm) {

        if (!data.input.readOnly && data.type !== "button" && data.attributes && data.attributes['data-store-id']) {

            switch (data.type) {

                case 'select':

                    var input = elm.querySelector('select');

                    elm.addEventListener("change", function(evt) {

                        var dsID = data.attributes['data-store-id'];

                        _priv.updateSelectDS(evt, dsID);

                    }, false);

                    break;

                case 'hidden':

                    break;

                default:

                    if (data.type !== "checkbox" && data.type !== "radio" && data.type !== "hidden") {

                        var input = elm.querySelector('input');

                        elm.addEventListener("keyup", function(evt) {

                            var dsID = data.attributes['data-store-id'];

                            _priv.updateDS(evt, dsID);

                        }, false);
                    }

                    break;

            }
        }

    };

	return {
		'bind': bind
	};

});
