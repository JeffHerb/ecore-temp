define(['jquery', 'kind'], function ($, kind) {

    // The rules object
    var _rules = {};

    // Required Field
    // Test that a field has contents other than a space
    _rules.required = {
        test: /[^\s-]/,
        errorMsg: "This field is required.",
        code: "UI000"
    };

    _rules.isNumeric = {
        test: /^$|^[0-9,\.\s]+$/,
        errorMsg: "This field can only contain numbers.",
        code: "UI001"
    };

    _rules.isAlpha = {
        test: /^$|^[A-Za-z\s]+$/,
        errorMsg: "This field can only contain letters and spaces.",
        code: "UI002"
    };

    _rules.isAlphaNumeric = {
        test: /^$|^[A-Za-z0-9\s]+$/,
        errorMsg: "This field can only contain letters, spaces and numbers.",
        code: "UI003"
    };

    _rules.isStrictlyAlphaNumeric = {
        test: /^$|^[A-Za-z0-9]+$/,
        errorMsg: "This field can only contain letters and numbers; without spaces.",
        code: "UI004"
    };

    _rules.isEmail = {
        test: /^$|^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i,
        errorMsg: "This field's value must be a valid email address.",
        code: "UI005"
    };

    _rules.checkMaxLength = {
        test: function _checkMaxLength($field, maxLength) {

            var defaultLength = 15;

            // check to see if a length was implied by the old function method
            if (maxLength === undefined) {

                // No maxLength provided via a function parameter, so check for a input attribute
                var inputAttr = $field.attr('data-max-length');

                if (inputAttr !== null || inputAttr !== undefined) {

                    if (!isNaN(inputAttr)) {

                        // Convert input value to a number field.
                        if (typeof inputAttr === "string") {
                            inputAttr = parseInt(inputAttr);
                        }

                        // Use the value provided
                        maxLength = inputAttr;

                    }
                    else {

                        console.error("Validation when attempting to check maxLength attribute of: " + $field.attr('id'));

                        return false;
                    }

                }
                else {

                    // No input attribute provided fall back to default
                    maxLength = defaultLength;

                    // Add this value because its missing
                    $field.attr('data-max-length', defaultLength);

                }
            }
            else {

                // Check if the provided
                if (!isNaN(maxLength)) {

                    // Convert input value to a number field.
                    if (typeof maxLength === "string") {
                        maxLength = parseInt(maxLength.trim());
                    }

                    // Add this value because its missing
                    $field.attr('data-max-length', maxLength);

                }
                else {

                    console.error("MaxLength validation check was passed a non-numerical value: " + $field.attr('id'));

                    return false;
                }

            }

            if ($field.val().length <= maxLength) {

                return true;

            } else {

                return false;
            }
        },
        errorMsg: function _max_length_error($field, fieldID) {

            var maxLimit = $field.attr('data-max-length');
            var errorMsg = "This field's value cannot exceed + characters.";
            // code was : UI006

            return errorMsg.replace('~',fieldID).replace('+',maxLimit);

        }
    };

    _rules.checkMinLength = {
        test: function _checkMaxLength($field, minLength) {

            var defaultLength = 0;

            // check to see if a length was implied by the old function method
            if (minLength === undefined) {

                // No maxLength provided via a function parameter, so check for a input attribute
                var inputAttr = $field.attr('data-max-length');

                if (inputAttr !== null || inputAttr !== undefined) {

                    if (!isNaN(inputAttr)) {

                        // Convert input value to a number field.
                        if (typeof inputAttr === "string") {
                            inputAttr = parseInt(inputAttr);
                        }

                        // Use the value provided
                        minLength = inputAttr;

                    }
                    else {

                        console.error("Validation when attempting to check minLength attribute of: " + $field.attr('id'));

                        return false;
                    }

                }
                else {

                    // No input attribute provided fall back to default
                    minLength = defaultLength;

                    // Add this value because its missing
                    $field.attr('data-min-length', defaultLength);

                }
            }
            else {

                // Check if the provided
                if (!isNaN(minLength)) {

                    // Convert input value to a number field.
                    if (typeof maxLength === "string") {
                        minLength = parseInt(minLength.trim());
                    }

                    // Add this value because its missing
                    $field.attr('data-min-length', minLength);

                }
                else {

                    console.error("MinLength validation check was passed a non-numerical value: " + $field.attr('id'));

                    return false;
                }

            }

            if ($field.val().length >= minLength) {

                return true;

            } else {

                return false;
            }
        },
        errorMsg: function _min_length_error($field, fieldID) {

            var minLimit = $field.attr('data-min-length');
            var errorMsg = "This field's value must be at least + characters long";
            // code was UI007

            return errorMsg.replace('~',fieldID).replace('+', minLimit);

        }
    };

    _rules.isZero = {
        test: function _is_zero($field) {

            var value = $field.val();

            // First test it to see if the field is numeric
            var numericCheck = _rules.isNumeric.test.test(value);

            if (numericCheck) {

                if (value === "0" || value === 0) {
                    return false;
                } else {
                    return true;
                }

            }
            else {

                return false;
            }

        },
        errorMsg: "This field's value must be a number and can not be zero",
        code: "UI008"
    };

    _rules.isCurrency = {
        test: function _is_curreny($field) {

            if ($field.val().length) {

                var origFieldVal = $field.val();

                var currencyTest = /^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{0,2})?$/;

                var result = currencyTest.test(origFieldVal);

                if (!result) {

                    var noCommanVal = origFieldVal.replace(/\,/g, '');

                    result = currencyTest.test(noCommanVal);

                    return result;

                }
                else {

                    return true;
                }

            }
            else {

                return true;
            }

        },
        errorMsg: "This field's value must be a currency value.",
        code: "UI009"
    };

    _rules.validateName = {
        test: function _validate_name($field) {

            var value = $field.val();
            var val1, val2;

            // First test it to see if the field is numeric
            var alphaCheck = _rules.isAlphaNumeric.test.test(value);

            if (alphaCheck) {

                // Check to see if the name enter started with a space.
                if (value.substring(0,1) === " " && value.length > 1) {

                    value = value.trim();
                }

                var rep2 = /[A-Za-z]*([a-z.\-\']|[0-9\-\'])*\s*[A-Za-z0-9\-\'.]*/;
                var rep = /[^A-Za-z0-9\s\-\'.]+/;
                var test = value.match(rep);
                var test2 = value.match(rep2);

                if (test === null && test2 !== null) {

                    // Process and correct format even if it doesnt need to be
                    val1 = value.substring(0,1);
                    val1 = val1.toUpperCase();
                    val2 = value.substring(1);
                    val2 = val2.toLowerCase();

                    // Put the two together
                    value = val1 + val2;

                    $field.val(value);

                    return true;
                }
                else {

                    return false;
                }

            }
            else {

                return false;
            }

        },
        errorMsg: "Names may only be contain letters, numbers, and spaces",
        code: "UI010"
    };

    _rules.dateValidator = {
        test: function _date_validator($field) {
            var dateregex = /^[0-9]+[0-9]+\/+[0-9]+[0-9]+\/+[0-9]+[0-9]+[0-9]+[0-9]$/;
            //var dateregex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
            var checkstr = "0123456789";
            var DateValue = $field.val();
            var DateTemp = "";
            var seperator = "/";
            var day;
            var month;
            var year;
            var leap = 0;
            var i;

            if (DateValue.match(dateregex) || DateValue === "") {
            }
            else {
                //alertMe('GL014', field);
                return "date";
            }

            //Delete all chars except 0..9 for the date value
            for (i = 0; i < DateValue.length; i++) {

                if (checkstr.indexOf(DateValue.substr(i,1)) >= 0) {

                  DateTemp = DateTemp + DateValue.substr(i,1);
                }
            }

            DateValue = DateTemp;

            //Get month value (2 digits)
            month = DateValue.substr(0,2);
            //Get the day value (2 digits)
            day = DateValue.substr(2,2);
            // Checks to make sure year entered is between 1900-2100, otherwise triggers error code GL021
            year = DateValue.substr(4,4);

            if (DateValue === "") {

                return true;
            } //Accept Last possible Valid Date
            else if ((month == 12) && (year == 9999) && (day == 31)) {

                return true;

            } //If the month is greater than 12 or less than 1, trigger error code GL022
            else if ( (month > 12) || (month < 1) ) {

                //alertMe("GL011", field);
                return "month";

            } //If the day is less than 1, trigger error message GL023
            else if ( (day < 1) || (day > 31) ) {

                //alertMe("GL012", field);
                return "day";

            } //If the year is greater than 2100 or less than 1800, trigger error code GL022
            else if ((year < 1800) || (year > 2100)) {

                //alertMe("GL013", field);
                return "year";
            }

            //Validation for leap-year / february / day. If it catches this, trigger error code GL022
            if ( ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0) ) {
                leap = 1;
            }

            if ((month === 2) && (leap === 1) && (day > 29)) {
                return "day";
            }

            if ((month === 2) && (leap !== 1) && (day > 28)) {
                return "day";
            }

            //Validation of other months . If date is greater than 31, trigger error message GL020
            if ((day > 31) && ((month === "01") || (month === "03") || (month === "05") || (month === "07") || (month === "08") || (month === "10") || (month === "12"))) {

                //alertMe("GL057", field);
                return "day";
            }

            if ((day > 30) && ((month === "04") || (month === "06") || (month === "09") || (month === "11"))) {

                //alertMe("GL057", field);
                return "day";

            } //If all conditions are valid, return true.
            else {
                return true;
            }
        },
        errorMsg: {
            "day": "Must be a valid day.",
            "month": "Must be a valid month.",
            "year": "Enter year between 1800-2100.",
            "date": "Dates must be in MM/DD/YYYY format."
        },
        // codes, day - UI011, month - UI012, year - UI013, date - UI014
    };

    _rules.validateListSize = {
        test: function _validate_list_size($field, num) {

            var defaultSize = 5;

            var selected = $field.val();
            var limitAttr = $field.attr('data-size-limit');

            // Check to see if we need to look in other places
            if (typeof num !== "number") {

                if (typeof num === "string" && !isNaN(num)) {

                    num = parseInt(num);
                }
                else if (limitAttr !== undefined && limitAttr !== null) {

                    if (!isNaN(limitAttr)) {

                        if (typeof limitAttr === "string") {
                            limitAttr = parseInt(limitAttr);
                        }

                        num = limitAttr;
                    }

                }
                else {

                    // Fall back to the default multiple select size.
                    num = defaultSize;
                }

            }

            // Set the field size attribute just in case. It is also used by the error control
            $field.attr('data-size-limit', num);

            if (selected === undefined || selected === null) {
                selected = [];
            }

            if (selected.length <= num) {
                return true;
            }
            else {
                return false;
            }

        },
        errorMsg: function _limit_size_error($field, fieldID) {

            var sizeLimit = $field.attr('data-size-limit');
            var errorMsg = "Limit the selection to + or less.";
            // code: UI015

            return errorMsg.replace('~',fieldID).replace('+', sizeLimit);

        }
    };

    _rules.checkMaxAllowed = {
        test: function _check_max_allowed($field, maxAllowed) {

            var defaultMax = 1000;

            // Pull the field value
            var value = $field.val();
            var maxAttr = $field.attr('data-max-allowed');
            var numericCheck = _rules.isNumeric.test.test(value);

            // Check to make sure the number is a value and not empty first
            if (numericCheck) {

                if (value.length === 0) {
                    return true;
                }

                value = parseInt(value);

            } else {

                return false;
            }

            // Check to or determine the proper maximum value
            if (typeof maxAllowed !== "number") {

                if (typeof maxAllowed === "string" && !isNaN(maxAllowed)) {

                    maxAllowed = parseInt(maxAllowed);
                }
                else if (maxAttr !== undefined && maxAttr !== null) {

                    if (!isNaN(maxAttr)) {

                        if (typeof maxAttr === "string") {
                            maxAttr = parseInt(maxAttr);
                        }

                        maxAllowed = maxAttr;
                    }

                }
                else {

                    // Fall back to the default multiple select size.
                    maxAllowed = defaultMax;
                }

            }

            // Set the field size attribute just in case. It is also used by the error control
            $field.attr('data-max-allowed', maxAllowed);

            if (value <= maxAllowed) {
                return true;
            } else {
                return false;
            }


        },
        errorMsg: function _check_max_allowed_error($field, fieldID) {

            var maxAllowed = $field.attr('data-max-allowed');
            var errorMsg = "This field's value must not exceed +.";
            // code: UI016

            return errorMsg.replace('~',fieldID).replace('+', maxAllowed);

        }
    };

    _rules.isPhone = {
        test: function _is_phone($field) {

            var i, temp;
            var num = $field.val();
            var alphaRegex = /[a-zA-Z]/g;
            var returnString = '';

            // No value entered
            if (num.length < 1 || num === "") {
                return true;
            }

            // Remove non-digits, capitalize letters
            for (i=0; i<num.length; i++) {
                num = num.replace(/\W/,'');
                num = num.replace(/\_/,'');

                // Remove ()-.
                num = num.replace(/\-/, '');
                num = num.replace(/\(/, '');
                num = num.replace(/\)/, '');
                num = num.replace(/\./, '');

                if (alphaRegex.test(num.substr(i,1))) {
                    temp = num;
                    num = "" + temp.substr(0,i) + temp.substr(i,1).toUpperCase() + temp.substr(i+1);
                    i--;
                }
            }

            // Some 11-digit numbers are still valid
            if (num.length == 11) {

                // If first digit is 1, remove it
                if (num.substr(0,1) == "1") {

                    //rebuild number without 1
                    temp = num;
                    num = "" + temp.substr(1);
                }
                // 11 digits but not beginning with 1
                else {

                    return false;
                }
            }

            // Check the length
            if (num.length == 10) {

                // Check for all the exceptions:
                // =============================

                // Make sure first three digits are numbers (area code)
                if ( alphaRegex.test(num.substr(0,3)) || num.substr(0,1) === "0" || num.substr(0,1) === "1"  ) {

                    return false;
                }
                // Exchange cannot begin with 1 or 0
                else if(num.substr(3,1) === "0" || num.substr(3,1) === "1") {

                    return false;
                }
                // If the exchange is 555, the post code must not be between 0100 and 0199
                else if(num.substr(3,3) === "555" && parseInt(num.substr(6,1)) === 0 && parseInt(num.substr(7,3)) < 200 && parseInt(num.substr(7,3)) >= 100) {

                    return false;
                }
                // Exchange cannot end with 11 (e.g., 911, 411, 211)
                else if(num.substr(4,2) === "11") {

                    return false;
                }
                else {
                    $field.val("(" + num.substr(0,3) + ")" + num.substr(3,3) + "-" + num.substr(6,4));
                    return true;
                }
            }
            else {

                return false;
            }

            return false;
        },
        errorMsg: "This field's value must be a valid phone number.",
        code: "UI017"
    };

    _rules.isForeignPhone = {

        test: function _is_foreign_phone($field) {

            var i;
            var num = $field.val();

            // No value entered
            if (num.length < 1 || num === "") {
                return true;
            }

            // Remove non-digits
            for (i=0; i<num.length; i++) {
                num = num.replace(/\W/,'');
                num = num.replace(/\_/,'');
            }

            //check length
            if (num.length > 9 && num.length < 16) {

                return true;
            }
            else {

                return false;
            }
        },
        errorMsg: "This field's value must be a valid foreign phone number.",
        code: "UI018"
    };

    _rules.checkSpecialChars = {
        test: function _check_special_chars($field, maxLength, validChars, enter) {

            var val = $field.val();

            if (val.length === 0) {
                return true;
            }

            // Check to see if maxlength is a number or not
            if (isNaN(maxLength)) {

                // Max length is not defined so we will assume its missing and shift the values
                enter = validChars;
                validChars = maxLength;

                // Add default of 1000 characters.
                maxLength = 1000;

            }

            $field.attr('data-max-allowed', maxLength);

            // Loop through and manually check each character
            for (var i = 0, len = val.length, valid=validChars; i < len; i++) {

                // Get char
                var substr = val.substring(i,i+1);

                if (valid.indexOf(substr) === -1) {

                    if(substr < "0" || substr > "9" ) {

                        if (substr < "a" || substr > "z") {

                            if (substr < "A" || substr > "Z") {

                                if (enter === "Y" || enter === "y" || enter ===  true) {

                                    if (substr !== '\r' && substr != '\n') {

                                        return false;
                                    }
                                }
                                else {

                                    return false;
                                }
                            }
                        }
                    }
                }
            }

            var checkMaxLength = _rules.checkMaxLength.test($field, maxLength);

            if (checkMaxLength) {

                return true;
            }

            return false;

        },
        errorMsg: function _check_special_chars_error($field, fieldID) {

            var maxAllowed = $field.attr('data-max-allowed');
            var errorMsg = "This field's value must not exceed +.";
            // code: UI019

            return errorMsg.replace('~',fieldID).replace('+', maxAllowed);
        }
    };

    _rules.isSSN = {
        test: function _is_ssn($field) {

            var val = $field.val().trim();

            if(val === null || val.length === 0) {

                return true;
            }

            var strMatch = /^[0-9]+[0-9]+[0-9]+\-+[0-9]+[0-9]+\-+[0-9]+[0-9]+[0-9]+[0-9]$/;

            if(val.match(strMatch) !== null) {

                if (val.length === 11) {

                    return true;
                } else {

                    return false;
                }
            }
            else {

                return false;
            }
        },
        errorMsg: "This field's value must be a valid solcial security number (SSN)",
        code: "UI020"
    };

    _rules.isEIN = {
        test: function _is_esn($field) {

            var val = $field.val().trim();

            if(val === null || val.length === 0) {
                return true;
            }

            var strMatch = /^[0-9]+[0-9]+\-+[0-9]+[0-9]+[0-9]+[0-9]+[0-9]+[0-9]+[0-9]$/;

            if(val.match(strMatch) !== null) {
                return true;
            }
            else {
                return false;
            }

        },
        errorMsg: "This field's value must be a valid EIN.",
        code: "UI021"
    };

    _rules.isDosId = {
        test: function _is_dos_id($field) {

            var val = $field.val().trim();

            if(val === null || val.length === 0) {
                return true;
            }

            var strMatch = /^[dD]+[0-9]+[0-9]+[0-9]+[0-9]+[0-9]+[0-9]+[0-9]+[0-9]$/;

            if(val.match(strMatch) !== null) {
                return true;
            }
            else {
                return false;
            }

        },
        errorMsg: "DOS IDs nust be a 'D' followed by 8 digits.",
        code: "UI022"
    };

    _rules.validateZip = {
        test: function _validate_zip($field) {
            //validate zip

            var val = $field.val().trim();
            var valid = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-";
            var hyphencount = 0;

            //This ensures that 5 or 10 characters are entered, otherwise an error message will display
            if(val.length === 0) {

                return true;
            }
            else if (val.length !== 5 && val.length !== 10 && val.length !== 6) {

                return "zip";
            }

            //Checks for valid characters in the zip code field
            for (var i=0; i < val.length; i++) {

                temp = "" + val.substring(i, i+1);

                if (temp == "-") hyphencount++;

                if (valid.indexOf(temp) == "-1") {

                    return "char";
                }
            }

            if (hyphencount >= 1) {

                var zipSplit = val.split('-');

                if (zipSplit[0].length !== 5 || zipSplit[1].length !== 4) {

                    return "format";
                }

            }

            return true;

        },
        errorMsg: {
            "zip": "This field's value must be a valid zip code.",
            "char": "This field's value must be a valid zip code.",
            "format": "Zip codes must be in #####-#### format."
        }
        // codes: zip - UI023, char - UI024, format - UI025
    };

    _rules.isWebSite = {
        test: function _is_website($field) {

            var site = $field.val().trim();
            var webSiteRegex = /^(http[s]?:\/\/)?([a-zA-Z0-9\-*]+\.)+([a-zA-Z]{2,4})(\/?$|\/[\w\.\-\#@\$=&\:]+)*$/;

            // No value entered
            if (site.length < 1 || site === "") {
                return true;
            }

            // Check the address for valid syntax and length
            if (webSiteRegex.test(site) && site.length < 257) {
                return true;
            }
            else {
                return false;
            }
        },
        errorMsg: "This field's value must be a valid website URL.",
        code: "UI026"
    };

    _rules.isCurrencySpecial = {
        test: function _is_currency_special($field) {

            var val = $field.val().trim();
            var regExp = /^(\-?\d+((\.\d{1,2})|\.)?)?$/;

            if (!regExp.test(val)) {

                return false;
            }
            else {

                // Check and return true if there is no value.
                if (val.length === 0) {
                    return true;
                }

                if (/\.\d$/.test(val)) {
                    val = val + '0';
                }
                if (/\.$/.test(val)) {
                    val = val + '00';
                }
                if (!(/\./.test(val))) {
                    val = val + '.00';
                }

                // Ensure that the value with decimals is not too large for the field
                var maxLength = $field.attr('maxlength');

                // incase maxlength is not defined on the input, default it to 23 characters.
                if (maxLength === undefined || maxLength === null) {
                    maxLength = 23;
                }

                if (val.length <= maxLength) {

                    // Updat ethe field
                    $field.val(val);
                    return true;
                }
                else {

                    return false;
                }

            }

        },
        errorMsg: "This field's value must be a valid special currency.",
        code: "UI027"
    };

    _rules.isNumericWithDecimal = {
        //test: /^$|^((\d+(\.\d+)?)|(\.\d+))?$/, // Changed on 2/6/2018 to support when user enters in commas and negative signs
        test: function() {

            var val = $field.val().trim();

            if (val.length !== 0) {

                var regExp = /^-?[0-9]{1,3}(,?[0-9]{3})*(\.[0-9]+)*$/;

                if (regExp.test(val)) {
                    return true;
                }
                else {

                    if (val.charAt(0) === ".") {

                        val = 0 + val;

                        if (regExp.test(val)) {
                            return true;
                        }
                        else {
                            return false;
                        }

                    }
                    else {

                        return false;
                    }
                }
            }

            return true;
        },
        errorMsg: "This field's value must be in proper decimal format.",
        code: "UI028"
    };

    _rules.isWithinRange = {
        // TODO: inline min and max with data-range-min and data-range-max
        test: function _is_within_range($field, min, max) {

            var minVal, maxVal;

            var val = parseFloat($field.val().trim(), 10);

            if (isNaN(val) || arguments.length != 3) {

                return "setup";
            }

            if (val.toString.length < 1) {

                return "range";
            }

            // Get Min value if possible
            if (typeof min === "string" && min.indexOf("document") !== -1) {
                var minName = min.split('.')[2];
                min = $('[name="' + minName + '"]');

                if (min.length === 0) {
                    minVal = false;
                }
                else {
                    minVal = parseFloat(min.val(), 10);
                }
            }
            else if (!isNaN(min)) {
                minVal = false;
            }
            else {
                minVal = parseFloat(min.val(), 10);
            }

            // Get Max value if possible
            if (typeof max === "string" && max.indexOf("document") !== -1) {
                var maxName = max.split('.')[2];
                max = $('[name="' + maxName + '"]');

                if (max.length === 0) {
                    maxVal = false;
                }
                else {
                    maxVal = parseFloat(max.val(), 10);
                }
            }
            else if (!isNaN(max)) {
                maxVal = false;
            }
            else {
                maxVal = parseFloat(max.val(), 10);
            }

            $field.attr('data-min-val', minVal);
            $field.attr('data-max-val', maxVal);

            // Check to make sure both min and max are not both missing.
            if (isNaN(minVal) && isNaN(maxVal)) {

                return "setup";
            }

            // Check to make sure the min is smaller than the max
            if (minVal > maxVal) {
                return "invalidRange";
            }

            // Check to see if the provided value is bigger than the known max
            if (isNaN(minVal)) {

                if (val > maxVal) {
                    return "overMax";
                }

                return true;
            }

            // Check to see if the provided value is less than the known min
            if (isNaN(maxVal)) {

                if (val < minVal) {
                    return "underMin";
                }

                return true;
            }

            // Both upper and lower limits specified
            if (!(minVal <= val && val <= maxVal)) {

                return "range";
            }
            else {

                return true;
            }

        },
        errorMsg: {
            "range": function _range_error($field){

                var errorMsg = "Value must be within + and -.";

                var minVal = $field.attr('data-min-val');
                var maxVal = $field.attr('data-max-val');

                return errorMsg.replace('+', minVal).replace('-', maxVal);
            },
            "setup": "Required parameters are missing to properly validate value.",
            "invalidRange": "Minimum range value is larger than defined maximum.",
            "overMax": function _overMax_error($field){

                var errorMsg = "Value must not exceed +.";

                var maxVal = $field.attr('data-max-val');

                return errorMsg.replace('+', maxVal);

            },
            "underMin": function _underMin_error($field){

                var errorMsg = "Value must be larger than +";

                var minVal = $field.attr('data-min-val');

                return errorMsg.replace('+', minVal);
            }
        }
        //codes: range - UI029, setup - UI030, invalidRange - UI031, overMax - UI032, underMin - UI033
    };

    _rules.isLengthWithinRange = {
        test: function _is_length_within_range($field, min, max) {

            var minVal, maxVal;

            var val = $field.val().trim().length;

            if (isNaN(val) || arguments.length != 3) {

                return "setup";
            }

            if (val.toString.length < 1) {

                return "setup";
            }

            // Get Min value if possible
            if (typeof min === "string" && min.indexOf("document") !== -1) {
                var minName = min.split('.')[2];
                min = $('[name="' + minName + '"]');

                if (min.length === 0) {
                    minVal = false;
                }
                else {
                    minVal = parseInt(min.val());
                }
            }
            else if (!isNaN(min)) {
                minVal = false;
            }
            else {
                minVal = parseInt(min.val());
            }

            // Get Max value if possible
            if (typeof max === "string" && max.indexOf("document") !== -1) {
                var maxName = max.split('.')[2];
                max = $('[name="' + maxName + '"]');

                if (max.length === 0) {
                    maxVal = false;
                }
                else {
                    maxVal = parseInt(max.val());
                }
            }
            else if (!isNaN(max)) {
                maxVal = false;
            }
            else {
                maxVal = parseInt(max.val());
            }

            $field.attr('data-min-val', minVal);
            $field.attr('data-max-val', maxVal);

            // Check to make sure both min and max are not both missing.
            if (isNaN(minVal) && isNaN(maxVal)) {

                return "setup";
            }

            // Check to make sure the min is smaller than the max
            if (minVal > maxVal) {
                return "invalidRange";
            }

            // Check to see if the provided value is bigger than the known max
            if (isNaN(minVal)) {

                if (val > maxVal) {
                    return "overMax";
                }

                return true;
            }

            // Check to see if the provided value is less than the known min
            if (isNaN(maxVal)) {

                if (val < minVal) {
                    return "underMin";
                }

                return true;
            }

            // Both upper and lower limits specified
            if (!(minVal <= val && val <= maxVal)) {

                return "range";
            }
            else {

                return true;
            }

        },
        errorMsg: {
            "range": "Must be within specified range",
            "setup": "Required parameters are missing to properly validate value",
            "invalidRange": "Minimum range value is larger than defined maximum.",
            "overMax": function _overMax_error($field){

                var errorMsg = "Must not exceed ~ characters.";

                var maxVal = $field.attr('data-max-val');

                return errorMsg.replace('~', maxVal);

            },
            "underMin": function _underMin_error($field){

                var errorMsg = "Must be larger than ~ characters.";

                var minVal = $field.attr('data-min-val');

                return errorMsg.replace('~', minVal);
            }
        }
        //codes: range - UI034, setup - UI035, invalidRange - UI036, overMax - UI037, underMin - UI038
    };

    _rules.dateCompare = {
        test: function _date_compare($source, date1, date2) {

            var splitDate;

            if (typeof date1 === "string" && date1.indexOf('document') !== -1) {

                splitDate = date1.split('.')[2];

                $date = $('input[name="' + splitDate + '"]');

                if ($date.length === 1) {

                    date1 = $date.val();
                }

            }

            if (typeof date2 === "string" && date2.indexOf('document') !== -1) {

                splitDate = date2.split('.')[2];

                $date = $('input[name="' + splitDate + '"]');

                if ($date.length === 1) {

                    date2 = $date.val();
                }

            }

            $source.attr('data-start-date', date1);
            $source.attr('data-end-date', date2);

            var dateObj1 = new Date(date1);
            var dateObj2 = new Date(date2);

            if (date1 === "" && date2 === "") {
                return true;
            }

            if (date1 === date2) {

                return "same";
            }

            if(dateObj2 < dateObj1) {

                return "sooner";
            }

        },
        errorMsg: {
            "same": "The two dates supplied are the same date.",
            "sooner": function _sooner_error($field, fieldID) {

                var date1 = $field.attr('data-start-date');
                var date2 = $field.attr('data-end-date');
                var errorMsg = "Date must fall between + and -.";

                return errorMsg.replace('~',fieldID).replace('+', date2).replace('-', date1);

            }

        }
        // code: same - UI039, sooner - UI040
    };

    _rules.tableSelect = {
        test: function($table) {

            var tableId = $table.attr('id');

            if (emp.reference.tables[tableId].dataStore.selectable && emp.reference.tables[tableId].dataStore.selectionRequired) {

                // Get the hidden input for checked rows
                $checkedInput = $('#' + tableId + '_checked_index');

                if ($checkedInput.val().length === 0) {

                    return "noselect";
                }
                else {

                    return true;
                }

            }
            else {

                return true;
            }

        },
        errorMsg: {
            "noselect": function _table_no_selection($table, tableId) {

                var tableTitle = false;

                if (emp.reference.tables[tableId].dataStore.title && emp.reference.tables[tableId].dataStore.title.indexOf('please') === -1 && emp.reference.tables[tableId].dataStore.title.indexOf('Please') === -1) {

                    tableTitle = emp.reference.tables[tableId].dataStore.title;
                }
                else {

                    var $tableSection = $table.parents('section').eq(0).find('.emp-section-title');

                    if ($tableSection.length) {

                        tableTitle = $tableSection.text().trim();
                    }
                    else {

                        journal.log({type: 'error', owner: 'UI', module: 'validation', func: 'TableSelect Test'}, 'Table selection test could not find a valid title to identify the table in error');
                    }
                }

                //var errorMsg = "UI037: The ~ table is invalid. Please select a row(s).";
                var errorMsg = "Please select a row.";
                // code: UI040

                return errorMsg.replace('~', tableTitle);
            }
        }
    };

    // Private functions
    var _priv = {};

    _priv.findReference = function _priv_findField (reference) {

        var $reference;

        // test jQuery reference
        if (reference instanceof jQuery) {

            if (reference.length === 1) {
                $reference = reference;
            }
            else if (reference.length === 0) {

                console.error("The provided reference validation jQuery reference has no length.");
                return false;
            }
            else if (reference.length > 1) {

                console.error("The provided reference validation jQuery reference has more than a singluar reference.");
                return false;
            }
        }
        // test string (id, then class) for references
        else if (typeof reference === "string") {

            var idTest = $('#' + reference);

            if (idTest.length === 1) {

                $reference = idTest;
            }
            else {

                var classTest = $('.' + reference);

                if (classTest.length === 1) {

                    $reference = classTest;

                } else {


                    if (classTest.length > 1 || idTest.length > 1) {

                        console.error("The provided reference validation string: " + reference + " has a reference to more than one element");
                        return false;
                    }
                    else if (classTest.length === 0 && idTest.length === 1) {

                        console.error("The provided reference validation string: " + reference + " was not able to produce a selectable reference");
                        return false;
                    }

                }

            }
        }
        // test native element reference
        else if (kind(reference) === "element") {

            var elemTest = $(reference);

            if (elemTest.length === 1) {

                $reference = elemTest;

            }
            else {
                console.error("The provided reference validation element reference was unusable");
                return false;
            }
        }

        return $reference;
    };

    _priv.validateField = function _priv_validate_field ($field) {

        // Start a default object
        var fieldObj = {
            $reference: $field,
            tests: {},
            result: true
        };

        // Start by checking to see if this is a required attribute
        if ($field.attr('aria-required') === "true") {

            // Create a test spaced
            fieldObj.tests.required = {};

            // Add results object
            fieldObj.tests.required.result = _priv.testRunner("required", $field);
        }

        // Check for validation functions
        if ($field.attr('data-validation')) {

            var calledRule;
            var validationRules = $field.attr('data-validation').replace(';','').split(/\,/);

            // Loop through all of the potential rules given
            for (var i = 0, len = validationRules.length; i < len; i++) {

                if (validationRules[i].indexOf('(') === -1) {

                    fieldObj.tests[validationRules[i]] = {};

                    fieldObj.tests[validationRules[i]].result = _priv.testRunner(validationRules[i], $field);

                    calledRule = validationRules[i];

                } else {

                    // Start by rebuilding the valudation rule.
                    var fullRule = validationRules[i];

                    // Rebuild the empire 1 rule.
                    while (fullRule.indexOf(")") === -1 &&  i < len ) {

                        fullRule += "," + validationRules[i + 1];

                        i++;
                    }

                    // Now just get the rule name
                    var rule = fullRule.replace(/ *\([^)]*\) */g, "");

                    fieldObj.tests[rule] = {};

                    calledRule = rule;

                    var params = fullRule.match(/\(([^)]+)\)/);

                    if (params.length > 0) {
                        params = params[1].split(',');
                    }

                    // Check to see if we want to strip the first parameter
                    switch (rule) {

                        case "checkMaxLength":
                        case "checkMinLength":
                        case "isZero":
                        case "validateName":
                        case "dateValidator":
                        case "validateListSize":
                        case "checkMaxAllowed":
                        case "isPhone":
                        case "isForeignPhone":
                        case "checkSpecialChars":
                        case "isSSN":
                        case "isEIN":
                        case "isDosId":
                        case "validateZip":
                        case "isWebSite":
                        case "isCurrencySpecial":
                        case "isNumericWithDecimal":

                            if (params[0].indexOf("document.") !== -1) {

                                params.shift();
                            }

                            break;

                        case "isWithinRange":
                        case "isLengthWithinRange":

                            // Check if 3 items are being provided (input, and 3 other values/fields, only then strip the first off)
                            if (params.length === 3) {
                                params.shift();
                            }

                            break;
                    }

                    // Pass the validation rule name, the field and the params that might have existed
                    fieldObj.tests[rule].result = _priv.testRunner(rule, $field, params);

                }

                // Catch any invalid returns/test and remove them from the tests object
                if (fieldObj.tests[calledRule].result === null) {

                    delete fieldObj.tests[calledRule];
                }

            }
        }

        // Loop through and check if we can switch the field state to true.
        for (var test in fieldObj.tests) {

            // Check for a failure
            if (!fieldObj.tests[test].result) {

                fieldObj.result = false;
            }

        }

        return fieldObj;
    };

    _priv.validateTable = function _priv_validate_table ($table) {

        // Start a default object
        var tableObj = {
            $reference: $table,
            tests: {},
            result: true
        };

        tableObj.tests.tableSelect = {};

        tableObj.tests.tableSelect.result = _priv.testRunner("tableSelect", $table);

        // Loop through and check if we can switch the field state to true.
        for (var tableTest in tableObj.tests) {

            // Check for a failure
            if (!tableObj.tests[tableTest].result) {

                tableObj.result = false;
            }

        }

        return tableObj;
    };

    _priv.testRunner = function _priv_test_runner(rule, $field, params) {
        var result = false;

        if (_rules.hasOwnProperty(rule)) {

            // Figure out what the test type is
            if (_rules[rule].test instanceof RegExp) {

                result = _rules[rule].test.test($field.val());

                if (_rules[rule].flipResult) {
                    result = !result;
                }

                return result;
            }
            else if (typeof _rules[rule].test === "function") {

                var newParams = [$field];

                params = newParams.concat(params);

                result = _rules[rule].test.apply(this, params);

                return result;
            }

        } else {

            journal.log({type: 'error', owner: 'UI', module: 'validation', func: 'testRunner'}, 'Unknown or unsuppoted validation rule: ' + rule);

            return null;
        }
    };

    _priv.generateError = function _priv_generate_error(resultsObj, test, result) {

        // Get field demographics
        var $field = resultsObj.$reference;
        var fieldId = $field.attr('id');
        var fieldName;

        var $fieldLabel = $('label[for="' + fieldId + '"]');

        if ($fieldLabel.length === 1) {
            fieldName = $fieldLabel.text();
        }
        else {
            fieldName = fieldId;
        }

        if (typeof _rules[test].errorMsg === "string") {

            return _rules[test].errorMsg.replace("~", fieldName);

        }
        else if (typeof _rules[test].errorMsg === "object") {

            if (_rules[test].errorMsg.hasOwnProperty(result)) {

                if (typeof _rules[test].errorMsg[result] === "string") {

                    return _rules[test].errorMsg[result].replace("~", fieldName);
                }
                else if (typeof _rules[test].errorMsg[result] === "function") {

                    return _rules[test].errorMsg[result].apply(this, [$field, fieldName]);
                }

            }
            else {

                journal.log({type: 'error', owner: 'UI', module: 'validation', func: 'generateError'}, 'Unknown object based error message definition for: ' + test + ' called: ' + result);
            }
        }
        else if (typeof _rules[test].errorMsg === "function") {

            return _rules[test].errorMsg.apply(this, [$field, fieldName]);
        }
        else {

            journal.log({type: 'error', owner: 'UI', module: 'validation', func: 'generateError'}, 'Validation error for ' + test + ' could not be generated because the errorMsg type is not string or function');
        }
    };

    var field = function _field(field) {

        var acceptableFields = ['INPUT', 'SELECT', 'TEXTAREA', 'TABLE'];

        // Test reference to ensure its valid.
        $field = _priv.findReference(field);

        if ($field && acceptableFields.indexOf($field[0].nodeName) !== -1) {

            // Check to see if the field has either of the aria-required or data-validation attributes
            if ($field.attr('aria-required') || $field.attr('data-validation')) {

                journal.log({type: 'info', owner: 'UI', module: 'validation', func: 'field'}, "Form field being validated:", $field.attr('id'));

                // Test the field
                var fieldTest = _priv.validateField($field);

                journal.log({type: 'info', owner: 'UI', module: 'validation', func: 'field'}, $field.attr('id') + "Form field tests:", fieldTest);

                // Set the field test to true for now and let the individual test check change it.
                fieldTest.result = true;

                // Loop through all of the tests and check if any failed
                for (var test in fieldTest.tests) {

                    // Check if the test field
                    if (typeof fieldTest.tests[test].result === "boolean" && !fieldTest.tests[test].result) {

                        // Set the field itself to false
                        fieldTest.result = false;

                        // Add the proper test message related to the test to the test object
                        fieldTest.tests[test].message = _priv.generateError(fieldTest, test, fieldTest.tests[test].result);

                    }
                    else if (typeof fieldTest.tests[test].result === "string") {

                        // Set the field itself to false
                        fieldTest.result = false;

                        fieldTest.tests[test].message = _priv.generateError(fieldTest, test, fieldTest.tests[test].result);

                    }

                }

                return fieldTest;

            }
            else if ($field.hasClass('emp-selectionRequired')) {

                var tablesTest = _priv.validateTable($field);

                // Set the field test to true for now and let the individual test check change it.
                tablesTest.result = true;

                for (var tabtest in tablesTest.tests) {

                    if (typeof tablesTest.tests[tabtest].result === "boolean" && !tablesTest.tests[tabtest].result) {

                        // Set the field itself to false
                        tablesTest.result = false;

                        // Add the proper test message related to the test to the test object
                        tablesTest.tests[tabtest].message = _priv.generateError(tablesTest, tabtest, tablesTest.tests[tabtest].result);

                    }
                    else if (typeof tablesTest.tests[tabtest].result === "string") {

                        // Set the field itself to false
                        tablesTest.result = false;

                        tablesTest.tests[tabtest].message = _priv.generateError(tablesTest, tabtest, tablesTest.tests[tabtest].result);

                    }

                }

                return tablesTest;
            }

        }
        else {

            journal.log({type: 'error', owner: 'UI', module: 'validation', func: 'field'}, 'Failed to validate field becasue proper DOM reference could not be made.');

            testResults.endResult = false;
        }
    };

    var form = function _form(form) {

        var testResults = {
            fields: [],
            endResult: true
        };

        // Test reference to ensure its valid.
        $form = _priv.findReference(form);

        journal.log({type: 'info', owner: 'UI', module: 'validation', func: 'form'}, "Form being validationed:", $form.attr('id'));

        if ($form.length === 1 && $form[0].nodeName === "FORM") {

            // Find all of the inputs in this form
            var inputs = $form.find('input, select, textarea, table.emp-selectionRequired').not(':hidden');

            //Add inputs that could be within hidden section resulting in display:none.
            inputs = inputs.add($form.find('input[aria-required="true"], select[aria-required="true"], textarea[aria-required="true"], table.emp-selectionRequired[aria-required="true"]'));

            // Check to see if anything inputs were even found.
            if (inputs.length > 0) {

                // Loop the found inputs.
                inputs.each(function(i) {

                    var $field = $(this);

                    var fieldResult = field($field);

                    if (fieldResult !== undefined) {

                        // If this field failed update the end results for the whole form.
                        if (!fieldResult.result) {
                            testResults.endResult = false;
                        }

                        // Add this fields results to the fields array
                        testResults.fields.push(fieldResult);

                    }

                });

            }

            return testResults;
        }
        else {

            journal.log({type: 'error', owner: 'UI', module: 'validation', func: 'form'}, 'Failed to validate form becasue proper DOM reference could not be made.');

            testResults.endResult = false;
        }
    };

    return {
        form: form,
        field: field
    };

});
