define([], function() {

    var relocate = function _error_out(sErrorPageName) {

        //console.log(window.location);

        var sAppName = window.location.pathname.slice(1).split('/')[0];
        var sAppBaseURI = window.location.protocol + '//' + window.location.hostname + '/' + sAppName;

        switch (sErrorPageName) {

            case 'invalidSession':
                window.location.replace(sAppBaseURI + '/invalid-session-error.jsp');
                break;

            case 'session':
                window.location.replace(sAppBaseURI + '/existingSessionError.jsp');
                break;

            case 'auth':
                window.location.replace(sAppBaseURI + '/genericAuthError.jsp');
                break;

            default:
                window.location.replace(sAppBaseURI + '/error.jsp');
                break;

        }

    };

    return {
        relocate: relocate
    };

});
