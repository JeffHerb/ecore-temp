define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');

    registerSuite({
        name: 'button',

        'Rendered Button Exists': function () {
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/render/pages/button.html'))
                .setFindTimeout(10000)
                .findById('E_TEST_BUTTON');
        },
        'Rendered Button is Button Element and Type of button': function () {
            return this.remote
                .execute(function() {

                    var button = document.querySelector('#E_TEST_BUTTON');
                    var tagName = button.tagName;
                    var tagType = button.getAttribute("type")

                    return {
                        tagName: tagName,
                        tagType: tagType
                    };
                }).
                then(function (inputObj) {
                        assert.strictEqual(inputObj.tagName, 'BUTTON','Button should render as a button tag.');
                        assert.strictEqual(inputObj.tagType, 'button', 'Button should include type attribute, set to button.');
                });
        },
        'Rendered Primary Button Exists': function () {
            return this.remote
                .setFindTimeout(10000)
                .findById('E_TEST_PRIMARY_BUTTON');
        },
        'Rendered Primary Button is Button Element and Type of button': function () {
            return this.remote
                .execute(function() {

                    var button = document.querySelector('#E_TEST_PRIMARY_BUTTON');

                    return {
                        tagName: button.tagName,
                        tagType: button.getAttribute("type"),
                        tagClass: button.getAttribute("class")
                    };
                }).
                then(function (inputObj) {
                        assert.strictEqual(inputObj.tagName, 'BUTTON','Button should render as a button tag.');
                        assert.strictEqual(inputObj.tagType, 'button', 'Button should include type attribute, set to button.');
                        assert.strictEqual(inputObj.tagClass, 'cui-button-primary', 'Button should include the primary button class "cui-button-primary".');
                });
        },
    });
});

