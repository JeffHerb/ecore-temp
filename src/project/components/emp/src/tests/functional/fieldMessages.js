define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');
    var pollUntil = require('intern/dojo/node!leadfoot/helpers/pollUntil');

    registerSuite({
        name: 'fieldMessages',

        /*
        Tests:
            Check no messages are present on the screen
            Spawn single field message error
                -Check field message and page message are created
            Resolve field level error
                -Check field message and page message are resolved
            Submit form with multiple field errors
                -Verify exactly one page message is created and that multiple field level messages are created.
        */
        'Remove refresh session messages if they apply': function () {
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/emp/pages/fieldMessages.html'))
                .setFindTimeout(5000)
                .execute(function() {

                    var messageText = false;

                    var messages = $('.cui-messages.emp-messages').children('li');

                    if (messages.length > 0) {

                        var favMsg = emp.reference.message[0].ref;

                        emp.empMessage.removeMessage(favMsg);

                    }

                    setTimeout(function() {

                        return true;

                    }, 2000);

                })
                .then(function () {

                    assert.strictEqual(true, true, 'Removed Messages');
                });
        },
        'Check to make sure no message exist': function () {
            return this.remote
                .setFindTimeout(5000)
                .execute(function() {

                    var pageMessages = $('.cui-messages.emp-messages').children('li');
                    var fieldMessages = $('.cui-field-message').children();
                    var empRefCount = 0;

                    if (emp.reference.message) {
                        empRefCount = emp.reference.message.length;
                    }

                    return {
                        pageMessageCount: pageMessages.length,
                        fieldMessageCount: fieldMessages.length,
                        empRefCount: empRefCount
                    };

                })
                .then(function (messageObj) {
                        assert.strictEqual(messageObj.pageMessageCount, 0, 'On load no page messages should exist on screen');
                        assert.strictEqual(messageObj.fieldMessageCount, 0, 'On load no field messages should exist on screen.');
                        assert.strictEqual(messageObj.empRefCount, 0, 'No messages should exist in the emp.reference.message array.');
                });
        },

        'Trigger single validation error and check for messages': function () {
            return this.remote
                .findById('E_REQUIRED_TEST')
                    .click()
                    .sleep(500)
                    .end()
                .execute(function() {

                    var pageMessages = $('.cui-messages.emp-messages').children('li');
                    var fieldMessages = $('.cui-field-message').children();
                    var empRefCount = 0;

                    if (emp.reference.message) {
                        empRefCount = emp.reference.message.length;
                    }

                    return {
                        pageMessageCount: pageMessages.length,
                        fieldMessageCount: fieldMessages.length,
                        empRefCount: empRefCount
                    };

                })
                .then(function (messageObj) {
                        assert.strictEqual(messageObj.pageMessageCount, 1, 'There should be one page message');
                        assert.strictEqual(messageObj.fieldMessageCount, 1, 'There should be one field message.');
                        assert.strictEqual(messageObj.empRefCount, 1, 'There should be one message in the emp.reference.messages array');
                });
        },

        'Resolve single validation error and check for messages': function () {
            return this.remote
                .findById('E_REQUIRED')
                    .click()
                    .type("test data")
                    .sleep(500)
                    .end()

                .findById('E_REQUIRED_TEST')
                    .click()
                    .sleep(500)
                    .end()

                .execute(function() {

                    var pageMessages = $('.cui-messages.emp-messages').children('li');
                    var fieldMessages = $('.cui-field-message').children();
                    var empRefCount = 0;

                    if (emp.reference.message) {
                        empRefCount = emp.reference.message.length;
                    }

                    return {
                        pageMessageCount: pageMessages.length,
                        fieldMessageCount: fieldMessages.length,
                        empRefCount: empRefCount
                    };

                })
                .then(function (messageObj) {
                        assert.strictEqual(messageObj.pageMessageCount, 0, 'There should not be any page messages');
                        assert.strictEqual(messageObj.fieldMessageCount, 0, 'There should not be any field messages.');
                        assert.strictEqual(messageObj.empRefCount, 0, 'There should be not be any messages in the emp.reference.messages array');
                });
        },

        'Resolve single validation error and check for messages': function () {
            return this.remote
                .findById('E_REQUIRED')
                    .clearValue()
                    .sleep(500)
                    .end()

                .findById('update')
                    .click()
                    .sleep(500)
                    .end()

                .execute(function() {

                    var pageMessages = $('.cui-messages.emp-messages').children('li');
                    var fieldMessages = $('.cui-field-message').children();
                    var empRefCount = 0;

                    if (emp.reference.message) {
                        empRefCount = emp.reference.message.length;
                    }

                    return {
                        pageMessageCount: pageMessages.length,
                        fieldMessageCount: fieldMessages.length,
                        empRefCount: empRefCount
                    };

                })
                .then(function (messageObj) {
                        assert.strictEqual(messageObj.pageMessageCount, 1, 'There should be one page message');
                        assert.strictEqual(messageObj.fieldMessageCount, 3, 'There should be one field message.');
                        assert.strictEqual(messageObj.empRefCount, 3, 'There should be three messages in the emp.reference.messages array');
                });
        },

    });
});

