define(['dataStore', 'handlebars', 'handlebars-templates', 'handlebars-partials', 'handlebars-helpers'], function(ds, handlebars, templates, partials) {

	var _priv = {};
	var _dataShivs = false;
	var _templateShivs = false;
    var _eventShivs = false;
    var _external = false;

    // Make a some template avaliable as a partial as well.
    for (temp in this['JST']) {

        // Make sure its not already a partial template
        if (temp.indexOf('_') !== 0) {

            var partialName = '_' + temp;

            // Check to make sure the partial name is not already reserved
            if (!this['JST'].hasOwnProperty(partialName)) {

                handlebars.registerPartial(partialName, this['JST'][temp], templates.field);
            }

        }
    };

    _priv.generic = function _generic_render(data, parentList, external, cb) {

    	var dataStoreElms = ['field', 'composite'];

	    function innerHTML(string) {
	        var doc = document.createElement("html");
	        doc.innerHTML = string.replace(/\s\s+/g, ' ');
	        return doc;
	    };

        if (!ds.hasStore("globalHeader")) {
            // For the global header only create a data stor object, append nothing!
            ds.createStore(data, 'globalHeader');
        }

        if (dataStoreElms.indexOf(data.template) !== -1) {

            if (data.template === "composite" || (data.template === "field" && data.type !== "button")) {

                var dsID = ds.createStore(data);

                if (!data.attributes) {
                    data.attributes = {};
                }

                data.attributes['data-store-id'] = dsID;
            }

        }

        // Start by rendering the handlebars template
        var render = templates[data.template](data);

    	var parsed = innerHTML(render).querySelector('body');

        if (parsed.childNodes.length) {

            var docFragement = document.createDocumentFragment();

            (function nextChild(childrenNodes) {

                var node = childrenNodes.shift();

                if (node && node.nodeType && node.nodeType === 1) {
                    docFragement.appendChild(node);
                }

                if (childrenNodes.length) {

                    nextChild(childrenNodes);
                }
                else {

                    cb(docFragement);
                }

            })(Array.prototype.slice.call(parsed.childNodes))

        }
        else {

            cb(false);
        }
    };

    _priv.process = function _render(data, root, parentList, cb) {

        var docFragement = document.createDocumentFragment();
        var lastReference = docFragement;

        if (typeof data === "object") {

            var processFunction = false;
            var dataShivName = false;

            if (data.template || data.type) {

                if (!data.template) {
                    data.template = "universal";

                    dataShivName = data.type;
                }
                else {

                    dataShivName = data.template;
                }

                if (_dataShivs[dataShivName]) {

                    data = _dataShivs[dataShivName](data, parentList);
                }

                if (_templateShivs[data.template]) {

                    processFunction = _templateShivs[data.template];
                }
                else {

                    processFunction = _priv.generic;
                }

                processFunction(data, parentList, _external, function(rendered) {

                    if (rendered !== false) {

                        docFragement.appendChild(rendered);
                        lastReference = docFragement.lastChild;
                    }

                    if (data.template !== 'universal') {

                        parentList += (parentList.length) ? (" > " +  data.template) :  data.template;
                    }
                    else {

                        parentList += (parentList.length) ? (" > " +  data.type) :  data.type;
                    }

                    if (data.type === "section" && data.federal) {

                        var federalMsg = {
                            "type": "row",
                            "attributes": {
                                "className": "emp-federal-print-message"
                            },
                            "template": "grid",
                            "contents": [
                                {
                                    "template": "federal-group-message",
                                }
                            ]
                        };

                        if (data.contents && data.contents.length) {

                            if (data.contents[0].template === "group") {

                                data.contents.splice(1, 0, federalMsg);
                            }
                            else {

                                data.contents.unshift(federalMsg);
                            }

                        }
                        else {

                            data.contents.push(federalMsg);

                        }

                    }

                    if (data.contents && data.contents.length) {

                        var inlineSections = [];
                        var insertSections = [];

                        if (!data.skipCheck) {

                            // Loop through all of the children
                            for (var c = 0, cLen = data.contents.length; c < cLen; c++) {

                                // Check for inline section
                                if (data.contents[c] && data.contents[c].type === "section" && data.contents[c].style && data.contents[c].style.indexOf('inline-group') !== -1) {

                                    if (!inlineSections.length) {

                                        inlineSections.push(c);

                                    }
                                    // Verify the last item was also a section
                                    else if (inlineSections.indexOf(c - 1) !== -1) {

                                        inlineSections.push(c);

                                        // Check again for next child
                                        if (data.contents[c + 1] && data.contents[c + 1].type === "section" && data.contents[c + 1].style && data.contents[c + 1].style.indexOf('inline-group') !== -1) {

                                            continue;
                                        }
                                        else {

                                            // Start a wrapper
                                            var newWrapper = {
                                                "type": "div",
                                                "attributes": {
                                                    "className": "emp-inline-sections"
                                                },
                                                "contents": [],
                                                "skipCheck": true
                                            };

                                            // Loop through and place children in wrapper div
                                            for (var ilg = 0, ilgLen = inlineSections.length; ilg < ilgLen; ilg++) {

                                                newWrapper.contents.push( $.extend(true, {}, data.contents[inlineSections[ilg]]) );
                                            }

                                            insertSections.push({
                                                startIndex: inlineSections[0],
                                                newChild: newWrapper,
                                                removeIndexs: [].concat(inlineSections)
                                            });

                                        }

                                    }
                                    else if (inlineSections.length === 1) {

                                        inlineSections = [];
                                    }
                                }

                            }

                            if (insertSections.length) {

                                for (var iw = 0, iwLen = insertSections.length; iw < iwLen; iw++) {

                                    data.contents.splice(insertSections[iw].startIndex, insertSections[iw].removeIndexs.length, insertSections[iw].newChild);
                                }

                            }

                        }

                        (function nextChild(contents) {

                            var content = contents.shift();

                            _priv.process(content, false, parentList, function (subRendered) {

                                if (subRendered !== false) {

                                    lastReference.appendChild(subRendered);
                                }

                                if (contents.length) {

                                    nextChild(contents);
                                }
                                else {

                                    cb(docFragement)
                                }
                            });

                        })(data.contents.concat());

                    }
                    else {

                        cb(docFragement);
                    }

                });

            }
            else {

                if (data.contents && data.contents.length) {

                    (function nextChild(contents) {

                        var content = contents.shift();

                        _priv.process(content, false, "", function _render_sub_child(subRendered) {

                            if (subRendered !== false) {

                                lastReference.appendChild(subRendered);
                            }

                            if (contents.length) {

                                nextChild(contents);
                            }
                            else {

                                cb(docFragement)
                            }
                        });

                    })(data.contents.concat());

                }
                else {

                    cb(docFragement);
                }

            }

        }
        else {

            cb(false);
        }
    };

    var render = function _render(data, root, cb) {

    	if (typeof root === "function") {
    		cb = root;
    		root = false;
    	}

    	_priv.process(data, root, '', function(docFrag) {

            if (docFrag !== false && docFrag !== null) {

                cb(docFrag);
            }
            else {

                cb(false);
            }
    	});
    };

	var setup = function _setup(dataShivs, templateShivs, eventShivs, external, cb) {

		_dataShivs = dataShivs;
		_templateShivs = templateShivs;
        _eventShivs = eventShivs;

        if (external) {
            _external = true;
        }

		if (typeof cb === "function") {

			cb(this);
		}
	};

	return {
		setup: setup,
		render: render,
        isNodeList: _priv.isNodeList
	};

});
