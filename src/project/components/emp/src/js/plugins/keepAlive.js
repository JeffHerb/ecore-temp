define(['fetchWrapper'], function (fw) {

    var e1 = function _empire_1_keep_alive(e1Url, cb) {

        var req = {
            url: e1Url
        };

        var res = {
            "done": function (data) {
                //journal.log({ type: 'error', owner: 'FW', module: 'notifications', func: 'updateView' }, 'Requested data!: ');

                if (data.status && data.status === "success") {

                    data = data.result;

                    if (data.length && data[0].body && data[0].body.notifications) {
                        data = data[0].body.notifications;

                        globals.messages = data;
                    }

                    if (typeof cb === "function") {
                        cb(true);
                    }

                }
                else {
                    journal.log({ type: 'error', owner: 'FW', module: 'keepAlive', func: 'e1' }, 'Error returned successfully from e1 ajax endpoint.');

                    if (typeof cb === "function") {
                        cb(false);
                    }
                }

            },
            "fail": function (err) {

                journal.log({ type: 'error', owner: 'FW', module: 'keepAlive', func: 'e1' }, 'Error occured when attempting to refresh e1 endpoint');

                if (typeof cb === "function") {
                    cb(false);
                }
            }
        };

        // Send request
        emp.fw.request(req, res);

    };

    var e2 = function _empire_2_keep_alive(e2Url, cb) {

        var req = {
            url: e2Url
        };

        var res = {
            "done": function (data) {
                //journal.log({ type: 'error', owner: 'FW', module: 'notifications', func: 'updateView' }, 'Requested data!: ');

                if (data.status && data.status === "success") {

                    data = data.result;

                    if (data.length && data[0].body && data[0].body.notifications) {
                        data = data[0].body.notifications;

                        globals.messages = data;
                    }

                    if (typeof cb === "function") {
                        cb(true);
                    }

                }
                else {
                    journal.log({ type: 'error', owner: 'FW', module: 'keepAlive', func: 'e2' }, 'Error returned successfully from e2 ajax endpoint.');
                }

            },
            "fail": function (err) {

                journal.log({ type: 'error', owner: 'FW', module: 'keepAlive', func: 'e2' }, 'Error occured when attempting to refresh e2 endpoint');
            }
        };

        // Send request
        emp.fw.request(req, res);

    };

    return {
        e1: e1,
        e2: e2
    };

});
