define(['render'], function (render) {

    var _priv = {};
    var _setup = {};
    var _events = {};
    var _prototype = {};
    var _defaults = {
        'setup': {
            'sort': true
        },
        'plugins': {
            'sort': {}
        }
    };

    // =================
    // Private Functions
    // =================

    // Function that will preform an alpha based sort
    _priv.alphaSort = function _alpha_sort(table, num, dir) {

        function compare(a, b) {
            // Pull the col values out and make sure we have the purest values possible.
            var colA = a.columns[num];
            var colB = b.columns[num];
            var textA = '';
            var textB = '';

            // Find the text value of each column, starting with the `.contents` property before falling back to `.text`
            if (colA.contents && colA.contents.length !== 0) {
                // Concat the texts for all contents
                colA.contents.forEach(function (content) {
                    if (content.text) {
                        textA += content.text;
                    }
                    else if (content.template === "field") {

                        if (content.type !== "textarea") {

                            textA += content.input.attributes.value;
                        }
                        else {

                            textA += content.input.text;
                        }
                    }
                });
            }
            else if (colA.text) {

                textA = colA.text;
            }

            if (colB.contents && colB.contents.length !== 0) {
                // Concat the texts for all contents
                colB.contents.forEach(function (content) {
                    if (content.text) {
                        textB += content.text;
                    }
                    else if (content.template === "field") {

                        if (content.type !== "textarea") {

                            textB += content.input.attributes.value;
                        }
                        else {

                            textB += content.input.text;
                        }
                    }
                });
            }
            else if (colB.text) {

                textB = colB.text;
            }

            // Compare the two texts
            textA = textA.trim().toLowerCase();
            textB = textB.trim().toLowerCase();

            if (dir === 'ASC') {
                if (textA < textB) {
                    return -1;
                }
                else if (textA > textB) {
                    return 1;
                }
            }
            else {
                if (textA < textB) {
                    return 1;
                }
                else if (textA > textB) {
                    return -1;
                }
            }

            return 0;
        }

        var results = table.dataStore.body.rows.sort(compare);

        // Create a new request object
        var newObj = $.extend(true, {}, table.dataStore);

        // Append the sorted rows
        newObj.body.rows = results;

        return newObj;
    };

    // Function that will preform an date based sort
    _priv.dateSort = function _date_sort(table, num, dir) {
        function compare(a, b) {
            var colA = a.columns[num];
            var colB = b.columns[num];
            var dateA = null;
            var dateB = null;

            if (colA.contents && colA.contents.length !== 0) {
                // Concat the texts for all contents
                colA.contents.forEach(function (content) {
                    if (content.text) {
                        dateA += content.text;
                    }
                });
            }
            else if (colA.text) {
                dateA = colA.text;
            }

            if (colB.contents && colB.contents.length !== 0) {
                // Concat the texts for all contents
                colB.contents.forEach(function (content) {
                    if (content.text) {
                        dateB += content.text;
                    }
                });
            }
            else if (colB.text) {
                dateB = colB.text;
            }

            // Convert col A
            try {
                if (dateA === '') {
                    colA = new Date(-8640000000000000);
                }
                else if (dateA.indexOf('-') !== -1) {
                    // Pull the starting (first period date) out of the range
                    colA = dateA.split('-')[0].trim();

                    colA = new Date(colA);
                }
                //TODO: if the column does not have a `.text` property but does have `.contents`, we should look through the `contents` array and concat those values to create the text. Use case: a link whose text is a date. Be sure to repeat this below for `colB`.
                else {
                    colA = new Date(dateA);
                }
            }
            catch (e) {
                colA = new Date(-8640000000000000);
            }

            // Convert col B
            try {
                if (dateB === '') {
                    colB = new Date(-8640000000000000);
                }
                else if (dateB.indexOf('-') !== -1) {
                    // Pull the starting (first period date) out of the range
                    colB = dateB.split('-')[0].trim();
                    colB = new Date(colB);
                }
                else {
                    colB = new Date(dateB);
                }
            }
            catch (e) {
                colB = new Date(-8640000000000000);
            }

            if (dir === 'ASC') {
                if (colA > colB) {
                    return (1);
                }

                if (colA < colB) {
                    return (-1);
                }

            }
            else {
                if (colA > colB) {
                    return (-1);
                }

                if (colA < colB) {
                    return (1);
                }
            }

            return 0;
        }

        var results = table.dataStore.body.rows.sort(compare);

        // Create a new request object
        var newObj = $.extend(true, {}, table.dataStore);

        // Append the sorted rows
        newObj.body.rows = results;

        return newObj;
    };

    // Function that will sort numeric values
    _priv.numericSort = function _numeric_sort(table, num, dir) {

        function compare(a, b) {
            // Pull the col values out and make sure we have the purest values possible.
            var colA = a.columns[num];
            var colB = b.columns[num];
            var numA = '';
            var numB = '';

            if (colA.contents && colA.contents.length !== 0) {
                // Concat the texts for all contents
                colA.contents.forEach(function (content) {
                    if (content.template === 'field') {

                        if (content.input.attributes.value) {
                            numA += content.input.attributes.value.replace(/[^0-9.-]/g, '');
                        }
                    }
                    else if (content.text) {
                        numA += content.text.replace(/[^0-9.-]/g, '');
                    }
                });
            }
            else if (colA.text) {
                numA = colA.text.replace(/[^0-9.-]/g, '');
            }

            if (colB.contents && colB.contents.length) {
                // Concat the texts for all contents
                colB.contents.forEach(function (content) {
                    if (content.template === 'field') {

                        if (content.input.attributes.value) {
                            numB += content.input.attributes.value.replace(/[^0-9.-]/g, '');
                        }
                    }
                    else if (content.text) {
                        numB += content.text.replace(/[^0-9.-]/g, '');
                    }
                });
            }
            else if (colB.text) {
                numB = colB.text.replace(/[^0-9.-]/g, '');
            }

            if ((numA !== undefined) && (numA !== '') && (numB !== undefined) && (numB !== '')) {
                if (!isNaN(parseFloat(numA)) && !isNaN(parseFloat(numB))) {
                    numA = parseFloat(numA);
                    numB = parseFloat(numB);

                    if (dir === 'ASC') {
                        return numA - numB;
                    }
                    else {
                        return numB - numA;
                    }
                }
                else if (isNaN(parseFloat(numA)) && isNaN(parseFloat(numB))) {
                    if (dir === 'ASC') {
                        if (numA > numB) {
                            return 1;
                        }

                        if (numA === numB) {
                            return 0;
                        }
                    }
                    else {
                        if (numA > numB) {
                            return 0;
                        }

                        if (numA === numB) {
                            return 1;
                        }
                    }
                }
                else if (isNaN(parseFloat(numB))) {
                    if (dir === 'ASC') {
                        return 1;
                    }
                    else {
                        return -1;
                    }
                }

                if (dir === 'ASC') {
                    return -1;
                }
                else {
                    return 1;
                }
            }
            else {
                if (dir === 'ASC') {
                    if (numA < numB) { return -1; }
                    if (numA > numB) { return 1; }
                }
                else {
                    if (numA < numB) { return 1; }
                    if (numA > numB) { return -1; }
                }

                return 0;
            }
        }

        var results = table.dataStore.body.rows.sort(compare);

        // Create a new request object
        var newObj = $.extend(true, {}, table.dataStore);

        // Append the sorted rows
        newObj.body.rows = results;

        return newObj;
    };

    _priv.iconSort = function _icon_sort(table, num, dir) {

        function compare(a, b) {

            var colA = a.columns[num];
            var colB = b.columns[num];

            if (colA.contents && colA.contents.length > 0) {

                colA = colA.contents[0];

                if (colA.template && colA.template === "icon") {

                    if (colA.sortvalue) {

                        colA = colA.sortvalue;

                    }
                    else if (colA.attributes['data-sortvalue']) {

                        colA = (!isNaN(colA.attributes['data-sortvalue'])) ? parseInt(colA.attributes['data-sortvalue']) : colA.attributes['data-sortvalue'];
                    }
                    else {

                        journal.log({ type: 'warn', owner: 'UI', module: 'table', submodule: 'sort', func: 'iconSort-compare' }, 'Icon does not have the data-sortvalue attribute. Defaulting to -1');

                        colA = -1;
                    }
                }
                else {

                    colA = -1;
                }

            }
            else {

                colA = -1;
            }

            if (colB.contents && colB.contents.length > 0) {

                colB = colB.contents[0];

                if (colB.template && colB.template === "icon") {

                    if (colB.sortvalue) {

                        colB = colB.sortvalue;

                    }
                    else if (colB.attributes['data-sortvalue']) {

                        colB = (!isNaN(colB.attributes['data-sortvalue'])) ? parseInt(colB.attributes['data-sortvalue']) : colB.attributes['data-sortvalue'];
                    }
                    else {

                        journal.log({ type: 'warn', owner: 'UI', module: 'table', submodule: 'sort', func: 'iconSort-compare' }, 'Icon does not have the data-sortvalue attribute. Defaulting to -1');

                        colB = -1;
                    }
                }
                else {

                    colB = -1;
                }

            }
            else {

                colB = -1;
            }


            var numA = colA;
            var numB = colB;

            if (dir === 'ASC') {
                return numA - numB;
            }
            else {
                return numB - numA;
            }

        }

        var results = table.dataStore.body.rows.sort(compare);

        // Create a new request object
        var newObj = $.extend(true, {}, table.dataStore);

        // Append the sorted rows
        newObj.body.rows = results;

        return newObj;
    };

    // Function that will sort the score component values
    _priv.scoreSort = function _score_sort(table, num, dir) {
        function compare(a, b) {
            var colA = a.columns[num];
            var colB = b.columns[num];
            var numA = '';
            var numB = '';

            if (colA.contents) {
                if (colA.contents[0].percentage) {
                    numA = colA.contents[0].percentage;
                }
                else if (colA.contents[0].percentage !== undefined) {
                    numA = colA.contents[0].percentage;
                }
            }

            if (colB.contents) {
                if (colB.contents[0].percentage) {
                    numB = colB.contents[0].percentage;
                }
                else if (colB.contents[0].percentage !== undefined) {
                    numB = colB.contents[0].percentage;
                }
            }

            if ((numA !== undefined) && (numA !== '') && (numB !== undefined) && (numB !== '')) {
                if (!isNaN(parseFloat(numA)) && !isNaN(parseFloat(numB))) {
                    numA = parseFloat(numA);
                    numB = parseFloat(numB);

                    if (dir === 'ASC') {
                        return numA - numB;
                    }
                    else {
                        return numB - numA;
                    }
                }
                else if (isNaN(parseFloat(numA)) && isNaN(parseFloat(numB))) {

                    if (dir === 'ASC') {
                        if (numA > numB) {
                            return 1;
                        }

                        if (numA === numB) {
                            return 0;
                        }
                    }
                    else {
                        if (numA > numB) {
                            return 0;
                        }

                        if (numA === numB) {
                            return 1;
                        }
                    }
                }
                else if (isNaN(parseFloat(numA))) {
                    if (dir === 'ASC') {
                        return -1;
                    }
                    else {
                        return 1;
                    }
                }
                else if (isNaN(parseFloat(numB))) {
                    if (dir === 'ASC') {
                        return 1;
                    }
                    else {
                        return -1;
                    }
                }

                if (dir === 'ASC') {
                    return -1;
                }
                else {
                    return 1;
                }
            }
            else {

                if (dir === 'ASC') {
                    if (numA < numB) { return -1; }
                    if (numA > numB) { return 1; }

                    if (isNaN(parseFloat(numA))) { return -1; }
                    if (isNaN(parseFloat(numB))) { return 1; }

                }
                else {
                    if (numA < numB) { return 1; }
                    if (numA > numB) { return -1; }

                    if (isNaN(parseFloat(numA))) { return 1; }
                    if (isNaN(parseFloat(numB))) { return -1; }
                }

                return 0;
            }
        }

        var results = table.dataStore.body.rows.sort(compare);

        // Create a new request object
        var newObj = $.extend(true, {}, table.dataStore);

        // Append the sorted rows
        newObj.body.rows = results;

        return newObj;
    };

    // Function that will sort control values
    _priv.controlSort = function _control_sort(table, num, dir) {
        var booleanSort = false;

        function compare(a, b) {
            var colA = a.columns[num];
            var colB = b.columns[num];
            var controlA = '';
            var controlB = '';

            // Column A
            if (colA.contents) {
                // Check to see if the input is a checkbox
                if (colA.contents[0].type === 'checkbox' || colA.contents[0].type === 'radio') {
                    // Set this to true if bools are found
                    booleanSort = true;

                    if (colA.contents[0].input.attributes.hasOwnProperty('checked')) {

                        if (colA.contents[0].input.attributes.value === "true" || colA.contents[0].input.attributes.value === "false") {

                            if (colA.contents[0].input.attributes.value === "true") {

                                controlA = true;
                            }
                            else {
                                controlA = false;
                            }

                        }
                        else {

                            if (typeof colA.contents[0].input.attributes.checked === "boolean") {

                                if (colA.contents[0].input.attributes.checked) {

                                    controlA = true;
                                }
                                else if (!colA.contents[0].input.attributes.checked) {

                                    controlA = false;
                                }
                                else {

                                    controlA = null;
                                }

                            }
                            else if (colA.contents[0].input.attributes.checked === "true") {

                                controlA = true;
                            }
                            else if (colA.contents[0].input.attributes.checked === "false") {

                                controlA = false;
                            }
                            else {

                                controlA = null;
                            }
                        }

                    }
                    else {

                        controlA = false;
                    }
                }
                else {

                    if (colA.contents[0].input.attributes.value) {

                        controlA = colA.contents[0].input.attributes.value;
                    }
                    else {
                        controlA = '';
                    }
                }
            }
            else if (colA.text) {

                controlA = '';
            }

            if (colB.contents) {
                // Check to see if the input is a checkbox
                if (colB.contents[0].type === 'checkbox' || colB.contents[0].type === 'radio') {
                    // Set this to true if bools are found
                    booleanSort = true;

                    if (colB.contents[0].input.attributes.hasOwnProperty('checked')) {

                        if (colB.contents[0].input.attributes.value === "true" || colB.contents[0].input.attributes.value === "false") {

                            if (colB.contents[0].input.attributes.value === "true") {

                                controlB = true;
                            }
                            else {
                                controlB = false;
                            }

                        }
                        else {

                            if (typeof colB.contents[0].input.attributes.checked === "boolean") {

                                if (colB.contents[0].input.attributes.checked) {

                                    controlB = true;
                                }
                                else if (!colB.contents[0].input.attributes.checked) {

                                    controlB = false;
                                }
                                else {

                                    controlB = null;
                                }

                            }
                            else if (colB.contents[0].input.attributes.checked === "true") {

                                controlB = true;
                            }
                            else if (colB.contents[0].input.attributes.checked === "false") {

                                controlB = false;
                            }
                            else {

                                controlB = null;
                            }
                        }

                    }
                    else {

                        controlB = false;
                    }
                }
                else {
                    if (colB.contents[0].input.attributes.value) {

                        controlB = colB.contents[0].input.attributes.value;
                    }
                    else {
                        controlB = '';
                    }
                }
            }
            else if (colB.text) {
                controlB = '';
            }

            // Sort the columns
            if (dir === 'ASC') {
                if (booleanSort) {

                    if (typeof controlA !== "boolean") {
                        controlA = null;
                    }

                    if (typeof controlB !== "boolean") {
                        controlB = null;
                    }

                    // return (controlA === controlB) ? 0 : controlA ? -1 : 1;

                    if ((controlA === null) && (controlB === null))
                        return 0;
                    else if (controlA === null)
                        return 1;
                    else if (controlB === null)
                        return -1;

                    return (controlA === controlB) ? 0 : controlA ? -1 : 1;

                }
                else {

                    if (controlA < controlB) {
                        return -1;
                    }
                    else if (controlA > controlB) {
                        return 1;
                    }

                    return 0;
                }
            }
            else {
                if (booleanSort) {

                    if (typeof controlA !== "boolean") {
                        controlA = null;
                    }

                    if (typeof controlB !== "boolean") {
                        controlB = null;
                    }

                    // return (controlA === controlB) ? -1 : controlA ? 1 : 0;

                    if ((controlA === null) && (controlB === null))
                        return 0;
                    else if (controlA === null)
                        return -1;
                    else if (controlB === null)
                        return 1;

                    return (controlA === controlB) ? 0 : controlA ? 1 : -1;

                }
                else {

                    if (controlA < controlB) {
                        return 1;
                    }
                    else if (controlA > controlB) {
                        return -1;
                    }

                    return 0;
                }
            }
        }

        var results = table.dataStore.body.rows.sort(compare);

        // Create a new request object
        var newObj = $.extend(true, {}, table.dataStore);

        // Append the sorted rows
        newObj.body.rows = results;

        return newObj;
    };

    _priv.ratingSort = function _rating_sort(table, num, dir) {

        function compare(a, b) {

            // Pull the col values out and make sure we have the purest values possible.
            var colA = a.columns[num];
            var colB = b.columns[num];
            var numA = '';
            var numB = '';

            if (colA.contents && colA.contents[0].type === "rating") {

                colA = colA.contents[0].parts.hidden.input.attributes.value;

                if (colA !== undefined) {

                    numA = colA.replace(/[^0-9.-]/g, '');

                    if (numA === "") {

                        numA = 0;
                    }
                }
                else {

                    numA = 0;
                }
            }

            if (colB.contents && colB.contents[0].type === "rating") {

                colB = colB.contents[0].parts.hidden.input.attributes.value;

                if (colB !== undefined) {

                    numB = colB.replace(/[^0-9.-]/g, '');

                    if (numB === "") {

                        numB = 0;
                    }
                }
                else {

                    numB = 0;
                }

            }

            if ((numA !== undefined) && (numA !== '') && (numB !== undefined) && (numB !== '')) {
                if (!isNaN(parseFloat(numA)) && !isNaN(parseFloat(numB))) {
                    numA = parseFloat(numA);
                    numB = parseFloat(numB);

                    if (dir === 'ASC') {
                        return numA - numB;
                    }
                    else {
                        return numB - numA;
                    }
                }
                else if (isNaN(parseFloat(numA)) && isNaN(parseFloat(numB))) {
                    if (dir === 'ASC') {
                        if (numA > numB) {
                            return 1;
                        }

                        if (numA === numB) {
                            return 0;
                        }
                    }
                    else {
                        if (numA > numB) {
                            return 0;
                        }

                        if (numA === numB) {
                            return 1;
                        }
                    }
                }
                else if (isNaN(parseFloat(numB))) {
                    if (dir === 'ASC') {
                        return 1;
                    }
                    else {
                        return -1;
                    }
                }

                if (dir === 'ASC') {
                    return -1;
                }
                else {
                    return 1;
                }
            }
            else {
                if (dir === 'ASC') {
                    if (numA < numB) { return -1; }
                    if (numA > numB) { return 1; }
                }
                else {
                    if (numA < numB) { return 1; }
                    if (numA > numB) { return -1; }
                }

                return 0;
            }
        }

        var results = table.dataStore.body.rows.sort(compare);

        // Create a new request object
        var newObj = $.extend(true, {}, table.dataStore);

        // Append the sorted rows
        newObj.body.rows = results;

        return newObj;
    };

    _priv.timeSort = function _time_sort(table, num, dir) {

        function compare(a, b) {

            // Pull the col values out and make sure we have the purest values possible.
            var timeA = _priv.getValue(a.columns[num]);
            var origA = _priv.getValue(a.columns[num]);
            var timeB = _priv.getValue(b.columns[num]);
            var origB = _priv.getValue(b.columns[num]);

            if (timeA && timeA.length) {
                timeA = _priv.timeCleanup(timeA);
            }
            else {

                // timeA = new Date();
                // timeA.setYear('1970');
                // timeA.setMonth('0');
                // timeA.setDate('1');

                timeA = new Date(-8640000000000000);
            }

            timeA = timeA.getTime() / 1000;

            if (timeB && timeB.length) {
                timeB = _priv.timeCleanup(timeB);
            }
            else {
                // timeB = new Date();
                // timeB.setYear('1970');
                // timeB.setMonth('0');
                // timeB.setDate('1');
                timeB = new Date(-8640000000000000);
            }

            timeB = timeB.getTime() / 1000;

            if (dir === 'ASC') {
                if (timeA > timeB) {
                    return (1);
                }

                if (timeA < timeB) {
                    return (-1);
                }

            }
            else {
                if (timeA > timeB) {
                    return (-1);
                }

                if (timeA < timeB) {
                    return (1);
                }
            }

            return 0;
        }

        var testDate = new Date(-8640000000000000);

        var results = table.dataStore.body.rows.sort(compare);

        // Create a new request object
        var newObj = $.extend(true, {}, table.dataStore);

        // Append the sorted rows
        newObj.body.rows = results;

        return newObj;
    };

    _priv.timeCleanup = function _time_cleanup(value) {

        value = value.trim();

        var date = new Date();
        date.setYear('1970');
        date.setMonth('0');
        date.setDate('1');

        if (value && value.length) {

            // check for AM/PM
            var timeDesg = value.split(' ');
            var hasTimeDesg = false;

            date.setYear('1970');
            date.setMonth('0');
            date.setDate('1');

            var isDay = true;

            // Check to see if the time designation exists
            if (timeDesg.length === 2) {

                hasTimeDesg = true;

                if (timeDesg[1] === "PM") {
                    isDay = false;
                }
            }

            // Split the time
            var time = timeDesg[0].split(':');

            var origH = time[0];

            if (hasTimeDesg && !isDay) {

                origH = parseInt(origH);

                origH += 12;

                origH = origH.toString();
            }

            date.setHours(origH);

            var origM = time[1];

            date.setMinutes(origM);

            var origS = (time[2] && time[2].length >= 1) ? time[2] : "00";

            date.setSeconds(origS);

            var origMS = (time[3] && time[3].length >= 1) ? time[3] : "000";

            date.setMilliseconds(origMS);

            return date;
        }
        else {
            date = new Date(-8640000000000000);
        }

        return date;
    };

    _priv.getValue = function _get_value(colObj) {

        // Check for just a text value
        if (colObj.text && (!colObj.contents || colObj.contents.length === 0)) {

            return colObj.text;
        }
        else {

        }

    };

    // ===============
    // Event Functions
    // ===============

    _events.sortColumn = function _sort_column(evt, table, $column) {

        if (table.dataStore.body && table.dataStore.body.rows && table.dataStore.body.rows.length) {

            table.resetLoadRecord();

            // Check to see if an event is present.
            if ($column === undefined) {
                $column = table;
                table = evt;
                evt = undefined;
            }

            // Get the type of sort that needs to be preformed, or default to alpha
            var columnDataType = ($column.attr('data-sort') !== undefined) ? $column.attr('data-sort') : $column.attr('data-type');
            var columnType = $column.attr('data-columntype');

            var num = false;

            if ($column.attr('data-col-index')) {
                num = parseInt($column.attr('data-col-index'));
            }
            else {
                num = (table.dataStore.selectable) ? $column.index() - 1 : $column.index();
            }

            var sortType = table.dataStore.head.rows[0].columns[num].sortable;

            if (typeof sortType === "boolean" && sortType) {

                // Go out and find all the currently sorted columns
                var alreadySorted = table.obj.$thead.find('[data-sortdir]');

                // Loop through and remove all already handled sort attributes
                alreadySorted.each(function (i) {
                    var $col = $(this);

                    var asNum = false;

                    if ($col.attr('data-col-index')) {
                        asNum = parseInt($col.attr('data-col-index'));
                    }
                    else {
                        asNum = (table.dataStore.selectable) ? $col.index() - 1 : $col.index();
                    }

                    // Remove the already sorted attribute
                    if (asNum !== num) {
                        $col.removeAttr('data-sortdir');
                    }
                });

                var dir = $column.attr('data-sortdir');

                // If the sort direction column type is not a string, or it is but not the value of ASC ore DESC, init like its the first time
                if (typeof dir !== 'string' || (dir !== 'ASC' && dir !== 'DESC')) {
                    $column.attr('data-sortdir', 'ASC');
                    dir = 'ASC';
                }
                else if (dir === 'ASC') {
                    $column.attr('data-sortdir', 'DESC');
                    dir = 'DESC';
                }
                else {
                    $column.attr('data-sortdir', 'ASC');
                    dir = 'ASC';
                }

                var sortedTable = false;

                switch (columnDataType) {

                    case 'alpha':
                    case 'alphaNumeric':
                    case 'link':
                    case 'notifier':

                        // Hook for imporper tag detection because of framework changes
                        if (columnType === "score") {

                            table.dataStore = _priv.scoreSort(table, num, dir);
                        }
                        else if (columnType === "rating") {

                            table.dataStore = _priv.ratingSort(table, num, dir);
                        }
                        else if (columnType === "icon") {

                            table.dataStore = _priv.iconSort(table, num, dir);
                        }
                        else if (columnType === "control") {

                            table.dataStore = _priv.controlSort(table, num, dir);
                        }
                        else {

                            table.dataStore = _priv.alphaSort(table, num, dir);
                        }

                        sortedTable = true;

                        break;

                    case 'date':
                    case 'dateTime':
                    case 'datetime':
                        table.dataStore = _priv.dateSort(table, num, dir);
                        sortedTable = true;

                        break;

                    case 'time':

                        table.dataStore = _priv.timeSort(table, num, dir);
                        sortedTable = true;

                        break;

                    case 'numeric':
                    case 'currency':

                        // Hook for score tag
                        if (columnType === "score") {

                            table.dataStore = _priv.scoreSort(table, num, dir);
                        }
                        else if (columnType === "rating") {

                            table.dataStore = _priv.ratingSort(table, num, dir);
                        }
                        else {

                            table.dataStore = _priv.numericSort(table, num, dir);
                        }

                        sortedTable = true;

                        break;

                    case 'icon':
                        table.dataStore = _priv.iconSort(table, num, dir);
                        sortedTable = true;

                        break;

                    case 'rating':
                        table.dataStore = _priv.ratingSort(table, num, dir);
                        sortedTable = true;
                        break;

                    case 'score':
                        table.dataStore = _priv.scoreSort(table, num, dir);
                        sortedTable = true;

                        break;

                    case 'icon':
                        table.dataStore = _priv.iconSort(table, num, dir);
                        sortedTable = true;

                        break;

                    case 'control':
                        table.dataStore = _priv.controlSort(table, num, dir);
                        sortedTable = true;

                        break;

                    default:
                        console.error('Unkwown sort type requested.');
                        break;
                }

                // Check to see if a sort object was returned.
                if (sortedTable !== false) {

                    // Mark the column as sorted
                    $column.attr('data-sortdir', dir);

                    // Re-render the table body
                    table.renderBody();

                    table.obj.$viewWrapper.scrollTop(0);

                    table.$self.trigger('sort.table');
                }
            }
            else if (typeof sortType === "string") {

                console.log("We have a server side sort.");

            }
            else {

                console.log("not a sortable column");
            }

        }
        else {

            journal.log({ type: 'info', owner: 'UI', module: 'table', submodule: 'sort', func: 'sortColumn' }, 'Sorting function blocked because table does not have a sortable body.');
        }

    };

    // ===============
    // Setup Functions
    // ===============

    _setup.sort = function _sort_setup(table, next) {

        if (!table.config.empty) {

            // Check for sort HTML option
            var sortCheck = table.$self.attr('data-sort');

            if (sortCheck === "false") {
                table.config.setup.sort = false;
            }

            if (table.config.setup.sort) {

                var sortColumns = table.obj.$thead.children('tr').eq(0).children('th.emp-sortable');

                if (sortColumns.length !== 0) {
                    sortColumns.on('click', function (evt) {
                        var $column = $(this);


                        // Verify we are on the th element
                        if ($column[0].nodeName !== 'TH') {
                            $column = $column.parents('th').eq(0);
                        }

                        _events.sortColumn(evt, table, $column);
                    });
                }
            }
        }

        next();
    };

    return {
        _priv: _priv,
        _setup: _setup,
        _defaults: _defaults,
    };
});
