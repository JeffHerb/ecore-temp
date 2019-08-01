define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');
    var pollUntil = require('intern/dojo/node!leadfoot/helpers/pollUntil');

    registerSuite({
        name: 'processMap',

        'Check to make sure map fields are populated': function () {
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/emp/pages/processMap.html'))
                .setFindTimeout(5000)

                .findById('E_TXT_FIELD_1')
                    .getAttribute('value')
                    .then(function(text){
                        assert.notStrictEqual(text, '', "First Process Map field is missing content")
                    })
                    .end()

                .findById('E_TXT_FIELD_2')
                    .getVisibleText()
                    .then(function(text){
                        assert.notStrictEqual(text, '', "Second Process Map field is missing content")
                    })
                    .end()
        },

        'Check to make map targets are empty': function () {
            return this.remote
                .findById('E_DEST_TXT_1')
                    .end()

                .findById('E_DEST_TXT_2')
                    .end()         

                .execute(function() {

                    var destinationFieldOne = $('#E_DEST_TXT_1');
                    var destinationFieldTwo = $('#E_DEST_TXT_2');
                    
                    return {
                        destinationFieldOneContent: destinationFieldOne.text().trim(),
                        destinationFieldTwoContent: destinationFieldTwo.val().trim()
                    };
                })
                .then(function (result) {
                        assert.strictEqual(result.destinationFieldOneContent, '', "First Process Map destination field is populated with content, should be empty")
                        assert.strictEqual(result.destinationFieldTwoContent, '', "Second Process Map destination field is populated with content, should be empty")
                });
        },

        'Run process map': function () {
            return this.remote
                .findById('processMap1')
                    .click()
                    .sleep(500)
        },


        'Verify process map field information transfered': function () {
            return this.remote

                .execute(function() {

                    var mapFieldOne = $('#E_TXT_FIELD_1');
                    var mapFieldTwo = $('#E_TXT_FIELD_2');

                    var destinationFieldOne = $('#E_DEST_TXT_1');
                    var destinationFieldTwo = $('#E_DEST_TXT_2');
                    
                    return {
                        mapFieldOneContent: mapFieldOne.val().trim(),
                        mapFieldTwoContent: mapFieldTwo.text().trim(),
                        destinationFieldOneContent: destinationFieldOne.text().trim(),
                        destinationFieldTwoContent: destinationFieldTwo.val().trim()
                    };
                })
                .then(function (result) {
                        assert.strictEqual(result.mapFieldOneContent, result.destinationFieldOneContent, 'First destination content should match map field');
                        assert.strictEqual(result.mapFieldTwoContent, result.destinationFieldTwoContent, 'Second destination content should match map field');                        
                });
        },

        'Edit input field content': function () {
            return this.remote
                .findById('E_DEST_TXT_2')
                    .clearValue()
                    .end()

                .findById('E_DEST_TXT_2')
                    .type("New Content")
                    .sleep(500)
                    .end()

                .execute(function() {
                    var destinationFieldTwo = $('#E_DEST_TXT_2');                    
                    return {
                        destinationFieldTwoContent: destinationFieldTwo.val().trim()
                    };
                })
                .then(function (result) {
                        assert.strictEqual(result.destinationFieldTwoContent, 'New Content', "Second Process Map destination field should have new content")
                });
        },


        'Run process map after editing content': function () {
            return this.remote
                .findById('processMap1')
                    .click()
                    .sleep(500)
        },

        'Verify process map field information transfered correctly after retrigger': function () {
            return this.remote

                .execute(function() {

                    var mapFieldOne = $('#E_TXT_FIELD_1');
                    var mapFieldTwo = $('#E_TXT_FIELD_2');

                    var destinationFieldOne = $('#E_DEST_TXT_1');
                    var destinationFieldTwo = $('#E_DEST_TXT_2');
                    
                    return {
                        mapFieldOneContent: mapFieldOne.val().trim(),
                        mapFieldTwoContent: mapFieldTwo.text().trim(),
                        destinationFieldOneContent: destinationFieldOne.text().trim(),
                        destinationFieldTwoContent: destinationFieldTwo.val().trim()
                    };
                })
                .then(function (result) {
                        assert.strictEqual(result.mapFieldOneContent, result.destinationFieldOneContent, 'First destination content should match map field');
                        assert.strictEqual(result.mapFieldTwoContent, result.destinationFieldTwoContent, 'Second destination content should match map field');                        
                });
        },

    });
});

