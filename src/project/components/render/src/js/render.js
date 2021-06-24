define(['processTemplates', 'tableShiv', 'sectionShiv', 'groupShiv', 'agencyHeaderShiv', 'fieldEvent', 'compositeEvent'], function(procTemplates, tableShiv, sectionShiv, groupShiv, agencyHeaderShiv, fieldEvent, compositeEvent) {

    var _priv = {
        setup: false
    };

    var dataShivs = {
        "section": sectionShiv.data,
        "group": groupShiv.data,
        "agency-header": agencyHeaderShiv.data
    };

    var templateShivs = {
        "table": tableShiv.render
    };

    var eventShivs = {
        "composite": compositeEvent.bind,
        "field": fieldEvent.bind
    };

    var external = (document.querySelector('html.external-app')) ? true : false;

    // This is the specific function that should only be used to generate the initial page.
    var page = function _page(target, data, cb) {

         //Tempory method to hide itags on page.
        if(data.page && data.page.style && data.page.style.indexOf('remove-itag') > -1){

            // Add global style to page
            document.documentElement.classList.add('emp-remove-itag');

            // Disable legend icon. If present should be first object of page contents array.
            if(data.page.contents && data.page.contents.length > 1){
                if(data.page.contents[0].pageLegend){
                    data.page.contents[0].pageLegend.helpText = false;
                }
            }

            journal.log({ type: 'info', owner: 'UI', module: 'render', func: 'page' }, 'Itags are being hidden by page style.');
        }

        // Check to see if we have an older rendering page
        if (!target.header) {

            target = target.page;
            data = data.page;

            if (typeof data === "object") {

                if (!_priv.setup) {

                    _priv.setup = true;

                    procTemplates.setup(dataShivs, templateShivs, eventShivs);
                }

                // Request the process template module and have the callback return the rendered page.
                procTemplates.render(data, true, function(html) {

                    if (html) {
                        target.appendChild(html);

                        cb();
                    }
                    else {

                        cb();
                    }

                });

            }
            else {

                console.error("UI [render]: fwData.page is not an object");
            }
        }
        else {

            if (!_priv.setup) {

                _priv.setup = true;

                procTemplates.setup(dataShivs, templateShivs, eventShivs);

            }

            // Render the header
            procTemplates.render(data.header, true, function (headerHTML) {

                target.header.appendChild(headerHTML);

                // Check to see if we have a footer
                if (data.footer && target.footer) {

                    // Render the footer
                    procTemplates.render(data.footer, true, function (footerHTML) {

                        target.footer.appendChild(footerHTML);

                        if (data.page && target.page) {

                            // Render the page
                            procTemplates.render(data.page, true, function (bodyHTML) {

                                target.page.appendChild(bodyHTML);

                                if (typeof cb === "function") {
                                    cb();
                                }

                            });

                        }
                        else {

                            if (typeof cb === "function") {
                                cb();
                            }

                        }

                    });

                }
                else {

                    // Render the page
                    procTemplates.render(data.page, true, function (html) {

                        target.page.appendChild(html);

                        if (typeof cb === "function") {
                            cb();
                        }

                    });
                }

            });

        }

    };

    // The section function should be used for on the fly/run-time building of sections.
    var section = function _section(target, data, method, cb) {

        if (!_priv.setup) {

            _priv.setup = true;

            procTemplates.setup(dataShivs, templateShivs, eventShivs, external);
        }

        // Check to see if method is function as that means the method was purposely omitted.
        if (typeof method === "function") {
            cb = method;
            method = undefined;
        }

        if (typeof data === "object") {

            procTemplates.render(data, false, function(html) {

                if (html && html !== null) {

                    if (method === undefined || method === "return") {

                        cb(html, data);
                    }
                    else if (method === "replace") {

                        if (typeof target === "string") {

                            target = document.getElementById(target);

                        }

                        var container = target.parentNode;

                        container.removeChild(target);

                        var contents = html.childNodes;

                        for (var c = 0, cLen = contents.length; c < cLen; c++) {

                            if (contents[c] && contents[c].nodeType && contents[c].nodeType === 1) {

                                container.appendChild(contents[c]);
                            }

                        }

                    }
                    else if (method === "append") {

                        var contents = html.childNodes;

                        for (var c = 0, cLen = contents.length; c < cLen; c++) {

                            if (contents[c] && contents[c].nodeType && contents[c].nodeType === 1) {

                                target.appendChild(contents[c]);
                            }

                        }

                        if (typeof cb === "function") {
                            cb(html);
                        }
                    }
                    else {

                        console.log("Uknown render function passed: " + method);
                    }
                }
                else {

                    console.log("Render returned nothing!");
                }

            });

        }
        else {

            console.error("UI [render]: Invalid data object not provided.")
        }
    };

    return {
        page: page,
        section: section
    };

});
