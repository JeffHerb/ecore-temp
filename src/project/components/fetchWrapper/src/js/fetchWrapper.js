define(['promise'], function (Promise) {

    // Utitlit function to handle checking HTTP return status
    function checkStatus(response) {

        if (response.status >= 200 && response.status < 300) {

            return response;

        } else {

            journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'fetchWrapper', func: 'checkStatus' }, response.statusText);

            var error = new Error(response.statusText);

            error.response = response;

            throw error;
        }
    }

    // Utility function to parse JSON
    function parseJSON(response) {

        if (typeof response === "object") {

            return response.json();
        }
        else if (typeof response === "string") {

            try {

                return JSON.parseJSON(response);
            }
            catch(e) {
                return response;
            }

        }

        return response;
    }

    function encodeFormData (oData) {

        var aEncodedValues = [];

        for (var key in oData) {
            aEncodedValues.push(encodeURIComponent(key) + '=' + encodeURIComponent(oData[key]));
        }

        return aEncodedValues.join('&');
    }

    var request = function request(req, res, jsonSubmit) {

        if (req.url) {

            var fetchObj = {
                cache: 'no-cache',
                method: req.method,
            };

            if ((location.hostname === "localhost" || location.hostname === "127.0.0.1") && location.port === "8888" && !req.ignoreLocal) {

                journal.log({ type: 'warning', owner: 'UI', module: 'emp', submodule: 'ajax', func: 'request' }, 'Request method being forced to "GET"');

                req.method = 'GET';
            }
            else {

                // Add method only if needed
                if (!req.method) {
                    fetchObj.method = 'POST';
                }
                else {
                    fetchObj.method = req.method;
                }

                if (!req.headers) {

                    // Add this in all other environments not UI developer machines
                    fetchObj.mode = 'cors';
                    fetchObj.credentials = 'same-origin';

                    fetchObj.headers = {
                        'Access-Control-Allow-Origin': '*'
                    };
                }
                else {

                    fetchObj.mode = 'cors';
                    fetchObj.headers = req.headers;
                }

                if (req.body && typeof req.body === "object" && jsonSubmit) {

                    req.data = JSON.stringify(req.body);
                }

                if (jsonSubmit) {

                    if (fetchObj.headers) {
                        fetchObj.headers['Content-Type'] = 'application/json';
                    }

                    fetchObj.body = req.data;

                }
                else {

                    if (fetchObj.headers) {
                    	fetchObj.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    }

                    fetchObj.body = encodeFormData(req.data);
                }

            }

            if (!req.ignoreResponse) {

                fetch(req.url, fetchObj)
                    .then(checkStatus)
                    .then(parseJSON)
                    .then(function (data) {

                        if (typeof res === "object") {

                            // If response contains a done function execute it
                            if (res.done) {

                                res.done(data);
                            }

                        }
                        else {

                            journal.log({ type: 'error', owner: 'UI', module: 'fetch', func: 'irequest' }, 'Fetch completed but, there was no response object!');
                        }
                    })
                    //resolved or rejected - always
                    .then(function (data) {

                        if (res.always) {

                            res.always(data);
                        }

                    })
                    // Same as jQuery fail!
                    .catch(function (err) {

                        journal.log({ type: 'error', owner: 'UI', module: 'fetch', func: 'irequest' }, 'Fetch Data request failed!');

                        console.log(err);

                        if (res.fail) {

                            res.fail(err);
                        }
                        else {

                            console.log(res);

                        }

                    });

            }
            else {

                journal.log({ type: 'info', owner: 'UI', module: 'fetch', func: 'irequest' }, 'Fetch Data request successfully, but contents ignored!');

                fetch(req.url, fetchObj)
                    .then(checkStatus)
                    .then(function () {


                        if (typeof res === "object") {

                            // If response contains a done function execute it
                            if (res.done) {

                                res.done();
                            }

                        }
                        else {

                            journal.log({ type: 'error', owner: 'UI', module: 'fetch', func: 'irequest' }, 'Fetch completed but, there was no response object!');
                        }
                    })
                    //resolved or rejected - always
                    .then(function () {

                        if (res.always) {

                            res.always();
                        }

                    })
                    // Same as jQuery fail!
                    .catch(function (err) {

                        journal.log({ type: 'error', owner: 'UI', module: 'fetch', func: 'irequest' }, 'Fetch Data request failed!');

                        if (res.fail) {

                            res.fail(err);
                        }

                    });
            }


        }
    };

    return {
        request: request
    };

});
