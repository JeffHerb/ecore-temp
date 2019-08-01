define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');

    registerSuite({
        name: 'checkbox',

        'Rendered Standard Checkbox Exists': function () {
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/render/pages/checkbox.html'))
                .execute(function() {

                    var checkbox = document.getElementById('E_TEST_CHECKBOX');
                    var checkboxTag;
                    var checkboxType;

                    if (checkbox) {

                        checkboxTag = checkbox.tagName;
                        checkboxType = checkbox.getAttribute("type");

                        return {
                            checkbox: checkbox,
                            checkboxTag: checkboxTag,
                            checkboxType: checkboxType
                        };
                    }
                    else {

                        return false
                    }

                })
                .then(function(checkboxObj) {

                    assert.strictEqual(checkboxObj.checkboxTag, 'INPUT','Input should render as an input tag.');
                    assert.strictEqual(checkboxObj.checkboxType, 'checkbox','Input should render with the type tag of "checkbox".');

                });
        },
        'Rendered Prechecked Checbkox Exists and Checked': function () {
            return this.remote
                .execute(function() {

                    var checkbox = document.getElementById('E_TEST_CHECKED_CHECKBOX');
                    var checkboxTag;
                    var checkboxType;

                    if (checkbox) {

                        checkboxTag = checkbox.tagName;
                        checkboxType = checkbox.getAttribute("type");

                        return {
                            checkbox: checkbox,
                            checkboxTag: checkboxTag,
                            checkboxType: checkboxType,
                            checkState: checkbox.checked
                        };
                    }
                    else {

                        return false
                    }

                })
                .then(function(checkboxObj) {

                    // Recheck the other stuff for the hell of it
                    assert.strictEqual(checkboxObj.checkboxTag, 'INPUT','Input should render as an input tag.');
                    assert.strictEqual(checkboxObj.checkboxType, 'checkbox','Input should render with the type tag of "checkbox".');
                    assert.strictEqual(checkboxObj.checkState, true,'Checkbox is checked.');
                });
        },
        'Rendered Check for DIV.cui-data-left on standard and then missing on (Flipped) Checkbox': function() {
            return this.remote
                .execute(function() {

                    var standardCheckbox = document.getElementById('E_TEST_CHECKED_CHECKBOX');
                    var flippedCheckbox = document.getElementById('E_TEST_FLIPPED_CHECKBOX');

                    var standardRoot = standardCheckbox.parentElement.parentElement;
                    var flippedRoot = flippedCheckbox.parentElement.parentElement;

                    var dataLeft = false;
                    var fieldWrap = false;

                    // Check the root for the checkbox to see if it has the class cui-data-left
                    if (standardRoot.getAttribute('class').indexOf('cui-data-left') !== -1) {

                        dataLeft = true;
                    }

                    // Check to see if the root of the flipped checkbox is the class emp-field
                    if (flippedRoot.getAttribute('class').indexOf('emp-field') !== -1) {

                        fieldWrap = true;
                    }

                    return {
                        dataLeft: dataLeft,
                        fieldWrap: fieldWrap
                    }

                })
                .then(function(inputObj) {

                    assert.strictEqual(inputObj.dataLeft, true, 'The standard checkbox tag should be contained inside of a ".cui-data-left" div.');
                    assert.strictEqual(inputObj.fieldWrap, true, 'The flipped checkbox tag should be contained inside of only a ".emp-field" div.');
                });
        },
        'Rendered Readonly Positive Checbkox Exists and icon is red check': function () {
            return this.remote
                .execute(function() {

                    var iconClass = "emp-icon-redcheck";

                    var checkboxIcon = document.getElementById('E_TEST_POS_CHECKBOX');
                    var checkboxClass = checkboxIcon.getAttribute('class');

                    if (checkboxIcon) {

                        if (checkboxClass) {

                            var properIconClass = (checkboxClass.indexOf(iconClass) !== -1) ? true : false;
                        }

                        return {
                            checkbox: checkboxIcon,
                            checkboxTag: checkboxIcon.tagName,
                            checkboxClass: properIconClass
                        };
                    }
                    else {

                        return false
                    }

                })
                .then(function(checkboxObj) {

                    // Recheck the other stuff for the hell of it
                    assert.strictEqual(checkboxObj.checkboxTag, 'I','Checkbox should render as an I tag.');
                    assert.strictEqual(checkboxObj.checkboxClass, true, 'Checkbox should render with the class "emp-icon-redcheck".');
                });
        },
        'Rendered Readonly Negative Checbkox Exists and icon is red circle': function () {
            return this.remote
                .execute(function() {

                    var iconClass = "emp-icon-stop";

                    var checkboxIcon = document.getElementById('E_TEST_NEG_CHECKBOX');
                    var checkboxClass = checkboxIcon.getAttribute('class');

                    if (checkboxIcon) {

                        if (checkboxClass) {

                            var properIconClass = (checkboxClass.indexOf(iconClass) !== -1) ? true : false;
                        }

                        return {
                            checkbox: checkboxIcon,
                            checkboxTag: checkboxIcon.tagName,
                            checkboxClass: properIconClass
                        };
                    }
                    else {

                        return false
                    }

                })
                .then(function(checkboxObj) {

                    // Recheck the other stuff for the hell of it
                    assert.strictEqual(checkboxObj.checkboxTag, 'I', 'Checkbox should render as an I tag.');
                    assert.strictEqual(checkboxObj.checkboxClass, true, 'Checkbox should render with the class "emp-icon-stop".');
                });
        },
    });
});

