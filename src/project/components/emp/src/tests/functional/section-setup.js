define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');
    var pollUntil = require('intern/dojo/node!leadfoot/helpers/pollUntil');

    registerSuite({
        name: 'section-setup',

        'Check table not initialized': function () {
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/emp/pages/section-setup.html'))
                .setFindTimeout(5000)
                .findById('contentReset')
                    .click()
                    .sleep(500)
                    .end()
                .execute(function() {

                      var initializedTableControls = $('.emp-table-client-side-controls');

                    return {
                        initializedTableControlCount: initializedTableControls.length
                    };

                })
                .then(function (confirmObj) {
                        assert.strictEqual(confirmObj.initializedTableControlCount, 0, 'On load no initialized tables should exist on the screen.');
                });
        },
        'Set Content One, initalize, and check for table setup': function () {
            return this.remote
                
                .setFindTimeout(5000)
                .findById('contentReset')
                    .click()
                    .sleep(500)
                    .end()
                .findById('contentSetOne')
                    .click()
                    .sleep(500)
                    .end()
                .findById('sectionSetup')
                    .click()
                    .sleep(500)
                    .end()
                .execute(function() {

                    var initializedTableControls = $('.emp-table-client-side-controls');

                    return {
                        initializedTableControlCount: initializedTableControls.length
                    };

                })
                .then(function (confirmObj) {
                        assert.isAtLeast(confirmObj.initializedTableControlCount, 1, 'Table is not initialized.');
                });
        },
        'Set Content Two, initalize, and check for table setup': function () {
            return this.remote
                .setFindTimeout(5000)
                .findById('contentReset')
                    .click()
                    .sleep(500)
                    .end()
                .findById('contentSetTwo')
                    .click()
                    .sleep(500)
                    .end()
                .findById('sectionSetup')
                    .click()
                    .sleep(500)
                    .end()
                .execute(function() {

                    var initializedTableControls = $('.emp-table-client-side-controls');

                    return {
                        initializedTableControlCount: initializedTableControls.length
                    };

                })
                .then(function (confirmObj) {
                        assert.isAtLeast(confirmObj.initializedTableControlCount, 1, 'Table is not initialized.');
                });
        },

        'Check date mask not initalized': function () {
            return this.remote
                .setFindTimeout(5000)
                .findById('contentReset')
                    .click()
                    .sleep(500)
                    .end()
                .execute(function() {

                    var initializedDateWrapper = $('.emp-date');
                    
                    return {
                        initalizedDateFieldCount: initializedDateWrapper.length
                    };

                })
                .then(function (confirmObj) {
                        assert.equal(confirmObj.initalizedDateFieldCount, 0, 'Date picker should not be initialized on load.');
                });
        },



        'Set Content Two, initalize, and check for date mask setup': function () {
            return this.remote
                .setFindTimeout(5000)
                .findById('contentReset')
                    .click()
                    .sleep(500)
                    .end()
                .findById('contentSetTwo')
                    .click()
                    .sleep(500)
                    .end()
                .findById('sectionSetup')
                    .click()
                    .sleep(500)
                    .end()
                .findByClassName('emp-date')
                    .click()
                    .clearValue()
                    .type('abcd')
                    .sleep(500)
                    .end()
                .execute(function() {

                    var initializedDateWrapper = $('.emp-date');
                    
                    return {
                        initalizedDateFieldContent: initializedDateWrapper[0].value
                    };

                })
                .then(function (confirmObj) {
                        assert.equal(confirmObj.initalizedDateFieldContent, "", 'Date picker is not initialized.');
                });
        },

        'Check calendar not initalized': function () {
            return this.remote
                .setFindTimeout(5000)
                .findById('contentReset')
                    .click()
                    .sleep(500)
                    .end()
                .execute(function() {

                    var initializedCalendarWrapper = $('.dpCalWrap');
                    
                    return {
                        initializedCalendarWrapperCount: initializedCalendarWrapper.length
                    };

                })
                .then(function (confirmObj) {
                        assert.equal(confirmObj.initializedCalendarWrapperCount, 0, 'Calendar should not be initialized on load.');
                });
        },

        'Set Content Two, initalize, and check for calendar setup': function () {
            return this.remote
                .setFindTimeout(5000)
                .findById('contentReset')
                    .click()
                    .sleep(500)
                    .end()
                .findById('contentSetTwo')
                    .click()
                    .sleep(500)
                    .end()
                .findById('sectionSetup')
                    .click()
                    .sleep(500)
                    .end()
                .findById('cal_E_AUDIT_PERIOD_BEGIN')
                    .click()
                    .sleep(500)
                    .end()
                .execute(function() {

                    var initializedCalendarWrapper = $('.dpCalWrap');

                    return {
                        initializedCalendarWrapperCount: initializedCalendarWrapper.length
                    };

                })
                .then(function (confirmObj) {
                        assert.isAtLeast(confirmObj.initializedCalendarWrapperCount, 1, 'Calendar is not initialized.');
                });
        },

        'Set Content Two, initalize, and check for group setup': function () {
            return this.remote
                .setFindTimeout(5000)
                .findById('contentReset')
                    .click()
                    .sleep(500)
                    .end()
                .findById('contentSetTwo')
                    .click()
                    .sleep(500)
                    .end()
                .findById('sectionSetup')
                    .click()
                    .sleep(500)
                    .end()
                .findByClassName('emp-icon-section-toggle-collapse')
                    .click()
                    .sleep(500)
                    .end()
                .execute(function() {

                    var initializedClosedGroupWrapper = $('.emp-collapse');

                    return {
                        initializedClosedGroupWrapperCount: initializedClosedGroupWrapper.length
                    };

                })
                .then(function (confirmObj) {
                        assert.isAtLeast(confirmObj.initializedClosedGroupWrapperCount, 1, 'Group is not initialized.');
                });
        },

        'Check rating not initalized': function () {
            return this.remote
                .setFindTimeout(5000)
                .findById('contentReset')
                    .click()
                    .sleep(500)
                    .end()
                .execute(function() {

                    var initializedRating = $('#E_RATING_WRAPPER .emp-rating-star');
                    
                    return {
                        initializedRatingCount: initializedRating.length
                    };

                })
                .then(function (confirmObj) {
                        assert.equal(confirmObj.initializedRatingCount, 0, 'Rating should not be initialized on load.');
                });
        },

        'Set Content Two, initalize, and check for rating setup': function () {
            return this.remote
                .setFindTimeout(5000)
                .findById('contentReset')
                    .click()
                    .sleep(500)
                    .end()
                .findById('contentSetTwo')
                    .click()
                    .sleep(500)
                    .end()
                .findById('sectionSetup')
                    .click()
                    .sleep(500)
                    .end()
                .findByCssSelector('#E_RATING_WRAPPER .emp-rating-star')
                    .click()
                    .sleep(500)
                    .end()
                .execute(function() {

                    var initializedRatingStar = $('#E_RATING_WRAPPER .emp-rating-star.emp-selected-star');

                    return {
                        initializedRatingStarrCount: initializedRatingStar.length
                    };

                })
                .then(function (confirmObj) {
                        assert.isAtLeast(confirmObj.initializedRatingStarrCount, 1, 'Rating are not initialized.');
                });
        },

        'Check tooltip not initalized': function () {
            return this.remote
                .setFindTimeout(5000)
                .findById('contentReset')
                    .click()
                    .sleep(500)
                    .end()
                .execute(function() {

                    var initializedTooltip = $('.cui-popover.emp-tooltip-style');

                    return {
                        initializedTooltipCount: initializedTooltip.length
                    };

                })
                .then(function (confirmObj) {
                        assert.equal(confirmObj.initializedTooltipCount, 0, 'Tooltips should not exist on page load.');
                });
        },

        'Set Content Two, initalize, and check for tooltip setup': function () {
            return this.remote
                .setFindTimeout(5000)
                .findById('contentReset')
                    .click()
                    .sleep(500)
                    .end()
                .findById('contentSetTwo')
                    .click()
                    .sleep(500)
                    .end()
                .findById('sectionSetup')
                    .click()
                    .sleep(500)
                    .end()
                .execute(function() {

                    var initializedTooltip = $('.cui-popover.emp-tooltip-style');

                    return {
                        initializedTooltipCount: initializedTooltip.length
                    };

                })
                .then(function (confirmObj) {
                        assert.isAtLeast(confirmObj.initializedTooltipCount, 1, 'Tooltips are not initialized.');
                });
        },

        //Additional Tests
        /*            
            setupSearchBox     

            setupSelectOtherBoxes

            setupClearAllButton

            setupSearchClearButton

            setupPrintIcon

            setupEmployeeSearch

            setupFileUploads

            setupFrameworkError
        */

    });
});

