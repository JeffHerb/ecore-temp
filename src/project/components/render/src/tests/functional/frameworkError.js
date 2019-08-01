define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');

    registerSuite({
        name: 'frameworkError',

        'Rendered Framework Error': function () {
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/render/pages/frameworkError.html'))
                .setFindTimeout(10000)
                .findByClassName('emp-framework-error');

        },
        'Test Framework Error Modal Appears': function () {
            return this.remote
                .setFindTimeout(10000)
                .findByClassName('emp-framework-error')
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
    });
});
