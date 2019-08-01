define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');
    var pollUntil = require('intern/dojo/node!leadfoot/helpers/pollUntil');

    registerSuite({
        name: 'associate',


        'Adjust Return': function() {
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/emp/pages/button-lib.html'))
                .setFindTimeout(5000)
                .execute(function() {

                    var row = 0;

                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iAdjustReturn.gif', 'Button icon JSON string should have been: iAdjustReturn.gif for: Adjust Return');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-adjust-return', 'Button should have had the class of: emp-icon-adjust-return for: Adjust Return');
                })
                .end()
        },

        'Activate, Inactivate': function() {
            return this.remote
                .execute(function() {

                    var row = 1;

                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iact_inact.gif', 'Button icon JSON string should have been: iact_inact.gif for: Activate, Inactivate');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-iact-inact', 'Button should have had the class of: emp-imgbtn-act-inact for: Activate, Inactivate');
                })
                .end()
        },

        'Assignment History': function() {
            return this.remote
                .execute(function() {

                    var row = 2;

                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iAssignmentHistory.gif', 'Button icon JSON string should have been: iAssignmentHistory.gif for: Assignment History');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-assignment-history', 'Button should have had the class of: emp-icon-assignment-history for: Assignment History');
                })
                .end()
        },

        'Associate': function() {
            return this.remote
                .execute(function() {

                    var row = 3;

                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iAssociate.gif', 'Button icon JSON string should have been: iAssociate.gif for: Associate');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-associate', 'Button should have had the class of: emp-icon-associate for: Associate');
                })
                .end()
        },

        'Bank': function() {
            return this.remote
                .execute(function() {

                    var row = 4;

                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'ibank.gif', 'Button icon JSON string should have been: ibank.gif for: Bank');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-bank', 'Button should have had the class of: emp-icon-bank for: Bank');
                })
                .end()
        },

        'CART Assignment': function() {
            return this.remote
                .execute(function() {

                    var row = 5;

                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iCARTSAssessments.gif', 'Button icon JSON string should have been: iCARTSAssessments.gif for: CART Assignment');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-cart-assignment', 'Button should have had the class of: emp-icon-cart-assignment for: CART Assignment');
                })
                .end()
        },

        'Created Under Joint Account': function() {
            return this.remote
                .execute(function() {

                    var row = 6;

                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iCreatedUnderJoint.gif', 'Button icon JSON string should have been: iCreatedUnderJoint.gif for: Created Under Joint Account');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-created-under-joint', 'Button should have had the class of: emp-icon-created-under-joint for: Created Under Joint Account');
                })
                .end()
        },

        'Claims': function() {
            return this.remote
                .execute(function() {

                    var row = 7;

                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iClaims.gif', 'Button icon JSON string should have been: iClaims.gif for: Claims');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-claims', 'Button should have had the class of: emp-icon-claims for: Claims');
                })
                .end()
        },

        'Copy': function() {
            return this.remote
                .execute(function() {

                    var row = 8;

                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iCopy.gif', 'Button icon JSON string should have been: iCopy.gif for: Copy');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-copy', 'Button should have had the class of: emp-icon-copy for: Copy');
                })
                .end()
        },

        'Create Migration Number': function() {
            return this.remote
                .execute(function() {

                    var row = 9;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'icreateMigNum.gif', 'Button icon JSON string should have been: icreateMigNum.gif for: Create Migration Number');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-create-migration-number', 'Button should have had the class of: emp-icon-create-migration-number for: Create Migration Number');
                })
                .end()
        },

        'CT Profile': function() {
            return this.remote
                .execute(function() {

                    var row = 10;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iCTProfile.gif', 'Button icon JSON string should have been: iCTProfile.gif for: CT Profile');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-ct-profile', 'Button should have had the class of: emp-icon-ct-profile for: CT Profile');
                })
                .end()
        },

        'CS Profile': function() {
            return this.remote
                .execute(function() {

                    var row = 11;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iCSProfile.gif', 'Button icon JSON string should have been: iCSProfile.gif for: CS Profile');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-cs-profile', 'Button should have had the class of: emp-icon-cs-profile for: CS Profile');
                })
                .end()
        },

        'Delete': function() {
            return this.remote
                .execute(function() {

                    var row = 12;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'delete', 'Button icon JSON string should have been: delete for: Delete');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-delete', 'Button should have had the class of: emp-icon-delete for: Delete');
                })
                .end()
        },

        'Preview': function() {
            return this.remote
                .execute(function() {

                    var row = 13;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'ipreview.gif', 'Button icon JSON string should have been: ipreview.gif for: Preview');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-more-info', 'Button should have had the class of: emp-icon-more-info for: Preview');
                })
                .end()
        },

        'Direct Deposit': function() {
            return this.remote
                .execute(function() {

                    var row = 14;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iDirectDeposit.gif', 'Button icon JSON string should have been: iDirectDeposit.gif for: Direct Deposit');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-direct-deposit', 'Button should have had the class of: emp-icon-direct-deposit for: Direct Deposit');
                })
                .end()
        },

        'Document Out': function() {
            return this.remote
                .execute(function() {

                    var row = 15;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'document-out.gif', 'Button icon JSON string should have been: document-out.gif for: Document Out');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-document-out', 'Button should have had the class of: emp-icon-document-out for: Document Out');
                })
                .end()
        },

        'Drill Down': function() {
            return this.remote
                .execute(function() {

                    var row = 16;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'idrilldown.gif', 'Button icon JSON string should have been: idrilldown.gif for: Drill Down');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-drill-down', 'Button should have had the class of: emp-icon-drill-down for: Drill Down');
                })
                .end()
        },

        'Edit': function() {
            return this.remote
                .execute(function() {

                    var row = 17;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'edit', 'Button icon JSON string should have been: edit for: Edit');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-edit', 'Button should have had the class of: emp-icon-edit for: Edit');
                })
                .end()
        },

        'Event Log': function() {
            return this.remote
                .execute(function() {

                    var row = 18;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iEventsLog.gif', 'Button icon JSON string should have been: iEventsLog.gif for: Event Log');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-event-log', 'Button should have had the class of: emp-icon-event-log for: Event Log');
                })
                .end()
        },

        'External Transmittal': function() {
            return this.remote
                .execute(function() {

                    var row = 19;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iExternalTransmittal.gif', 'Button icon JSON string should have been: iExternalTransmittal.gif for: External Transmittal');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-external-transmittal', 'Button should have had the class of: emp-icon-external-transmittal for: External Transmittal');
                })
                .end()
        },

        'Filing Comp': function() {
            return this.remote
                .execute(function() {

                    var row = 20;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'ifilingcomp.gif', 'Button icon JSON string should have been: ifilingcomp.gif for: Filing Comp');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-filing-comp', 'Button should have had the class of: emp-icon-filing-comp for: Filing Comp');
                })
                .end()
        },

        'View Image': function() {
            return this.remote
                .execute(function() {

                    var row = 21;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'view-image', 'Button icon JSON string should have been: view-image for: View Image');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-view-image', 'Button should have had the class of: emp-icon-view-image for: View Image');
                })
                .end()
        },

        'Informational': function() {
            return this.remote
                .execute(function() {

                    var row = 22;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'informational', 'Button icon JSON string should have been: informational for: Informational');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-informational', 'Button should have had the class of: emp-icon-informational for: Informational');
                })
                .end()
        },

        'Internal Transmittal': function() {
            return this.remote
                .execute(function() {

                    var row = 23;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iInternalTransmittal.png', 'Button icon JSON string should have been: iInternalTransmittal.png for: Internal Transmittal');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-internal-transmittal', 'Button should have had the class of: emp-icon-internal-transmittal for: Internal Transmittal');
                })
                .end()
        },

        'Legal Representative': function() {
            return this.remote
                .execute(function() {

                    var row = 24;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'legal', 'Button icon JSON string should have been: legal for: Legal Representative');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-legal-rep', 'Button should have had the class of: emp-icon-legal-rep for: Legal Representative');
                })
                .end()
        },

        'LP Summary': function() {
            return this.remote
                .execute(function() {

                    var row = 25;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iLPSummary.png', 'Button icon JSON string should have been: iLPSummary.png for: LP Summary');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-lp-summary', 'Button should have had the class of: emp-icon-lp-summary for: LP Summary');
                })
                .end()
        },

        'Lock': function() {
            return this.remote
                .execute(function() {

                    var row = 26;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iLocked.gif', 'Button icon JSON string should have been: iLocked.gif for: Lock');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-lock', 'Button should have had the class of: emp-icon-lock for: Lock');
                })
                .end()
        },

        'Liability Period': function() {
            return this.remote
                .execute(function() {

                    var row = 27;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iLiabilityPeriod.gif', 'Button icon JSON string should have been: iLiabilityPeriod.gif for: Liability Period');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-liability-period', 'Button should have had the class of: emp-icon-liability-period for: Liability Period');
                })
                .end()
        },

        'Manual Adjust': function() {
            return this.remote
                .execute(function() {

                    var row = 28;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'imanualadjust.gif', 'Button icon JSON string should have been: imanualadjust.gif for: Manual Adjust');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-manual-adjust', 'Button should have had the class of: emp-icon-manual-adjust for: Manual Adjust');
                })
                .end()
        },

        'Map': function() {
            return this.remote
                .execute(function() {

                    var row = 29;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iMap.gif', 'Button icon JSON string should have been: iMap.gif for: Map');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-map', 'Button should have had the class of: emp-icon-map for: Map');
                })
                .end()
        },

        'Dollar Sign': function() {
            return this.remote
                .execute(function() {

                    var row = 30;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'dollar-sign', 'Button icon JSON string should have been: dollar-sign for: Dollar Sign');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-dollar-sign', 'Button should have had the class of: emp-icon-dollar-sign for: Dollar Sign');
                })
                .end()
        },

        'View More Details': function() {
            return this.remote
                .execute(function() {

                    var row = 31;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'view-details', 'Button icon JSON string should have been: view-details for: View More Details');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-view-details', 'Button should have had the class of: emp-icon-view-details for: View More Details');
                })
                .end()
        },

        'Multiple Returns': function() {
            return this.remote
                .execute(function() {

                    var row = 32;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iMultipleReturns.gif', 'Button icon JSON string should have been: iMultipleReturns.gif for: Multiple Returns');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-multiple-returns', 'Button should have had the class of: emp-icon-multiple-returns for: Multiple Returns');
                })
                .end()
        },

        'Form Order': function() {
            return this.remote
                .execute(function() {

                    var row = 33;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iFormOrder.gif', 'Button icon JSON string should have been: iFormOrder.gif for: Form Order');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-form-order', 'Button should have had the class of: emp-icon-form-order for: Form Order');
                })
                .end()
        },

        'OSC Void': function() {
            return this.remote
                .execute(function() {

                    var row = 34;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iOSCVoid.gif', 'Button icon JSON string should have been: iOSCVoid.gif for: OSC Void');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-osc-void', 'Button should have had the class of: emp-icon-osc-void for: OSC Void');
                })
                .end()
        },

        'Popup': function() {
            return this.remote
                .execute(function() {

                    var row = 35;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'popup', 'Button icon JSON string should have been: popup for: Popup');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-popup-view-list', 'Button should have had the class of: emp-icon-popup-view-list for: Popup');
                })
                .end()
        },

        'Draft': function() {
            return this.remote
                .execute(function() {

                    var row = 36;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iDraft.gif', 'Button icon JSON string should have been: iDraft.gif for: Draft');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-draft', 'Button should have had the class of: emp-icon-draft for: Draft');
                })
                .end()
        },

        'Arrow Down': function() {
            return this.remote
                .execute(function() {

                    var row = 37;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iArrowDown1.gif', 'Button icon JSON string should have been: iArrowDown1.gif for: Arrow Down');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-arrow-down', 'Button should have had the class of: emp-icon-arrow-down for: Arrow Down');
                })
                .end()
        },

        'Printer': function() {
            return this.remote
                .execute(function() {

                    var row = 38;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'printer', 'Button icon JSON string should have been: printer for: Printer');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-print', 'Button should have had the class of: emp-icon-print for: Printer');
                })
                .end()
        },

        'Final': function() {
            return this.remote
                .execute(function() {

                    var row = 39;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iFinal.gif', 'Button icon JSON string should have been: iFinal.gif for: Final');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-final-copy', 'Button should have had the class of: emp-icon-final-copy for: Final');
                })
                .end()
        },

        'Record Match': function() {
            return this.remote
                .execute(function() {

                    var row = 40;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iRecordMatch.gif', 'Button icon JSON string should have been: iRecordMatch.gif for: Record Match');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-record-match', 'Button should have had the class of: emp-icon-record-match for: Record Match');
                })
                .end()
        },

        'Transmittal': function() {
            return this.remote
                .execute(function() {

                    var row = 41;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iTransmittal.png', 'Button icon JSON string should have been: iTransmittal.png for: Transmittal');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-transmittal', 'Button should have had the class of: emp-icon-transmittal for: Transmittal');
                })
                .end()
        },

        'Remove Mig Number': function() {
            return this.remote
                .execute(function() {

                    var row = 42;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iremoveMigNum.gif', 'Button icon JSON string should have been: iremoveMigNum.gif for: Remove Mig Number');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-remove-mig-num', 'Button should have had the class of: emp-icon-remove-mig-num for: Remove Mig Number');
                })
                .end()
        },

        'Rollup': function() {
            return this.remote
                .execute(function() {

                    var row = 43;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iRollup.gif', 'Button icon JSON string should have been: iRollup.gif for: Rollup');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-roll-up', 'Button should have had the class of: emp-icon-roll-up for: Rollup');
                })
                .end()
        },

        'Sales Tax Liabilities': function() {
            return this.remote
                .execute(function() {

                    var row = 44;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iSalesTaxLiabilities.gif', 'Button icon JSON string should have been: iSalesTaxLiabilities.gif for: Sales Tax Liabilities');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-sales-tax-liabilities', 'Button should have had the class of: emp-icon-sales-tax-liabilities for: Sales Tax Liabilities');
                })
                .end()
        },

        'Sales Tax Profile': function() {
            return this.remote
                .execute(function() {

                    var row = 45;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iSalesTaxProfile.gif', 'Button icon JSON string should have been: iSalesTaxProfile.gif for: Sales Tax Profile');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-sales-tax-profile', 'Button should have had the class of: emp-icon-sales-tax-profile for: Sales Tax Profile');
                })
                .end()
        },

        'Arrow Up': function() {
            return this.remote
                .execute(function() {

                    var row = 46;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iArrowUp1.gif', 'Button icon JSON string should have been: iArrowUp1.gif for: Arrow Up');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-arrow-up', 'Button should have had the class of: emp-icon-arrow-up for: Arrow Up');
                })
                .end()
        },

        'Source of Deficiency': function() {
            return this.remote
                .execute(function() {

                    var row = 47;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iSourceOfDeficiency.gif', 'Button icon JSON string should have been: iSourceOfDeficiency.gif for: Source of Deficiency');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-source-of-deficiency', 'Button should have had the class of: emp-icon-source-of-deficiency for: Source of Deficiency');
                })
                .end()
        },

        'Star': function() {
            return this.remote
                .execute(function() {

                    var row = 48;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'star-red', 'Button icon JSON string should have been: star-red for: Star');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-star-red', 'Button should have had the class of: emp-icon-star-red for: Star');
                })
                .end()
        },

        'Table Details': function() {
            return this.remote
                .execute(function() {

                    var row = 49;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'itabledetails.gif', 'Button icon JSON string should have been: itabledetails.gif for: Table Details');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-table-details', 'Button should have had the class of: emp-icon-table-details for: Table Details');
                })
                .end()
        },

        'Transfer In Out': function() {
            return this.remote
                .execute(function() {

                    var row = 50;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iTransfInOut.gif', 'Button icon JSON string should have been: iTransfInOut.gif for: Transfer In Out');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-transfer-in-out', 'Button should have had the class of: emp-icon-transfer-in-out for: Transfer In Out');
                })
                .end()
        },

        'Tax Payer Data': function() {
            return this.remote
                .execute(function() {

                    var row = 51;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iTaxpayerData.png', 'Button icon JSON string should have been: iTaxpayerData.png for: Tax Payer Data');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-tax-payer-data', 'Button should have had the class of: emp-icon-tax-payer-data for: Tax Payer Data');
                })
                .end()
        },

        'Tax Payer Assessments': function() {
            return this.remote
                .execute(function() {

                    var row = 52;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iTaxpayerAssessments.gif', 'Button icon JSON string should have been: iTaxpayerAssessments.gif for: Tax Payer Assessments');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-tax-payer-assessments', 'Button should have had the class of: emp-icon-tax-payer-assessments for: Tax Payer Assessments');
                })
                .end()
        },

        'Trxn': function() {
            return this.remote
                .execute(function() {

                    var row = 53;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iTrxn.gif', 'Button icon JSON string should have been: iTrxn.gif for: Trxn');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-trxn', 'Button should have had the class of: emp-icon-trxn for: Trxn');
                })
                .end()
        },

        'Unlink': function() {
            return this.remote
                .execute(function() {

                    var row = 54;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iUnlink.gif', 'Button icon JSON string should have been: iUnlink.gif for: Unlink');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-unlink', 'Button should have had the class of: emp-icon-unlink for: Unlink');
                })
                .end()
        },

        'Unlock': function() {
            return this.remote
                .execute(function() {

                    var row = 55;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iUnlocked.gif', 'Button icon JSON string should have been: iUnlocked.gif for: Unlock');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-unlock', 'Button should have had the class of: emp-icon-unlock for: Unlock');
                })
                .end()
        },

        'User Profile': function() {
            return this.remote
                .execute(function() {

                    var row = 56;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iUserProfiles.gif', 'Button icon JSON string should have been: iUserProfiles.gif for: User Profile');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-user-profile', 'Button should have had the class of: emp-icon-user-profile for: User Profile');
                })
                .end()
        },

        'View Map': function() {
            return this.remote
                .execute(function() {

                    var row = 57;
                    var tableRow = emp.reference.tables['button-lib'].dataStore.body.rows[row];

                    // Wanted values
                    var buttonJSON = tableRow.columns[0].contents[0].input.icon;

                    // Gets the table row
                    var $tableRow = $('#button-lib tbody tr').eq(row);

                    // Gets the button
                    var $tableButton = $tableRow.find('button');

                    var buttonClass = $tableButton.attr('class');

                    return {
                        buttonJSONIcon: buttonJSON,
                        buttonClass: buttonClass
                    };

                })
                .then(function (rowObj) {

                        // Check the icon JSON string
                        assert.strictEqual(rowObj.buttonJSONIcon, 'iViewMap.gif', 'Button icon JSON string should have been: iViewMap.gif for: View Map');

                        // Check if classes match
                        assert.strictEqual(rowObj.buttonClass, 'emp-icon-view-map', 'Button should have had the class of: emp-icon-view-map for: View Map');
                })
                .end()
        }


    });
});
