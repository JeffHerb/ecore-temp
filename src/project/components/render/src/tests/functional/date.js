define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');

    registerSuite({
        name: 'date',

        'Rendered Date': function () {
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/render/pages/date.html'))
                .execute(function() {

                    var input = document.querySelector('#E_TEST_DATE');
                    var tagName = input.tagName;
                    var tagType = input.getAttribute("type");

                    var datepicker = document.querySelector('#cal_E_TEST_DATE');

                    return {
                        tagName: tagName,
                        tagType: tagType,
                        datepicker: (datepicker !== null) ? true : false
                    };
                }).
                then(function (inputObj) {
                        assert.strictEqual(inputObj.tagName, 'INPUT','Date input should render as an input tag.');
                        assert.strictEqual(inputObj.tagType, 'text','Date input should render as a text input type.');

                        assert.strictEqual(inputObj.datepicker, true, 'Datepicker control should have rendered with the input.');
                });
        },
        'Rendered Readonly Date': function () {
            return this.remote
                .execute(function() {

                    var textProperty = 'textContent' in document ? 'textContent' : 'innerText';

                    var input = document.querySelector('#E_TEST_DATE_READONLY');
                    var tagName = input.tagName;

                    var datepicker = document.querySelector('#cal_E_TEST_DATE_READONLY');

                    return {
                        tagName: tagName,
                        datepicker: (datepicker === null) ? true : false,
                        value: input[textProperty].trim()
                    };
                }).
                then(function (inputObj) {

                        assert.strictEqual(inputObj.tagName, 'SPAN','Date input should render as an span element when its in readonly mode.');

                        assert.strictEqual(inputObj.datepicker, true, 'Datepicker control should not have been rendered when when the date input is in readonly mode.');

                        assert.strictEqual(inputObj.value, '10/1/1984','Readonly date input should have the default value "readonly value".');
                });
        },
        'Rendered Required Date': function () {
            return this.remote
                .execute(function() {

                    var aria = false;
                    var rootClass = false;

                    // Find the input required input element
                    var input = document.querySelector('#E_TEST_DATE_REQUIRED');

                    if (input.getAttribute("aria-required")) {

                        aria = true;
                    }

                    var fieldElement = input.parentElement.parentElement;

                    if (fieldElement.getAttribute("class").indexOf('cui-required') !== -1) {

                        rootClass = true;
                    }

                    return {
                        ariaAttribute: aria,
                        requiredClass: rootClass
                    }
                }).
                then(function (inputObj) {

                    // Verify if the aria attribute is on the input
                    assert.strictEqual(inputObj.ariaAttribute, true, 'Date has the aria-required attribute on it.');

                    // Verify we ahve the required class on the root container
                    assert.strictEqual(inputObj.requiredClass, true, 'Date root emp-filed container also has the "cui-required" class');
                });
        },
        'Rendered Readonly Required Date': function () {
            return this.remote
                .execute(function() {

                    var aria = false;
                    var rootClass = false;

                    // Find the input required input element
                    var input = document.querySelector('#E_TEST_DATE_READONLY_REQUIRED');
                    var tagName = input.tagName;

                    var datepicker = document.querySelector('#cal_E_TEST_DATE_READONLY_REQUIRED');

                    if (input.getAttribute("aria-required")) {

                        aria = true;
                    }

                    var fieldElement = input.parentElement.parentElement;

                    if (fieldElement.getAttribute("class").indexOf('cui-required') !== -1) {

                        rootClass = true;
                    }

                    return {
                        tagName: tagName,
                        ariaAttribute: aria,
                        requiredClass: rootClass,
                        datepicker: (datepicker === null) ? true : false,
                    }
                }).
                then(function (inputObj) {

                    assert.strictEqual(inputObj.tagName, 'SPAN','Date input should render as an span element when its in readonly mode.');

                    // Verify if the aria attribute is on the input
                    assert.strictEqual(inputObj.ariaAttribute, false, 'Date has the aria-required attribute on it.');

                    // Verify we ahve the required class on the root container
                    assert.strictEqual(inputObj.requiredClass, false, 'Date root emp-filed container also has the "cui-required" class');

                    assert.strictEqual(inputObj.datepicker, true, 'Datepicker control should not have been rendered when when the date input is in readonly mode.');
                });
        },
        'Rendered Hidden Label with Space Date': function () {
            return this.remote
                .execute(function() {

                    var cuiLabelClass = false;
                    var labelHideClass = false;

                    // Find the input required input element
                    var input = document.querySelector('#E_TEST_DATE_HIDDEN_LABEL');

                    // This should move us from the input to the cui-label div
                    var cuiLabel = input.parentElement.previousElementSibling;

                    // Run the check to see if the hide label with space class exists
                    if (cuiLabel.getAttribute("class").indexOf('emp-hide-label-with-space') !== -1) {

                        cuiLabelClass = true;
                    }

                    var label = cuiLabel.getElementsByTagName('label')[0];

                    // Run the check to see if the hide label with space class exists
                    if (label.getAttribute("class").indexOf('cui-hide-from-screen') !== -1) {

                        labelHideClass = true;
                    }


                    return {
                        cuiLabelClass: cuiLabelClass,
                        labelHideClass: labelHideClass
                    }
                }).
                then(function (inputObj) {

                    // Verify if the aria attribute is on the input
                    assert.strictEqual(inputObj.cuiLabelClass, true, 'Date input label should render with the class of "emp-hide-label-with-space" on "div.cui-label".');

                    // Verify we ahve the required class on the root container
                    assert.strictEqual(inputObj.labelHideClass, true, 'Date inputs corresponding Label has the hide label class "cui-hide-from-screen".');
                });
        },
        'Rendered Hidden Label without Space Date': function () {
            return this.remote
                .execute(function() {

                    var cuiLabelClass = false;
                    var labelHideClass = false;

                    // Find the input required input element
                    var input = document.querySelector('#E_TEST_DATE_HIDDEN_LABEL_NO_SPACE');

                    // This should move us from the input to the root emp-field container
                    var inputRoot = input.parentElement.parentElement;

                    // Look for the cui-label div
                    var cuiLabels = inputRoot.querySelectorAll('.cui-label');

                    var label = inputRoot.querySelectorAll('label[for="E_TEST_DATE_HIDDEN_LABEL_NO_SPACE"]');

                    return {
                        labelContainers: cuiLabels.length,
                        labels: label.length
                    }
                }).
                then(function (inputobj) {

                    // Verify if the aria attribute is on the input
                    assert.strictEqual(inputobj.labelContainers, 0, 'Date inputs div.cui-label should not exist.');
                    assert.strictEqual(inputobj.labels, 1, 'Though the label is taking up no width it should still exist on the page.');
                });
        },
        'Rendered Error Date': function () {
            return this.remote
                .execute(function() {

                    // Find the input required input element
                    var input = document.querySelector('#E_TEST_DATE_ERROR');

                    // This should move us from the input to the root emp-field container
                    var inputRoot = input.parentElement.parentElement;

                    // Check to see if the error class exists
                    var errorClass = (inputRoot.getAttribute('class').indexOf('emp-validation-error') !== -1) ? true : false;

                    // Look for the cui-label div
                    var errorMessageContainer = inputRoot.querySelectorAll('.cui-data .cui-messages');

                    return {
                        errorClass: errorClass,
                        errorMessageContainer: errorMessageContainer.length
                    }
                }).
                then(function (inputobj) {

                    // Verify if the aria attribute is on the input
                    assert.strictEqual(inputobj.errorClass, true, 'Date inputs root div.emp-field did not have the addtional "emp-validation-error" class.');
                    assert.strictEqual(inputobj.errorMessageContainer, 1, 'The date input did not render with the expected error message container');
                });
        },
        'Rendered Federal Date': function () {
            return this.remote
                .execute(function() {

                    // Find the input required input element
                    var input = document.querySelector('#E_TEST_DATE_FEDERAL');

                    // This should move us from the input to the root emp-field container
                    var inputRoot = input.parentElement.parentElement;

                    // Check to see if the error class exists
                    var federalClass = (inputRoot.getAttribute('class').indexOf('emp-federal-data') !== -1) ? true : false;

                    return {
                        federalClass: federalClass
                    }
                }).
                then(function (inputobj) {

                    // Verify if the aria attribute is on the input
                    assert.strictEqual(inputobj.federalClass, true, 'Date inputs root div.emp-field did not have the addtional "emp-federal-data" class');
                });
        },
    });
});

