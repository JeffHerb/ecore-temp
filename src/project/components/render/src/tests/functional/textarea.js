define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');
    var expect = require('intern/chai!expect');

    registerSuite({
        name: 'textarea',

        'Rendered Textarea': function () {
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/render/pages/textarea.html'))
                .execute(function() {

                    var textarea = document.querySelector('#E_TEST_TEXTAREA');
                    var tagName = textarea.tagName;

                    return {
                        tagName: tagName,
                        value: textarea.value
                    };
                }).
                then(function (inputObj) {

                        assert.strictEqual(inputObj.tagName, 'TEXTAREA','Textarea should render as an input tag.');
                        assert.strictEqual(inputObj.value, 'editable value','Textarea should have the default value "editable value".');
                });
        },
        'Rendered Readonly Textarea': function () {
            return this.remote
                .execute(function() {

                    var textProperty = 'textContent' in document ? 'textContent' : 'innerText';

                    var textarea = document.querySelector('#E_TEST_TEXTAREA_READONLY');
                    var tagName = textarea.tagName;

                    return {
                        tagName: tagName,
                        value: textarea[textProperty].trim()
                    };
                }).
                then(function (inputObj) {
                        assert.strictEqual(inputObj.tagName, 'P','Textarea should render as an span element when its in readonly mode.');
                        assert.strictEqual(inputObj.value, 'readonly value','Readonly textarea should have the default value "readonly value".');
                });
        },
        'Rendered Required Textarea': function () {
            return this.remote
                .execute(function() {

                    var aria = false;
                    var rootClass = false;

                    // Find the input required input element
                    var input = document.querySelector('#E_TEST_TEXTAREA_REQUIRED');

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
                    assert.strictEqual(inputObj.ariaAttribute, true, 'Textarea has the aria-required attribute on it.');

                    // Verify we ahve the required class on the root container
                    assert.strictEqual(inputObj.requiredClass, true, 'Textarea root emp-filed container also has the "cui-required" class');
                });
        },
        'Rendered Readonly Required Textarea': function () {
            return this.remote
                .execute(function() {

                    var aria = false;
                    var rootClass = false;

                    // Find the input required input element
                    var input = document.querySelector('#E_TEST_TEXTAREA_READONLY_REQUIRED');
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

                    assert.strictEqual(inputObj.tagName, 'P','Textarea should render as an span element when its in readonly mode.');

                    // Verify if the aria attribute is on the input
                    assert.strictEqual(inputObj.ariaAttribute, false, 'Textarea has the aria-required attribute on it.');

                    // Verify we ahve the required class on the root container
                    assert.strictEqual(inputObj.requiredClass, false, 'Textarea root emp-filed container also has the "cui-required" class');
                });
        },
        'Rendered Hidden Label with Space Textarea': function () {
            return this.remote
                .execute(function() {

                    var cuiLabelClass = false;
                    var labelHideClass = false;

                    // Find the input required input element
                    var input = document.querySelector('#E_TEST_TEXTAREA_HIDDEN_LABEL');

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
                    assert.strictEqual(inputObj.cuiLabelClass, true, 'Textarea label should render with the class of "emp-hide-label-with-space" on "div.cui-label".');

                    // Verify we ahve the required class on the root container
                    assert.strictEqual(inputObj.labelHideClass, true, 'Textarea corresponding Label has the hide label class "cui-hide-from-screen".');
                });
        },
        'Rendered Hidden Label without Space Textarea': function () {
            return this.remote
                .execute(function() {

                    var cuiLabelClass = false;
                    var labelHideClass = false;

                    // Find the input required input element
                    var input = document.querySelector('#E_TEST_TEXTAREA_HIDDEN_LABEL_WITHOUTSPACE');

                    // This should move us from the input to the root emp-field container
                    var inputRoot = input.parentElement.parentElement;

                    // Look for the cui-label div
                    var cuiLabels = inputRoot.querySelectorAll('.cui-label');

                    var label = inputRoot.querySelectorAll('label[for="E_TEST_TEXTAREA_HIDDEN_LABEL_WITHOUTSPACE"]');

                    return {
                        labelContainers: cuiLabels.length,
                        labels: label.length
                    }
                }).
                then(function (inputobj) {

                    // Verify if the aria attribute is on the input
                    assert.strictEqual(inputobj.labelContainers, 0, 'Textarea div.cui-label should not exist.');
                    assert.strictEqual(inputobj.labels, 1, 'Though the label is taking up no width it should still exist on the page.');
                });
        },
        'Rendered Error Textarea': function () {
            return this.remote
                .execute(function() {

                    // Find the input required input element
                    var input = document.querySelector('#E_TEST_TEXTAREA_ERROR');

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
                    assert.strictEqual(inputobj.errorClass, true, 'Textarea root div.emp-field did not have the addtional "emp-validation-error" class.');
                    assert.strictEqual(inputobj.errorMessageContainer, 1, 'The Textarea did not render with the expected error message container');
                });
        },
        'Rendered Federal Textarea': function () {
            return this.remote
                .execute(function() {

                    // Find the input required input element
                    var input = document.querySelector('#E_TEST_TEXTAREA_FEDERAL');

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
                    assert.strictEqual(inputobj.federalClass, true, 'Inputs root div.emp-field did not have the addtional "emp-federal-data" class');
                });
        },
    });
});

