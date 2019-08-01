Handlebars.registerHelper('assetPath', function(context, options) {

    var host = window.location.hostname;
    var protocol = window.location.protocol;
    var port = window.location.port;

    if (port === 80 || port === 443) {

        if (host === "localhost" || protocol === "file") {
            return window.location.protocol + "//" + host + "/dist/";
        }
        else {
            return window.location.protocol + "//" + host + "/emp/";
        }

    }
    else {

        if (host === "localhost" || protocol === "file") {
            return window.location.protocol + "//" + host + ":" + port + "/dist/";
        }
        else {
            return window.location.protocol + "//" + host + ":" + port + "/emp/";
        }

    }

});






