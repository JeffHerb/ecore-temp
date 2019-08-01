// Create the attribute helper
Handlebars.registerHelper('getSearchBoxInputs', function(options) {

	var selected = options.hash.selected;
	var values = options.hash.values;

	if (selected !== undefined && values !== undefined) {

		if (values.hasOwnProperty(selected)) {

			return values[selected];

		}

		return false;

	} else {

		return false;

	}

});