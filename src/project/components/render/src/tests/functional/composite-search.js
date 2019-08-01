define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');

    registerSuite({
        name: 'composite - search',

        'Rendered Search Composite': function() {
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/render/pages/composite-search.html'))
                .execute(function() {

                    // Find the source container
                    var searchContainer = document.querySelector('#E_STANDARD_SEARCH_COMPOSITE');

                    var searchContainerClasses = (searchContainer.getAttribute('class').indexOf('emp-composite') !== -1 && searchContainer.getAttribute('class').indexOf('emp-search-composite') !== -1 ) ? true: false;

                    // Find the individual components
                    var label = searchContainer.querySelectorAll('.cui-label label');
                    var text = searchContainer.querySelectorAll('.cui-data text');
                    var button = searchContainer.querySelectorAll('.cui-data button');

                    // Get the cui-data wrapper
                    var cuiDataWrapper = searchContainer.querySelector('.cui-data');

                    // Check to see if the cui-data has the additional emp-search class
                    var searchWrapperClass = (cuiDataWrapper.getAttribute('class').indexOf('emp-search') !== -1) ? true: false;

                    // Verify we have 2 .emp-fields containers inside of the cui-data block
                    var inputWrappers = searchContainer.querySelectorAll('.cui-data .emp-field');

                    return {
                        searchContainer: searchContainer,
                        searchContainerClasses: searchContainerClasses,
                        label: (label[0] !== null) ? true : false,
                        text: (text[0] !== null) ? true : false,
                        button: (button[0] !== null) ? true : false,
                        searchWrapperClass: searchWrapperClass,
                        inputWrappers: inputWrappers
                    }
                })
                .then(function (searchComp) {

                    // Check to see if the label, text and button all rendered
                    assert.strictEqual(searchComp.label, true, 'The search composite label did not render');
                    assert.strictEqual(searchComp.text, true, 'The search composite text input did not render');
                    assert.strictEqual(searchComp.button, true, 'The search composite button input did not render');

                    // Check that the search container has the proper classes
                    assert.strictEqual(searchComp.searchContainerClasses, true, 'The search composite container did not have either "emp-composite" or "emp-search-composite" or both.');

                    // Check that the search wrapper class is on the div.cui-data
                    assert.strictEqual(searchComp.searchWrapperClass, true, 'The search composite cui-data wrapper did not have the additional class ".emp-search"');

                    // Check to see if we have two elements with the id of emp-field, these should be the input and button, so we should always have 2
                    assert.strictEqual(searchComp.inputWrappers.length, 2, 'The search composite text input, button or both did not render wrapped inside of a "div.emp-field"');

                });
        },

        'Rendered ReadOnly Search Composite': function() {
            return this.remote
                .execute(function() {

                    // Find the source container
                    var searchContainer = document.querySelector('#E_READONLY_SEARCH_COMPOSITE');

                    var searchContainerClasses = (searchContainer.getAttribute('class').indexOf('emp-composite') !== -1 && searchContainer.getAttribute('class').indexOf('emp-search-composite') !== -1 ) ? true: false;

                    // Find the individual components
                    var label = searchContainer.querySelectorAll('.cui-label label');
                    var text = searchContainer.querySelectorAll('.cui-data span');
                    var button = searchContainer.querySelectorAll('.cui-data button');

                    //var textTag = text[0].tageName;

                    // Get the cui-data wrapper
                    var cuiDataWrapper = searchContainer.querySelector('.cui-data');

                    // Check to see if the cui-data has the additional emp-search class
                    var searchWrapperClass = (cuiDataWrapper.getAttribute('class').indexOf('emp-search') !== -1) ? true: false;

                    // Verify we have 2 .emp-fields containers inside of the cui-data block
                    var inputWrappers = searchContainer.querySelectorAll('.cui-data .emp-field');

                    return {
                        searchContainer: searchContainer,
                        searchContainerClasses: searchContainerClasses,
                        label: (label[0] !== null && label[0] !== "null") ? true : false,
                        text: (text[0] !== null && text[0] !== "null") ? true : false,
                        textTag: text[0].tagName,
                        button: (button[0] !== null && button[0] !== "null") ? true : false,
                        searchWrapperClass: searchWrapperClass,
                        inputWrappers: inputWrappers
                    }
                })
                .then(function (searchComp) {

                    // Check to see if the label, text and button all rendered
                    assert.strictEqual(searchComp.label, true, 'The search composite label did not render');
                    assert.strictEqual(searchComp.text, true, 'The search composite text input did not render');
                    assert.strictEqual(searchComp.button, true, 'The search composite button input did not render');

                    // Check that the search container has the proper classes
                    assert.strictEqual(searchComp.searchContainerClasses, true, 'The search composite container did not have either "emp-composite" or "emp-search-composite" or both.');

                    // Check that the search wrapper class is on the div.cui-data
                    assert.strictEqual(searchComp.searchWrapperClass, true, 'The search composite cui-data wrapper did not have the additional class ".emp-search"');

                    // Check to see if we have two elements with the id of emp-field, these should be the input and button, so we should always have 2
                    assert.strictEqual(searchComp.inputWrappers.length, 2, 'The search composite text input, button or both did not render wrapped inside of a "div.emp-field"');

                    // Additional Check to make sure the readonly item is a span (this could be a paragraph {p} if the readonly was a textarea)
                    assert.strictEqual(searchComp.textTag, "SPAN", 'The search composite text input, should have rendered as a SPAN tag.');

                });
        },

        'Rendered Required Search Composite': function() {
            return this.remote
                .execute(function() {

                    // Find the source container
                    var searchContainer = document.querySelector('#E_REQUIRED_SEARCH_COMPOSITE');

                    var searchContainerClasses = (searchContainer.getAttribute('class').indexOf('emp-composite') !== -1 && searchContainer.getAttribute('class').indexOf('emp-search-composite') !== -1 ) ? true: false;

                    // Find the individual components
                    var label = searchContainer.querySelectorAll('.cui-label label');
                    var text = searchContainer.querySelectorAll('.cui-data text');
                    var button = searchContainer.querySelectorAll('.cui-data button');

                    // Get the cui-data wrapper
                    var cuiDataWrapper = searchContainer.querySelector('.cui-data');

                    // Check to see if the cui-data has the additional emp-search class
                    var searchWrapperClass = (cuiDataWrapper.getAttribute('class').indexOf('emp-search') !== -1) ? true: false;

                    // Verify we have 2 .emp-fields containers inside of the cui-data block
                    var inputWrappers = searchContainer.querySelectorAll('.cui-data .emp-field');

                    // Verify that additional reqired class was also added.
                    var requiredClass = (searchContainer.getAttribute('class').indexOf('cui-required') !== -1) ? true : false;

                    return {
                        searchContainer: searchContainer,
                        searchContainerClasses: searchContainerClasses,
                        label: (label[0] !== null) ? true : false,
                        text: (text[0] !== null) ? true : false,
                        button: (button[0] !== null) ? true : false,
                        searchWrapperClass: searchWrapperClass,
                        inputWrappers: inputWrappers,
                        requiredClass: requiredClass
                    }
                })
                .then(function (searchComp) {

                    // Check to see if the label, text and button all rendered
                    assert.strictEqual(searchComp.label, true, 'The search composite label did not render');
                    assert.strictEqual(searchComp.text, true, 'The search composite text input did not render');
                    assert.strictEqual(searchComp.button, true, 'The search composite button input did not render');

                    // Check that the search container has the proper classes
                    assert.strictEqual(searchComp.searchContainerClasses, true, 'The search composite container did not have either "emp-composite" or "emp-search-composite" or both.');

                    // Check that the search wrapper class is on the div.cui-data
                    assert.strictEqual(searchComp.searchWrapperClass, true, 'The search composite cui-data wrapper did not have the additional class ".emp-search"');

                    // Check to see if we have two elements with the id of emp-field, these should be the input and button, so we should always have 2
                    assert.strictEqual(searchComp.inputWrappers.length, 2, 'The search composite text input, button or both did not render wrapped inside of a "div.emp-field"');

                    // Check that the search wrapper class is on the div.cui-data
                    assert.strictEqual(searchComp.requiredClass, true, 'The search composite has the additional root class ".cui-required"');

                });
        },

        'Rendered Hide Label Search Composite': function() {
            return this.remote
                .execute(function() {

                    // Find the source container
                    var searchContainer = document.querySelector('#E_HIDDEN_LABEL_SEARCH_COMPOSITE');

                    var searchContainerClasses = (searchContainer.getAttribute('class').indexOf('emp-composite') !== -1 && searchContainer.getAttribute('class').indexOf('emp-search-composite') !== -1 ) ? true: false;

                    // Find the individual components
                    var label = searchContainer.querySelectorAll('.cui-label label');
                    var text = searchContainer.querySelectorAll('.cui-data text');
                    var button = searchContainer.querySelectorAll('.cui-data button');

                    // Get the cui-data wrapper
                    var cuiDataWrapper = searchContainer.querySelector('.cui-data');

                    var cuiLabelWrapper = searchContainer.querySelector('.cui-label');

                    // Check to see if the cui-data has the additional emp-search class
                    var searchWrapperClass = (cuiDataWrapper.getAttribute('class').indexOf('emp-search') !== -1) ? true: false;

                    // Verify we have 2 .emp-fields containers inside of the cui-data block
                    var inputWrappers = searchContainer.querySelectorAll('.cui-data .emp-field');

                    // Verify that additional reqired class was also added.
                    var hideLabelClass = (cuiLabelWrapper.getAttribute('class').indexOf('emp-hide-label-with-space') !== -1) ? true : false;

                    return {
                        searchContainer: searchContainer,
                        searchContainerClasses: searchContainerClasses,
                        label: (label[0] !== null) ? true : false,
                        text: (text[0] !== null) ? true : false,
                        button: (button[0] !== null) ? true : false,
                        searchWrapperClass: searchWrapperClass,
                        inputWrappers: inputWrappers,
                        hideLabelClass: hideLabelClass
                    }
                })
                .then(function (searchComp) {

                    // Check to see if the label, text and button all rendered
                    assert.strictEqual(searchComp.label, true, 'The search composite label did not render');
                    assert.strictEqual(searchComp.text, true, 'The search composite text input did not render');
                    assert.strictEqual(searchComp.button, true, 'The search composite button input did not render');

                    // Check that the search container has the proper classes
                    assert.strictEqual(searchComp.searchContainerClasses, true, 'The search composite container did not have either "emp-composite" or "emp-search-composite" or both.');

                    // Check that the search wrapper class is on the div.cui-data
                    assert.strictEqual(searchComp.searchWrapperClass, true, 'The search composite cui-data wrapper did not have the additional class ".emp-search"');

                    // Check to see if we have two elements with the id of emp-field, these should be the input and button, so we should always have 2
                    assert.strictEqual(searchComp.inputWrappers.length, 2, 'The search composite text input, button or both did not render wrapped inside of a "div.emp-field"');

                    // Check that the search wrapper class is on the div.cui-data
                    assert.strictEqual(searchComp.hideLabelClass, true, 'The search composite has the additional root class ".emp-hide-label-with-space"');

                });
        },

        'Rendered Hide Label No Space Search Composite': function() {
            return this.remote
                .execute(function() {

                    // Find the source container
                    var searchContainer = document.querySelector('#E_HIDDEN_LABEL_NO_SPACE_SEARCH_COMPOSITE');

                    var searchContainerClasses = (searchContainer.getAttribute('class').indexOf('emp-composite') !== -1 && searchContainer.getAttribute('class').indexOf('emp-search-composite') !== -1 ) ? true: false;

                    // Find the individual components
                    var label = searchContainer.querySelectorAll('label');
                    var text = searchContainer.querySelectorAll('.cui-data text');
                    var button = searchContainer.querySelectorAll('.cui-data button');

                    // Get the cui-data wrapper
                    var cuiDataWrapper = searchContainer.querySelector('.cui-data');

                    var cuiLabelWrapper = searchContainer.querySelector('.cui-label');

                    // Check to see if the cui-data has the additional emp-search class
                    var searchWrapperClass = (cuiDataWrapper.getAttribute('class').indexOf('emp-search') !== -1) ? true: false;

                    // Verify we have 2 .emp-fields containers inside of the cui-data block
                    var inputWrappers = searchContainer.querySelectorAll('.cui-data .emp-field');

                    // Verify that additional reqired class was also added.
                    var hideLabelClass = (label[0].getAttribute('class').indexOf('cui-hide-from-screen') !== -1) ? true : false;

                    return {
                        searchContainer: searchContainer,
                        searchContainerClasses: searchContainerClasses,
                        label: (label[0] !== null) ? true : false,
                        text: (text[0] !== null) ? true : false,
                        button: (button[0] !== null) ? true : false,
                        searchWrapperClass: searchWrapperClass,
                        inputWrappers: inputWrappers,
                        labelWrapper: cuiLabelWrapper,
                        hideLabelClass: hideLabelClass
                    }
                })
                .then(function (searchComp) {

                    // Check to see if the label, text and button all rendered
                    assert.strictEqual(searchComp.label, true, 'The search composite label did not render');
                    assert.strictEqual(searchComp.text, true, 'The search composite text input did not render');
                    assert.strictEqual(searchComp.button, true, 'The search composite button input did not render');

                    // Check that the search container has the proper classes
                    assert.strictEqual(searchComp.searchContainerClasses, true, 'The search composite container did not have either "emp-composite" or "emp-search-composite" or both.');

                    // Check that the search wrapper class is on the div.cui-data
                    assert.strictEqual(searchComp.searchWrapperClass, true, 'The search composite cui-data wrapper did not have the additional class ".emp-search"');

                    // Check to see if we have two elements with the id of emp-field, these should be the input and button, so we should always have 2
                    assert.strictEqual(searchComp.inputWrappers.length, 2, 'The search composite text input, button or both did not render wrapped inside of a "div.emp-field"');

                    // Check to see if label wrapper does not exist
                    assert.strictEqual(searchComp.labelWrapper, null, 'The label wrapper "div.cui-label" does not exist');

                    // Check that the label still has the class that hides the text.
                    assert.strictEqual(searchComp.hideLabelClass, true, 'The search composite has the additional label container class ".cui-hide-from-screen"');

                });
        },

        'Rendered Error Search Composite': function() {
            return this.remote
                .execute(function() {

                    // Find the source container
                    var searchContainer = document.querySelector('#E_ERROR_SEARCH_COMPOSITE');

                    var searchContainerClasses = (searchContainer.getAttribute('class').indexOf('emp-composite') !== -1 && searchContainer.getAttribute('class').indexOf('emp-search-composite') !== -1 ) ? true: false;

                    // Find the individual components
                    var label = searchContainer.querySelectorAll('.cui-label label');
                    var text = searchContainer.querySelectorAll('.cui-data text');
                    var button = searchContainer.querySelectorAll('.cui-data button');

                    // Get the cui-data wrapper
                    var cuiDataWrapper = searchContainer.querySelector('.cui-data');

                    var cuiLabelWrapper = searchContainer.querySelector('.cui-label');

                    // Check to see if the cui-data has the additional emp-search class
                    var searchWrapperClass = (cuiDataWrapper.getAttribute('class').indexOf('emp-search') !== -1) ? true: false;

                    // Verify we have 2 .emp-fields containers inside of the cui-data block
                    var inputWrappers = searchContainer.querySelectorAll('.cui-data .emp-field');

                    // Verify that additional reqired class was also added.
                    var requiredClass = (searchContainer.getAttribute('class').indexOf('cui-required') !== -1) ? true : false;

                    // Verify that the additional error validation class exists.
                    var errorClass = (searchContainer.getAttribute('class').indexOf('emp-validation-error') !== -1) ? true : false;

                    var errorContainer = searchContainer.querySelectorAll('.emp-composite-message');

                    return {
                        searchContainer: searchContainer,
                        searchContainerClasses: searchContainerClasses,
                        label: (label[0] !== null) ? true : false,
                        text: (text[0] !== null) ? true : false,
                        button: (button[0] !== null) ? true : false,
                        searchWrapperClass: searchWrapperClass,
                        inputWrappers: inputWrappers,
                        requiredClass: requiredClass,
                        errorClass: errorClass,
                        errorContainer: (errorContainer[0] !== null) ? true : false
                    }
                })
                .then(function (searchComp) {

                    // Check to see if the label, text and button all rendered
                    assert.strictEqual(searchComp.label, true, 'The search composite label did not render');
                    assert.strictEqual(searchComp.text, true, 'The search composite text input did not render');
                    assert.strictEqual(searchComp.button, true, 'The search composite button input did not render');

                    // Check that the search container has the proper classes
                    assert.strictEqual(searchComp.searchContainerClasses, true, 'The search composite container did not have either "emp-composite" or "emp-search-composite" or both.');

                    // Check that the search wrapper class is on the div.cui-data
                    assert.strictEqual(searchComp.searchWrapperClass, true, 'The search composite cui-data wrapper did not have the additional class ".emp-search"');

                    // Check to see if we have two elements with the id of emp-field, these should be the input and button, so we should always have 2
                    assert.strictEqual(searchComp.inputWrappers.length, 2, 'The search composite text input, button or both did not render wrapped inside of a "div.emp-field"');

                    // Check to see if we have two elements with the id of emp-field, these should be the input and button, so we should always have 2
                    assert.strictEqual(searchComp.requiredClass, true, 'The search composite does not have additional class of ".cui-required" on the root of the composite');

                    // Check to see if we have two elements with the id of emp-field, these should be the input and button, so we should always have 2
                    assert.strictEqual(searchComp.errorClass, true, 'The search composite does not have additional class of ".emp-validation-error" on the root of the composite');

                    assert.strictEqual(searchComp.errorContainer, true, 'The search composite error container did not render');

                });
        },

        'Rendered Federal Search Composite': function() {
            return this.remote
                .execute(function() {

                    // Find the source container
                    var searchContainer = document.querySelector('#E_FEDERAL_SEARCH_COMPOSITE');

                    var searchContainerClasses = (searchContainer.getAttribute('class').indexOf('emp-composite') !== -1 && searchContainer.getAttribute('class').indexOf('emp-search-composite') !== -1 ) ? true: false;

                    // Find the individual components
                    var label = searchContainer.querySelectorAll('.cui-label label');
                    var text = searchContainer.querySelectorAll('.cui-data text');
                    var button = searchContainer.querySelectorAll('.cui-data button');

                    // Get the cui-data wrapper
                    var cuiDataWrapper = searchContainer.querySelector('.cui-data');

                    // Check to see if the cui-data has the additional emp-search class
                    var searchWrapperClass = (cuiDataWrapper.getAttribute('class').indexOf('emp-search') !== -1) ? true: false;

                    // Verify we have 2 .emp-fields containers inside of the cui-data block
                    var inputWrappers = searchContainer.querySelectorAll('.cui-data .emp-field');

                    // Verify that additional reqired class was also added.
                    var federalClass = (searchContainer.getAttribute('class').indexOf('emp-federal-data') !== -1) ? true : false;

                    return {
                        searchContainer: searchContainer,
                        searchContainerClasses: searchContainerClasses,
                        label: (label[0] !== null) ? true : false,
                        text: (text[0] !== null) ? true : false,
                        button: (button[0] !== null) ? true : false,
                        searchWrapperClass: searchWrapperClass,
                        inputWrappers: inputWrappers,
                        federalClass: federalClass
                    }
                })
                .then(function (searchComp) {

                    // Check to see if the label, text and button all rendered
                    assert.strictEqual(searchComp.label, true, 'The search composite label did not render');
                    assert.strictEqual(searchComp.text, true, 'The search composite text input did not render');
                    assert.strictEqual(searchComp.button, true, 'The search composite button input did not render');

                    // Check that the search container has the proper classes
                    assert.strictEqual(searchComp.searchContainerClasses, true, 'The search composite container did not have either "emp-composite" or "emp-search-composite" or both.');

                    // Check that the search wrapper class is on the div.cui-data
                    assert.strictEqual(searchComp.searchWrapperClass, true, 'The search composite cui-data wrapper did not have the additional class ".emp-search"');

                    // Check to see if we have two elements with the id of emp-field, these should be the input and button, so we should always have 2
                    assert.strictEqual(searchComp.inputWrappers.length, 2, 'The search composite text input, button or both did not render wrapped inside of a "div.emp-field"');

                    // Check that the search wrapper class is on the div.cui-data
                    assert.strictEqual(searchComp.federalClass, true, 'The search composite has the additional root class ".emp-federal-data"');

                });
        },

    });
});

