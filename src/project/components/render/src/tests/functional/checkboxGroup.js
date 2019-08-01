define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');

    registerSuite({
        name: 'checkboxGroup',

        'Rendered Standard Checkbox Group Exists': function () {
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/render/pages/checkboxGroup.html'))
                .execute(function() {

                    var checkboxColumn = document.getElementById('E_EDITABLE_CHECKBOXGROUP');

                    var checkboxInputs = checkboxColumn.querySelectorAll('input[type="checkbox"]');

                    return checkboxInputs.length;

                })
                .then(function(checkboxCount) {

                    assert.strictEqual(checkboxCount, 3,'Checkbox group should render and contain 3 checkbox inputs');

                });
        },
        'Rendered Readonly Checkbox Group Exists': function () {
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/render/pages/checkboxGroup.html'))
                .execute(function() {

                    var textProperty = 'textContent' in document ? 'textContent' : 'innerText';

                    var checkboxColumn = document.getElementById('E_READONLY_CHECKBOXGROUP');

                    var readonlyValue = checkboxColumn.querySelectorAll('span.emp-data')[0];

                    // Pull the value out of the elment.


                    return readonlyValue[textProperty].trim();

                })
                .then(function(readOnlyResults) {

                    assert.strictEqual(readOnlyResults, 'Blue, Red','Readonly Checkbox group should return a span with the value "Blue, Red"');

                });
        }
    });
});

