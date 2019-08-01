define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');

    registerSuite({
        name: 'text',

        'Rendered Textbox': function () {
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/render/pages/text.html'))
                .execute(function() {

                    var input = document.querySelector('#E_TEST_TEXT');
                    var tagName = input.tagName;
                    var tagType = input.getAttribute("type");

                    return {
                        tagName: tagName,
                        tagType: tagType,
                        value: input.value
                    };
                }).
                then(function (inputObj) {
                        assert.strictEqual(inputObj.tagName, 'INPUT','Input should render as an input tag.');
                        assert.strictEqual(inputObj.tagType, 'text','Input should render as a text input type.');
                        assert.strictEqual(inputObj.value, 'editable value','Input should have the default value "editable value".');
                });
        },
        'Rendered Readonly Textbox': function () {
            return this.remote
                .execute(function() {

                    var textProperty = 'textContent' in document ? 'textContent' : 'innerText';

                    var input = document.querySelector('#E_TEST_TEXT_READONLY');
                    var tagName = input.tagName;

                    return {
                        tagName: tagName,
                        value: input[textProperty].trim()
                    };
                }).
                then(function (inputObj) {
                        assert.strictEqual(inputObj.tagName, 'SPAN','Input should render as an span element when its in readonly mode.');
                        assert.strictEqual(inputObj.value, 'readonly value','Readonly input should have the default value "readonly value".');
                });
        },
        'Rendered Required Textbox': function () {
            return this.remote
                .execute(function() {

                    var aria = false;
                    var rootClass = false;

                    // Find the input required input element
                    var input = document.querySelector('#E_TEST_TEXT_REQUIRED');

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
                    assert.strictEqual(inputObj.ariaAttribute, true, 'Input has the aria-required attribute on it.');

                    // Verify we ahve the required class on the root container
                    assert.strictEqual(inputObj.requiredClass, true, 'Input root emp-filed container also has the "cui-required" class');
                });
        },
        'Rendered Readonly Required Textbox': function () {
            return this.remote
                .execute(function() {

                    var aria = false;
                    var rootClass = false;

                    // Find the input required input element
                    var input = document.querySelector('#E_TEST_TEXT_READONLY_REQUIRED');
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

                    assert.strictEqual(inputObj.tagName, 'SPAN','Input should render as an span element when its in readonly mode.');

                    // Verify if the aria attribute is on the input
                    assert.strictEqual(inputObj.ariaAttribute, false, 'Span should not have the aria-required attribute.');

                    // Verify we ahve the required class on the root container
                    assert.strictEqual(inputObj.requiredClass, false, 'Span root emp-filed container should not have has the "cui-required" class');
                });
        },
        'Rendered Hidden Label with Space Textbox': function () {
            return this.remote
                .execute(function() {

                    var cuiLabelClass = false;
                    var labelHideClass = false;

                    // Find the input required input element
                    var input = document.querySelector('#E_TEST_TEXT_HIDDEN_LABEL');

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
        'Rendered Hidden Label without Space Textbox': function () {
            return this.remote
                .execute(function() {

                    var cuiLabelClass = false;
                    var labelHideClass = false;

                    // Find the input required input element
                    var input = document.querySelector('#E_TEST_TEXT_HIDDEN_LABEL_NO_SPACE');

                    // This should move us from the input to the root emp-field container
                    var inputRoot = input.parentElement.parentElement;

                    // Look for the cui-label div
                    var cuiLabels = inputRoot.querySelectorAll('.cui-label');

                    var label = inputRoot.querySelectorAll('label[for="E_TEST_TEXT_HIDDEN_LABEL_NO_SPACE"]');

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
        'Rendered Error Textbox': function () {
            return this.remote
                .execute(function() {

                    // Find the input required input element
                    var input = document.querySelector('#E_TEST_TEXT_ERROR');

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
                    assert.strictEqual(inputobj.errorClass, true, 'Inputs root div.emp-field did not have the addtional "emp-validation-error" class.');
                    assert.strictEqual(inputobj.errorMessageContainer, 1, 'The Input did not render with the expected error message container');
                });
        },
        'Rendered Federal Textbox': function () {
            return this.remote
                .execute(function() {

                    // Find the input required input element
                    var input = document.querySelector('#E_TEST_TEXT_FEDERAL');

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
        'Rendered data-title Textbox': function(){
            return this.remote
                .setFindTimeout(5000)
                .findById('E_TEST_DATA-TITLE_READONLY')
                    .click()
                    .end()
                    .sleep(1500)
                .execute(function() {

                    // Find the input required input element
                    var input = document.querySelector('#E_TEST_DATA-TITLE_READONLY');

                    var title = input.getAttribute("title");

                    var dataTitle = input.getAttribute("data-title");

                    var classes = input.getAttribute("class");

                    var tooltipClass = (classes.indexOf("emp-tooltip") !== -1) ? true : false;
                    var cuiPopoverClass = (classes.indexOf("cui-popover-toggle") !== -1) ? true : false;

                    return {
                        title:  title,
                        dataTitle: dataTitle,
                        tooltipClass: tooltipClass,
                        cuiPopoverClass: cuiPopoverClass
                    };
                }).
                then(function (inputObj) {
                    assert.strictEqual(inputObj.title, "Click to see more.", 'title does not match expected');
                    assert.strictEqual(inputObj.dataTitle, "readonly hover text value", 'Data-title does not match expected');
                    assert.strictEqual(inputObj.tooltipClass, true, 'emp-tooltip does not exists');
                    assert.strictEqual(inputObj.cuiPopoverClass, true, 'cui-popover-toggle does not exists');
                });
        }
    });
});

