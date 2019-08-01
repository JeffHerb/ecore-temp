define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');
    var pollUntil = require('intern/dojo/node!leadfoot/helpers/pollUntil');

    registerSuite({
        name: 'confirm',

        'Check modal doesnt exists': function () {
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/emp/pages/confirm.html'))
                .setFindTimeout(5000)
                .execute(function() {

                    var modals = $('.cui-modal');

                    return {
                        modalCount: modals.length
                    };

                })
                .then(function (confirmObj) {
                        assert.strictEqual(confirmObj.modalCount, 0, 'On load no modals should exist on the screen.');
                });
        },
        'Open Modal': function () {
            return this.remote
                .setFindTimeout(5000)
                .findById('edit-1')
                    .click()
                    .end()
                    .sleep(1500)
                    
                .execute(function() {

                    var modals = $('.cui-modal');

                    return {
                        modalCount: modals.length
                    };

                })
                .then(function (confirmObj) {
                        assert.strictEqual(confirmObj.modalCount, 1, 'Modal Should now appear in the DOM but is missing.');
                });


        },
        'Close Modal with "No" Answer': function() {
            return this.remote
                .setFindTimeout(5000)
                .findById('emp-confirm-no-button')
                    .click()
                    .sleep(1500)
                    .end()
                .execute(function() {

                    var modals = $('.cui-modal');

                    var tableFocusRows = $('#confirm-test .emp-highlight-row');

                    return {
                        modalCount: modals.length,
                        selectedRows: tableFocusRows.length
                    };


                })
                .then(function (confirmObj) {
                        assert.strictEqual(confirmObj.modalCount, 0, 'Modal should have disappeared but is still detectable in the DOM.');
                        assert.strictEqual(confirmObj.selectedRows, 0, 'Table row was selected, this should not have happened when "No" is clicked.');
                });
        },
        'Close Modal with "Yes" Answer - Run remaining steps': function() {
            return this.remote
                .setFindTimeout(5000)
                .findById('edit-1')
                    .click()
                    .sleep(1500)
                    .end()
                .findById('emp-confirm-yes-button')
                    .click()
                    .sleep(1500)
                    .end()
                .execute(function() {

                    var modals = $('.cui-modal');

                    var tableFocusRows = $('#confirm-test .emp-highlight-row');

                    return {
                        modalCount: modals.length,
                        selectedRows: tableFocusRows.length
                    };

                })
                .then(function (confirmObj) {
                    assert.strictEqual(confirmObj.modalCount, 0, 'Modal should not be part of the page as "yes" should have removed it.');
                    assert.strictEqual(confirmObj.selectedRows, 1, 'Table row was not selected, this should have been marked as selected after modal closed.');
                });
        }

    });
});

