define([], function() {

    var _events = {};

    var init = function _init() {

        $paragraphSearchButton = $('button#E2_PARA_SEARCH_JS_9');

        if ($paragraphSearchButton.length === 1) {

            $paragraphSearchButton.on('click', function() {

                try {

                    var sUniqueName = emp.getCookie("JSESSIONID") || "",
                            sWindowName = "paragraph_search_" + sUniqueName.replace(/\W/g,''),
                            width = 990;

                    // Create the window
                    sURL = "http://taxportal/empiresearch/pages/ecpsresults.aspx?k=ANY(" +
                            encodeURIComponent(document.form1.E_SEARCH_TEXT.value) + ")";

                    // Window size
                    if (screen.width >= 1124) {

                        // This size is preferable for avoiding horizontal scrollbars, but the screen must be large enough to fit it
                        width = '1124';

                    } else if (screen.width > 1 && screen.width < 990) {

                        // Check screen.width greater than 1 to make sure it's returning a
                        // real value, Make sure the window still fits on smaller screens
                        width = (screen.width - 20);
                    }

                    // Open the window
                    emp.openWindow(sURL, sWindowName, "width=" + width + ", resizable=yes");

                } catch (e) {
                    console.log(e);
                }

            });
        }
        else {

            journal.log({type: 'warning', owner: 'UI', module: 'pageScript - MDZ807S', func: 'init'}, 'Init function could not find the Paragraph Search button by the id of: E2_PARA_SEARCH_JS_9');
        }

    };

    return {
        init: init
    };

});
