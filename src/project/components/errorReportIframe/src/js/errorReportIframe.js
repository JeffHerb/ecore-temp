////////////////////////////////////////////////
//Injects error report page into iframe
//Recreate error page to see the errors reported
/////////////////////////////////////////////////

//Register as an anonymous module (AMD)
define(['fetchWrapper'], function(fw) {

    var injectIframe = function(iframe){

        // Find the insert div
        var errorReportContainer = document.querySelectorAll('.emp-report-container');

        if (errorReportContainer && errorReportContainer.length === 1) {

            errorReportContainer = errorReportContainer[0];

            var requestURL = errorReportContainer.getAttribute('data-url') || false;

            if (requestURL) {

                var req = {
                    url: requestURL
                };

                var res = {
                    "done": function(data) {

                        if (data.status === "success") {

                            var errorJSON = data.result[0].body;

                            if (errorJSON.page) {
                                errorJSON = errorJSON.page;
                            }

                            // Remove the menu to prevent page navigation from it.
                            if (errorJSON && errorJSON.menu) {
                                delete errorJSON.menu;
                            }

                            // Add flag to indicate this is an error report.
                            errorJSON.errorReport = true;
                            errorJSON.screen.errorReport = true;

                            var assetPath = false;

                            if (errorJSON.assetsPath.domain.indexOf('localhost') === -1) {

                                assetPath = errorJSON.assetsPath.domain + errorJSON.assetsPath.version + "/";
                            }
                            else {
                                assetPath = errorJSON.assetsPath.domain + "/dist/";
                            }


                            var cssPath = assetPath + errorJSON.assetsPath.css;
                            var jsPath = assetPath + errorJSON.assetsPath.js;

                            var iframe = document.createElement('iframe');
                            iframe.setAttribute("style", "display: block; width: 100 %; height: 1100px; border: 4px solid #000000; margin: 15px auto;");
                            iframe.setAttribute("width", "100%");

                            // Change Session ID
                            if (errorJSON.screen && errorJSON.screen.session) {
                                errorJSON.screen.session = errorJSON.screen.session + '_errorPageRender';
                                errorJSON.screen.type = "error";
                            }

                            errorReportContainer.appendChild(iframe);

                            var iframeWin = iframe.contentWindow;
                            var iframeDoc = iframe.contentWindow.document;

                            var header = '<!DOCTYPE html> <html lang="en" class="theme-teal"><head><meta charset="utf-8"/><title>Error Reporting Popup</title><link href="' + cssPath + '" rel="stylesheet" type="text/css" media="all"></head><div id="body-wrapper"></div>';
                            var footer = '<script id="require" src="' + jsPath + '"></script></body></html>';
                            var pageJSON = '<script> var fwData = ' + JSON.stringify(errorJSON) + ';</script>';

                            // Append the error report page to the iframe
                            iframeDoc.open();
                            iframeDoc.write(header + pageJSON + footer);
                            iframeDoc.close();

                            setTimeout(function () {

                                var errorPageBody = iframeDoc.querySelector('#body-wrapper');
                                var searchBoxButton = iframeDoc.querySelector('#search');
                                var tabsetLinks = iframeDoc.querySelectorAll('.emp-tabset a');

                                errorPageBody.classList.add('emp-disabled-page');

                                iframeDoc.getElementsByClassName('emp-header-logo')[0].setAttribute('title', 'Form submissions have been disabled in error report windows.');

                                // Disable all form submits
                                iframeWin.emp.disable.form(true);

                                // Disable search box
                                if (searchBoxButton) {
                                    searchBoxButton.setAttribute('type', 'button');
                                }

                                // Disable Tabset
                                if (tabsetLinks && tabsetLinks.length) {

                                    for (var tl = 0, tlLen = tabsetLinks.length; tl < tlLen; tl++) {

                                        tabsetLinks[tl].setAttribute('href', '#');
                                    }

                                }

                            }, 500);

                        }
                        else {

                            throw new Error("Response returned server side failure. Reach out to framework for more assistance");
                        }

                    },
                    "fail": function(err) {

                        journal.log({ type: 'error', owner: 'FW', module: 'errorReportIframe', func: 'injectIframe' }, 'Error occured when fetching data or after. Error Msg: ' + err);
                    }
                };

                fw.request(req, res);
            }

        }
        else if (errorReportContainer.length > 1) {

            journal.log({ type: 'error', owner: 'FW', module: 'errorReportIframe', func: 'injectIframe' }, 'Too many error report containers exist on the page.');

        }

    };

    return {
        injectIframe: injectIframe
    };

});

