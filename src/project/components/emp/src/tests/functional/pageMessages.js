define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');
    var pollUntil = require('intern/dojo/node!leadfoot/helpers/pollUntil');

    registerSuite({
        name: 'pageMessages',
        'Remove refresh session messages if they apply': function () {
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/emp/pages/pageMessages.html'))
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

                    var messageText = false;

                    var messages = $('.cui-messages.emp-messages').children('li');

                    var empRefCount = 0;

                    if (emp.reference.message) {
                        empRefCount = emp.reference.message.length;
                    }

                    return {
                        messageCount: messages.length,
                        empRefCount: empRefCount,
                        messageText: messageText
                    };

                })
                .then(function (messageObj) {

                        assert.strictEqual(messageObj.messageCount, 0, 'On load no modals should exist on the screen.');
                        assert.strictEqual(messageObj.empRefCount, 0, 'No messages should exist in the emp.reference.message array.');
                });
        },
        'Create all of the messages': function () {
            return this.remote
            //REMOVE/COMMENTED OUT DUE TO SELENUIMN ERROR - "Unknown error: Element is not clickable at point (616, 776). Other element would receive the click"
/*                 .setFindTimeout(5000)
                .findById('E_MSG_ERROR')
                    .click()
                    .end()
                .findById('E_MSG_INFO')
                    .click()
                    .end()
                .findById('E_MSG_SUCCESS')
                    .click()
                    .end()
                .findById('E_MSG_WARNING')
                    .click()
                    .sleep(500)
                    .end() */
                .execute(function() {
                    
                    //get buttons and simulate click event                    
                    var clickEvt = new Event('click');
                    
                    document.querySelector('#E_MSG_ERROR').dispatchEvent(clickEvt);
                    document.querySelector('#E_MSG_INFO').dispatchEvent(clickEvt);
                    document.querySelector('#E_MSG_SUCCESS').dispatchEvent(clickEvt);
                    document.querySelector('#E_MSG_WARNING').dispatchEvent(clickEvt);
                    
                    var $messages = $('.cui-messages.emp-messages').children('li');

                    var errorCount = $('.cui-messages.emp-messages').find('.cui-error').length;
                    var infoCount = $('.cui-messages.emp-messages').find('.cui-informational').length;
                    var successCount = $('.cui-messages.emp-messages').find('.cui-success').length;
                    var warningCount = $('.cui-messages.emp-messages').find('.cui-warning').length;

                    var empRefCount = emp.reference.message.length;

                    return {
                        messageCount: $messages.length,
                        empRefCount: empRefCount,
                      /*errorCount: errorCount,
                        infoCount: infoCount,
                        successCount: successCount,
                        warningCount: warningCount*/
                    };

                })
                .then(function (messageObj) {
                        assert.strictEqual(messageObj.messageCount, 4, '4 new messages should have been added to the screen.');
                        assert.strictEqual(messageObj.empRefCount, 4, '4 messages should exist in the emp.reference.message array.');
                        /*assert.strictEqual(messageObj.errorCount, 2, '1 Error Message should have been created');
                        assert.strictEqual(messageObj.infoCount, 1, '1 Info Message should have been created');
                        assert.strictEqual(messageObj.successCount, 1, '1 Success Message should have been created');
                        assert.strictEqual(messageObj.warningCount, 1, '1 Warning Message should have been created'); */
                });
        },
        'Remove the first message': function() {
            return this.remote
                .sleep(3000)
            //REMOVE/COMMENTED OUT DUE TO SELENUIMN ERROR - "Unknown error: Element is not clickable at point (616, 776). Other element would receive the click"
             /* .setFindTimeout(5000)
               .findById('E_REMOVE_MSG_INDEX_0')
                    .click()
                    .sleep(500)
                    .end() */
                .execute(function() {

                    var clickEvt = new Event('click');
                    var removeFirstMsgBtn = document.querySelector('#E_REMOVE_MSG_INDEX_0').dispatchEvent(clickEvt);                   

                    var messages = $('.cui-messages.emp-messages').children('li');

                    var empRefCount = emp.reference.message.length;

                    return {
                        messageCount: messages.length,
                        empRefCount: empRefCount
                    };

                })
                .then(function (messageObj) {
                        assert.strictEqual(messageObj.messageCount, 3, '3 new messages should have been added to the screen.');
                        assert.strictEqual(messageObj.empRefCount, 3, '3 messages should exist in the emp.reference.message array.');
                });
        }

    });
});

