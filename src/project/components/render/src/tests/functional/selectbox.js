define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');

    registerSuite({
        name: 'selectbox',

        'Rendered Selectbox': function () {
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/render/pages/selectbox.html'))
                .execute(function() {

                    var select = document.querySelector('#E_TEST_SELECT');
                    var tagName = select.tagName;
                    var options = select.querySelectorAll("option");

                    return {
                        tagName: tagName,
                        value: select.value,
                        options: options
                    };
                }).
                then(function (inputObj) {
                    assert.strictEqual(inputObj.tagName, 'SELECT','Selectbox should render as a select tag.');
                    assert.strictEqual(inputObj.value, 'blue','Select box should have the value of "blue"');
                    assert.strictEqual(inputObj.options.length, 4,'Select box should have 4 options');
                });
        },
        'Rendered Selectbox with no blank options': function () {
            return this.remote
                .execute(function() {

                    var select = document.querySelector('#E_TEST_SELECT_NO_BLANK');
                    var selectOptions = select.querySelectorAll("option");

                    return selectOptions;
                })
                .then(function (selectOptions) {

                     assert.strictEqual(selectOptions.length, 3,'Select box should have 3 options.');
                });
        },
        'Rendered ReadOnly Selectbox': function () {
            return this.remote
                .execute(function() {

                    var textProperty = 'textContent' in document ? 'textContent' : 'innerText';

                    var select = document.querySelector('#E_TEST_SELECT_READONLY');
                    var tagName = select.tagName;

                    return {
                        tagName: tagName,
                        value: select[textProperty].trim()
                    };
                }).
                then(function (inputObj) {
                    assert.strictEqual(inputObj.tagName, 'SPAN','Selectbox readonly version should render as a span tag.');
                    assert.strictEqual(inputObj.value, 'Red','Select box should have the value of "Red", the text not the real value.');
                });
        },
        'Rendered Required Selectbox': function () {
            return this.remote
                .execute(function() {

                    var aria = false;
                    var rootClass = false;

                    // Find the input required input element
                    var input = document.querySelector('#E_TEST_SELECT_REQUIRED');

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
                    assert.strictEqual(inputObj.ariaAttribute, true, 'Selectbox has the aria-required attribute on it.');

                    // Verify we ahve the required class on the root container
                    assert.strictEqual(inputObj.requiredClass, true, 'Selectbox root emp-filed container also has the "cui-required" class');
                });
        },
        'Rendered Readonly Required Selectbox': function () {
            return this.remote
                .execute(function() {

                    var aria = false;
                    var rootClass = false;

                    // Find the input required input element
                    var input = document.querySelector('#E_TEST_SELECT_READONLY_REQUIRED');
                    var tagName = input.tagName;

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
                        requiredClass: rootClass
                    }
                }).
                then(function (inputObj) {

                    assert.strictEqual(inputObj.tagName, 'SPAN','Selectbox readonly version should render as a span tag.');

                    // Verify if the aria attribute is on the input
                    assert.strictEqual(inputObj.ariaAttribute, false, 'Selectbox has the aria-required attribute on it.');

                    // Verify we ahve the required class on the root container
                    assert.strictEqual(inputObj.requiredClass, false, 'Selectbox root emp-filed container also has the "cui-required" class');
                });
        },
        'Rendered Hidden Label with Space Selectbox': function () {
            return this.remote
                .execute(function() {

                    var cuiLabelClass = false;
                    var labelHideClass = false;

                    // Find the input required input element
                    var input = document.querySelector('#E_TEST_SELECT_HIDDEN_LABEL');

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
                    assert.strictEqual(inputObj.cuiLabelClass, true, 'Input label should render with the class of "emp-hide-label-with-space" on "div.cui-label".');

                    // Verify we ahve the required class on the root container
                    assert.strictEqual(inputObj.labelHideClass, true, 'Inputs corresponding Label has the hide label class "cui-hide-from-screen".');
                });
        },
        'Rendered Hidden Label without Space Selectbox': function () {
            return this.remote
                .execute(function() {

                    var cuiLabelClass = false;
                    var labelHideClass = false;

                    // Find the input required input element
                    var input = document.querySelector('#E_TEST_SELECT_HIDDEN_LABEL_NO_SPACE');

                    // This should move us from the input to the root emp-field container
                    var inputRoot = input.parentElement.parentElement;

                    // Look for the cui-label div
                    var cuiLabels = inputRoot.querySelectorAll('.cui-label');

                    var label = inputRoot.querySelectorAll('label[for="E_TEST_SELECT_HIDDEN_LABEL_NO_SPACE"]');

                    return {
                        labelContainers: cuiLabels.length,
                        labels: label.length
                    }
                }).
                then(function (inputobj) {

                    // Verify if the aria attribute is on the input
                    assert.strictEqual(inputobj.labelContainers, 0, 'Inputs div.cui-label should not exist.');
                    assert.strictEqual(inputobj.labels, 1, 'Though the label is taking up no width it should still exist on the page.');
                });
        },
        'Rendered Error Selectbox': function () {
            return this.remote
                .execute(function() {

                    // Find the input required input element
                    var input = document.querySelector('#E_TEST_SELECT_ERROR');

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
                    assert.strictEqual(inputobj.errorClass, true, 'Selectbox root div.emp-field did not have the addtional "emp-validation-error" class.');
                    assert.strictEqual(inputobj.errorMessageContainer, 1, 'The Selectbox did not render with the expected error message container');
                });
        },
        'Rendered Federal Selectbox': function () {
            return this.remote
                .execute(function() {

                    // Find the input required input element
                    var input = document.querySelector('#E_TEST_SELECT_FEDERAL');

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
                    assert.strictEqual(inputobj.federalClass, true, 'Selectbox root div.emp-field did not have the addtional "emp-federal-data" class');
                });
        },
    });
});

