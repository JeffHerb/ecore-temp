define([], function () {

    var protocol = window.location.protocol;

    if (protocol.indexOf("http") !== -1) {
        protocol = true;
    }
    else {
        protocol = false;
    }

    function inIframe () {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    var favorites = function _favorites_refresh(cb) {

        var errorText = false;

        console.log("fav refresh");

        if (fwData.context.urls && fwData.context.urls.favorites && fwData.context.urls.favorites.fetch) {

            var req = {
                "url": fwData.context.urls.favorites.fetch,
                "cache": false
            };

            var res = {

                done: function _done(data) {

                    if (data.status && data.status === "success") {

                        if (data.result.length === 1 && data.result[0].body) {

                            var body = data.result[0].body;

                            journal.log({type: 'info', owner: 'UI', module: 'refreshSession', func: 'favorites'}, 'Data was recieved via the framework endpoint.');

                            var favData = body.data;
                            var tabsetids = body.tabsetids;

                            if (typeof cb === "function") {

                                cb(favData, tabsetids);
                            }

                        }

                    }
                    else {

                        errorText = "Favorites returned in error. Please contact the help desk.";

                        emp.empMessage.createMessage({text:errorText, type:"error"});

                    }

                },
                fail: function _fail() {

                    errorText = "Favorites fetch failed. Please contact the help desk.";

                    emp.empMessage.createMessage({text:errorText, type:"error"});
                }
            };

            if (protocol) {
                emp.ajax.request(req, res, false, true);
            }
        }
        else {

            if (protocol) {

                errorText = "Unable to find global references to refresh user favorites. Please Contact Help Desk.";

                if (inIframe) {

                    emp.empMessage.createMessage({text:errorText, type:"error"});
                }
                else {
                    emp.empMessage.createMessage({text:errorText, type:"success"});
                }

            }

        }


    };

    return {
        favorites: favorites
    };

});
