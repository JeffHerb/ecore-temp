define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');
    var pollUntil = require('intern/dojo/node!leadfoot/helpers/pollUntil');

    registerSuite({
        name: 'associate',

        // Can't fully implement test due to CORS errors

        /*
            Check icon there. 
            Check server running.
            Make sure popup does not exist.
            
            Click associate button.
            Verify popup triggers.
            Close popup.
            Verify button still exists.
            Click button again.
            Select record
            Click Select
            Verify popup closes.
        */



        'Check to make sure associate icon is present': function () {
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/emp/pages/associate.html'))
                .setFindTimeout(5000)

                .findById('assoicate-list-joint')
                .end()          
        },

        'Verify modal does not exist': function () {
            return this.remote
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

        'Trigger associate popup': function () {
            return this.remote
                .findById('assoicate-list-joint')
                    .click()
                    .sleep(500)
        },

        // 'Verify Popup triggered and click close': function () {
        //     return this.remote

        //         .findByClassName('cui-modal-footer')
        //             .findByTagName('button')
        //             .click()
        //             .sleep(50000)

        //         .execute(function() {

        //             var mapFieldOne = $('#E_TXT_FIELD_1');
        //             var mapFieldTwo = $('#E_TXT_FIELD_2');

        //             var destinationFieldOne = $('#E_DEST_TXT_1');
        //             var destinationFieldTwo = $('#E_DEST_TXT_2');
                    
        //             return {
        //                 mapFieldOneContent: mapFieldOne.val().trim(),
        //                 mapFieldTwoContent: mapFieldTwo.text().trim(),
        //                 destinationFieldOneContent: destinationFieldOne.text().trim(),
        //                 destinationFieldTwoContent: destinationFieldTwo.val().trim()
        //             };
        //         })
        //         .then(function (result) {
        //                 assert.strictEqual(result.mapFieldOneContent, result.destinationFieldOneContent, 'First destination content should match map field');
        //                 assert.strictEqual(result.mapFieldTwoContent, result.destinationFieldTwoContent, 'Second destination content should match map field');                        
        //         });
        // },

        // 'Edit input field content': function () {
        //     return this.remote
        //         .findById('E_DEST_TXT_2')
        //             .clearValue()
        //             .end()

        //         .findById('E_DEST_TXT_2')
        //             .type("New Content")
        //             .sleep(500)
        //             .end()

        //         .execute(function() {
        //             var destinationFieldTwo = $('#E_DEST_TXT_2');                    
        //             return {
        //                 destinationFieldTwoContent: destinationFieldTwo.val().trim()
        //             };
        //         })
        //         .then(function (result) {
        //                 assert.strictEqual(result.destinationFieldTwoContent, 'New Content', "Second Process Map destination field should have new content")
        //         });
        // },


        // 'Run process map after editing content': function () {
        //     return this.remote
        //         .findById('processMap1')
        //             .click()
        //             .sleep(500)
        // },

        // 'Verify process map field information transfered correctly after retrigger': function () {
        //     return this.remote

        //         .execute(function() {

        //             var mapFieldOne = $('#E_TXT_FIELD_1');
        //             var mapFieldTwo = $('#E_TXT_FIELD_2');

        //             var destinationFieldOne = $('#E_DEST_TXT_1');
        //             var destinationFieldTwo = $('#E_DEST_TXT_2');
                    
        //             return {
        //                 mapFieldOneContent: mapFieldOne.val().trim(),
        //                 mapFieldTwoContent: mapFieldTwo.text().trim(),
        //                 destinationFieldOneContent: destinationFieldOne.text().trim(),
        //                 destinationFieldTwoContent: destinationFieldTwo.val().trim()
        //             };
        //         })
        //         .then(function (result) {
        //                 assert.strictEqual(result.mapFieldOneContent, result.destinationFieldOneContent, 'First destination content should match map field');
        //                 assert.strictEqual(result.mapFieldTwoContent, result.destinationFieldTwoContent, 'Second destination content should match map field');                        
        //         });
        // },

    });
});

