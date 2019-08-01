define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');

    registerSuite({
        name: 'group',

        'Rendered Group/Section': function () {
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/render/pages/group.html'))
                .execute(function() {

                    var section = document.querySelector('#E_TEST_GROUP');

                    var tagName = (section) ? section.tagName : false;

                    return {
                        exists: (section)? true : false,
                        tagName: tagName
                    }

                })
                .then(function(groupObj) {

                    assert.strictEqual(groupObj.exists, true, 'Section failed to be rendered by the render.');
                    assert.strictEqual(groupObj.tagName, 'SECTION', 'Section should render as a `section` html tag');

                })
        },
        'Rendered Nested Group/Section Exists': function () {
            return this.remote
                .execute(function() {

                    var nestedSection = document.querySelector('#E_TEST_NESTED_GROUP');

                    var wrapper = nestedSection.parentElement;

                    var wrapperClasses = (wrapper.getAttribute('class').indexOf('emp-section-in-section-container') !== -1) ? true : false;

                    return {
                        wrapperTag:  wrapper.tagName,
                        wrapperClass: wrapperClasses
                    }

                })
                .then(function(groupObj) {

                    assert.strictEqual(groupObj.wrapperTag, 'DIV', 'Section should be found inside of a div wrapper element, but was found in: ' + groupObj.wrapperTag);
                    assert.strictEqual(groupObj.wrapperClass, true, 'Sections nested in sections should be wrapperd in a special div with the class of "emp-section-in-section-container", this was not found.');

                })
        },
        'Rendered Print Only Message for Federal Sections (no header)': function() {

            return this.remote
                .execute(function() {

                    var federalSection = document.querySelector('#E_FEDERAL_TEST');

                    var federalMessage = federalSection.childNodes[0];

                    var federalClass = (federalMessage.getAttribute('class').indexOf('emp-federal-print-message') !== -1) ? true : false;

                    return {
                        federalClass: federalClass
                    }

                })
                .then(function(groupObj) {

                    assert.strictEqual(groupObj.federalClass, true, 'Sections first child element should have been a div with the class of `emp-federal-print-message`');

                })

        },
        'Rendered Print Only Message for Federal Sections (with header)': function() {

            return this.remote
                .execute(function() {

                    var federalSection = document.querySelector('#E_FEDERAL_TEST_WITH_HEADER');

                    var federalMessage = federalSection.childNodes[1];

                    var federalClass = (federalMessage.getAttribute('class').indexOf('emp-federal-print-message') !== -1) ? true : false;

                    return {
                        federalClass: federalClass
                    }

                })
                .then(function(groupObj) {

                    assert.strictEqual(groupObj.federalClass, true, 'Sections second child (first after header) element should have been a div with the class of `emp-federal-print-message`');

                })

        }
    });
});
