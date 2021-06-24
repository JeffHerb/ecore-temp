Handlebars.registerHelper('extendDefaults', function (params) {

    // Get the provided default setting for the element.

    var defaults = false;

    if (params.hash.defaults) {

        if (typeof params.hash.defaults !== "object")  {

            if (typeof params.hash.defaults === "string") {

                defaults = JSON.parse(params.hash.defaults);
            }
            else {

                defaults = {};
            }
        }
        else {

            defaults = JSON.parse(JSON.stringify(params.hash.defaults));
        }

    }
    else {

        defaults = {};
    }

    //var defaults = (params.hash.defaults) ? JSON.parse(params.hash.defaults) : {};

    // Get a copy of the scope if its supplied
    var scope = (params.hash.scope) ? params.hash.scope : false;
    var state = (params.hash.state) ? params.hash.state : false;
    var section = (params.hash.section) ? params.hash.section : false;

    function addValue (type, value) {

        // Check to see if this attribute value exists
        if (defaults.hasOwnProperty(type)) {
            defaults[type] += ' ' + value;
        }
        else {
            // Defautl does not have this type, so lets create it.
            defaults[type] = value;
        }
    };

    function replaceValue(type, value) {
        defaults[type] = value;
    };

    function suffixValue(type, suffix) {

        defaults[type] = (defaults[type] + suffix);
    };

    function addInlineStyle (rule, value) {

        // Create the html attribute
        addValue('style', rule + ':' + value + ';');
    };

    var _extendFuncs = {};

    _extendFuncs.extend = function _extend (obj, section, scope, state) {

        if (obj !== undefined) {
            if (typeof obj === 'string') {
                obj = JSON.parse(obj);
            }

            for (var prop in obj) {
                addValue(prop, obj[prop]);
            }
        }
    };

    // Look for special attribute attached based on specific sections. These are not passed in from framework as UI wants the ability to change them as needed.
    _extendFuncs.section = function _section_attributes (source, section, scope, state) {
        if (section !== undefined) {
            switch (section) {
                case 'asof-previous':
                    addValue('className', 'emp-asof-prev');
                    break;

                case 'asof-next':
                    addValue('className', 'emp-asof-next');
                    break;

                case 'globalHeader':
                    if (scope === 'message') {

                        addValue('className', 'cui-messages');
                        addValue('className', 'emp-messages');
                    }

                    break;
            }
        }
    };

    // This function handles when a element has a selected attribute
    _extendFuncs.selected = function _selected (bool, section, scope, state) {
        if (bool === true || bool === 'true') {
            addValue('className', 'emp-selected');
        }
    };

    _extendFuncs.style = function _style (styles, section, scope, state) {

        if (styles !== undefined) {

            if (styles.indexOf(',') !== -1) {
                styles = styles.split(',');
            }
            else {
                styles = [styles];
            }

            for (var i = 0, len = styles.length; i < len; i++) {

                switch (styles[i]) {

                    case 'error':
                        addValue('className', 'cui-error');
                        break;

                    case 'info':
                    case 'informational':
                        addValue('className', 'cui-informational');
                        break;

                    case 'warning':
                        addValue('className', 'cui-warning');
                        break;

                    case 'success':
                        addValue('className', 'cui-success');
                        break;

                    case 'currency':
                        addValue('className', 'cui-currency');
                        break;

                    case 'numeric':
                    addValue('className', 'cui-numeric');
                    break;

                    case 'align-right':
                        addValue('className', 'cui-align-right');
                        break;

                    case 'align-center':
                        addValue('className', 'cui-align-center');
                        break;

                    case 'currency-left':
                        addValue('className', 'emp-currency-left');
                        break;

                    case 'min-width':
                        addValue('className', 'emp-min-width');
                        break;

                    case 'negative':
                    case 'negative-number':

                        addValue('className', 'emp-negative-number');
                        break;

                    case 'no-wrap':
                        addValue('className', 'cui-no-wrap');
                        break;

                    case 'equal-height':
                        addValue('className', 'emp-equal-height');
                        break;

                    case 'key-value':
                        addValue('className', 'emp-key-value-pairs');
                        break;

                    case 'bold':

                        addValue('className', 'emp-bold');
                        break;

                    case 'top-align-label':
                        addValue('className', 'emp-top-align-label');
                        break;

                    case 'skip-blocker':
                        addValue('data-skip-blocker', 'true');
                        break;

                    case 'indicator-1':
                        addValue('className', 'emp-indicator-1');
                        break;

                    case 'indicator-2':
                        addValue('className', 'emp-indicator-2');
                        break;

                    case 'indicator-3':
                        addValue('className', 'emp-indicator-3');
                        break;

                    case 'order-column':
                        addValue('className', 'emp-order-column');
                        break;

                    case 'mobile-responsive':
                        addValue('className', 'emp-pivot-table');
                        break;

                    case 'manual-stripping':
                        addValue('className', 'cui-no-stripes');
                        break;

                    // Disable table plugins

                    case 'noFilter':
                        addValue('data-filter', 'false');
                        break;

                    case 'noResize':
                        addValue('data-resize', 'false');
                        break;

                    case 'noColumns':
                        addValue('data-responsive', 'false');
                        break;

                    case "employee":

                        addValue('className', 'emp-ajax-tooltip');
                        break;

                    case "boolean-list":
                        addValue('className', 'emp-boolean-input-group');
                        break;

                    case "hidden":
                        addValue('className', 'cui-hide-from-screen');
                        break;

                    // Expandable Text Areas
                    case "expanding":
                        addValue('className', 'emp-expanding');
                        break;

                    // Expandable region hooks for rows and columns!
                    // Already open expandable regions
                    case "expandable-region":
                        addValue('aria-live', 'polite');
                        break;

                    // Rendered closed expandable regions
                    case "expandable-region-collapsed":
                        addValue('aria-live', 'polite');
                        addValue('className', 'emp-collapse');
                        break;

                    case "actions":
                        addValue('className', 'emp-external-actions-menu');
                        break;

                    case "light-header":
                        addValue('className', 'emp-light-header');
                        break;

                    // EC COMPONENTS
                    case 'ecSubComp':
                        addValue('className', "ec-sub-component-source");
                        break;

                    case 'ec-short-section':
                        addValue('className', 'ec-short-section');
                        break;

                    case 'ec-long-section':
                        addValue('className', 'ec-long-section');
                        break;

                    // EMP TEST STYLES NOT FOR PRODUCTION USE
                    case 'active-green':
                        addValue('className', 'emp-active-green');
                        break;

                    case 'active-red':
                        addValue('className', 'emp-active-red');
                        break;

                }
            }
        }
    };

    _extendFuncs.theme = function(theme, section, scope, state) {

        switch (theme) {
            case 'orpts':
                addValue('className', 'emp-orpts-subtheme');
                break;
        }

    };

    _extendFuncs.align = function _align(align, styles, section, scope, state) {
        if (align !== undefined) {
            if (align === 'right') {
                addValue('className', 'cui-align-right');
            }
            else if (align === 'center') {
                addValue('className', 'cui-align-center');
            }
        }
    };

    _extendFuncs.collapse = function _collapse (bool, section, scope, state) {
        if (bool === true || bool === 'true') {
            addValue('className', 'emp-collapse');
        }
    };

    _extendFuncs.collapseChildren = function _collapseChilden(bool, section, scope, state) {
        if (bool === true || bool === 'true') {
            addValue('className', 'emp-collapse-children');
        }
    };

    _extendFuncs.visibility = function _visibility (value, section, scope, state) {
        // Check to see if a scope and a state of hidden was defined, otherwise do nothing
        if (scope !== undefined) {
            switch (scope) {
                default:

                    addValue('className', 'cui-hidden');
                    break;
            }
        }
    };

    _extendFuncs.federal = function _federal (bool, section, scope, state) {
        if (bool === true || bool === 'true') {
            switch (scope) {
                case 'notifier':
                    // Check to see if this is a global Header notifier
                    if (section === 'globalHeader') {
                        addValue('className', 'emp-indicator');
                    }

                    addValue('className', 'emp-federal-data');

                    break;

                case 'inputGroup':
                    addValue('className', 'emp-federal-data');

                    break;

                default:
                    addValue('className', 'emp-federal-data');

                    break;
            }
        }
    };

    _extendFuncs.primary = function _primary (bool, section, scope, state) {

        if (bool === true || bool === 'true') {
            addValue('className', 'cui-button-primary');
        }
    };

    _extendFuncs.required = function _required (def, section, scope, state) {

        if (typeof def === "object") {

            // Check the scope here as many elements are affected by a single value.
            switch (scope) {

                case 'boolean-input':
                    addValue('required', 'true');
                    break;

                case 'field':
                case 'inputGroup':
                case 'search-composite':
                case 'file-upload':

                    if (state === "forceRequired" && def.required) {

                        addValue('className', 'cui-required');
                    }
                    else if (def.required && !def.readOnly) {

                        addValue('className', 'cui-required');
                    }

                    break;
            }
        }
        else if (typeof def === "boolean" && def) {

            // Check the scope here as many elements are affected by a single value.
            switch (scope) {

                case 'boolean-input':
                    addValue('required', 'true');
                    break;

                case 'yesNo':
                    addValue('className', 'cui-required');
                    addValue('aria-required', 'true');
                    break;

                case 'field':
                case 'inputGroup':
                case 'search-composite':
                case 'file-upload':

                    addValue('className', 'cui-required');
                    break;
            }

        }
    };

    _extendFuncs.total = function _total(def, section, scope, state){

        if(def.total || def.total === 'true'){

            addValue('className', 'emp-total');

        }else if(def.totalLine || def.totalLine === 'true'){

            addValue('className', 'emp-total-line');
        }
    }

    _extendFuncs.nestCheck = function _nest_check (elem, section, scope, state) {
        if (elem !== undefined) {
            switch (elem) {
                case 'section':
                    addValue('className', 'emp-section-in-section-container');
                    break;
            }
        }
    };

    _extendFuncs.addClass = function _add_class(classString, section, scope, state) {

        if (classString !== undefined) {
            addValue('className', classString);
        }
    };

    _extendFuncs.idSuffix = function _id_suffix(suffix, section, scope, state) {

        if (defaults && defaults.id !== undefined && typeof suffix === "string") {

            suffixValue("id", suffix);
        }
    };

    _extendFuncs.title = function _title (title, section, scope, state) {

        if (title) {
            addValue('title', title);
        }

    };

    // This function polly fills in all icon classes
    _extendFuncs.iconClass = function _icon_class (icon, section, scope, state) {
        var iconClass;
        var prefix = 'emp-icon-';

        // Use a switch case to get the right icon
        switch (icon) {
            case 'checkmark':
            case 'redcheck':
                iconClass = 'redcheck';
                break;

            case 'green-check':
            case 'greencheck':
                iconClass = 'greencheck';
                break;

            case 'credits-claimed':
                iconClass = 'credits-claimed'
                break;
    
            case 'error':
                iconClass = 'error';
                break;

            case 'stop':
            case 'not-applicable':
                iconClass = 'stop';
                break;

            case 'legal':
            case 'iLegalRepresentative.gif':
                iconClass = 'legal-rep';
                break;

            case 'printer':
            case 'iprint.gif':
                iconClass = 'print';
                break;

            case 'data-joint':
                iconClass = 'data-joint';
                break;

            case 'list-joint':
                iconClass = 'list-joint';
                break;

            case 'tax-type':
                iconClass = 'tax-type';
                break;

            case 'add-event':
            case 'iCommentsAdd.gif': // Backward support icon
                iconClass = 'add-event';
                break;

            case 'emp-work-items.svg':
                iconClass = 'work-items';
                break;

            case 'diff-mail':
                iconClass = 'diff-mail';
                break;

            case 'resize-section':
                iconClass = 'resize-section';
                break;

            case 'ipopup.gif':
            case 'popup':
            case 'popup-view-list':
                iconClass = 'popup-view-list';
                break;

            case 'view-notes':
                iconClass = 'view-notes';
                break;

            case 'work-items':
                iconClass = 'work-items';
                break;

            case 'iViewMoreDetails.gif':
            case 'view-details':
                iconClass = 'view-details';
                break;

            case 'delete':
            case 'iDeleteImage.gif':
                iconClass = 'delete';
                break;

            case 'edit':
            case 'iEditImage.gif':
                iconClass = 'edit';
                break;

            case 'help':
                iconClass="help";
                break;

            case 'letters-tx':
                iconClass = 'letters-tx';
                break;

            case 'star-red':
                iconClass = 'star-red';
                break;

            case 'ipreview.gif':
            case 'iPreview.gif':
            case 'more-info':
                iconClass = 'more-info';
                break;

            case 'previous':
                iconClass = "previous";
                break;

            case 'next':
                iconClass = "next";
                break;

            case "first":
                iconClass = "first";
                break;

            case "last":
                iconClass= "last";
                break;

            // Old Icons ....

            case 'iAdjustReturn.gif':
                iconClass = 'adjust-return';
                break;

            // Missing from empire 1
            case 'iact_inact.gif':
                iconClass = 'iact-inact';
                break;

            case 'iAssignmentHistory.gif':
                iconClass = 'assignment-history';
                break;

            case 'associations.gif':
                iconClass = 'associations';
                break;

            case 'iAssociate.gif':
                iconClass = 'associate';
                break;

            case 'ibank.gif':
                iconClass = 'bank';
                break;

            case 'iCARTSAssessments.gif':
                iconClass = 'cart-assignment';
                break;

            case 'iCreatedUnderJoint.gif':
                iconClass = 'created-under-joint';
                break;

            case 'iClaims.gif':
                iconClass = 'claims';
                break;

            case 'iCopy.gif':
                iconClass = 'copy';
                break;

            case 'icreateMigNum.gif':
                iconClass = 'create-migration-number';
                break;

            case 'iCTProfile.gif':
                iconClass = 'ct-profile';
                break;

            case 'iCSProfile.gif':
                iconClass = 'cs-profile';
                break;

            case 'iDirectDeposit.gif':
                iconClass = 'direct-deposit';
                break;

            case 'document-out.gif':
                iconClass = 'document-out';
                break;

            case 'idrilldown.gif':
            case 'drill-down':
                iconClass = 'drill-down';
                break;

            case 'iEventsLog.gif':
                iconClass = 'event-log';
                break;

            case 'iExternalTransmittal.gif':
            case 'iExternalTransmittal.png':
                iconClass = 'external-transmittal';
                break;

            case 'ifilingcomp.gif':
                iconClass = 'filing-comp';
                break;

            case 'ipicture.gif':
            case 'iPicture.gif':
            case 'view-image':
                iconClass = 'view-image';
                break;

            case 'iinformation.gif':
            case 'informational':
                iconClass = 'informational';
                break;

            case 'iInternalTransmittal.png':
                iconClass = 'internal-transmittal';
                break;

            case 'iLPSummary.png':
                iconClass = 'lp-summary';
                break;

            case 'iLocked.gif':
                iconClass = 'lock';
                break;

            case 'iLiabilityPeriod.gif':
                iconClass = 'liability-period';
                break;

            case 'imanualadjust.gif':
                iconClass = 'manual-adjust';
                break;

            case 'iMap.gif':
                iconClass = 'map';
                break;

            case 'dollar-sign':
            case 'imoney.gif':
                iconClass = 'dollar-sign';
                break;

            case 'iMultipleReturns.gif':
                iconClass = 'multiple-returns';
                break;

            case 'iFormOrder.gif':
                iconClass = 'form-order';
                break;

            case 'iOSCVoid.gif':
                iconClass = 'osc-void';
                break;

            case 'iDraft.gif':
                iconClass = 'draft';
                break;

            case 'iArrowDown1.gif':
                iconClass = 'arrow-down';
                break;

            case 'iFinal.gif':
                iconClass = 'final-copy';
                break;

            case 'iRecordMatch.gif':
                iconClass = 'record-match';
                break;

            case 'iTransmittal.png':
                iconClass = 'transmittal';
                break;

            case 'iremoveMigNum.gif':
                iconClass = 'remove-mig-num';
                break;

            case 'iRollup.gif':
                iconClass = 'roll-up'
                break;

            case 'iSalesTaxLiabilities.gif':
                iconClass = 'sales-tax-liabilities';
                break;

            case 'iSalesTaxProfile.gif':
                iconClass = 'sales-tax-profile';
                break;

            case 'iArrowUp1.gif':
                iconClass = 'arrow-up';
                break;

            case 'iSourceOfDeficiency.gif':
                iconClass = 'source-of-deficiency';
                break;

            case 'itabledetails.gif':
                iconClass = 'table-details';
                break;

            case 'iTransfInOut.gif':
                iconClass = 'transfer-in-out';
                break;

            case 'iTaxpayerData.png':
                iconClass = 'tax-payer-data';
                break;

            case 'iTaxpayerAssessments.gif':
                iconClass = 'tax-payer-assessments';
                break;

            case 'iTrxn.gif':
                iconClass = 'trxn';
                break;

            case 'iUnlink.gif':
                iconClass = 'unlink';
                break;

            case 'iUnlocked.gif':
                iconClass = 'unlock';
                break;

            case 'iUserProfiles.gif':
                iconClass = 'user-profile';
                break;

            case 'iViewMap.gif':
                iconClass = 'view-map';
                break;

            case 'iViewPDF.gif':
                iconClass = 'view-pdf';
                break;

            case 'iWageReporting.gif':
                iconClass = 'wage-reporting';
                break;

            case 'icalculator.png':
                iconClass = 'calculator';
                break;

            case 'iFinancialWorksheet.gif':
                iconClass = 'financial-worksheet';
                break;

            case 'iLink.gif':
                iconClass = 'link';
                break;

            case 'ifolderclosed.gif':
                iconClass = 'folder-closed';
                break;

            case 'iLowPriority.gif':
            case 'low-priority':
                iconClass = 'low-priority';
                break;

            case "medium-priority":
                iconClass = 'medium-priority';
                break;

            case 'priority-1':
            case 'high-priority':
                iconClass = 'high-priority';
                break;

            // Workflow

            case 'iWorklistLaunch.gif':
                iconClass = 'worklist-launch';
                break;

            case 'iWFpending.gif':
                iconClass = 'work-flow-pending'
                break;

            case 'iWFgetNext.gif':
            case 'workflow-item-next':
                iconClass = 'work-flow-next'
                break;

            case 'iWFgotoSubCategoryWorklist.png':
            case 'work-flow-subcategory-work-list':
            case 'iWFgotoSubCategoryWorklist.gif':
                iconClass = 'work-flow-subcategory-work-list'
                break;

            case 'iWFreturnToWorkList.gif':
            case 'work-flow-return-to-work-list':
                iconClass = 'work-flow-return-to-work-list';
                break;

            case 'workflow-item-comments':
            case 'iComments.gif':
                iconClass = 'workflow-item-comments';
                break;

            case 'workflow-item-no-comments':
            case 'iCommentsmt.gif':
                iconClass = 'workflow-item-no-comments';
                break;

            case 'workflow-item-work-management':
                iconClass = 'workflow-item-work-management';
                break;

            case 'responsive-table-menu':
                iconClass = 'responsive-table-menu';
                break;

            case 'exclamation':
                iconClass = 'exclamation';
                break;

            case 'up-arrow':
            case 'filled-up':
            case 'positive-influence':
                iconClass = 'filled-up';

                break;

            case 'down-arrow':
            case 'outline-down':
            case 'negative-influence':
                iconClass = 'outline-down';
                break;

            case 'order-table-move-down':
                iconClass = 'order-table-move-down';
                break;

            case 'order-table-move-up':
                iconClass = 'order-table-move-up';
                break;

        }

        // Check to make sure a value was found
        if (iconClass) {
            addValue('className', prefix + iconClass);
        }

        switch (icon) {

            case 'down-arrow':
            case 'outline-down':
            case 'negative-influence':

                addValue('data-sortValue', "0");
                break;

            case 'up-arrow':
            case 'filled-up':
            case 'positive-influence':

                addValue('data-sortValue', "1");
                break;

        }
    };

    // Function is used by both buttons, links and notifiers
    _extendFuncs.popup = function _popup (bool, section, scope, state) {
        if (bool === true || bool === 'true') {
            switch (scope) {
                case 'notifier':
                    addValue('className', 'popup');
                    break;

                default:
                    addValue('className', 'emp-popup');
                    break;
            }
        }
    };

    _extendFuncs.compositeSearchRequired = function _composite_search_required(compositeDef, section, scope, state) {

        if (typeof compositeDef === "object") {

            if (compositeDef.text && compositeDef.text.input.required && compositeDef.button) {

                addValue('className', 'cui-required');
            }

        }
    };

    _extendFuncs.expands = function _expandable_contorl(control, section, scope, state ) {

        switch (control.type) {

            case "select":

                if (control.input && !control.input.readOnly && control.input.options && control.input.options.length) {

                    var foundExpandable = false;
                    var expandableOpen = false;
                    var controlContainers = [];

                    for (var o = 0, oLen = control.input.options.length; o < oLen; o++) {

                        if (control.input.options[o].expands) {

                            foundExpandable = true;

                            if (controlContainers.indexOf(control.input.options[o].expands) === -1) {

                                controlContainers.push(control.input.options[o].expands);
                            }

                            if (control.input.options[o].value === control.input.value) {
                                expandableOpen = true;
                            }

                        }

                    }

                    if (foundExpandable && controlContainers.length) {
                        addValue('className', 'emp-expandable-control');
                        addValue('aria-controls', controlContainers.join(' '));

                        if (expandableOpen) {
                            addValue('aria-expanded', "true");
                        }
                        else {
                            addValue('aria-expanded', "false");
                        }
                    }

                }

                break;

            case "radio":
            case "checkbox":

                if (control.input && control.input.expands) {

                    var controlSections = control.input.expands.split(','). join(" ");

                    // Add the aria definition for what this input controls
                    addValue('aria-controls', controlSections);

                    // Add genaric expandable-control hook
                    addValue('className', 'emp-expandable-control');

                    if (control.input.attributes && control.input.attributes.checked) {
                        addValue('aria-expanded', "true");
                    }
                    else {
                        addValue('aria-expanded', "false");
                    }

                }

                break;

            // Hook for no input controls but sub elements
            default:

                if (scope === "option" && control.expands) {

                    addValue('data-expands', control.expands);
                }

                break;

        }


    };

    // ====================
    // Tag Specific Extends
    // ====================

    // Notifiers
    _extendFuncs.notifierLengthClass = function _notifier_length_class (text, section, scope, state) {
        if (text !== undefined) {
            var textLength = text.length;
            var className = 'emp-indicator-' + textLength;

            addValue('className', className);
        }
    };

    _extendFuncs.notifierColor = function _notifier_color(color, section, scope, state) {

        if (color !== undefined) {

            switch (color) {

                case "black":

                    addValue('className', 'emp-notifier-color-black');
                    break;

                case "green":

                    addValue('className', 'emp-notifier-color-green');
                    break;

                case "lightgray":

                    addValue('className', 'emp-notifier-color-lightgray');
                    break;

                default:
                    addValue('className', 'emp-notifier-color-red');
                    break;
            }

        }
        else {

            // Undefined requests will default to red
            addValue('className', 'emp-notifier-color-red');

        }
    };

    // Labels
    _extendFuncs.labelLength = function _label_length (text, section, scope, state) {
        if (typeof text === 'string') {
            if (text.split(' ').length > 5) {
                addValue('className', 'emp-long-wrapping-label');
            }
        }
        else {
            journal.log({owner: 'Java', type: 'warn'}, 'Label tag has no text');
        }
    };

    _extendFuncs.labelStyles = function _label_styles (styles, section, scope, state) {
        if (styles !== undefined) {

            if (styles.indexOf(',') !== -1) {
                styles = styles.split(',');
            }
            else {
                styles = [styles];
            }

            for (var i = 0, len = styles.length; i < len; i++) {
                switch (styles[i]) {
                    case 'label-min-width':
                        addValue('className', 'emp-min-width-label');
                        break;

                    case 'top-align-label':
                        addValue('className', 'emp-top-align-label');
                        break;

                    case 'unregistered':
                        addValue('className', 'emp-unregistered-field');
                        break;

                    default:
                        break;
                }
            }
        }
    };

    _extendFuncs.messageType = function _message_type(value, section, scope, state) {
        if (value !== undefined) {
            switch (value) {
                case 'info':
                    addValue('className', 'cui-informational');
                    break;

                case 'warning':
                case 'warn':
                    addValue('className', 'cui-warning');
                    break;

                case 'error':
                    addValue('className', 'cui-error');
                    break;

                case 'success':
                    addValue('className', 'cui-success');
                    break;

                case 'federal':
                    addValue('className', 'emp-federal');
                    break;
            }
        }
    };

    // Select
    _extendFuncs.multipleSelection = function _multiple_selection(select, section, scope, state) {

        var newSize = 2;

        if (select.attributes && select.attributes.multiple) {

            if (select.options && select.options.length >= 2) {

                if (select.options.length > 10) {

                    newSize = 10;
                }
                else {

                    newSize = select.options.length;
                }
            }

            if (select.attributes && select.attributes.size) {

                replaceValue('size', newSize);
            }
            else {

                addValue('size', newSize);
            }

        }

    }

    // =========
    // Grids ===
    // =========
    _extendFuncs.width = function _width(width, section, scope, state) {

        var colClassSize = null;

        if (width !== undefined) {

            if (isNaN(width)) {

                // Developer declared a string so check to see if matches one of our supported shorthand names
                switch (width) {

                    case 'full':

                        colClassSize = 'emp-col-full';
                        break;

                    case 'half':

                        colClassSize = 'emp-col-half';
                        break;

                    // Unused spec
                    case 'three-quarters':

                        colClassSize = 'emp-col-three-quarters';
                        break;

                    // Unused spec
                    case 'quarter':

                        colClassSize = 'emp-col-quarter';
                        break;
                }

            } else {

                if (parseInt(width) >= 1 && parseInt(width) <= 12) {

                    colClassSize = 'cui-col-small-' + width;
                }
            }
        }

        if (colClassSize !== null) {

            addValue('className', colClassSize);
        }
    };

    _extendFuncs.push = function _push(push, section, scope, state) {

        var pushSize = null;

        if (push !== undefined) {

            switch (push) {

                case 'half':

                    pushSize = 'emp-col-pull-half';
                    break;
            }
        }

        if (pushSize !== null) {

            addValue('className', pushSize);
        }
    };

    _extendFuncs.cuiSize = function _cui_size(colAryObj, section, scope, state) {

        if (Array.isArray(colAryObj) && colAryObj.length >= 1) {

            for (var co = 0, coLen = colAryObj.length; co < coLen; co++) {

                var colClass = "cui-col-";

                colClass += colAryObj[co].screen + "-" + colAryObj[co].count;

                addValue('className', colClass);
            }

        }


    };

    // =========
    // Table ===
    // =========

    // Table Row Key
    _extendFuncs.rowKey = function _row_key(value, section, scope, state) {

        if (value !== undefined) {

            addValue('data-key', value);
        }
    };

    _extendFuncs.colIndex = function _col_index(value, section, scope, state) {

        if (value !== undefined) {

            addValue("data-col-index", value);
        }
    };

    // Searches cells to find specific content templates
    _extendFuncs.cellSearch = function _cell_search(contents, section, scope, state) {

        if (contents !== undefined) {

            if (contents.template === "composite") {

                switch (contents.type) {

                    case "fwNameSearchList":

                        addValue('className', 'emp-key-value-pairs');
                        break;

                }

            }
        }
    };

    _extendFuncs.dynamicLabel = function _dynamic_label(contents, section, scope, state) {

        if (contents !== undefined) {

            switch (scope) {

                case "search-composite":

                    if (contents.type === "select") {

                        addValue('className', 'emp-seach-composite-dynamic-label');
                    }

                    break;
            }
        }
    };

    _extendFuncs.footerTooltip = function _footer_tooltips(obj, section, scope, state) {

        if (obj && typeof obj === "object") {

            var headerText = obj.tableData.head.rows[0].columns[obj.colIndex].text;

            addValue('title', 'Total ' + headerText + ": " + obj.text);
            addValue('data-title', 'Total ' + headerText + ": " + obj.text);

            addValue('className', 'emp-tooltip');
        }
    };

    _extendFuncs.validationTable = function _validation_table(bool, section, scope, state) {

        if (bool === true || bool === "true") {

            addValue('className', 'emp-selectionRequired');
        }
    };

    // ==========
    // Viewer ===
    // ==========

    _extendFuncs.viewerSize = function _viewer_size(size, section, scope, state) {

        if (size === "medium") {

            addValue('className', 'emp-viewer-size-medium');
        }
        else if (size === "large") {

            addValue('className', 'emp-viewer-size-large');
        }
        else {

            addValue('className', 'emp-viewer-size-small');
        }
    }

    // ==========
    // Fields ===
    // ==========

    _extendFuncs.validationError = function _validation_error(type, section, scope, state) {

        if (type !== undefined && typeof type === "string") {

            if (type === "error") {

                addValue('className', 'emp-validation-error');
            }

        }
    };

    _extendFuncs.isPassword = function _is_password(type, section, scope, state) {
        addValue('className', 'emp-password-input');
    };

    _extendFuncs.enhancedAttributes = function _enhanced_attributes(object, section, scope, state) {

        if (object && typeof object === "object") {

            switch (scope) {

                case "text":
                case "textarea":
                case "span":

                    if (object.hasOwnProperty('data-title')) {

                        addValue('title', 'Click to see more.');
                        addValue('className', 'emp-tooltip');
                    }

                    if(object.hasOwnProperty('data-tooltip-url')){

                        addValue('className', 'emp-ajax-tooltip');
                    }

            }

        }
    };

    // ===============
    // Dropdowns =====
    // ===============

    _extendFuncs.selectOther = function _select_other(value, section, scope, state) {

        if (scope === "selectOther") {

            if (value) {

                addValue('data-select-other', value);
            }
            else if (value === undefined || value === null) {

                addValue('data-select-other', 'other');
            }
        }


    };

    // ==========
    // Tabs =====
    // ==========

    _extendFuncs.tabState = function _tab_pane(id, section, scope, state) {

        if (state) {

            addValue('className', 'emp-active-tab');
        }
    };

    _extendFuncs.contentState = function _content_pane(id, section, scope, state) {

        if (state) {

            addValue('className', 'emp-active-tab');
        }else{
            addValue('className', 'cui-hidden-for-tabs');
        }
    };

    _extendFuncs.tabIndex = function _tab_index(index, section, scope, state) {

        /*if (scope === "tab-container") {

            if (index !== 0) {
                addValue('style', "top: -" + index + "px");
            }
            else {
                addValue('style', "top: " + index + "px");
            }
        }
        else {*/

            addValue('data-tab-index', index);
        //}

    };

    _extendFuncs.defaultSelection = function _default_selection(value, section, scope, state) {

        if (value && value.trim().length > 0) {
            addValue('data-default', value);
        }

    };

    // ===============
    // Form Lines ====
    // ===============

    _extendFuncs.formLineColumnDetect = function _form_line_column_detect(sectionObj, section, scope, state) {

        if (sectionObj['lineAdjustmentTitle']) {
            addValue('className', 'has-adjustment-column');
        }
        else {
            addValue('className', 'no-adjustment-column');
        }

        if (sectionObj['lineAdjustmentReasonTitle']) {
            addValue('className', 'has-reason-column');
        }
        else {
            addValue('className', 'no-reason-column');
        }

    };

    _extendFuncs.expandRoot = function _expandRoot(rootValue, section, scope, state) {

        if (rootValue !== false) {
            addValue('className', 'emp-tree-root');
        }

    };

    _extendFuncs.check

    var extendArguments = Object.keys(params.hash);

    var i = 0;

    // Loop through extendArguments
    while(extendArguments[i]) {

        // Skip the default item
        if (extendArguments[i] !== 'defaults') {

            var extendedName = extendArguments[i];

            // Check to see if the extended name matches a known function
            if (_extendFuncs.hasOwnProperty(extendedName)) {

                if (params.hash[extendedName] !== undefined) {

                    if (scope !== "grid-column") {

                        var extendedArg = (params.hash[extendedName].constructor === Array) ? params.hash[extendedName].concat() : [params.hash[extendedName]];
                    }
                    else {

                        var extendedArg = [params.hash[extendedName]];
                    }
                }
                else {
                    var extendedArg = [];
                }

                if (section) {
                    extendedArg.push(section);
                }
                else {
                    extendedArg.push(undefined);
                }

                // If scope was defined, let make sure its passed along
                if (scope) {
                    extendedArg.push(scope);
                }
                else {
                    extendedArg.push(undefined);
                }

                if (state) {
                    extendedArg.push(state);
                }
                else {
                    extendedArg.push(undefined);
                }

                _extendFuncs[extendedName].apply(this, extendedArg);

            }

        }

        i++;
    }

    return defaults;

});
