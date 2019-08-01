define([], function() {

    return function _get_cookie(sName) {

        var aCookies = document.cookie.split(';');
        var i = aCookies.length;
        var oCookie;

        sName = sName + '=';

        while (i--) {
            oCookie = aCookies[i].replace(/^\s*/, '');

            if (oCookie.indexOf(sName) === 0) {
                return oCookie.substring(sName.length, oCookie.length);
            }
        }

        return null;
    };

});
