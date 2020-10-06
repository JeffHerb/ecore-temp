define(['fetchWrapper'], function (fw) {

    var platform = function _platform(pltfrmUrl, cb, pltfrm) {

        var req = {
            url: false,
            ignoreResponse: true
        };

        if (pltfrmUrl.indexOf('http') === -1) {

            req.url = window.location.protocol + "//" + window.location.hostname + pltfrmUrl;
        }
        else {

            req.url = pltfrmUrl;
        }

        //We need to pass an object in some instances for journal log
        if(typeof pltfrm === 'object'){

            var pltfrmName = pltfrm.name;
        }

        var res = {
            "done": function (data) {

                if (data) {

                    // Since empire 1 does not return any page json or standard ajax we just assume its fine by done being called.
                    journal.log({ type: 'info', owner: 'FW', module: 'keepAlive', func: 'flatform' }, pltfrmName + ' successfully refreshed from ' + pltfrmName + ' ajax endpoint');

                    if (typeof cb === "function") {
                        cb(true, pltfrm);
                    }
                }

            },
            "fail": function (err) {

                journal.log({ type: 'error', owner: 'FW', module: 'keepAlive', func: 'flatform' }, 'Error occured when attempting to refresh ' + pltfrmName + ' endpoint');

                if (typeof cb === "function") {
                    cb(false, pltfrm);
                }
            }
        };

        // Send request
        emp.fw.request(req, res);

    };

    return {
        platform: platform
    };

});
