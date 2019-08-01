define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');

    registerSuite({
        name: 'form',

        'Rendered Form Exists': function () {
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/render/pages/form.html'))
                .setFindTimeout(10000)
                .findById('form1');

        },
        'Rendered Form has Method Attribute': function () {
            return this.remote
                .setFindTimeout(10000)
                .findById('form1')
                .getProperty('method')
                    .then(function (value) {
                        assert.strictEqual(value, 'post',
                            'Form should be set to POST submit method');
                    });
        },
        'Rendered Form has Action Attribute': function () {
            return this.remote
                .setFindTimeout(10000)
                .findById('form1')
                .getProperty('action')
                    .then(function (value) {
                        assert.strictEqual(value, 'https://tax.ny.gov/',
                            'Form should be set to submit to the tax website (https://tax.ny.gov).');
                    });
        }
    });
});

