define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');

    registerSuite({
        name: 'col (grid)',

        'Rendered Full Width Column': function () {
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/render/pages/col.html'))
                .execute(function() {

                    var fullWidth = document.querySelector('#E_FULL_WIDTH');

                    var columnClass = fullWidth.getAttribute('class');

                    if (columnClass === "emp-col-full") {

                        return true;
                    }
                    else {

                        return false;
                    }
                })
                .then(function (fullClass) {

                    assert.strictEqual(fullClass, true, 'The full width column should have rendered with the empire class "emp-col-full');
                });
        },
        'Rendered Half Width Column': function () {
            return this.remote
                .execute(function() {

                    var halfWidth = document.querySelector('#E_HALF_WIDTH');


                    var columnClass = halfWidth.getAttribute('class');

                    if (columnClass === "emp-col-half") {

                        return true;
                    }
                    else {

                        return false;
                    }
                })
                .then(function (halfClass) {

                    assert.strictEqual(halfClass, true, 'The half width column should have rendered with the empire class "emp-col-half');
                });
        },
        'Rendered Push Half Width Column': function () {
            return this.remote
                .execute(function() {

                    var halfWidth = document.querySelector('#E_PUSH_HALF_WIDTH');


                    var columnClass = halfWidth.getAttribute('class');

                    if (columnClass === "emp-col-pull-half emp-col-half") {

                        return true;
                    }
                    else {

                        return false;
                    }
                })
                .then(function (halfClass) {

                    assert.strictEqual(halfClass, true, 'The half width column should have rendered with the empire class "emp-col-pull-half emp-col-half');
                });
        },
        'Rendered Three-Quarter Width Column': function () {
            return this.remote
                .execute(function() {

                    var threeQuartersWidth = document.querySelector('#E_THREE_QUARTERS_WIDTH');


                    var columnClass = threeQuartersWidth.getAttribute('class');

                    if (columnClass === "emp-col-three-quarters") {

                        return true;
                    }
                    else {

                        return false;
                    }
                })
                .then(function (threeQuartersClass) {

                    assert.strictEqual(threeQuartersClass, true, 'The half width column should have rendered with the empire class "emp-col-three-quarters');
                });
        },
        'Rendered Quarter Width Column': function () {
            return this.remote
                .execute(function() {

                    var querterWidth = document.querySelector('#E_QUARTERS_WIDTH');

                    var columnClass = querterWidth.getAttribute('class');

                    if (columnClass === "emp-col-quarter") {

                        return true;
                    }
                    else {

                        return false;
                    }
                })
                .then(function (quarterClass) {

                    assert.strictEqual(quarterClass, true, 'The quarter width column should have rendered with the empire class "emp-col-quarter');
                });
        },
        'Rendered Custom Width Column': function () {
            return this.remote
                .execute(function() {

                    var customWidth = document.querySelector('#E_CUSTOM_WIDTH');


                    var columnClass = customWidth.getAttribute('class');

                    if (columnClass === "cui-col-small-8") {

                        return true;
                    }
                    else {

                        return false;
                    }
                })
                .then(function (customClass) {

                    assert.strictEqual(customClass, true, 'The custom column was set to a size of 8, so it should have the Core UI grid class of "cui-col-small-8"');
                });
        },
    });
});

