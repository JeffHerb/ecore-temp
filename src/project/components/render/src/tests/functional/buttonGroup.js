define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');
    var expect = require('intern/chai!expect');

    registerSuite({
        name: 'button group',

        'Rendered Left Button Group Exists': function () {
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/render/pages/buttonGroup.html'))
                .setFindTimeout(10000)
                .findById('E_LEFT_BUTTON');
        },
        'Rendered Left Button Appears on the left side of the screen': function () {
            return this.remote
                .setFindTimeout(10000)
                .findById('E_LEFT_BUTTON')
                .getPosition()
                .then(function(value) {
                    //Check left button is withing tolerance
                    expect(value.x).to.be.closeTo(10, 1, 'Button should appear between 9-11px to the left of the window browser');
                })
        },
        'Rendered Right Button Group Exists': function () {
            return this.remote
                .setFindTimeout(10000)
                .findById('E_RIGHT_BUTTON');
        },
        'Rendered Right Button Appears on the right side of the screen': function () {
            return this.remote
                .execute(function() {

                    var button = document.querySelector('#E_RIGHT_BUTTON');
                    var buttonLeft = button.offsetLeft;
                    var buttonWidth = button.offsetWidth;
                    var windowWidth = window.innerWidth;

                    return {
                        windowWidth: windowWidth,
                        buttonWidth: buttonWidth,
                        buttonLeft: buttonLeft
                    };
                })
                .then(function (valuesObj) {

                    // Calculate the proper right value
                    var rightPos = valuesObj.windowWidth - valuesObj.buttonLeft - valuesObj.buttonWidth;
                    
                    expect(rightPos).to.be.closeTo(10, 1, 'Button should appear between 9-11px to the right of the window browser');
                });
        },
        'Rendered Center Button Group Exists': function () {
            return this.remote
                .setFindTimeout(10000)
                .findById('E_CENTER_BUTTON');
        },
        'Rendered Center Button Appears in the center of the screen': function () {
            return this.remote
                .execute(function() {

                    var button = document.querySelector('#E_CENTER_BUTTON');

                    var buttonLeft = button.offsetLeft;
                    var buttonWidth = button.offsetWidth;
                    var windowWidth = window.innerWidth;

                    return {
                        windowWidth: windowWidth,
                        buttonWidth: buttonWidth,
                        buttonLeft: buttonLeft
                    };
                })
                .then(function (valuesObj) {

                    // Calculate the proper right value
                    var rightOffset = valuesObj.windowWidth - valuesObj.buttonLeft - valuesObj.buttonWidth;

                    // Check left button is withing tolerance
                    expect(valuesObj.buttonLeft).to.be.within(rightOffset -1, rightOffset + 1);

                    // Check right button is withing tolerance
                    expect(rightOffset).to.be.within(valuesObj.buttonLeft -1, valuesObj.buttonLeft + 1);
                });
        },
        'Rendered Button Rows and Columns classes have the proper classes on them': function() {
            return this.remote
                .execute(function() {

                    var buttonRows = document.querySelectorAll('.emp-button-row');
                    var buttonCols = document.querySelectorAll('.button-col');

                    return {
                        buttonRows: buttonRows,
                        buttonCols: buttonCols
                    };
                })
                .then(function (valuesObj) {

                    assert.strictEqual(valuesObj.buttonRows.length, 3,'There should be 3 button rows on this page.');
                    assert.strictEqual(valuesObj.buttonCols.length, 3,'There should be 3 column classes on this page.');
                });
        }
    });
});

