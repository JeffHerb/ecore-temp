Handlebars.registerHelper("incrementValue", function(value, num) {

	if (value !== undefined && num !== undefined) {

		value = parseInt(value);
		num = parseInt(num);

		value = value + num;

		return value;

	}
	else {

		return false;
	}

});