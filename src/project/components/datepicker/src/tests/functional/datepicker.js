define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');
    var pollUntil = require('intern/dojo/node!leadfoot/helpers/pollUntil');

    registerSuite({
        name: 'date-picker',

        'Date Picker elements do not exist on page at load': function () {
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/datepicker/pages/datepicker.html'))
                .setFindTimeout(5000)
                .execute(function() {

                    var calWraps = $('.dpCalWrap');

                    return {
                        calCount: calWraps.length
                    };
                })
                .then(function (result) {
                        assert.strictEqual(result.calCount, 0, 'On load no modals should exist on the screen.');
                });
        },

        'Check if Date Picker fields are populated': function () {
            return this.remote
                .findDisplayedById('E_TEST_DATE')
                    .end()
                .execute(function() {
                    var dateField = $('#E_TEST_DATE');
                    return {
                        dateFieldContents: dateField.val().trim(),
                    };
                })
                .then(function (result) {
                        assert.strictEqual(result.dateFieldContents, "", 'First datepicker field should not be populated on page load');
                })

                .findDisplayedById('E_TEST_DATE_2')
                    .end()
                .execute(function() {
                    var dateField = $('#E_TEST_DATE_2');
                    return {
                        dateFieldContents: dateField.val().trim(),
                    };
                })
                .then(function (result) {
                        assert.notStrictEqual(result.dateFieldContents, "", 'Second datepicker field should be populated on page load');
                });
        },

        'Trigger first date picker field and set date to todays date': function () {
            return this.remote

                .findDisplayedById('cal_E_TEST_DATE')
                    .click()
                    .end()

                .findDisplayedByClassName('monthYear')
                    .click()
                    .end()

                .findDisplayedByClassName('dpOtherL')
                    .click()

                .execute(function() {
                    var dateField = $('#E_TEST_DATE');
                    var d = new Date();

                    var month = d.getMonth()+1;
                    var day = d.getDate();
                    var year = d.getFullYear();

                    if (month < 10) {
                        month = "0" + month;
                    }

                    if (day < 10) {
                        day = "0" + day;
                    }

                    var formattedNow = month + "/" + day + "/" + year;

                    return {
                        dateFieldContents: dateField.val().trim(),
                        now : formattedNow.trim()
                    };
                })
                .then(function (result) {
                        assert.strictEqual(result.dateFieldContents, result.now, 'The datepicker field should be populated with todays date');
                });
        },

        'Set first date picker field to not todays date': function () {
            return this.remote

                .findDisplayedById('cal_E_TEST_DATE')
                    .click()
                    .end()

                .findDisplayedByClassName('navPrevMon')
                    .click()
                    .end()

                .findDisplayedByClassName('newLine')
                    .click()

                .execute(function() {
                    var dateField = $('#E_TEST_DATE');
                    var d = new Date();

                    var formattedNow = (d.getMonth()+1)+"/"+d.getDate()+"/"+d.getFullYear();

                    return {
                        dateFieldContents: dateField.val().trim(),
                        now : formattedNow.trim()
                    };
                })
                .then(function (result) {
                        assert.notStrictEqual(result.dateFieldContents, result.now, 'The datepicker field should be populated with todays date');
                });
        },

        'Set second date picker field and set date to todays date': function () {
            return this.remote

                .findDisplayedById('cal_E_TEST_DATE_2')
                    .click()
                    .end()

                .findDisplayedByClassName('monthYear')
                    .click()
                    .end()

                .findDisplayedByClassName('dpOtherL')
                    .click()

                .execute(function() {
                    var dateField = $('#E_TEST_DATE_2');
                    var d = new Date();

                    var month = d.getMonth()+1;
                    var day = d.getDate();
                    var year = d.getFullYear();

                    if (month < 10) {
                        month = "0" + month;
                    }

                    if (day < 10) {
                        day = "0" + day;
                    }

                    var formattedNow = month + "/" + day + "/" + year;

                    return {
                        dateFieldContents: dateField.val().trim(),
                        now : formattedNow.trim()
                    };
                })
                .then(function (result) {
                        assert.strictEqual(result.dateFieldContents, result.now, 'The second datepicker field should be populated with todays date');
                });
        },

        'Deply date filter and close by clicking on input field': function () {
            return this.remote

                .findDisplayedById('cal_E_TEST_DATE')
                    .click()
                    .end()

                .findByClassName('monthYear')
                    .isDisplayed()
                    .then(function (result) {
                            assert.strictEqual(result, true, 'The datepicker should be displayed');
                    })
                    .end()

                .findDisplayedById('E_TEST_DATE')
                    .click()
                    .end()

                .findByClassName('monthYear')
                    .isDisplayed()
                .then(function (result) {
                        assert.strictEqual(result, false, 'The datepicker should not be displayed');
                });
        },

        'Verify read only field is present and not producing a date picker link': function () {
            return this.remote

                .findById('E_TEST_DATE_READONLY')
                .end()

                .execute(function() {
                    var datePicker = $('#cal_E_TEST_DATE_3');

                    return {
                        datePickerLength : datePicker.length
                    };
                })
                .then(function (result) {
                        assert.strictEqual(result.datePickerLength, 0, 'There should not be a datepicker trigger for read only fields');
                });
        },


    });
});

