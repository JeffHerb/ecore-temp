define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');

    registerSuite({
        name: 'table',

        'Rendered Standard Table only contains 5 columns': function () {
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/render/pages/table.html'))
                .setFindTimeout(10000)
                .findById('E_STANDARD_TABLE')
                .execute(function() {

                    var thead = document.querySelectorAll('#E_STANDARD_TABLE thead th');
                    var tbody = document.querySelectorAll('#E_STANDARD_TABLE tbody td');

                    return {
                        thead: thead,
                        tbody: tbody
                    };
                }).
                then(function (tableObj) {

                    assert.strictEqual(tableObj.thead.length, 5,'Standard table should render 5 TH in the THEAD.');
                    assert.strictEqual(tableObj.tbody.length, 5,'Standard table should redner 5 TD in the TBODY.');

                });
        },
        'Rendered Standard Selection (Checkbox) Table': function () {
            return this.remote
                .execute(function() {

                    var table = document.querySelector('#E_STANDARD_CHECKBOX_SELECT');

                    var selectClass = (table.getAttribute('class').indexOf('emp-table-selectable') !== -1) ? true : false;

                    var thead = document.querySelectorAll('#E_STANDARD_CHECKBOX_SELECT thead th');
                    var tbody = document.querySelectorAll('#E_STANDARD_CHECKBOX_SELECT tbody td');
                    var checkbox = document.querySelectorAll('#E_STANDARD_CHECKBOX_SELECT tbody td input');

                    return {
                        thead: thead,
                        tbody: tbody,
                        checkbox: checkbox,
                        type: checkbox[0].getAttribute("type"),
                        class: selectClass
                    };
                }).
                then(function (tableObj) {

                    // Reverify the 6th column does exist as it should
                    assert.strictEqual(tableObj.thead.length, 6,'Standard table should render 6 TH in the THEAD.');
                    assert.strictEqual(tableObj.tbody.length, 6,'Standard table should redner 6 TD in the TBODY.');
                    assert.strictEqual(tableObj.type, 'checkbox','Standard Checkbox table should include a body input with the type of checkbox.');
                    assert.strictEqual(tableObj.class, true, 'Standard Checkbox table does not include include the selection class "emp-table-selectable".');

                });
        },
        'Rendered Standard Selection All (Checkbox) Table': function () {
            return this.remote
                .execute(function() {

                    var table = document.querySelector('#E_STANDARD_CHECKBOX_SELECT_ALL');

                    var selectClass = (table.getAttribute('class').indexOf('emp-table-selectable') !== -1) ? true : false;

                    var thead = document.querySelectorAll('#E_STANDARD_CHECKBOX_SELECT_ALL thead th');
                    var tbody = document.querySelectorAll('#E_STANDARD_CHECKBOX_SELECT_ALL tbody td');
                    var checkbox = document.querySelectorAll('#E_STANDARD_CHECKBOX_SELECT_ALL tbody td input');
                    var selectAllBox = document.querySelectorAll('#E_STANDARD_CHECKBOX_SELECT_ALL thead th input');

                    // Check for selectable table class
                    //var selectableClass = (table.getAttribute('class').indexOf('emp-table-selectable') !== -1) ? true : false;

                    return {
                        thead: thead,
                        tbody: tbody,
                        checkbox: checkbox,
                        checkboxtype: checkbox[0].getAttribute("type"),
                        selectAll: selectAllBox,
                        selectAlltype: selectAllBox[0].getAttribute("type"),
                        class: selectClass
                    };
                }).
                then(function (tableObj) {

                    // Reverify the 6th column does exist as it should
                    assert.strictEqual(tableObj.thead.length, 6,'Standard table should render 6 TH in the THEAD.');
                    assert.strictEqual(tableObj.tbody.length, 6,'Standard table should redner 6 TD in the TBODY.');
                    assert.strictEqual(tableObj.checkboxtype, 'checkbox','Standard Checkbox All table should include a body input with the type of checkbox.');
                    assert.strictEqual(tableObj.selectAlltype, 'checkbox','Standard Checkbox All table should include a body input with the type of checkbox.');
                    assert.strictEqual(tableObj.class, true, 'Standard Checkbox All table does not include include the selection class "emp-table-selectable".');

                });
        },
        'Rendered Standard Selection (Radio) Table': function () {
            return this.remote
                .execute(function() {

                    var table = document.querySelector('#E_STANDARD_RADIO_SELECT');

                    var selectClass = (table.getAttribute('class').indexOf('emp-table-selectable') !== -1) ? true : false;

                    var thead = document.querySelectorAll('#E_STANDARD_RADIO_SELECT thead th');
                    var tbody = document.querySelectorAll('#E_STANDARD_RADIO_SELECT tbody td');
                    var radio = document.querySelectorAll('#E_STANDARD_RADIO_SELECT tbody td input');

                    // Check for selectable table class
                    //var selectableClass = (table.getAttribute('class').indexOf('emp-table-selectable') !== -1) ? true : false;

                    return {
                        thead: thead,
                        tbody: tbody,
                        checkbox: radio,
                        type: radio[0].getAttribute("type"),
                        class: selectClass
                    };
                }).
                then(function (tableObj) {

                    // Reverify the 6th column does exist as it should
                    assert.strictEqual(tableObj.thead.length, 6,'Standard table should render 6 TH in the THEAD.');
                    assert.strictEqual(tableObj.tbody.length, 6,'Standard table should redner 6 TD in the TBODY.');
                    assert.strictEqual(tableObj.type, 'radio','Standard Radio table should include a body input with the type of radio.');
                    assert.strictEqual(tableObj.class, true, 'Standard Radio table does not include include the selection class "emp-table-selectable".');

                });
        },
        'Rendered Empty Table': function () {
            return this.remote
                .execute(function() {

                    var textProperty = 'textContent' in document ? 'textContent' : 'innerText';

                    var thead = document.querySelectorAll('#EMPTY_TABLE thead th');
                    var tbody = document.querySelectorAll('#EMPTY_TABLE tbody td');
                    var td = document.querySelector('#EMPTY_TABLE tbody td');
                    var tdText = td[textProperty].trim();

                    return {
                        thead: thead,
                        tbody: tbody,
                        cell: td,
                        cellColSpan: td.getAttribute("colspan"),
                        cellText: tdText
                    };
                }).
                then(function (tableObj) {

                    // Reverify the 6th column does exist as it should
                    assert.strictEqual(tableObj.thead.length, 10,'Empty table should render 10 TH in the THEAD.');
                    assert.strictEqual(tableObj.tbody.length, 1,'Empty table should render 1 TD in the TBODY.');
                    assert.strictEqual(tableObj.cellColSpan, '10','Empty table should render with the single body column spaning 10 columns.');
                    assert.strictEqual(tableObj.cellText, 'There is no data to display.','Empty TBODY table has the default text of "There is no data to display."');

                });
        },
        'Rendered Button Table': function () {
            return this.remote
                .execute(function() {

                    var thead = document.querySelectorAll('#E_BUTTON_TEST_TABLE thead th');
                    var tbody = document.querySelectorAll('#E_BUTTON_TEST_TABLE tbody td');
                    var buttons = document.querySelectorAll('#E_BUTTON_TEST_TABLE tbody td button');

                    // Standard button columns
                    var col1 = document.getElementById('button-col-7');
                    var col2 = document.getElementById('button-col-8');
                    var col3 = document.getElementById('button-col-9');

                    // Primary button column
                    var pButtonCol = document.getElementById('button-col-10');

                    // Responsive Menu Button
                    var menuButtonCol = thead[7];

                    return {
                        thead: thead,
                        tbody: tbody,
                        buttons: buttons,
                        normalButtons: [col1, col2, col3],
                        primaryButtonCol: pButtonCol,
                        menuButtonCol: menuButtonCol
                    };
                }).
                then(function (tableObj) {

                    // Reverify the 6th column does exist as it should
                    assert.strictEqual(tableObj.thead.length, 8,'Button table should render 8 TH in the THEAD.');
                    assert.strictEqual(tableObj.tbody.length, 8,'Button table should render 8 TD in the TBODY.');
                    assert.strictEqual(tableObj.buttons.length, 2,'Button table should render 2 Buttons in the TBODY.');

                    var nomalButtonRenderArray = [null, null, null];

                    // Check to make sure the normal button columns doent exists
                    assert.deepEqual(tableObj.normalButtons, nomalButtonRenderArray, 'Deep check the table to see if the normal button table ever render by looking for the ids. It should return 3 nulls because they should not exist.');
                });
        },
        'Rendered Pagining Table': function () {
            return this.remote
                .execute(function() {

                    var table = document.querySelector('#E_PAGING_TEST_TABLE');

                    var tableWrapper = table.parentElement.parentElement;

                    var pagingContainers = tableWrapper.querySelectorAll('.emp-table-pagination');

                    return {
                        pagingContainers: pagingContainers
                    }
                }).
                then(function (tableObj) {

                    // Reverify the 6th column does exist as it should
                    assert.strictEqual(tableObj.pagingContainers.length, 2, 'Table should have 2 sets of paging controls (header and footer).');
                });
        }
    });
});

