define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');

    registerSuite({
        name: 'table - selection',

        // ===============================
        // MULTIPLE (CHECKBOX) TABLE TESTS
        // ===============================

        // Tests that the preselected table options are correct
        'Multiple Select Table - Checking for prechecked rows': function() {

            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/table/pages/selection.html'))
                .sleep(250)
                .execute(function() {

                    // Find the table and the viewWrapper around it
                    var table = document.querySelector('table#multiple-test-example');
                    var viewWrapper = table.parentElement;

                    var tableObj = emp.reference.tables['multiple-test-example'];
                    var tableData = tableObj.dataStore;

                    var preCheckedKeys = tableObj.getCheckedIndex();

                    // Get _selected_index hidden input value
                    // ======================================

                    var selectedIndices = document.querySelector('input#multiple-test-example_checked_index').value;

                    // Return everything
                    return {
                        hasPreCheckedKeys: (preCheckedKeys.length >= 1) ? true : false,
                        preCheckedKeys: preCheckedKeys,
                        selectedIndices: selectedIndices
                    };

                }).
                then(function (tableObj) {

                    // Check to make sure that the lengths of the number of preselected inputs matches the length of found checkboxes
                    assert.strictEqual(tableObj.hasPreCheckedKeys, true, 'The table definition does not have a prechecked array definition.');

                    // Check to make sure that the right number of checkboxes was found
                    assert.strictEqual(tableObj.preCheckedKeys.length, 2, 'The number of prechecked should have found 2 rows/checkboxes.');

                    // Check to see if the selected index match the expected value
                    assert.strictEqual(tableObj.selectedIndices, tableObj.preCheckedKeys.join(','), 'The selected index did not match the expected selected index based on the prechecked keys.');
                });
        },

        // Test that the clear selection function works properly
        'Multiple Select Table - Clearing Prechecked options': function() {

            return this.remote
                .setFindTimeout(5000)
                // Clear the table by the declared page button
                .findById('multi-check-clear')
                    .click()
                    .end()
                    .sleep(500)
                .execute(function() {

                    // Find the table and the viewWrapper around it
                    var table = document.querySelector('table#multiple-test-example');
                    var viewWrapper = table.parentElement;

                    var tableObj = emp.reference.tables['multiple-test-example'];
                    var tableData = tableObj.dataStore;

                    var preCheckedKeys = tableObj.getCheckedIndex();

                    // Get _selected_index hidden input value
                    // ======================================

                    var renderedChecks =  document.querySelectorAll('table#multiple-test-example tbody tr .table-control-col > input[type="checkbox"]');
                    var checkedInputs = 0;

                    for (var j = 0, jLen = renderedChecks.length; j < jLen; j++) {

                        if (renderedChecks[j].checked) {

                            checkedInputs += 1;
                        }

                    }

                    var selectedIndices = document.querySelector('input#multiple-test-example_checked_index').value;

                    // Return everything
                    return {
                        preCheckedKeys: preCheckedKeys,
                        checkedInputs: checkedInputs,
                        selectedIndices: selectedIndices
                    };

                })
                .then(function(tableObj) {

                    assert.strictEqual(tableObj.preCheckedKeys, false, 'The dataStore reports one or more rows has a selected attribute equal to `true` at the row level.');

                    assert.strictEqual(tableObj.checkedInputs, 0, 'The table contained a table row that had a checked checkbox when it shouldnt.');

                    assert.strictEqual(tableObj.selectedIndices, "", 'The tables hidden input _checked_index element has a value and it shouldnt.');

                });
        },

        // Check the first row and then check to see if it was acturally checked
        'Multiple Select Table - Check via jQuery row reference': function() {

            return this.remote
                .setFindTimeout(5000)
                // Clear the table by the declared page button
                .findById('multi-check-first-jquery')
                    .click()
                    .end()
                .execute(function() {

                    // Find the table and the viewWrapper around it
                    var table = document.querySelector('table#multiple-test-example');
                    var viewWrapper = table.parentElement;

                    // Ge the table datastore
                    var table = emp.reference.tables['multiple-test-example'];

                    var hiddenInputs = table.getHiddenInputValues();

                    var selectedRows = [];

                    // Loop through the dataStore looking for any rows with the selection property that is true
                    for (var i = 0, len = table.dataStore.body.rows.length; i < len; i++) {

                        if (table.dataStore.body.rows[i].selection && table.dataStore.body.rows[i].selection.checked) {

                            selectedRows.push(i);
                        }

                    }

                    var checkboxInputs = document.querySelectorAll('table#multiple-test-example tbody tr .table-control-col > input[type="checkbox"]');

                    var checkedInputCount = 0;

                    for (var j = 0, jLen = checkboxInputs.length; j < jLen; j++) {

                        if (checkboxInputs[j].checked) {

                            checkedInputCount += 1;
                        }

                    }

                    var checkedIndex = document.querySelector('input#multiple-test-example_checked_index').value;

                    return {
                        checkedIndex: checkedIndex,
                        checkedInputCount: checkedInputCount,
                        hiddenInputs: hiddenInputs,
                        selectedRows: selectedRows
                    }

                })
                .then(function(tableObj) {

                    var expectedHiddenInputs = {
                        "multiple-test-example_amount": "",
                        "multiple-test-example_amount_temp": "",
                        "multiple-test-example_auditOwnership": "",
                        "multiple-test-example_auditOwnership_temp": "",
                        "multiple-test-example_checked_index": "multi-test-0",
                        "multiple-test-example_hidden": "",
                        "multiple-test-example_hidden_temp": "",
                        "multiple-test-example_jointLiabilityPeriodExists": "",
                        "multiple-test-example_jointLiabilityPeriodExists_temp": "",
                        "multiple-test-example_liabilityPeriod": "",
                        "multiple-test-example_liabilityPeriod_temp": "",
                        "multiple-test-example_phone": "",
                        "multiple-test-example_phone_temp": "",
                        "multiple-test-example_returnStatus": "",
                        "multiple-test-example_returnStatusDate": "",
                        "multiple-test-example_returnStatusDate_temp": "",
                        "multiple-test-example_returnStatus_temp": "",
                        "multiple-test-example_reviewDetails": "",
                        "multiple-test-example_reviewDetails_temp": "",
                        "multiple-test-example_selected_index": "",
                        "multiple-test-example_taxTypeSubType": "",
                        "multiple-test-example_taxTypeSubType_temp": ""
                    };

                    assert.strictEqual(tableObj.selectedRows.length, 1, 'The dataStore reports either 0 or more than 1 selected attribute equal to `true` at the row level of the dataStore.');

                    assert.strictEqual(tableObj.checkedInputCount, 1, 'The table contained 0 or 2 or more checked input when it should only find 1');

                    assert.strictEqual(tableObj.checkedIndex, "multi-test-0", 'The tables hidden input _checked_index element has a value and it shouldnt.');

                    assert.deepEqual(tableObj.hiddenInputs, expectedHiddenInputs, 'The table hidden inputs do not match the expected hidden inputs values.');

                });
        },

        // Uncheck the first row and then check to see if the was acturally unchecked
        'Multiple Select Table - Uncheck via jQuery row reference': function() {

            return this.remote
                .setFindTimeout(5000)
                // Clear the table by the declared page button
                .findById('multi-uncheck-first-jquery')
                    .click()
                    .end()
                .execute(function() {

                    // Find the table and the viewWrapper around it
                    var table = document.querySelector('table#multiple-test-example');
                    var viewWrapper = table.parentElement;

                    // Ge the table datastore
                    var table = emp.reference.tables['multiple-test-example'];

                    var hiddenInputs = table.getHiddenInputValues();

                    var selectedRows = [];

                    // Loop through the dataStore looking for any rows with the selection property that is true
                    for (var i = 0, len = table.dataStore.body.rows.length; i < len; i++) {

                        if (table.dataStore.body.rows[i].selection && table.dataStore.body.rows[i].selection.checked) {

                            selectedRows.push(i);
                        }

                    }

                    var checkboxInputs = document.querySelectorAll('table#multiple-test-example tbody tr .table-control-col > input[type="checkbox"]');

                    var checkedInputCount = 0;

                    for (var j = 0, jLen = checkboxInputs.length; j < jLen; j++) {

                        if (checkboxInputs[j].checked) {

                            checkedInputCount += 1;
                        }

                    }

                    var checkedIndex = document.querySelector('input#multiple-test-example_checked_index').value;

                    return {
                        checkedIndex: checkedIndex,
                        checkedInputCount: checkedInputCount,
                        hiddenInputs: hiddenInputs,
                        selectedRows: selectedRows
                    }

                })
                .then(function(tableObj) {

                    var expectedHiddenInputs = {
                        "multiple-test-example_amount": "",
                        "multiple-test-example_amount_temp": "",
                        "multiple-test-example_auditOwnership": "",
                        "multiple-test-example_auditOwnership_temp": "",
                        "multiple-test-example_checked_index": "",
                        "multiple-test-example_hidden": "",
                        "multiple-test-example_hidden_temp": "",
                        "multiple-test-example_jointLiabilityPeriodExists": "",
                        "multiple-test-example_jointLiabilityPeriodExists_temp": "",
                        "multiple-test-example_liabilityPeriod": "",
                        "multiple-test-example_liabilityPeriod_temp": "",
                        "multiple-test-example_phone": "",
                        "multiple-test-example_phone_temp": "",
                        "multiple-test-example_returnStatus": "",
                        "multiple-test-example_returnStatusDate": "",
                        "multiple-test-example_returnStatusDate_temp": "",
                        "multiple-test-example_returnStatus_temp": "",
                        "multiple-test-example_reviewDetails": "",
                        "multiple-test-example_reviewDetails_temp": "",
                        "multiple-test-example_selected_index": "",
                        "multiple-test-example_taxTypeSubType": "",
                        "multiple-test-example_taxTypeSubType_temp": ""
                    };

                    assert.strictEqual(tableObj.selectedRows.length, 0, 'The dataStore reports 1 or more attribute equal to `true` at the row level of the dataStore.');

                    assert.strictEqual(tableObj.checkedInputCount, 0, 'The table contained 1 or more checked input when it should have been none');

                    assert.strictEqual(tableObj.checkedIndex, "", 'The tables hidden input _checked_index element has a value and it shouldnt.');

                    assert.deepEqual(tableObj.hiddenInputs, expectedHiddenInputs, 'The table hidden inputs do not match the expected hidden inputs values.');

                });
        },

        // Check the first row and then check to see if it was acturally checked
        'Multiple Select Table - Check via JavaScript row element reference': function() {

            return this.remote
                .setFindTimeout(5000)
                // Clear the table by the declared page button
                .findById('multi-check-first-js')
                    .click()
                    .end()
                .execute(function() {

                    // Find the table and the viewWrapper around it
                    var table = document.querySelector('table#multiple-test-example');
                    var viewWrapper = table.parentElement;

                    // Ge the table datastore
                    var table = emp.reference.tables['multiple-test-example'];

                    var hiddenInputs = table.getHiddenInputValues();

                    var selectedRows = [];

                    // Loop through the dataStore looking for any rows with the selection property that is true
                    for (var i = 0, len = table.dataStore.body.rows.length; i < len; i++) {

                        if (table.dataStore.body.rows[i].selection && table.dataStore.body.rows[i].selection.checked) {

                            selectedRows.push(i);
                        }

                    }

                    var checkboxInputs = document.querySelectorAll('table#multiple-test-example tbody tr .table-control-col > input[type="checkbox"]');

                    var checkedInputCount = 0;

                    for (var j = 0, jLen = checkboxInputs.length; j < jLen; j++) {

                        if (checkboxInputs[j].checked) {

                            checkedInputCount += 1;
                        }

                    }

                    var checkedIndex = document.querySelector('input#multiple-test-example_checked_index').value;

                    return {
                        checkedIndex: checkedIndex,
                        checkedInputCount: checkedInputCount,
                        hiddenInputs: hiddenInputs,
                        selectedRows: selectedRows
                    }

                })
                .then(function(tableObj) {

                    var expectedHiddenInputs = {
                        "multiple-test-example_amount": "",
                        "multiple-test-example_amount_temp": "",
                        "multiple-test-example_auditOwnership": "",
                        "multiple-test-example_auditOwnership_temp": "",
                        "multiple-test-example_checked_index": "multi-test-0",
                        "multiple-test-example_hidden": "",
                        "multiple-test-example_hidden_temp": "",
                        "multiple-test-example_jointLiabilityPeriodExists": "",
                        "multiple-test-example_jointLiabilityPeriodExists_temp": "",
                        "multiple-test-example_liabilityPeriod": "",
                        "multiple-test-example_liabilityPeriod_temp": "",
                        "multiple-test-example_phone": "",
                        "multiple-test-example_phone_temp": "",
                        "multiple-test-example_returnStatus": "",
                        "multiple-test-example_returnStatusDate": "",
                        "multiple-test-example_returnStatusDate_temp": "",
                        "multiple-test-example_returnStatus_temp": "",
                        "multiple-test-example_reviewDetails": "",
                        "multiple-test-example_reviewDetails_temp": "",
                        "multiple-test-example_selected_index": "",
                        "multiple-test-example_taxTypeSubType": "",
                        "multiple-test-example_taxTypeSubType_temp": ""
                    };

                    assert.strictEqual(tableObj.selectedRows.length, 1, 'The dataStore reports either 0 or more than 1 selected attribute equal to `true` at the row level of the dataStore.');

                    assert.strictEqual(tableObj.checkedInputCount, 1, 'The table contained 0 or 2 or more checked input when it should only find 1');

                    assert.strictEqual(tableObj.checkedIndex, "multi-test-0", 'The tables hidden input _checked_index element has a value and it shouldnt.');

                    assert.deepEqual(tableObj.hiddenInputs, expectedHiddenInputs, 'The table hidden inputs do not match the expected hidden inputs values.');

                });
        },

        // Uncheck the first row and then check to see if the was acturally unchecked
        'Multiple Select Table - Uncheck via JavaScript row element reference': function() {

            return this.remote
                .setFindTimeout(5000)
                // Clear the table by the declared page button
                .findById('multi-uncheck-first-js')
                    .click()
                    .end()
                .execute(function() {

                    // Find the table and the viewWrapper around it
                    var table = document.querySelector('table#multiple-test-example');
                    var viewWrapper = table.parentElement;

                    // Ge the table datastore
                    var table = emp.reference.tables['multiple-test-example'];

                    var hiddenInputs = table.getHiddenInputValues();

                    var selectedRows = [];

                    // Loop through the dataStore looking for any rows with the selection property that is true
                    for (var i = 0, len = table.dataStore.body.rows.length; i < len; i++) {

                        if (table.dataStore.body.rows[i].selection && table.dataStore.body.rows[i].selection.checked) {

                            selectedRows.push(i);
                        }

                    }

                    var checkboxInputs = document.querySelectorAll('table#multiple-test-example tbody tr .table-control-col > input[type="checkbox"]');

                    var checkedInputCount = 0;

                    for (var j = 0, jLen = checkboxInputs.length; j < jLen; j++) {

                        if (checkboxInputs[j].checked) {

                            checkedInputCount += 1;
                        }

                    }

                    var checkedIndex = document.querySelector('input#multiple-test-example_checked_index').value;

                    return {
                        checkedIndex: checkedIndex,
                        checkedInputCount: checkedInputCount,
                        hiddenInputs: hiddenInputs,
                        selectedRows: selectedRows
                    }

                })
                .then(function(tableObj) {

                    var expectedHiddenInputs = {
                        "multiple-test-example_amount": "",
                        "multiple-test-example_amount_temp": "",
                        "multiple-test-example_auditOwnership": "",
                        "multiple-test-example_auditOwnership_temp": "",
                        "multiple-test-example_checked_index": "",
                        "multiple-test-example_hidden": "",
                        "multiple-test-example_hidden_temp": "",
                        "multiple-test-example_jointLiabilityPeriodExists": "",
                        "multiple-test-example_jointLiabilityPeriodExists_temp": "",
                        "multiple-test-example_liabilityPeriod": "",
                        "multiple-test-example_liabilityPeriod_temp": "",
                        "multiple-test-example_phone": "",
                        "multiple-test-example_phone_temp": "",
                        "multiple-test-example_returnStatus": "",
                        "multiple-test-example_returnStatusDate": "",
                        "multiple-test-example_returnStatusDate_temp": "",
                        "multiple-test-example_returnStatus_temp": "",
                        "multiple-test-example_reviewDetails": "",
                        "multiple-test-example_reviewDetails_temp": "",
                        "multiple-test-example_selected_index": "",
                        "multiple-test-example_taxTypeSubType": "",
                        "multiple-test-example_taxTypeSubType_temp": ""
                    };

                    assert.strictEqual(tableObj.selectedRows.length, 0, 'The dataStore reports 1 or more attribute equal to `true` at the row level of the dataStore.');

                    assert.strictEqual(tableObj.checkedInputCount, 0, 'The table contained 1 or more checked input when it should have been none');

                    assert.strictEqual(tableObj.checkedIndex, "", 'The tables hidden input _checked_index element has a value and it shouldnt.');

                    assert.deepEqual(tableObj.hiddenInputs, expectedHiddenInputs, 'The table hidden inputs do not match the expected hidden inputs values.');

                });
        },

        // Check the first row and then check to see if it was acturally checked
        'Multiple Select Table - Check via data-key row reference': function() {

            return this.remote
                .setFindTimeout(5000)
                // Clear the table by the declared page button
                .findById('multi-check-first-js-key')
                    .click()
                    .end()
                .execute(function() {

                    // Find the table and the viewWrapper around it
                    var table = document.querySelector('table#multiple-test-example');
                    var viewWrapper = table.parentElement;

                    // Ge the table datastore
                    var table = emp.reference.tables['multiple-test-example'];

                    var hiddenInputs = table.getHiddenInputValues();

                    var selectedRows = [];

                    // Loop through the dataStore looking for any rows with the selection property that is true
                    for (var i = 0, len = table.dataStore.body.rows.length; i < len; i++) {

                        if (table.dataStore.body.rows[i].selection && table.dataStore.body.rows[i].selection.checked) {

                            selectedRows.push(i);
                        }

                    }

                    var checkboxInputs = document.querySelectorAll('table#multiple-test-example tbody tr .table-control-col > input[type="checkbox"]');

                    var checkedInputCount = 0;

                    for (var j = 0, jLen = checkboxInputs.length; j < jLen; j++) {

                        if (checkboxInputs[j].checked) {

                            checkedInputCount += 1;
                        }

                    }

                    var checkedIndex = document.querySelector('input#multiple-test-example_checked_index').value;

                    return {
                        checkedIndex: checkedIndex,
                        checkedInputCount: checkedInputCount,
                        hiddenInputs: hiddenInputs,
                        selectedRows: selectedRows
                    }

                })
                .then(function(tableObj) {

                    var expectedHiddenInputs = {
                        "multiple-test-example_amount": "",
                        "multiple-test-example_amount_temp": "",
                        "multiple-test-example_auditOwnership": "",
                        "multiple-test-example_auditOwnership_temp": "",
                        "multiple-test-example_checked_index": "multi-test-0",
                        "multiple-test-example_hidden": "",
                        "multiple-test-example_hidden_temp": "",
                        "multiple-test-example_jointLiabilityPeriodExists": "",
                        "multiple-test-example_jointLiabilityPeriodExists_temp": "",
                        "multiple-test-example_liabilityPeriod": "",
                        "multiple-test-example_liabilityPeriod_temp": "",
                        "multiple-test-example_phone": "",
                        "multiple-test-example_phone_temp": "",
                        "multiple-test-example_returnStatus": "",
                        "multiple-test-example_returnStatusDate": "",
                        "multiple-test-example_returnStatusDate_temp": "",
                        "multiple-test-example_returnStatus_temp": "",
                        "multiple-test-example_reviewDetails": "",
                        "multiple-test-example_reviewDetails_temp": "",
                        "multiple-test-example_selected_index": "",
                        "multiple-test-example_taxTypeSubType": "",
                        "multiple-test-example_taxTypeSubType_temp": ""
                    };

                    assert.strictEqual(tableObj.selectedRows.length, 1, 'The dataStore reports either 0 or more than 1 selected attribute equal to `true` at the row level of the dataStore.');

                    assert.strictEqual(tableObj.checkedInputCount, 1, 'The table contained 0 or 2 or more checked input when it should only find 1');

                    assert.strictEqual(tableObj.checkedIndex, "multi-test-0", 'The tables hidden input _checked_index element has a value and it shouldnt.');

                    assert.deepEqual(tableObj.hiddenInputs, expectedHiddenInputs, 'The table hidden inputs do not match the expected hidden inputs values.');

                });
        },

        // Uncheck the first row and then check to see if the was acturally unchecked
        'Multiple Select Table - Uncheck via data-key row reference': function() {

            return this.remote
                .setFindTimeout(5000)
                // Clear the table by the declared page button
                .findById('multi-uncheck-first-js-key')
                    .click()
                    .end()
                .execute(function() {

                    // Find the table and the viewWrapper around it
                    var table = document.querySelector('table#multiple-test-example');
                    var viewWrapper = table.parentElement;

                    // Ge the table datastore
                    var table = emp.reference.tables['multiple-test-example'];

                    var hiddenInputs = table.getHiddenInputValues();

                    var selectedRows = [];

                    // Loop through the dataStore looking for any rows with the selection property that is true
                    for (var i = 0, len = table.dataStore.body.rows.length; i < len; i++) {

                        if (table.dataStore.body.rows[i].selection && table.dataStore.body.rows[i].selection.checked) {

                            selectedRows.push(i);
                        }

                    }

                    var checkboxInputs = document.querySelectorAll('table#multiple-test-example tbody tr .table-control-col > input[type="checkbox"]');

                    var checkedInputCount = 0;

                    for (var j = 0, jLen = checkboxInputs.length; j < jLen; j++) {

                        if (checkboxInputs[j].checked) {

                            checkedInputCount += 1;
                        }

                    }

                    var checkedIndex = document.querySelector('input#multiple-test-example_checked_index').value;

                    return {
                        checkedIndex: checkedIndex,
                        checkedInputCount: checkedInputCount,
                        hiddenInputs: hiddenInputs,
                        selectedRows: selectedRows
                    }

                })
                .then(function(tableObj) {

                    var expectedHiddenInputs = {
                        "multiple-test-example_amount": "",
                        "multiple-test-example_amount_temp": "",
                        "multiple-test-example_auditOwnership": "",
                        "multiple-test-example_auditOwnership_temp": "",
                        "multiple-test-example_checked_index": "",
                        "multiple-test-example_hidden": "",
                        "multiple-test-example_hidden_temp": "",
                        "multiple-test-example_jointLiabilityPeriodExists": "",
                        "multiple-test-example_jointLiabilityPeriodExists_temp": "",
                        "multiple-test-example_liabilityPeriod": "",
                        "multiple-test-example_liabilityPeriod_temp": "",
                        "multiple-test-example_phone": "",
                        "multiple-test-example_phone_temp": "",
                        "multiple-test-example_returnStatus": "",
                        "multiple-test-example_returnStatusDate": "",
                        "multiple-test-example_returnStatusDate_temp": "",
                        "multiple-test-example_returnStatus_temp": "",
                        "multiple-test-example_reviewDetails": "",
                        "multiple-test-example_reviewDetails_temp": "",
                        "multiple-test-example_selected_index": "",
                        "multiple-test-example_taxTypeSubType": "",
                        "multiple-test-example_taxTypeSubType_temp": ""
                    };

                    assert.strictEqual(tableObj.selectedRows.length, 0, 'The dataStore reports 1 or more attribute equal to `true` at the row level of the dataStore.');

                    assert.strictEqual(tableObj.checkedInputCount, 0, 'The table contained 1 or more checked input when it should have been none');

                    assert.strictEqual(tableObj.checkedIndex, "", 'The tables hidden input _checked_index element has a value and it shouldnt.');

                    assert.deepEqual(tableObj.hiddenInputs, expectedHiddenInputs, 'The table hidden inputs do not match the expected hidden inputs values.');

                });
        },

        'Multiple Select Table - Check All checkboxes': function() {

            return this.remote
                .setFindTimeout(5000)
                // Clear the table by the declared page button
                .findById('multi-check-all')
                    .click()
                    .end()
                    .sleep(500)
                .execute(function() {

                    // Ge the table datastore
                    var table = emp.reference.tables['multiple-test-example'];

                    var hiddenInputs = table.getHiddenInputValues();

                    var selectedRows = [];

                    // Loop through the dataStore looking for any rows with the selection property that is true
                    for (var i = 0, len = table.dataStore.body.rows.length; i < len; i++) {

                        if (table.dataStore.body.rows[i].selection && table.dataStore.body.rows[i].selection.checked) {

                            selectedRows.push(i);
                        }

                    }

                    var checkboxInputs = document.querySelectorAll('table#multiple-test-example tbody tr .table-control-col > input[type="checkbox"]');

                    var checkedInputCount = 0;

                    for (var j = 0, jLen = checkboxInputs.length; j < jLen; j++) {

                        if (checkboxInputs[j].checked) {

                            checkedInputCount += 1;
                        }

                    }

                    var checkedIndex = document.querySelector('input#multiple-test-example_checked_index').value;

                    var headerCheckboxInput = document.querySelector('table#multiple-test-example thead tr .table-control-col input[type="checkbox"]');

                    var headerCheckState = (headerCheckboxInput.checked) ? true : false;

                    return {
                        headerCheckState: headerCheckState,
                        checkedIndex: checkedIndex,
                        checkedInputCount: checkedInputCount,
                        hiddenInputs: hiddenInputs,
                        selectedRows: selectedRows
                    }

                })
                .then(function(tableObj) {

                    var expectedHiddenInputs = {
                        "multiple-test-example_amount": "",
                        "multiple-test-example_amount_temp": "",
                        "multiple-test-example_auditOwnership": "",
                        "multiple-test-example_auditOwnership_temp": "",
                        "multiple-test-example_checked_index": "multi-test-0,multi-test-1,multi-test-2,multi-test-3,multi-test-4,multi-test-5",
                        "multiple-test-example_hidden": "",
                        "multiple-test-example_hidden_temp": "",
                        "multiple-test-example_jointLiabilityPeriodExists": "",
                        "multiple-test-example_jointLiabilityPeriodExists_temp": "",
                        "multiple-test-example_liabilityPeriod": "",
                        "multiple-test-example_liabilityPeriod_temp": "",
                        "multiple-test-example_phone": "",
                        "multiple-test-example_phone_temp": "",
                        "multiple-test-example_returnStatus": "",
                        "multiple-test-example_returnStatusDate": "",
                        "multiple-test-example_returnStatusDate_temp": "",
                        "multiple-test-example_returnStatus_temp": "",
                        "multiple-test-example_reviewDetails": "",
                        "multiple-test-example_reviewDetails_temp": "",
                        "multiple-test-example_selected_index": "",
                        "multiple-test-example_taxTypeSubType": "",
                        "multiple-test-example_taxTypeSubType_temp": ""
                    };

                    assert.strictEqual(tableObj.headerCheckState, true, 'The header check all checkbox was not checked.');

                    assert.strictEqual(tableObj.selectedRows.length, 6, 'The dataStore reports 1 or more attribute equal to `true` at the row level of the dataStore.');

                    assert.strictEqual(tableObj.checkedInputCount, 6, 'The table contained 1 or more checked input when it should have been none');

                    assert.strictEqual(tableObj.checkedIndex, "multi-test-0,multi-test-1,multi-test-2,multi-test-3,multi-test-4,multi-test-5", 'The tables hidden input _checked_index element has a value and it shouldnt.');

                    assert.deepEqual(tableObj.hiddenInputs, expectedHiddenInputs, 'The table hidden inputs do not match the expected hidden inputs values.');

                });
        },

        // ===============================
        // SINGLE (RADIO) TABLE TESTS
        // ===============================

        // Check the first row and then check to see if it was acturally checked
        'Single Select Table - Checking for prechecked rows and hidden inputs': function() {

            return this.remote
                .setFindTimeout(5000)
                .execute(function() {

                    // Ge the table datastore
                    var table = emp.reference.tables['single-test-example'];

                    var hiddenInputs = table.getHiddenInputValues();

                    var selectedRows = [];

                    // Loop through the dataStore looking for any rows with the selection property that is true
                    for (var i = 0, len = table.dataStore.body.rows.length; i < len; i++) {

                        if (table.dataStore.body.rows[i].selection && table.dataStore.body.rows[i].selection.checked) {

                            selectedRows.push(i);
                        }

                    }

                    var checkboxInputs = document.querySelectorAll('table#single-test-example tbody tr .table-control-col > input[type="radio"]');

                    var checkedInputCount = 0;

                    for (var j = 0, jLen = checkboxInputs.length; j < jLen; j++) {

                        if (checkboxInputs[j].checked) {

                            checkedInputCount += 1;
                        }

                    }

                    var checkedIndex = document.querySelector('input#single-test-example_checked_index').value;

                    return {
                        selectedRows: selectedRows,
                        checkboxCount: checkboxInputs.length,
                        checkedInputCount: checkedInputCount,
                        checkedIndex: checkedIndex,
                        hiddenInputs: hiddenInputs
                    }
                })
                .then(function(tableObj) {

                    var expectedHiddenInputs = {
                        "single-test-example_amount": "2,500,000.99",
                        "single-test-example_amount_temp": "",
                        "single-test-example_auditOwnership": "AU",
                        "single-test-example_auditOwnership_temp": "",
                        "single-test-example_checked_index": "single-test-4",
                        "single-test-example_hiddenColumn": "4",
                        "single-test-example_hiddenColumn_temp": "",
                        "single-test-example_jointLiabilityPeriodExists": "J",
                        "single-test-example_jointLiabilityPeriodExists_temp": "",
                        "single-test-example_liabilityPeriod": "01/01/2015 - 12/31/2015",
                        "single-test-example_liabilityPeriod_temp": "",
                        "single-test-example_returnStatus": "Filed - Exception",
                        "single-test-example_returnStatusDate": "04/13/2015",
                        "single-test-example_returnStatusDate_temp": "",
                        "single-test-example_returnStatus_temp": "",
                        "single-test-example_reviewDetails": "",
                        "single-test-example_reviewDetails_temp": "",
                        "single-test-example_selected_index": "",
                        "single-test-example_score": "3000",
                        "single-test-example_score_temp": "",
                        "single-test-example_taxTypeSubType": "CORP - CT-3, 3S, CT-4",
                        "single-test-example_taxTypeSubType_temp": ""
                    };

                    assert.strictEqual(tableObj.selectedRows.length, 1, 'The dataStore reports one or more rows has a selected attribute equal to `true` at the row level.');

                    assert.strictEqual(tableObj.checkedInputCount, 1, 'The table contained a table row that had a checked checkbox when it shouldnt.');

                    assert.strictEqual(tableObj.checkedIndex, "single-test-4", 'The tables hidden input _checked_index element has a value and it shouldnt.');

                    assert.deepEqual(tableObj.hiddenInputs, expectedHiddenInputs, 'The table hidden inputs do not match the expected hidden inputs values.');
                });
        },

        // Test the extract value function that gets the new column values and copys the old to the _temp inputs
        'Single Select Table - Checking first row via jQuery to test extract new hidden values': function() {

            return this.remote
            //REMOVE DUE TO SELENUIMN ERROR: elemement is not clickable at (625, 458) another element will be click
/*              .setFindTimeout(5000)
                .findById('single-check-first-jquery')
                    .click()
                    .end()
                    .sleep(500) */
                .execute(function() {
                    
                    //get single-uncheck... button and simulate click event
                    var clickEvt = new Event('click');

                    document.querySelector('#single-check-first-jquery').dispatchEvent(clickEvt);

                    // Ge the table datastore
                    var table = emp.reference.tables['single-test-example'];

                    var hiddenInputs = table.getHiddenInputValues();

                    var selectedRows = [];

                    // Loop through the dataStore looking for any rows with the selection property that is true
                    for (var i = 0, len = table.dataStore.body.rows.length; i < len; i++) {

                        if (table.dataStore.body.rows[i].selection && table.dataStore.body.rows[i].selection.checked) {

                            selectedRows.push(i);
                        }

                    }

                    var checkboxInputs = document.querySelectorAll('table#single-test-example tbody tr .table-control-col > input[type="radio"]');

                    var checkedInputCount = 0;

                    for (var j = 0, jLen = checkboxInputs.length; j < jLen; j++) {

                        if (checkboxInputs[j].checked) {

                            checkedInputCount += 1;
                        }

                    }

                    var checkedIndex = document.querySelector('input#single-test-example_checked_index').value;

                    return {
                        selectedRows: selectedRows,
                        checkboxCount: checkboxInputs.length,
                        checkedInputCount: checkedInputCount,
                        checkedIndex: checkedIndex,
                        hiddenInputs: hiddenInputs
                    }
                })
                .then(function(tableObj) {

                    var expectedHiddenInputs = {
                        "single-test-example_amount": "1,750.00",
                        "single-test-example_amount_temp": "2,500,000.99",
                        "single-test-example_auditOwnership": "",
                        "single-test-example_auditOwnership_temp": "AU",
                        "single-test-example_checked_index": "single-test-0",
                        "single-test-example_hiddenColumn": "0",
                        "single-test-example_hiddenColumn_temp": "4",
                        "single-test-example_jointLiabilityPeriodExists": "J",
                        "single-test-example_jointLiabilityPeriodExists_temp": "J",
                        "single-test-example_liabilityPeriod": "01/01/2011 - 12/31/2011",
                        "single-test-example_liabilityPeriod_temp": "01/01/2015 - 12/31/2015",
                        "single-test-example_returnStatus": "Not filed",
                        "single-test-example_returnStatusDate": "04/15/2012",
                        "single-test-example_returnStatusDate_temp": "04/13/2015",
                        "single-test-example_returnStatus_temp": "Filed - Exception",
                        "single-test-example_reviewDetails": "",
                        "single-test-example_reviewDetails_temp": "",
                        "single-test-example_selected_index": "",
                        "single-test-example_score": "80",
                        "single-test-example_score_temp": "3000",
                        "single-test-example_taxTypeSubType": "CORP - CT-3, 3S, CT-4, 4S",
                        "single-test-example_taxTypeSubType_temp": "CORP - CT-3, 3S, CT-4"
                    };

                    assert.strictEqual(tableObj.selectedRows.length, 1, 'The dataStore reports one or more rows has a selected attribute equal to `true` at the row level.');

                    assert.strictEqual(tableObj.checkedInputCount, 1, 'The table contained a table row that had a checked checkbox when it shouldnt.');

                    assert.strictEqual(tableObj.checkedIndex, "single-test-0", 'The tables hidden input _checked_index element has a value and it shouldnt.');

                    assert.deepEqual(tableObj.hiddenInputs, expectedHiddenInputs, 'The table hidden inputs do not match the expected hidden inputs values.');
                });
        },

        // Test the extract value function properly clears out the current hidden input columns but preseves the last on uncheck function
        'Single Select Table - UnChecking first row via jQuery to test extract clear current fields': function() {

            return this.remote
            //REMOVE DUE TO SELENUIMN ERROR: elemement is not clickable at (625, 458) another element will be click
            /* .setFindTimeout(5000)
                .findById('single-uncheck-first-jquery')
                    .click()
                    .end()
                    .sleep(500) */
                .execute(function() {

                    //get single-uncheck... button and simulate click event
                    var clickEvt = new Event('click');

                    document.querySelector('#single-uncheck-first-jquery').dispatchEvent(clickEvt);

                    // Ge the table datastore
                    var table = emp.reference.tables['single-test-example'];

                    var hiddenInputs = table.getHiddenInputValues();

                    var selectedRows = [];

                    // Loop through the dataStore looking for any rows with the selection property that is true
                    for (var i = 0, len = table.dataStore.body.rows.length; i < len; i++) {

                        if (table.dataStore.body.rows[i].selection && table.dataStore.body.rows[i].selection.checked) {

                            selectedRows.push(i);
                        }

                    }

                    var checkboxInputs = document.querySelectorAll('table#single-test-example tbody tr .table-control-col > input[type="radio"]');

                    var checkedInputCount = 0;

                    for (var j = 0, jLen = checkboxInputs.length; j < jLen; j++) {

                        if (checkboxInputs[j].checked) {

                            checkedInputCount += 1;
                        }

                    }

                    var checkedIndex = document.querySelector('input#single-test-example_checked_index').value;

                    return {
                        selectedRows: selectedRows,
                        checkboxCount: checkboxInputs.length,
                        checkedInputCount: checkedInputCount,
                        checkedIndex: checkedIndex,
                        hiddenInputs: hiddenInputs
                    }
                })
                .then(function(tableObj) {

                    var expectedHiddenInputs = {
                        "single-test-example_amount": "",
                        "single-test-example_amount_temp": "1,750.00",
                        "single-test-example_auditOwnership": "",
                        "single-test-example_auditOwnership_temp": "",
                        "single-test-example_checked_index": "",
                        "single-test-example_hiddenColumn": "",
                        "single-test-example_hiddenColumn_temp": "0",
                        "single-test-example_jointLiabilityPeriodExists": "",
                        "single-test-example_jointLiabilityPeriodExists_temp": "J",
                        "single-test-example_liabilityPeriod": "",
                        "single-test-example_liabilityPeriod_temp": "01/01/2011 - 12/31/2011",
                        "single-test-example_returnStatus": "",
                        "single-test-example_returnStatusDate": "",
                        "single-test-example_returnStatusDate_temp": "04/15/2012",
                        "single-test-example_returnStatus_temp": "Not filed",
                        "single-test-example_reviewDetails": "",
                        "single-test-example_reviewDetails_temp": "",
                        "single-test-example_selected_index": "",
                        "single-test-example_score": "",
                        "single-test-example_score_temp": "80",
                        "single-test-example_taxTypeSubType": "",
                        "single-test-example_taxTypeSubType_temp": "CORP - CT-3, 3S, CT-4, 4S"
                    };

                    assert.strictEqual(tableObj.selectedRows.length, 0, 'The dataStore reports one or more rows has a selected attribute equal to `true` at the row level.');

                    assert.strictEqual(tableObj.checkedInputCount, 0, 'The table contained a table row that had a checked checkbox when it shouldnt.');

                    assert.strictEqual(tableObj.checkedIndex, "", 'The tables hidden input _checked_index element has a value and it shouldnt.');

                    assert.deepEqual(tableObj.hiddenInputs, expectedHiddenInputs, 'The table hidden inputs do not match the expected hidden inputs values.');
                });
        },

        // ===============================
        // SELECTIONLESS TABLE TESTS
        // ===============================

        'Selectionless Prechecked Table - Checked prechecked row and hidden inputs': function() {

            return this.remote
                .setFindTimeout(5000)
                .execute(function() {

                    // Ge the table datastore
                    var table = emp.reference.tables['edit-button-test'];

                    var hiddenInputs = table.getHiddenInputValues();

                    var selectedRows = [];

                    // Loop through the dataStore looking for any rows with the selection property that is true
                    for (var i = 0, len = table.dataStore.body.rows.length; i < len; i++) {

                        if (table.dataStore.body.rows[i].highlight) {

                            selectedRows.push(i);
                        }

                    }

                    var checkboxInputs = document.querySelectorAll('table#edit-button-test tbody tr .table-control-col > input[type="radio"]');

                    var checkedInputCount = 0;

                    for (var j = 0, jLen = checkboxInputs.length; j < jLen; j++) {

                        if (checkboxInputs[j].checked) {

                            checkedInputCount += 1;
                        }

                    }

                    var checkedIndex = document.querySelector('input#edit-button-test_checked_index').value;

                    return {
                        selectedRows: selectedRows,
                        checkboxCount: checkboxInputs.length,
                        checkedInputCount: checkedInputCount,
                        checkedIndex: checkedIndex,
                        hiddenInputs: hiddenInputs
                    }
                })
                .then(function(tableObj) {

                    var expectedHiddenInputs = {
                        "edit-button-test_amount": "125.00",
                        "edit-button-test_amount_temp": "",
                        "edit-button-test_auditOwnership": "",
                        "edit-button-test_auditOwnership_temp": "",
                        "edit-button-test_checked_index": "",
                        "edit-button-test_hiddenColumn1": "02",
                        "edit-button-test_hiddenColumn1_temp": "",
                        "edit-button-test_jointLiabilityPeriodExists": "J",
                        "edit-button-test_jointLiabilityPeriodExists_temp": "",
                        "edit-button-test_liabilityPeriod": "01/01/2012 - 12/31/2012",
                        "edit-button-test_liabilityPeriod_temp": "",
                        "edit-button-test_returnStatus": "Not filed",
                        "edit-button-test_returnStatusDate": "04/10/2013",
                        "edit-button-test_returnStatusDate_temp": "",
                        "edit-button-test_returnStatus_temp": "",
                        "edit-button-test_reviewDetails": "",
                        "edit-button-test_reviewDetails_temp": "",
                        "edit-button-test_selected_index": "edit-test-1",
                        "edit-button-test_score": "90",
                        "edit-button-test_score_temp": "",
                        "edit-button-test_taxTypeSubType": "CORP - CT-3, 3S, CT-4",
                        "edit-button-test_taxTypeSubType_temp": ""
                    };

                    assert.strictEqual(tableObj.selectedRows.length, 1, 'The dataStore reports one or more rows has a selected attribute equal to `true` at the row level.');

                    assert.strictEqual(tableObj.checkedInputCount, 0, 'The table contained a table row that had a checked checkbox when it shouldnt.');

                    assert.strictEqual(tableObj.checkedIndex, "", 'The tables hidden input _checked_index element has a value and it shouldnt.');

                    assert.deepEqual(tableObj.hiddenInputs, expectedHiddenInputs, 'The table hidden inputs do not match the expected hidden inputs values.');
                });
        },

        'Selectionless Prechecked Table - Set focus on the first row': function() {

            return this.remote
                .setFindTimeout(5000)
                //REMOVE DUE TO SELENUIM ERROR: element is not clickable at ... anther will be click
                /*.findById('set-focus-index-0')
                    .click()
                    .end()
                    .sleep(500) */
                .execute(function() {

                    //get set-focus-index-0 button and simulate click event
                    var clickEvt = new Event('click');

                    document.querySelector('#set-focus-index-0').dispatchEvent(clickEvt);

                    // Ge the table datastore
                    var table = emp.reference.tables['edit-button-test'];

                    var hiddenInputs = table.getHiddenInputValues();

                    var selectedRows = [];

                    // Loop through the dataStore looking for any rows with the selection property that is true
                    for (var i = 0, len = table.dataStore.body.rows.length; i < len; i++) {

                        if (table.dataStore.body.rows[i].highlight) {

                            selectedRows.push(i);
                        }

                    }

                    var checkboxInputs = document.querySelectorAll('table#edit-button-test tbody tr .table-control-col > input[type="radio"]');

                    var checkedInputCount = 0;

                    for (var j = 0, jLen = checkboxInputs.length; j < jLen; j++) {

                        if (checkboxInputs[j].checked) {

                            checkedInputCount += 1;
                        }

                    }

                    var checkedIndex = document.querySelector('input#edit-button-test_checked_index').value;

                    return {
                        selectedRows: selectedRows,
                        checkboxCount: checkboxInputs.length,
                        checkedInputCount: checkedInputCount,
                        checkedIndex: checkedIndex,
                        hiddenInputs: hiddenInputs
                    }
                })
                .then(function(tableObj) {

                    var expectedHiddenInputs = {
                        "edit-button-test_amount": "1,750.00",
                        "edit-button-test_amount_temp": "125.00",
                        "edit-button-test_auditOwnership": "",
                        "edit-button-test_auditOwnership_temp": "",
                        "edit-button-test_checked_index": "",
                        "edit-button-test_hiddenColumn1": "01",
                        "edit-button-test_hiddenColumn1_temp": "02",
                        "edit-button-test_jointLiabilityPeriodExists": "J",
                        "edit-button-test_jointLiabilityPeriodExists_temp": "J",
                        "edit-button-test_liabilityPeriod": "01/01/2011 - 12/31/2011",
                        "edit-button-test_liabilityPeriod_temp": "01/01/2012 - 12/31/2012",
                        "edit-button-test_returnStatus": "Not filed",
                        "edit-button-test_returnStatusDate": "04/15/2012",
                        "edit-button-test_returnStatusDate_temp": "04/10/2013",
                        "edit-button-test_returnStatus_temp": "Not filed",
                        "edit-button-test_reviewDetails": "",
                        "edit-button-test_reviewDetails_temp": "",
                        "edit-button-test_selected_index": "edit-test-0",
                        "edit-button-test_score": "80",
                        "edit-button-test_score_temp": "90",
                        "edit-button-test_taxTypeSubType": "CORP - CT-3, 3S, CT-4, 4S",
                        "edit-button-test_taxTypeSubType_temp": "CORP - CT-3, 3S, CT-4"
                    };

                    assert.strictEqual(tableObj.selectedRows.length, 1, 'The dataStore reports one or more rows has a selected attribute equal to `true` at the row level.');

                    assert.strictEqual(tableObj.checkedInputCount, 0, 'The table contained a table row that had a checked checkbox when it shouldnt.');

                    assert.strictEqual(tableObj.checkedIndex, "", 'The tables hidden input _checked_index element has a value and it shouldnt.');

                    assert.deepEqual(tableObj.hiddenInputs, expectedHiddenInputs, 'The table hidden inputs do not match the expected hidden inputs values.');
                });

        }

    });
});

