define(['findParent', 'process', 'fetchWrapper', 'render', 'empMessage', 'errorPage'], function(fParent, process, fw, render, eMessage, errPage) {

    var _priv = {};

    _priv.createFieldMessageLoc = function _dropdown_field_message_loc(dField) {

        var dFieldMessageLoc = dField.querySelector('div.cui-messages');
        var dFieldParent = dField.parentNode;

        if (!dFieldMessageLoc) {
            dFieldMessageLoc = document.createElement('div');
            dFieldMessageLoc.classList.add('cui-messages');

            dFieldParent.appendChild(dFieldMessageLoc);
        }

        return dFieldMessageLoc;
    };

    var dropdown = function(evt, target, source, reqType) {

        var returnResult = false;

        if (typeof target === "string") {

            // Get all the target information
            var dTarget = document.querySelector('#' + target);
            var dTargetFieldWrapper = fParent.getFirst(dTarget, '.emp-field');
            var sTargetDataStoreID = dTargetFieldWrapper.getAttribute('data-store-id');
            var oTargetDataStore = emp.ds.getStore(sTargetDataStoreID);

            if (reqType) {

                switch(reqType) {

                    case 'data':

                        break;

                    case 'ajax':

                        if (source && typeof source === "object" && source.url && source.data) {

                            // Generate a request object
                            var req = {
                                url: source.url
                            };

                            var res = {};

                            // Check to see if the data object exists
                            if (Object.keys(source.data).length >= 1) {

                                // Generate a data map from the source.data property defined on the argument map
                                source.data = process.data(source.data);

                                req.data = source.data;

                            }
                            else {

                                journal.log({ type: 'info', owner: 'Developer|Framework', module: 'emp', submodule: 'dropdown - ajax' }, 'Source request for dynamic dropdown did not require any additional parameters');
                            }

                            console.log(req.data);

                            res.done = function _dropdown_response_done(data) {

                                if (data.status === "success" && data.result.length === 1) {

                                    // Check to see if the current target specification has an options property, if not add it
                                    if (!oTargetDataStore.input.options) {
                                        oTargetDataStore.input.options = false;
                                    }

                                    oTargetDataStore.input.options = data.result[0].body;

                                    render.section(undefined, oTargetDataStore, 'return', function(html) {

                                        var dTargetFieldColumn = dTargetFieldWrapper.parentNode;

                                        dTargetFieldColumn.insertBefore(html.firstChild, dTargetFieldWrapper);
                                        dTargetFieldColumn.removeChild(dTargetFieldWrapper);

                                    });
                                }
                                else {

                                    // Error out the user and relocate them to the standard error.jsp for the app
                                    errPage.relocate('error');
                                }

                            };

                            res.fail = function _dropdown_response_fail(err) {

                                    // Error out the user and relocate them to the standard error.jsp for the app
                                    errPage.relocate('error');
                            };

                            fw.request(req, res);
                        }
                        else {

                            journal.log({ type: 'error', owner: 'Developer|Framework', module: 'emp', submodule: 'dropdown - ajax' }, 'Source object is missing or missing url or data property. This is what we have: "' + source + '"');
                        }

                        break;

                    default:

                        journal.log({ type: 'error', owner: 'Developer|Framework', module: 'emp', submodule: 'dropdown' }, 'Unknown request type returned "' + reqType + '"');
                        break;

                }

            }
            else {

                journal.log({ type: 'error', owner: 'Developer|Framework', module: 'emp', submodule: 'dropdown' }, 'Dynamic Dropdown missing source request type');
            }

        }
        else {

            journal.log({ type: 'error', owner: 'Developer|Framework', module: 'emp', submodule: 'dropdown' }, 'Dynamic Dropdown target was not defined!');
        }

        return returnResult;
    };

    return {
        dropdown: dropdown
    };

});
