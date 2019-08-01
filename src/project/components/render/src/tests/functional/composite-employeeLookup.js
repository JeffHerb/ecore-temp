define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');

    registerSuite({
        name: 'composite - employeeSearch',

        'Rendered Employee Search Composite Exists': function () {
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/render/pages/composite-employeeSearch.html'))
                .setFindTimeout(10000)
                .findById('E_STANDARD_EMPLOYEE_SEARCH');
        },

        'Check for all the Employee Search Components are in place.': function() {
            return this.remote
                .execute(function() {

                    var searchContainer = document.querySelector('#E_STANDARD_EMPLOYEE_SEARCH');

                    // Get ID Name Toggle Control
                    var nameIDSelect = document.querySelector('#employee-search-select');

                    // ID Inputs
                    var idInput = document.querySelector('#employee-search-id');

                    // Name Inputs
                    var fnameInput = document.querySelector('#employee-search-fname');
                    var mnameInput = document.querySelector('#employee-search-mname');
                    var lnameInput = document.querySelector('#employee-search-lname');

                    // Generic Submit button
                    var submit = document.querySelector('#E_STANDARD_EMPLOYEE_SEARCH button.cui-only-composite');

                    return {
                        select: (nameIDSelect !== null && nameIDSelect !== undefined) ? true : false,
                        idInput: (idInput !== null && idInput !== undefined) ? true : false,
                        fnameInput: (fnameInput !== null && fnameInput !== undefined) ? true : false,
                        mnameInput: (mnameInput !== null && mnameInput !== undefined) ? true : false,
                        lnameInput: (lnameInput !== null && lnameInput !== undefined) ? true : false,
                        submit: (submit !== null && submit !== undefined) ? true : false
                    };
                })
                .then(function (employeeSearch) {

                    // Check For the existance of the select toggle control
                    assert.strictEqual(employeeSearch.select, true, 'The selection control to toggle between ID and Name search did not render');

                    // ID Search Inputs
                    assert.strictEqual(employeeSearch.idInput, true, 'The employee id input did not render');

                    // Employee Search Inputs
                    assert.strictEqual(employeeSearch.fnameInput, true, 'The employee first name input did not render');
                    assert.strictEqual(employeeSearch.mnameInput, true, 'The employee middle name input did not render');
                    assert.strictEqual(employeeSearch.lnameInput, true, 'The employee last name input did not render');

                    // Search button control
                    assert.strictEqual(employeeSearch.submit, true, 'The generic employee search button did not render.');

                });
        },

        'Rendered Prefixed Employee Search Composite Exists': function () {
            return this.remote
                .setFindTimeout(10000)
                .findById('E_PREFIX_EMPLOYEE_SEARCH');
        },

        'Check for all the Prefix Employee Search Components are in place.': function() {
            return this.remote
                .execute(function() {

                    var searchContainer = document.querySelector('#E_PREFIX_EMPLOYEE_SEARCH');

                    // Get ID Name Toggle Control
                    var nameIDSelect = document.querySelector('#PREFIX-employee-search-select');

                    // ID Inputs
                    var idInput = document.querySelector('#PREFIX-employee-search-id');

                    // Name Inputs
                    var fnameInput = document.querySelector('#PREFIX-employee-search-fname');
                    var mnameInput = document.querySelector('#PREFIX-employee-search-mname');
                    var lnameInput = document.querySelector('#PREFIX-employee-search-lname');

                    // Generic Submit button
                    var submit = document.querySelector('#E_PREFIX_EMPLOYEE_SEARCH button.cui-only-composite');

                    return {
                        select: (nameIDSelect !== null && nameIDSelect !== undefined) ? true : false,
                        idInput: (idInput !== null && idInput !== undefined) ? true : false,
                        fnameInput: (fnameInput !== null && fnameInput !== undefined) ? true : false,
                        mnameInput: (mnameInput !== null && mnameInput !== undefined) ? true : false,
                        lnameInput: (lnameInput !== null && lnameInput !== undefined) ? true : false,
                        submit: (submit !== null && submit !== undefined) ? true : false
                    };
                })
                .then(function (employeeSearch) {

                    // Check For the existance of the select toggle control
                    assert.strictEqual(employeeSearch.select, true, 'The selection control to toggle between ID and Name search did not render');

                    // ID Search Inputs
                    assert.strictEqual(employeeSearch.idInput, true, 'The employee id input did not render');

                    // Employee Search Inputs
                    assert.strictEqual(employeeSearch.fnameInput, true, 'The employee first name input did not render');
                    assert.strictEqual(employeeSearch.mnameInput, true, 'The employee middle name input did not render');
                    assert.strictEqual(employeeSearch.lnameInput, true, 'The employee last name input did not render');

                    // Search button control
                    assert.strictEqual(employeeSearch.submit, true, 'The generic employee search button did not render.');

                });
        },

    });
});

