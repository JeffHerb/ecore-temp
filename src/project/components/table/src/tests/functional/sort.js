define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');

    registerSuite({
        name: 'table - sort',

        // ================
        // ALPHA SORT TESTS
        // ================

        // Tests the alpha sort in asceneding order. It uses the first column of the table only
        'Test Alpha Asceneding': function() {
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/table/pages/sort.html'))
                .setFindTimeout(5000)
                .findById('alpha-1')
                    .click()
                    .end()
                .execute(function() {

                    // Pull the data-sortdir attribute off the table header
                    // ====================================================

                    var clickedHeader = document.getElementById('alpha-1');

                    var sortDir = clickedHeader.getAttribute('data-sortdir');

                    // DataStore pull
                    // ==============

                    // Get a copy of the dataStore body table columns
                    var tableCols = emp.reference.tables['sort-table'].dataStore.body.rows.map(function(cols) {
                        return cols.columns;
                    });

                    var firstColumn = [];

                    // Loop through and extract the first columns values
                    for (var i = 0, len = tableCols.length; i < len; i++) {

                        if (tableCols[i][0].hasOwnProperty('text')) {

                            firstColumn.push(tableCols[i][0].text.trim());
                        }
                        else {

                            firstColumn.push("");
                        }
                    };

                    return {
                        firstColumn: firstColumn,
                        sortDir: sortDir
                    };

                })
                .then(function (tableObj) {

                    // The expected ascended order
                    var expendedAlphaSort = [ '',
                        '2sru7BPnVm',
                        '6Icd6NQSTZ',
                        '8t8lXP2SXc',
                        '9RnPpdRC3b',
                        'aMzIQckDT0',
                        'bXC3IZpEmi',
                        'DODYenUAe7',
                        'FgueZJgcsU',
                        'fPC314YcK7',
                        'IjSeP6JTil',
                        'jhgAJQwpVM',
                        'KChuS2rFyA',
                        'KLhL4Hczji',
                        'LLfJgYSVFK',
                        'LyRQmz9F2c',
                        'NdsxaqlaH4',
                        'QjQuRlyT9n',
                        'qOr1GdMIFG',
                        'r2RjDRhZmo',
                        'SaeOYVGM0N',
                        'tJZ47zge3e',
                        'u9EqSN3ubw',
                        'UDOzv2RGn3',
                        'Unmmta3RmP',
                        'uwn50Aphh8',
                        'vhz1Ovh9Pr',
                        'vrrhsW6KRF',
                        'vty5tWXdSh',
                        'WmzKBd3NEl',
                        'xCkhIvCZ49',
                        'xfSzddUWoH',
                        'Xm2yqQya2K',
                        'YoK7O3Facq'];

                    // Check to make sure that the returned dataStore is in ascended order
                    assert.deepEqual(tableObj.firstColumn, expendedAlphaSort, 'The expected alpha sort matches the current dataStore extracted values in descending order.');

                    // Checks to see if the data-sortdir attribute that appears after click is reporting the correct direction.
                    assert.strictEqual(tableObj.sortDir, 'ASC', 'The sorted columns should be contain the value of "ACS" to indicate it was sorted in ascending order, it reported ' + tableObj.sortDir);

                });
        },
        // Tests the alpha sort in decending order. It uses the first column of the table only
        'Test Alpha Descending': function() {
            return this.remote
                .setFindTimeout(5000)
                .findById('alpha-1')
                    .click()
                    .end()
                .execute(function() {

                    // Pull the data-sortdir attribute off the table header
                    // ====================================================

                    var clickedHeader = document.getElementById('alpha-1');

                    var sortDir = clickedHeader.getAttribute('data-sortdir');

                    // DataStore pull
                    // ==============

                    // Get a copy of the dataStore body table columns
                    var tableCols = emp.reference.tables['sort-table'].dataStore.body.rows.map(function(cols) {
                        return cols.columns;
                    });

                    var firstColumn = [];

                    // Loop through and extract the first columns values
                    for (var i = 0, len = tableCols.length; i < len; i++) {

                        if (tableCols[i][0].hasOwnProperty('text')) {

                            firstColumn.push(tableCols[i][0].text.trim());
                        }
                        else {

                            firstColumn.push("");
                        }
                    };

                    return {
                        firstColumn: firstColumn,
                        sortDir: sortDir
                    };

                })
                .then(function (tableObj) {

                    // The expected ascended order
                    var expendedAlphaSort = [
                        'YoK7O3Facq',
                        'Xm2yqQya2K',
                        'xfSzddUWoH',
                        'xCkhIvCZ49',
                        'WmzKBd3NEl',
                        'vty5tWXdSh',
                        'vrrhsW6KRF',
                        'vhz1Ovh9Pr',
                        'uwn50Aphh8',
                        'Unmmta3RmP',
                        'UDOzv2RGn3',
                        'u9EqSN3ubw',
                        'tJZ47zge3e',
                        'SaeOYVGM0N',
                        'r2RjDRhZmo',
                        'qOr1GdMIFG',
                        'QjQuRlyT9n',
                        'NdsxaqlaH4',
                        'LyRQmz9F2c',
                        'LLfJgYSVFK',
                        'KLhL4Hczji',
                        'KChuS2rFyA',
                        'jhgAJQwpVM',
                        'IjSeP6JTil',
                        'fPC314YcK7',
                        'FgueZJgcsU',
                        'DODYenUAe7',
                        'bXC3IZpEmi',
                        'aMzIQckDT0',
                        '9RnPpdRC3b',
                        '8t8lXP2SXc',
                        '6Icd6NQSTZ',
                        '2sru7BPnVm',
                        '']

                    // Check to make sure that the returned dataStore is in ascended order
                    assert.deepEqual(tableObj.firstColumn, expendedAlphaSort, 'The expected alpha sort matches the current dataStore extracted values in descending order.');

                    // Checks to see if the data-sortdir attribute that appears after click is reporting the correct direction.
                    assert.strictEqual(tableObj.sortDir, 'DESC', 'The sorted columns should be contain the value of "DESC" to indicate it was sorted in descending order, it reported ' + tableObj.sortDir);

                });
        },

        // ==================
        // NUMERIC SORT TESTS
        // ==================

        // Tests the numeric sort in asceneding order. It uses the first column of the table only
        'Test Numeric Asceneding': function() {
            return this.remote
                .setFindTimeout(5000)
                .findById('numeric-1')
                    .click()
                    .end()
                .execute(function() {

                    // Pull the data-sortdir attribute off the table header
                    // ====================================================

                    var clickedHeader = document.getElementById('numeric-1');

                    var sortDir = clickedHeader.getAttribute('data-sortdir');

                    // DataStore pull
                    // ==============

                    // Get a copy of the dataStore body table columns
                    var tableCols = emp.reference.tables['number-sort-table'].dataStore.body.rows.map(function(cols) {
                        return cols.columns;
                    });

                    var firstColumn = [];

                    // Loop through and extract the first columns values
                    for (var i = 0, len = tableCols.length; i < len; i++) {

                        if (tableCols[i][0].hasOwnProperty('text')) {

                            firstColumn.push(tableCols[i][0].text.trim());
                        }
                        else {

                            firstColumn.push("");
                        }
                    };

                    return {
                        firstColumn: firstColumn,
                        sortDir: sortDir
                    };

                })
                .then(function (tableObj) {

                    // The expected ascended order
                    var expendedSort = [
                        "",
                        "100",
                        "105",
                        "15,256",
                        "25,258",
                        "660,511",
                        "2,978,983",
                        "44,469,510",
                        "278,254,084",
                        "309,522,829",
                        "1,574,269,424",
                        "2,821,953,575",
                        "5,456,155,597",
                        "5,770,003,071",
                        "6,333,795,534",
                        "6,372,405,501",
                        "7,172,778,714",
                        "7,194,615,704",
                        "8,084,078,570",
                        "8,322,950,368",
                        "9,865,636,005"];

                    // Check to make sure that the returned dataStore is in ascended order
                    assert.deepEqual(tableObj.firstColumn, expendedSort, 'The expected numeric sort does not match the current dataStore extracted values in ascending order.');

                    // Checks to see if the data-sortdir attribute that appears after click is reporting the correct direction.
                    assert.strictEqual(tableObj.sortDir, 'ASC', 'The sorted columns should be contain the value of "ACS" to indicate it was sorted in ascending order, it reported ' + tableObj.sortDir);

                });
        },
        // Tests the numeric sort in decending order. It uses the first column of the table only
        'Test Numeric Descending': function() {
            return this.remote
                .setFindTimeout(5000)
                .findById('numeric-1')
                    .click()
                    .end()
                .execute(function() {

                    // Pull the data-sortdir attribute off the table header
                    // ====================================================

                    var clickedHeader = document.getElementById('numeric-1');

                    var sortDir = clickedHeader.getAttribute('data-sortdir');

                    // DataStore pull
                    // ==============

                    // Get a copy of the dataStore body table columns
                    var tableCols = emp.reference.tables['number-sort-table'].dataStore.body.rows.map(function(cols) {
                        return cols.columns;
                    });

                    var firstColumn = [];

                    // Loop through and extract the first columns values
                    for (var i = 0, len = tableCols.length; i < len; i++) {

                        if (tableCols[i][0].hasOwnProperty('text')) {

                            firstColumn.push(tableCols[i][0].text.trim());
                        }
                        else {

                            firstColumn.push("");
                        }
                    };

                    return {
                        firstColumn: firstColumn,
                        sortDir: sortDir
                    };

                })
                .then(function (tableObj) {

                    // The expected ascended order
                    var expendedSort = [
                        "9,865,636,005",
                        "8,322,950,368",
                        "8,084,078,570",
                        "7,194,615,704",
                        "7,172,778,714",
                        "6,372,405,501",
                        "6,333,795,534",
                        "5,770,003,071",
                        "5,456,155,597",
                        "2,821,953,575",
                        "1,574,269,424",
                        "309,522,829",
                        "278,254,084",
                        "44,469,510",
                        "2,978,983",
                        "660,511",
                        "25,258",
                        "15,256",
                        "105",
                        "100",
                        ""]

                    assert.deepEqual(tableObj.firstColumn, expendedSort, 'The expected numeric sort does not match the current dataStore extracted values in descending order.');

                    // Checks to see if the data-sortdir attribute that appears after click is reporting the correct direction.
                    assert.strictEqual(tableObj.sortDir, 'DESC', 'The sorted columns should be contain the value of "DESC" to indicate it was sorted in descending order, it reported ' + tableObj.sortDir);

                });
        },

        // ===============
        // DATE SORT TESTS
        // ===============

        // Tests the date sort in ascending order. It uses the first column of the table only
        'Test Date Asceneding': function() {
            return this.remote
                .setFindTimeout(5000)
                .findById('date-1')
                    .click()
                    .end()
                .execute(function() {

                    // Pull the data-sortdir attribute off the table header
                    // ====================================================

                    var clickedHeader = document.getElementById('date-1');

                    var sortDir = clickedHeader.getAttribute('data-sortdir');

                    // DataStore pull
                    // ==============

                    // Get a copy of the dataStore body table columns
                    var tableCols = emp.reference.tables['date-sort-table'].dataStore.body.rows.map(function(cols) {
                        return cols.columns;
                    });

                    var firstColumn = [];

                    // Loop through and extract the first columns values
                    for (var i = 0, len = tableCols.length; i < len; i++) {

                        if (tableCols[i][0].hasOwnProperty('text')) {

                            firstColumn.push(tableCols[i][0].text.trim());
                        }
                        else {

                            firstColumn.push("");
                        }
                    };

                    return {
                        firstColumn: firstColumn,
                        sortDir: sortDir
                    };

                })
                .then(function (tableObj) {

                    // The expected ascended order
                    var expendedSort = [ '',
                        '3/16/1901',
                        '1/15/1903',
                        '4/12/1906',
                        '11/4/1913',
                        '3/19/1933',
                        '7/17/1937',
                        '2/23/1941',
                        '2/17/1956',
                        '5/1/1967',
                        '4/17/1968',
                        '3/25/1972',
                        '5/1/1980',
                        '7/29/1982',
                        '11/11/1991',
                        '9/16/2000' ]


                    // Check to make sure that the returned dataStore is in ascended order
                    assert.deepEqual(tableObj.firstColumn, expendedSort, 'The expected date sort does not match the current dataStore extracted values in ascending order.');

                    // Checks to see if the data-sortdir attribute that appears after click is reporting the correct direction.
                    assert.strictEqual(tableObj.sortDir, 'ASC', 'The sorted columns should be contain the value of "ACS" to indicate it was sorted in ascending order, it reported ' + tableObj.sortDir);

                });
        },
        // Tests the date sort in decending order. It uses the first column of the table only
        'Test Date Descending': function() {
            return this.remote
                .setFindTimeout(5000)
                .findById('date-1')
                    .click()
                    .end()
                .execute(function() {

                    // Pull the data-sortdir attribute off the table header
                    // ====================================================

                    var clickedHeader = document.getElementById('date-1');

                    var sortDir = clickedHeader.getAttribute('data-sortdir');

                    // DataStore pull
                    // ==============

                    // Get a copy of the dataStore body table columns
                    var tableCols = emp.reference.tables['date-sort-table'].dataStore.body.rows.map(function(cols) {
                        return cols.columns;
                    });

                    var firstColumn = [];

                    // Loop through and extract the first columns values
                    for (var i = 0, len = tableCols.length; i < len; i++) {

                        if (tableCols[i][0].hasOwnProperty('text')) {

                            firstColumn.push(tableCols[i][0].text.trim());
                        }
                        else {

                            firstColumn.push("");
                        }
                    };

                    return {
                        firstColumn: firstColumn,
                        sortDir: sortDir
                    };

                })
                .then(function (tableObj) {

                    // The expected ascended order
                    var expendedSort = [
                        "9/16/2000",
                        "11/11/1991",
                        "7/29/1982",
                        "5/1/1980",
                        "3/25/1972",
                        "4/17/1968",
                        "5/1/1967",
                        "2/17/1956",
                        "2/23/1941",
                        "7/17/1937",
                        "3/19/1933",
                        "11/4/1913",
                        "4/12/1906",
                        "1/15/1903",
                        "3/16/1901",
                        ""]

                    // Check to make sure that the returned dataStore is in ascended order
                    assert.deepEqual(tableObj.firstColumn, expendedSort, 'The expected date sort does not match the current dataStore extracted values in descending order.');

                    // Checks to see if the data-sortdir attribute that appears after click is reporting the correct direction.
                    assert.strictEqual(tableObj.sortDir, 'DESC', 'The sorted columns should be contain the value of "DESC" to indicate it was sorted in descending order, it reported ' + tableObj.sortDir);

                });
        },


        // ======================================
        // CONTROL (READONLY CHECKBOX) SORT TESTS
        // ======================================

        // Tests the control sort in ascending order. It uses the second column of the table only
        'Test Control - Readonly Checkbox - Asceneding': function() {
            return this.remote
                .setFindTimeout(5000)
                .findById('control-2')
                    .click()
                    .end()
                .execute(function() {

                    // Pull the data-sortdir attribute off the table header
                    // ====================================================

                    var clickedHeader = document.getElementById('control-2');

                    var sortDir = clickedHeader.getAttribute('data-sortdir');

                    // DataStore pull
                    // ==============

                    // Get a copy of the dataStore body table columns
                    var tableCols = emp.reference.tables['control-sort-table'].dataStore.body.rows.map(function(cols) {
                        return cols.columns;
                    });

                    var firstColumn = [];

                    // Loop through and extract the first columns values
                    for (var i = 0, len = tableCols.length; i < len; i++) {

                        if (tableCols[i][1].hasOwnProperty('contents')) {

                            if (tableCols[i][1].contents[0].hasOwnProperty('input')) {

                                if (tableCols[i][1].contents[0].input.attributes.type === "checkbox") {

                                    if (tableCols[i][1].contents[0].input.attributes.hasOwnProperty('checked')) {

                                        firstColumn.push(tableCols[i][1].contents[0].input.attributes.checked);
                                    }
                                    else {

                                        firstColumn.push(null);
                                    }

                                }
                                else {

                                    if (tableCols[i][1].contents[0].input.attributes.hasOwnProperty("value")) {

                                        firstColumn.push(tableCols[i][1].contents[0].input.attributes.value);
                                    }
                                    else {

                                        firstColumn.push("");
                                    }
                                }
                            }

                        }
                        else {

                            firstColumn.push(tableCols[i][1].text);
                        }
                    };

                    return {
                        firstColumn: firstColumn,
                        sortDir: sortDir
                    };

                })
                .then(function (tableObj) {

                    // The expected ascended order
                    var expendedSort = [ true, true, true, false, '' ]

                    // Check to make sure that the returned dataStore is in ascended order
                    assert.deepEqual(tableObj.firstColumn, expendedSort, 'The expected control sort does not match the current dataStore extracted values in ascending order.');

                    // Checks to see if the data-sortdir attribute that appears after click is reporting the correct direction.
                    assert.strictEqual(tableObj.sortDir, 'ASC', 'The sorted columns should be contain the value of "ACS" to indicate it was sorted in ascending order, it reported ' + tableObj.sortDir);

                });
        },
        // Tests the date sort in decending order. It uses the first column of the table only
        'Test Control - Readonly Checkbox - Descending': function() {
            return this.remote
                .setFindTimeout(5000)
                .findById('control-2')
                    .click()
                    .end()
                .execute(function() {

                    // Pull the data-sortdir attribute off the table header
                    // ====================================================

                    var clickedHeader = document.getElementById('control-2');

                    var sortDir = clickedHeader.getAttribute('data-sortdir');

                    // DataStore pull
                    // ==============

                    // Get a copy of the dataStore body table columns
                    var tableCols = emp.reference.tables['control-sort-table'].dataStore.body.rows.map(function(cols) {
                        return cols.columns;
                    });

                    var firstColumn = [];

                    // Loop through and extract the first columns values
                    for (var i = 0, len = tableCols.length; i < len; i++) {

                        if (tableCols[i][1].hasOwnProperty('contents')) {

                            if (tableCols[i][1].contents[0].hasOwnProperty('input')) {

                                if (tableCols[i][1].contents[0].input.attributes.type === "checkbox") {

                                    if (tableCols[i][1].contents[0].input.attributes.hasOwnProperty('checked')) {

                                        firstColumn.push(tableCols[i][1].contents[0].input.attributes.checked);
                                    }
                                    else {

                                        firstColumn.push(null);
                                    }

                                }
                                else {

                                    if (tableCols[i][1].contents[0].input.attributes.hasOwnProperty("value")) {

                                        firstColumn.push(tableCols[i][1].contents[0].input.attributes.value);
                                    }
                                    else {

                                        firstColumn.push("");
                                    }
                                }
                            }

                        }
                        else {

                            firstColumn.push(tableCols[i][1].text);
                        }
                    };

                    return {
                        firstColumn: firstColumn,
                        sortDir: sortDir
                    };

                })
                .then(function (tableObj) {

                    // The expected ascended order
                    var expendedSort = ['', false, true, true, true ]

                    // Check to make sure that the returned dataStore is in ascended order
                    assert.deepEqual(tableObj.firstColumn, expendedSort, 'The expected control sort does not match the current dataStore extracted values in descending order.');

                    // Checks to see if the data-sortdir attribute that appears after click is reporting the correct direction.
                    assert.strictEqual(tableObj.sortDir, 'DESC', 'The sorted columns should be contain the value of "DESC" to indicate it was sorted in descending order, it reported ' + tableObj.sortDir);

                });
        },

        // ================
        // SCORE SORT TESTS
        // ================

        // Tests the score sort in ascending order. It uses the third column of the table only
        'Test Score - Asceneding': function() {
            return this.remote
                .setFindTimeout(5000)
                .findById('score-3')
                    .click()
                    .end()
                .execute(function() {

                    // Pull the data-sortdir attribute off the table header
                    // ====================================================

                    var clickedHeader = document.getElementById('score-3');

                    var sortDir = clickedHeader.getAttribute('data-sortdir');

                    // DataStore pull
                    // ==============

                    // Get a copy of the dataStore body table columns
                    var tableCols = emp.reference.tables['score-sort-table'].dataStore.body.rows.map(function(cols) {
                        return cols.columns;
                    });

                    var column = [];

                    // Loop through and extract the third columns values
                    for (var i = 0, len = tableCols.length; i < len; i++) {

                        if (tableCols[i][2].hasOwnProperty('contents')) {

                            var score = tableCols[i][2].contents[0].score;

                            column.push(parseInt(score));
                        }
                        else {

                            column.push("invalid column");
                        }
                    };

                    return {
                        column: column,
                        sortDir: sortDir
                    };

                })
                .then(function (tableObj) {

                    // The expected ascended order
                    var expendedSort = [ 37, 42, 58, 62, 68,87,98, 100 ];

                    // Check to make sure that the returned dataStore is in ascended order
                    assert.deepEqual(tableObj.column, expendedSort, 'The expected score sort does not match the current dataStore extracted values in ascending order.');

                    // Checks to see if the data-sortdir attribute that appears after click is reporting the correct direction.
                    assert.strictEqual(tableObj.sortDir, 'ASC', 'The sorted columns should be contain the value of "ACS" to indicate it was sorted in ascending order, it reported ' + tableObj.sortDir);

                });
        },

        // Tests the score sort in ascending order. It uses the third column of the table only
        'Test Score - Descending': function() {
            return this.remote
                .setFindTimeout(5000)
                .findById('score-3')
                    .click()
                    .end()
                .execute(function() {

                    // Pull the data-sortdir attribute off the table header
                    // ====================================================

                    var clickedHeader = document.getElementById('score-3');

                    var sortDir = clickedHeader.getAttribute('data-sortdir');

                    // DataStore pull
                    // ==============

                    // Get a copy of the dataStore body table columns
                    var tableCols = emp.reference.tables['score-sort-table'].dataStore.body.rows.map(function(cols) {
                        return cols.columns;
                    });

                    var column = [];

                    // Loop through and extract the third columns values
                    for (var i = 0, len = tableCols.length; i < len; i++) {

                        if (tableCols[i][2].hasOwnProperty('contents')) {

                            var score = tableCols[i][2].contents[0].score;

                            column.push(parseInt(score));
                        }
                        else {

                            column.push("invalid column");
                        }
                    };

                    return {
                        column: column,
                        sortDir: sortDir
                    };

                })
                .then(function (tableObj) {

                    // The expected ascended order
                    var expendedSort = [ 100, 98, 87, 68, 62, 58, 42, 37 ];

                    // Check to make sure that the returned dataStore is in ascended order
                    assert.deepEqual(tableObj.column, expendedSort, 'The expected score sort does not match the current dataStore extracted values in descending order.');

                    // Checks to see if the data-sortdir attribute that appears after click is reporting the correct direction.
                    assert.strictEqual(tableObj.sortDir, 'DESC', 'The sorted columns should be contain the value of "DESC" to indicate it was sorted in descending order, it reported ' + tableObj.sortDir);

                });
        },

        // =================
        // RATING SORT TESTS
        // =================

        'Test Rating - Ascending': function() {
            return this.remote
                .setFindTimeout(5000)
                .findById('rating-3')
                    .click()
                    .end()
                .execute(function() {

                    // Pull the data-sortdir attribute off the table header
                    // ====================================================

                    var clickedHeader = document.getElementById('rating-3');

                    var sortDir = clickedHeader.getAttribute('data-sortdir');

                    // DataStore pull
                    // ==============

                    // Get a copy of the dataStore body table columns
                    var tableCols = emp.reference.tables['rating-sort-table'].dataStore.body.rows.map(function(cols) {
                        return cols.columns;
                    });

                    var column = [];

                    // Loop through and extract the third columns values
                    for (var i = 0, len = tableCols.length; i < len; i++) {

                        if (tableCols[i][2].hasOwnProperty('contents')) {

                            var ratingInput = tableCols[i][2].contents[0].parts.hidden.input;

                            if (ratingInput.attributes && ratingInput.attributes.value) {

                                if (typeof ratingInput.attributes.value === 'string' && !isNaN(ratingInput.attributes.value)) {

                                    column.push(parseInt(ratingInput.attributes.value));
                                }
                                else if (typeof ratingInput.attributes.value === 'number') {

                                    column.push(ratingInput.attributes.value)
                                }
                                else {

                                    column.push(null);
                                }
                            }
                            else {

                                column.push(null);
                            }

                        }
                        else {

                            column.push("invalid column");
                        }
                    };

                    return {
                        column: column,
                        sortDir: sortDir
                    };

                })
                .then(function (tableObj) {

                    // The expected ascended order
                    var expendedSort = [null, 1, 2, 3, 4, 5];

                    // Check to make sure that the returned dataStore is in ascended order
                    assert.deepEqual(tableObj.column, expendedSort, 'The expected score sort does not match the current dataStore extracted values in ascending order.');

                    // Checks to see if the data-sortdir attribute that appears after click is reporting the correct direction.
                    assert.strictEqual(tableObj.sortDir, 'ASC', 'The sorted columns should be contain the value of "ACS" to indicate it was sorted in ascending order, it reported ' + tableObj.sortDir);

                });
        },

        'Test Rating - Descending': function() {
            return this.remote
                .setFindTimeout(5000)
                .findById('rating-3')
                    .click()
                    .end()
                .execute(function() {

                    // Pull the data-sortdir attribute off the table header
                    // ====================================================

                    var clickedHeader = document.getElementById('rating-3');

                    var sortDir = clickedHeader.getAttribute('data-sortdir');

                    // DataStore pull
                    // ==============

                    // Get a copy of the dataStore body table columns
                    var tableCols = emp.reference.tables['rating-sort-table'].dataStore.body.rows.map(function(cols) {
                        return cols.columns;
                    });

                    var column = [];

                    // Loop through and extract the third columns values
                    for (var i = 0, len = tableCols.length; i < len; i++) {

                        if (tableCols[i][2].hasOwnProperty('contents')) {

                            var ratingInput = tableCols[i][2].contents[0].parts.hidden.input;

                            if (ratingInput.attributes && ratingInput.attributes.value) {

                                if (typeof ratingInput.attributes.value === 'string' && !isNaN(ratingInput.attributes.value)) {

                                    column.push(parseInt(ratingInput.attributes.value));
                                }
                                else if (typeof ratingInput.attributes.value === 'number') {

                                    column.push(ratingInput.attributes.value)
                                }
                                else {

                                    column.push(null);
                                }
                            }
                            else {

                                column.push(null);
                            }

                        }
                        else {

                            column.push("invalid column");
                        }
                    };

                    return {
                        column: column,
                        sortDir: sortDir
                    };

                })
                .then(function (tableObj) {

                    // The expected ascended order
                    var expendedSort = [5, 4, 3, 2, 1, null];

                    // Check to make sure that the returned dataStore is in ascended order
                    assert.deepEqual(tableObj.column, expendedSort, 'The expected score sort does not match the current dataStore extracted values in ascending order.');

                    // Checks to see if the data-sortdir attribute that appears after click is reporting the correct direction.
                    assert.strictEqual(tableObj.sortDir, 'DESC', 'The sorted columns should be contain the value of "ACS" to indicate it was sorted in ascending order, it reported ' + tableObj.sortDir);

                });
        },

        // ===================
        // NOTIFIER SORT TESTS
        // ===================

        'Test Notifier - Ascending': function () {
            return this.remote
                .setFindTimeout(5000)
                .findById('notifier-6')
                .click()
                .end()
                .execute(function () {

                    // Pull the data-sortdir attribute off the table header
                    // ====================================================

                    var clickedHeader = document.getElementById('notifier-6');

                    var sortDir = clickedHeader.getAttribute('data-sortdir');

                    // DataStore pull
                    // ==============

                    // Get a copy of the dataStore body table columns
                    var tableCols = emp.reference.tables['notifier-table'].dataStore.body.rows.map(function (cols) {
                        return cols.columns;
                    });

                    var column = [];

                    // Loop through and extract the sixth columns values
                    for (var i = 0, len = tableCols.length; i < len; i++) {

                        if (tableCols[i][5].contents) {

                            if (tableCols[i][5].contents[0].hasOwnProperty('text')) {
    
                                column.push(tableCols[i][5].contents[0].text.trim());
                            }
                            else {
    
                                column.push(null);
                            }
                        }
                        else {
                            column.push(null);
                        }

                    };

                    return {
                        column: column,
                        sortDir: sortDir
                    };

                })
                .then(function (tableObj) {


                    // The expected ascended order
                    var expendedSort = [null, null, null, null, 'A', 'AAA', 'AAA', 'AAA', 'ABC', 'ABC', 'ABC', 'B', 'CCC', 'CLS', 'DEF', 'GHI', 'L', 'OOO', 'OX', 'q', 'QQQ', 'R', 'RST', 'S', 'S', 'S', 'SSS', 'UVW', 'XXX', 'XXX', 'YYY', 'Z', 'ZZZ', 'ZZZ'];

                    // Check to make sure that the returned dataStore is in ascended order
                    assert.deepEqual(tableObj.column, expendedSort, 'The expected score sort does not match the current dataStore extracted values in ascending order.');

                    // Checks to see if the data-sortdir attribute that appears after click is reporting the correct direction.
                    assert.strictEqual(tableObj.sortDir, 'ASC', 'The sorted columns should be contain the value of "ACS" to indicate it was sorted in ascending order, it reported ' + tableObj.sortDir);

                });
        },

        'Test Notifier - Descending': function () {
            return this.remote
                .setFindTimeout(5000)
                .findById('notifier-6')
                .click()
                .end()
                .execute(function () {

                    // Pull the data-sortdir attribute off the table header
                    // ====================================================

                    var clickedHeader = document.getElementById('notifier-6');

                    var sortDir = clickedHeader.getAttribute('data-sortdir');

                    // DataStore pull
                    // ==============

                    // Get a copy of the dataStore body table columns
                    var tableCols = emp.reference.tables['notifier-table'].dataStore.body.rows.map(function (cols) {
                        return cols.columns;
                    });

                    var column = [];

                    // Loop through and extract the sixth columns values
                    for (var i = 0, len = tableCols.length; i < len; i++) {

                        if (tableCols[i][5].contents) {

                            if (tableCols[i][5].contents[0].hasOwnProperty('text')) {

                                column.push(tableCols[i][5].contents[0].text.trim());
                            }
                            else {

                                column.push(null);
                            }
                        }
                        else {
                            column.push(null);
                        }

                    };

                    return {
                        column: column,
                        sortDir: sortDir
                    };

                })
                .then(function (tableObj) {

                    // The expected ascended order
                    var expendedSort = ['ZZZ', 'ZZZ', 'Z', 'YYY', 'XXX', 'XXX', 'UVW', 'SSS', 'S', 'S', 'S', 'RST', 'R', 'QQQ', 'q', 'OX', 'OOO', 'L', 'GHI', 'DEF', 'CLS', 'CCC', 'B', 'ABC', 'ABC', 'ABC', 'AAA', 'AAA', 'AAA', 'A', null, null, null, null];

                    // Check to make sure that the returned dataStore is in ascended order
                    assert.deepEqual(tableObj.column, expendedSort, 'The expected score sort does not match the current dataStore extracted values in ascending order.');

                    // Checks to see if the data-sortdir attribute that appears after click is reporting the correct direction.
                    assert.strictEqual(tableObj.sortDir, 'DESC', 'The sorted columns should be contain the value of "DESC" to indicate it was sorted in ascending order, it reported ' + tableObj.sortDir);

                });
        },
        
        //==============
        //TIME SORT TEST
        //==============

        //Test the time sort in ascending order. Uses the first column.
        'Test Time - Ascending': function(){
            return this.remote
            .setFindTimeout(5000)
            .findById('time-sort-table')
                .findById('time-1')
                    .click()
                    .end()
                .sleep(2500)

            .execute(function() {
                // Pull the data-sortdir attribute off the table header
                    // ====================================================

                    var clickedHeader = document.querySelector('#time-1');
                    
                    var dataSortAttr = clickedHeader.getAttribute('data-sortdir');

                    // DataStore pull
                    // ==============

                    // Get a copy of the dataStore body table columns
                    var tableCols = emp.reference.tables['time-sort-table'].dataStore.body.rows.map(function(cols) {
                        return cols.columns;
                    });

                    var firstColumn = [];

                    // Loop through and extract the first columns values
                    for (var i = 0, len = tableCols.length; i < len; i++) {

                        if (tableCols[i][0].hasOwnProperty('text')) {

                            firstColumn.push(tableCols[i][0].text.trim());
                        }
                        else {

                            firstColumn.push("");
                        }
                    };

                    return {
                        dataSortAttr: dataSortAttr,
                        firstColumn: firstColumn   
                    };

                })
                .then(function (tableObj) {

                    // The expected ascended order
                    var expendedSort = [
                        "",
                        "1:54 AM",
                        "2:20 AM",
                        "3:21 AM",
                        "4:20 AM",
                        "8:14 AM",
                        "10:45 AM",
                        "12:05 AM",
                        "1:15 PM",
                        "3:26 PM",
                        "4:25 PM",
                        "5:41 PM",
                        "6:37 PM",
                        "7:42 PM",
                        "10:24 PM",
                        "11:55 PM",
                    ]; 

                    // Checks to see if the data-sortdir attribute that appears after click is reporting the correct direction.
                    assert.strictEqual(tableObj.dataSortAttr, 'ASC', 'The sorted columns should be contain the value of "ACS" to indicate it was sorted in ascending order, it reported ' + tableObj.dataSortAttr);
                    // Check to make sure that the returned dataStore is in ascended order
                    assert.deepEqual(tableObj.firstColumn, expendedSort, 'The expected numeric sort does not match the current dataStore extracted values in ascending order.');
                });
        },

        //Test the time sort in descending order. Uses the first column.
        'Test Time - Descending': function(){
            return this.remote
            .setFindTimeout(5000)
            .findById('time-sort-table')
                .findById('time-1')
                    .click()
                    .end()
                .sleep(2500)

            .execute(function() {
                // Pull the data-sortdir attribute off the table header
                    // ====================================================

                    var clickedHeader = document.querySelector('#time-1');
                    
                    var dataSortAttr = clickedHeader.getAttribute('data-sortdir');

                    // DataStore pull
                    // ==============

                    // Get a copy of the dataStore body table columns
                    var tableCols = emp.reference.tables['time-sort-table'].dataStore.body.rows.map(function(cols) {
                        return cols.columns;
                    });

                    var firstColumn = [];

                    // Loop through and extract the first columns values
                    for (var i = 0, len = tableCols.length; i < len; i++) {

                        if (tableCols[i][0].hasOwnProperty('text')) {

                            firstColumn.push(tableCols[i][0].text.trim());
                        }
                        else {

                            firstColumn.push("");
                        }
                    };

                    return {
                        dataSortAttr: dataSortAttr,
                        firstColumn: firstColumn   
                    };

                })
                .then(function (tableObj) {

                    // The expected ascended order
                    var expendedSort = [
                        "11:55 PM",
                        "10:24 PM",
                        "7:42 PM",
                        "6:37 PM",
                        "5:41 PM",
                        "4:25 PM",
                        "3:26 PM",
                        "1:15 PM",
                        "12:05 AM",
                        "10:45 AM",
                        "8:14 AM",
                        "4:20 AM",
                        "3:21 AM",
                        "2:20 AM",
                        "1:54 AM",
                        ""
                    ]; 
                    // Checks to see if the data-sortdir attribute that appears after click is reporting the correct direction.
                    assert.strictEqual(tableObj.dataSortAttr, 'DESC', 'The sorted columns should be contain the value of "DESC" to indicate it was sorted in ascending order, it reported ' + tableObj.dataSortAttr);
                    // Check to make sure that the returned dataStore is in descended order
                    assert.deepEqual(tableObj.firstColumn, expendedSort, 'The expected numeric sort does not match the current dataStore extracted values in descending order.');
                });
        },

        //===================
        //DATE TIME SORT TEST
        //===================

        //Test the datetime sort in ascending order uses the first column
        'Test DateTime - Ascending': function(){
            return this.remote
            .setFindTimeout(5000)
            .findById('date-time-sort-table')
                .findById('datetime-1')
                    .click()
                    .end()
                .sleep(2500)

            .execute(function() {
                // Pull the data-sortdir attribute off the table header
                    // ====================================================

                    var clickedHeader = document.querySelector('#datetime-1');
                    
                    var dataSortAttr = clickedHeader.getAttribute('data-sortdir');

                    // DataStore pull
                    // ==============

                    // Get a copy of the dataStore body table columns
                    var tableCols = emp.reference.tables['date-time-sort-table'].dataStore.body.rows.map(function(cols) {
                        return cols.columns;
                    });

                    var firstColumn = [];

                    // Loop through and extract the first columns values
                    for (var i = 0, len = tableCols.length; i < len; i++) {

                        if (tableCols[i][0].hasOwnProperty('text')) {

                            firstColumn.push(tableCols[i][0].text.trim());
                        }
                        else {

                            firstColumn.push("");
                        }
                    };
 
                    return {
                        dataSortAttr: dataSortAttr,
                        firstColumn: firstColumn   
                    };

                })
                .then(function (tableObj) {

                    // The expected ascended order
                    var expendedSort = [
                        "",
                        "4/14/1770 5:24 PM",
                        "3/16/1901 6:34 PM",
                        "3/16/1901 6:37 PM",
                        "3/19/1933 12:05 AM",
                        "7/17/1937 3:26 PM",
                        "2/23/1941 7:42 PM",
                        "2/17/1956 5:41 PM",
                        "4/12/1970 3:21 AM",
                        "4/12/1970 8:14 AM",
                        "5/1/1970 1:15 PM",
                        "3/25/1972 4:25 PM",
                        "5/1/1980 1:54 AM",
                        "7/29/1982 11:55 PM",
                        "11/11/1991 4:20 AM",
                        "9/16/2000 2:20 AM",
                        
                    ]; 

                    // Checks to see if the data-sortdir attribute that appears after click is reporting the correct direction.
                    assert.strictEqual(tableObj.dataSortAttr, 'ASC', 'The sorted columns should be contain the value of "ACS" to indicate it was sorted in ascending order, it reported ' + tableObj.dataSortAttr);
                    // Check to make sure that the returned dataStore is in ascended order
                    assert.deepEqual(tableObj.firstColumn, expendedSort, 'The expected numeric sort does not match the current dataStore extracted values in ascending order.');
                });
        },

        //Test the datetime sort in descending order uses the first column
        'Test DateTime - Descending': function(){
            return this.remote
            .setFindTimeout(5000)
            .findById('date-time-sort-table')
                .findById('datetime-1')
                    .click()
                    .end()
                .sleep(2500)

            .execute(function() {
                // Pull the data-sortdir attribute off the table header
                    // ====================================================

                    var clickedHeader = document.querySelector('#datetime-1');
                    
                    var dataSortAttr = clickedHeader.getAttribute('data-sortdir');

                    // DataStore pull
                    // ==============

                    // Get a copy of the dataStore body table columns
                    var tableCols = emp.reference.tables['date-time-sort-table'].dataStore.body.rows.map(function(cols) {
                        return cols.columns;
                    });

                    var firstColumn = [];

                    // Loop through and extract the first columns values
                    for (var i = 0, len = tableCols.length; i < len; i++) {

                        if (tableCols[i][0].hasOwnProperty('text')) {

                            firstColumn.push(tableCols[i][0].text.trim());
                        }
                        else {

                            firstColumn.push("");
                        }
                    };
 
                    return {
                        dataSortAttr: dataSortAttr,
                        firstColumn: firstColumn   
                    };

                })
                .then(function (tableObj) {

                    // The expected ascended order
                    var expendedSort = [
                        "9/16/2000 2:20 AM",
                        "11/11/1991 4:20 AM",
                        "7/29/1982 11:55 PM",
                        "5/1/1980 1:54 AM",
                        "3/25/1972 4:25 PM",
                        "5/1/1970 1:15 PM",
                        "4/12/1970 8:14 AM",
                        "4/12/1970 3:21 AM",
                        "2/17/1956 5:41 PM",
                        "2/23/1941 7:42 PM",
                        "7/17/1937 3:26 PM",
                        "3/19/1933 12:05 AM",
                        "3/16/1901 6:37 PM",
                        "3/16/1901 6:34 PM",
                        "4/14/1770 5:24 PM",
                        "",
                    ]; 

                    // Checks to see if the data-sortdir attribute that appears after click is reporting the correct direction.
                    assert.strictEqual(tableObj.dataSortAttr, 'DESC', 'The sorted columns should be contain the value of "DESC" to indicate it was sorted in ascending order, it reported ' + tableObj.dataSortAttr);
                    // Check to make sure that the returned dataStore is in ascended order
                    assert.deepEqual(tableObj.firstColumn, expendedSort, 'The expected numeric sort does not match the current dataStore extracted values in ascending order.');
                });
        }

    });
});