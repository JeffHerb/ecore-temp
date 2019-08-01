define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');

    registerSuite({
        name: 'composite - Asof',

        'Rendered Asof Composite Exists': function () {
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/render/pages/composite-asof.html'))
                .setFindTimeout(10000)
                .findById('form_asof');
        },

        'Check for all the registered component and properties': function() {
            return this.remote
                .execute(function() {

                    var textProperty = 'textContent' in document ? 'textContent' : 'innerText';

                    // Get a reference to the actual form
                    var asofForm = document.querySelector('#form_asof');

                    // Get a reference to the previous and next buttons
                    var previousButton = document.querySelector('#E_PREVIOUS_BUTTON');
                    var nextButton = document.querySelector('#E_NEXT_BUTTON');

                    var previousExists = (previousButton) ? true : false;
                    var nextExists = (nextButton) ? true : false;

                    var time = document.querySelector('#form_asof time');


                    return {
                        formAction: asofForm.getAttribute('action'),
                        time: time[textProperty],
                        previous: previousButton,
                        previousExists: previousExists,
                        next: nextButton,
                        nextExists: nextExists
                    };
                })
                .then(function (asofObj) {

                    // Check the asof form action attribute value
                    // Removed for now per framework change
                    // assert.strictEqual(asofObj.formAction, 'http://www.tax.ny.gov', 'The asof form action location is not the expected value: "http://www.tax.ny.gov"');

                    // Check the time string thats betweent the buttons
                    assert.strictEqual(asofObj.time, '01/01/2016 12:00:00 AM', 'Check to see what the time property between the buttons: "01/01/2016 12:00:00 AM"');

                    // Check to see if the button exists
                    assert.strictEqual(asofObj.previousExists, true, 'The previous button did not render on the screen');

                    // Check to see if the button exists
                    assert.strictEqual(asofObj.nextExists, true, 'The next button did not render on the screen');
                });
        }

    });
});

