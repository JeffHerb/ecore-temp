define(['deepmerge'], function(deepmerge) {

    var _priv = {};

    // Object to keep track of all the style sheets.
    var _sheetStore = {};

    // Function creates a new
    _priv.newStyleSheet = function _new_style_sheet(name, media) {
        var sheet = (function() {
            // Create the <style> tag
            var style = document.createElement('style');

            // Add a media (and/or media query) here if provided or just force to screen
            if (!media) {
                style.setAttribute('media', 'screen');
            }
            else if (typeof media === 'string') {
                style.setAttribute('media', media);
            }
            else {
                style.setAttribute('media', 'screen');

                console.warn('[UI - Stylesheet] Stylesheet has been set to screen only because the request included unexpected media data-type: ', media);
            }

            // Use the provided name to set the stylsheet name
            style.setAttribute('id', name);

            // WebKit hack :(
            style.appendChild(document.createTextNode(''));

            // Add the <style> element to the page
            document.head.appendChild(style);

            // Add it tor sheet stor eincase we need to look it up by name.
            _sheetStore[name] = style.sheet;

            return style.sheet;
        }());

        return sheet;
    };

    _priv.addRule = function _add_rule (sheet, selector, rules, index) {
        if ('insertRule' in sheet) {
            // A valid index must be provided to `.insertRule()` per the spec, plus it will show warnings in Chrome's console
            if (typeof index !== 'number') {
                // Put it at the end of the current style sheet so it will cascade over any existing rules for the same selector
                index = sheet.cssRules.length;
            }

            sheet.insertRule(selector + '{' + rules + '}', index);
        }
        else if('addRule' in sheet) {
            sheet.addRule(selector, rules, index);
        }
    };

    _priv.deleteRule = function _delete_rule (sheet, selector) {

        var recheck = [];

        if (sheet.cssRules.length !== 0) {
            if (Array.isArray(selector)) {
                //TODO: Add Array support
            }
            else {

                for (var i = 0, len = sheet.cssRules.length; i < len; i++) {
                    var styleRule = sheet.cssRules[i];

                    if (styleRule !== undefined) {

                        if (styleRule.selectorText !== undefined && styleRule.selectorText === selector) {
                            sheet.deleteRule(i);

                            recheck.push({i: i, selector: selector});
                        }

                        if (selector.indexOf('*') !== -1) {
                            var tempSelector = selector.replace('*', '');

                            if (styleRule.selectorText !== undefined && styleRule.selectorText === tempSelector) {
                                sheet.deleteRule(i);

                                recheck.push({i: i, selector: selector});
                            }
                        }
                    }
                }
            }
        }
        else {
            console.warn('No style rules to delete');
            return true;
        }
    };

    _priv.updateRule = function _update_rule (sheet, rules) {

        var selector;
        var currentRules;
        var styleRule;
        var i;
        var len;

        function generateSelectorRules (rules) {
            var fullStyleList = '';

            for (var style in rules) {
                if (rules.hasOwnProperty(style)) {
                    fullStyleList += style + ':' + rules[style] + ';';
                }
            }

            return fullStyleList;
        }

        function convertCSStext (text, selector) {
            var ruleArray =  text.replace(selector, '').replace(/[\{\}]+/g,'').trim().split(';');
            var ruleObject = {};

            for (var i = 0, len = ruleArray.length; i < len; i++) {
                var styleRule = ruleArray[i].split(':');
                var style = styleRule[0].trim();

                // Filter our nameless rules
                if (style !== '') {
                    ruleObject[style] = styleRule[1];
                }
            }

            return ruleObject;
        }

        for (selector in rules) {

            if (rules.hasOwnProperty(selector)) {

                // Check to see if the selector already has this rule.
                if (sheet.cssRules.length !== 0) {

                    currentRules = null;
                    var ruleRemovedIndex = null;
                    var removedText = null;

                    for (i = 0, len = sheet.cssRules.length; i < len; i++) {
                        styleRule = sheet.cssRules[i];

                        if (styleRule && styleRule.selectorText === selector) {

                            _priv.deleteRule(sheet, selector);
                        }
                    }

                    if (styleRule) {

                        currentRules = convertCSStext(styleRule.cssText, selector);
                        currentRules = deepmerge(currentRules, rules[selector]);

                        // Now add the rule
                        _priv.addRule(sheet, selector, generateSelectorRules(currentRules) );
                    }
                }
                else {
                    _priv.addRule(sheet, selector, generateSelectorRules(rules[selector]) );
                }
            }
            else {

                console.log("no selector in rules");
            }
        }
    };

    // Function to create/register a new stylesheet
    var newStyleSheet = function _new_style_sheet (name, media, rules) {
        // Move the rules over to be in the right spot so media can be optional if needed.
        if (typeof media === 'object' && rules === undefined) {
            rules = media;
            media = undefined;
        }

        // Check to see if we can safely create this stylesheet
        if (!_sheetStore.hasOwnProperty(name)) {
            // Create the stylesheet
            var sheet = _priv.newStyleSheet(name, media);

            updateStyleRule(sheet, rules);

            // Add the style sheet to the store.
            _sheetStore[name] = sheet;

            // Return the stylesheet instance to the caller.
            return sheet;
        }
        else {
            console.error('[UI - Stylesheet] Attempt to create a stylesheet with a similar name: "' + name + '" named stylesheet returned');

            return _sheetStore[name];
        }
    };

    var deleteStyleSheet = function _delete_style_sheet(name) {

        if (_sheetStore.hasOwnProperty(name)) {

            delete _sheetStore[name];

            $('#' + name).remove();
        }

    };

    var deleteStyleRule = function _delete_style_rule (sheet, rules) {
        if (typeof sheet === 'object' && sheet.cssRules) {
            // Check to make sure this is a real stylesheet object
            if (!sheet.cssRules) {
                console.error('[UI - Stylesheet] Passed in object is not a stylesheet object');

                return false;
            }
        }
        else if (typeof sheet === 'string') {
            sheet = _sheetStore[sheet];
        }
        else {
            console.error('[UI - Stylesheet] Unable to locate stylesheet being referenced: ', sheet);

            return false;
        }

        // Call the update function
        _priv.deleteRule(sheet, rules);
    };

    var updateStyleRule = function _update_style_rule (sheet, rules) {

        if (typeof sheet === 'object' && sheet && sheet.cssRules) {
            // Check to make sure this is a real stylesheet object
            if (!sheet.cssRules) {
                console.error('[UI - Stylesheet] Unable to locate stylesheet being referenced: ', sheet);

                return false;
            }
        }
        else if (typeof sheet === 'string') {
            sheet = _sheetStore[sheet];
        }
        else {
            console.error('[UI - Stylesheet] Unable to locate stylesheet being referenced: ', sheet);

            return false;
        }

        // Call the update function
        _priv.updateRule(sheet, rules);
    };

    return {
        newSheet: newStyleSheet,
        deleteSheet: deleteStyleSheet,
        updateRule: updateStyleRule,
        deleteRule: deleteStyleRule
    };
});
