define([], function () {

    var _priv = {};

    _priv.checkForIllegalChar = function(value) {

        var invalidTableCharacters = ['%', '$'];

        for (var i = 0, len = invalidTableCharacters.length; i < len; i++) {

            var char = invalidTableCharacters[i];

            if (value.indexOf(char) !== -1) {

                return true;
            }
        }

        return false;
    };

    _priv.breakTable = function(table, $table, dataStore) {

        var colSpan = dataStore.head.rows[0].columns.length;

        var errRow = document.createElement('tr');
        var errCell = document.createElement('td');
        var errCellText = document.createTextNode('Table Rendering Blocked - One or more cells contain an illegal character ["%", "$"]. Please contact UI Support for assistance.');

        errCell.setAttribute('colspan', colSpan);
        errCell.appendChild(errCellText);

        errRow.appendChild(errCell);

        var tBody = table.querySelector('tbody');

        while(tBody.firstChild) {

            tBody.removeChild(tBody.firstChild);
        }

        tBody.appendChild(errRow);

        setTimeout(function() {

            $table.removeHeight();

        }, 1000);

    };

    var init = function () {

        var tables = document.querySelectorAll('table');

        if (tables.length) {

            for (var t = 0, tLen = tables.length; t < tLen; t++) {

                var tableID = tables[t].getAttribute('id');

                var dataStore = emp.reference.tables[tableID].dataStore;

                var invalidTable = false;

                if (dataStore.body && dataStore.body.rows && dataStore.body.rows.length) {

                    rows:
                    for (var r = 0, rLen = dataStore.body.rows.length; r <rLen; r++) {

                        var row = dataStore.body.rows[r];

                        if (row.columns && row.columns.length) {

                            columns:
                            for (var c = 0, cLen = row.columns.length; c < cLen; c++) {

                                var col = row.columns[c];

                                var cellValue = false;

                                if (col.contents && col.contents.length) {

                                }
                                else if (col.text && (!col.contents || col.contents.length === 0)) {

                                    if (_priv.checkForIllegalChar(col.text)) {

                                        invalidTable = true;
                                        break rows;
                                    }

                                }

                            }
                        }

                    }

                }

                if (invalidTable) {
                    _priv.breakTable(tables[t], emp.reference.tables[tableID], dataStore);
                }
            }

        }

    };

    return {
        init: init
    };

});
