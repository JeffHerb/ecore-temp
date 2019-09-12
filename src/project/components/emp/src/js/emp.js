/*jshint loopfunc: true, quotmark: false, sub: true */
define(['jquery', 'cui', 'dataStore', 'render', 'table', 'tabs', 'rating', 'datepicker', 'tooltip', 'showHidePassword', 'validation', 'kind', 'external-menu', 'spin', 'detectIE', 'guid', 'store', 'clickblocker', 'empMessage', 'selectionPopup', 'addRemove', 'forms', 'getCookie', 'refresh', 'dynamicDropDown', 'fetchWrapper', 'uiPopup', 'process', 'events', 'windows', 'expandables', 'staticTree', 'externalApp', 'expandingTextArea', 'keepAlive', 'session', 'badge', 'getCursorPosition', 'fastdom', 'journal'], function ($, cui, ds, render, table, tabs, rating, datepicker, tooltip, showHidePassword, validation, kind, externalMenu, spin, detectIE, guid, store, clkblocker, empMessage, selectionPopup, addRemove, forms, getCookie, refresh, dyncDD, fw, uiPopup, processM, events, windowsM, expandables, staticTree, externalApp, expandingTextArea, keepAlive, session) {

    var _priv = {
        isInitialized: false,
        $groupToggleControl: null,
    };

    var _disableReport = false;
    var _disableForms = false;
    var _disableAjax = false;

    var $clickBlock = false;
    var clickSource = false;

    var $body = $(document.body);
    var $window = $(window);

    var hostname = window.location.hostname;

    var pageScripts = false;

    var protocol = window.location.protocol;

    var windows = {};

    if (protocol.indexOf("http") !== -1) {
        protocol = true;
    }
    else {
        protocol = false;
    }

    var sessionTimeout = false;

    var externalEmpire = false;

    /**
     * Sets up the page after its HTML has been rendered
     * Adds event listeners, loads applicable plugins, etc
     */
    _priv.pageSetup = function _pageSetup(options, cb) {

        externalEmpire = (document.querySelector('html.external-app')) ? true : false;

        // Older jQuery values
        var $mainWrapper = $('main');
        var $tables = $('.emp-table table');
        var $dateInputs = $('.emp-date');
        var $dateCalenders = $('.cui-c-datepicker');
        var $selectOtherBoxes = $('.emp-select-other-selectbox select');
        var $selectOtherCheckbox = $('.emp-check-other-checkbox input');
        var $ratingContainers = $('.emp-rating-stars-container');
        var $fileUploads = $('.emp-file-upload');
        var $viewDocumentSections = $('.emp-document-viewer');
        var $entityLookup = $('.emp-entity-lookup .emp-entity-lookup-toggle select');

        // Ensure `fwData` and its required properties exist
        _priv.stubOutFwData();

        emp.isIE = false;
        emp.isEdge = false;

        var dApplicationTitle = document.querySelector('.application-title');
        var dPageTitle = document.querySelector('title');
        var sApplicationTitle = dApplicationTitle.textContent.trim();

        if (sApplicationTitle.length === 0) {
            dApplicationTitle.textContent = dPageTitle.textContent;
        }

        session.setup();
        showHidePassword.init();

        var detectIntE = detectIE();

        expandables.setup();
        expandingTextArea.setup();

        _priv.selectionListSetup();

        if (detectIntE) {
            $body.addClass('ie');
            emp.isIE = true;

            if (detectIntE.edge) {
                emp.isEdge = true;
            }
        }

        var localSessionID = store.get("sessionID");
        var refreshSession = false;

        // Check for a session ID;
        if (fwData.context.screen && fwData.context.screen.id && (fwData.context.screen.type !== "framework-search" && fwData.context.screen.type !== "error" && fwData.context.urls  && fwData.context.urls.errorReport)) {

            if (localSessionID) {

                // Check to see if the local session matches the current session id
                if (fwData.context.screen.id !== localSessionID) {

                    journal.log({ type: 'warning', owner: 'UI', module: 'emp', submodule: '', func: 'pageSetup' }, 'New session ID detected, updating');

                    refreshSession = true;
                }
                else {

                    journal.log({ type: 'info', owner: 'UI', module: 'emp', submodule: '', func: 'pageSetup' }, 'Session ID and Local Storage match!');
                }

            }
            else {

                journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: '', func: 'pageSetup' }, 'No session ID in localStorage!');

                refreshSession = true;
            }

        }
        else {

            if (fwData.context.screen && (fwData.context.screen.type !== "framework-search" && fwData.context.screen.type !== "error" && fwData.context.screen.type !== "missing")) {

                journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: '', func: 'pageSetup' }, 'No session ID was provided as part of the page screen object!');
            }
            else {

                journal.log({ type: 'info', owner: 'UI', module: 'emp', submodule: '', func: 'pageSetup' }, 'Refresh blocked on none valid screen type');
            }
        }

        windowsM.setup();

        // Default required Table plugins
        if ($tables.length && !options.skipTable) {

            $tables.table();

            $tables.on('sort.table', function () {

                var $ajaxTooltips = $tables.find('.emp-ajax-tooltip');

                if ($ajaxTooltips.length) {

                    $ajaxTooltips.each(function () {
                        requestTooltip($(this));
                    });
                }

            });

            $tables.on('table.filter', function () {

                var $ajaxTooltips = $tables.find('.emp-ajax-tooltip');

                if ($ajaxTooltips.length) {

                    $ajaxTooltips.each(function () {
                        requestTooltip($(this));
                    });
                }

            });
        }

        var $itag = $('button.emp-icon-help:not(.emp-legend-help)');

        if ($itag.length) {

            $itag.tooltip();
        }

        // Select other page binding
        if ($selectOtherBoxes.length) {

            // Loop through all of the selectOthers and bind the event
            for (var so = 0, soLen = $selectOtherBoxes.length; so < soLen; so++) {

                // Passing in the raw element at this point to by pas jQuery
                events.otherDropdown($selectOtherBoxes[so]);

            }

        }

        if ($selectOtherCheckbox.length) {

            $selectOtherCheckbox.on('click', function (evt) {

                _events.checkOther(evt);
            });
        }

        // Add custom binding for when user types dates to auto add '/'s
        dateMask($dateInputs);

        // Bind the date picker to all date inputs.
        $dateCalenders.datepicker();


        // Just do a body binding for the tooltips.
        $body.on('click', '.emp-tooltip, td span[title]', function (evt) {

            function createTooltip($tooltip, force) {

                if ($tooltip[0].hasAttribute("data-title")) {

                    $tooltip.popover({
                        display: {
                            className: 'emp-tooltip-style'
                        },
                        html: '<span>' + $tooltip.attr("data-title") + '</span>'
                    });

                }
                else {

                    var tooltip = $tooltip.attr('title').replace(/[\n]/g, '<br>');

                    $tooltip.popover({

                        display: {
                            className: 'emp-tooltip-style'
                        },
                        html: '<span>' + tooltip + '</span>'
                    });
                }

                setTimeout(function () {

                    $tooltip.trigger('click');

                }, 100);
            }

            var $tooltip = $(this);

            if (!$tooltip.hasClass('cui-popover-toggle')) {

                if (require.defined('popover')) {

                    createTooltip($tooltip);
                }
                else {

                    clkblocker.add($tooltip);

                    cui.load('popover', function _loadPopover() {

                        clkblocker.remove();

                        fastdom.mutate(function () {

                            createTooltip($tooltip);
                        });

                    });
                }
            }
        });

        var $ajaxTooltips = $('.emp-ajax-tooltip');

        if ($ajaxTooltips.length) {

            $ajaxTooltips.each(function () {
                requestTooltip($(this));
            });
        }

        if ($fileUploads.length) {

            $fileUploads.each(function () {

                var $fileUploadContainer = $(this);
                var $fakeButton = $fileUploadContainer.find('button');
                var $realInput = $fileUploadContainer.find('input');
                var $spanText = $fileUploadContainer.find('span');

                var elmObject = {
                    "$button": $fakeButton,
                    "$input": $realInput,
                    "$span": $spanText
                };

                // Bind the button click event
                $fakeButton.on('click', elmObject, _events.fileUploadButton);

                $realInput.on('change', elmObject, _events.fileUploadInput);

            });
        }

        // Test to see if this window is a popup
        if (window.isPopup || fwData.isPopup || fwData.popup) {

            render.section(null, { "template": "closePopup" }, 'return', function (html) {

                if (html) {
                    $('#body-wrapper').append(html);
                }
                else {
                    journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: '', func: 'popupWindow' }, 'Failed to build popup close control');
                }
            });
        }

        // Check for framework blinky's
        $body.on('click', '.emp-icon-ghost', function (evt) {

            _events.frameworkError(evt);

        });

        if (fwData.popup) {

            journal.log({ type: 'info', owner: 'UI', module: 'emp', func: 'pageSetup => popup detected' }, 'Detected window is a popup.');

            window.opener.emp.showChild();
        }

        if ($viewDocumentSections.length) {

            $viewDocumentSections.each(function () {

                var $resizer = $(this).find('.emp-view-document-resizer');

                if ($resizer.length === 1) {

                    $resizer.on('click', _events.resizeDocumentViewer);
                }

            });
        }

        $rootForm = $('main').find('form:not(#form_asof)').eq(0);

        if ($rootForm.length) {

            $rootForm.on('keypress', function (e) {

                if (e.keyCode === 13) {

                    // Get the current control
                    var $elm = $(':focus');

                    if ($elm[0].nodeName !== "BUTTON" && $elm[0].nodeName !== "SELECT" && $elm[0].nodeName !== "TEXTAREA") {

                        $compositeParent = $elm.parents('.emp-search-composite').eq(0);

                        e.preventDefault();

                        if ($compositeParent.length) {

                            $compositeButton = $compositeParent.find('button');

                            if ($compositeButton.length === 1) {

                                $compositeButton.trigger('click');
                            }
                            else if ($compositeButton.length === 0) {

                                journal.log({ type: 'warning', owner: 'UI', module: 'emp', func: 'pageSetup' }, 'Blocked enter key on field preventing composite action as no button was found.');
                            }
                            else {

                                journal.log({ type: 'warning', owner: 'UI', module: 'emp', func: 'pageSetup' }, 'Blocked enter key on field preventing composite action as you have more than 1 button control!.');
                            }
                        }
                        else {

                            journal.log({ type: 'warning', owner: 'UI', module: 'emp', func: 'pageSetup' }, 'Blocked enter key on field preventing page from submitting.');
                        }

                    }
                }

            });
        }

        var $addRemoveList = $('.emp-add-remove-list');

        if ($addRemoveList && $addRemoveList.length) {

            $addRemoveList.addRemove();
        }

        // Setup tabs!
        var $tabs = $('.emp-tabs');

        if ($tabs.length) {

            $tabs.tabs();
        }

        var $pageSelects = $mainWrapper.find('select');

        if ($pageSelects.length) {

            $pageSelects.each(function () {

                $body.on('change', 'main select', function () {

                    var $select = $(this);

                    var value = $select.val();

                    var $option = $select.children('option[value="' + value + '"]');

                    if ($option) {

                        var dynamicSectionOpen = $option.attr('data-open-section');
                        var dynamicSectionClose = $option.attr('data-close-section');

                        if (dynamicSectionOpen || dynamicSectionClose) {

                            journal.log({ type: 'info', owner: 'UI', module: 'emp', function: 'selectBoxChange' }, 'User changes dynamic section dropdown');

                            var $section = false;

                            if (dynamicSectionClose) {

                                var closeSections = dynamicSectionClose.split(',');

                                for (var c = 0, cLen = closeSections.length; c < cLen; c++) {

                                    $section = $('#' + closeSections[c]);

                                    if ($section.length && $section[0].nodeName === "SECTION") {

                                        if (!$section.hasClass('emp-collapse')) {
                                            $section.addClass('emp-collapse');
                                        }

                                    }
                                    else {

                                        journal.log({ type: 'error', owner: 'Developer', module: 'emp', function: 'selectBoxChange' }, 'Unable to find section with ID: ' + closeSections[c]);
                                    }

                                }

                            }

                            if (dynamicSectionOpen) {

                                var openSections = dynamicSectionOpen.split(',');

                                for (var o = 0, oLen = openSections.length; o < oLen; o++) {

                                    $section = $('#' + openSections[o]);

                                    if ($section.length && $section[0].nodeName === "SECTION") {

                                        if ($section.hasClass('emp-collapse')) {
                                            $section.removeClass('emp-collapse');
                                        }

                                    }
                                    else {

                                        journal.log({ type: 'error', owner: 'Developer', module: 'emp', function: 'selectBoxChange' }, 'Unable to find section with ID: ' + openSections[o]);
                                    }

                                }
                            }

                        }

                    }


                });

            });
        }

        $body.trigger('setup.page');

        $entityLookup.on('change', function(evt) {

            _events.entityChange(evt, $(evt.target));
        });

        function newItagContainer(headerText, tagContents, tagID) {

            var wrapper = document.createElement('div');
            wrapper.setAttribute('id', tagID);

            wrapper.innerHTML = tagContents;

            var header = document.createElement('header');
            headerText = document.createTextNode(headerText);

            header.appendChild(headerText);

            wrapper.insertBefore(header, wrapper.firstChild);

            return wrapper;
        }

        staticTree.init();

        if (externalEmpire) {

            var pageInstructionTooltip = document.querySelector('.emp-page-legend button.emp-page-itags');

            if (pageInstructionTooltip) {

                pageInstructionTooltip.addEventListener('click', function () {

                    var instructionSection = document.querySelector('#emp-field-instructions');

                    if (instructionSection) {

                        if (instructionSection.classList.contains('showOnScreen')) {
                            instructionSection.classList.remove('showOnScreen');
                        }
                        else {
                            instructionSection.classList.add('showOnScreen');
                        }
                    }
                    else {

                        // Find all of the help text below
                        var helpTagsButtons = document.querySelectorAll(
                            '#body-wrapper .cui-row .emp-icon-help, #body-wrapper th .emp-icon-help, #body-wrapper section .emp-icon-help');

                        var newInstructionSection = document.createElement('div');
                        newInstructionSection.setAttribute('id', 'emp-field-instructions');
                        newInstructionSection.classList.add('emp-field-instructions');
                        newInstructionSection.classList.add('showOnScreen');

                        for (var h = 0, hlen = helpTagsButtons.length; h < hlen; h++) {

                            var fieldWrapper = false;
                            var fieldSetWrapper = false;
                            var tableColumnWrapper = false;
                            var sectionWrapper = false;

                            var helpTagButton = helpTagsButtons[h];
                            var helpTagContents = helpTagButton.querySelector('.cui-hide-from-screen').innerHTML;

                            var helpDataSource = helpTagButton.getAttribute('data-tooltip-source');

                            if (!helpDataSource) {
                                helpDataSource = guid();

                                helpTagButton.setAttribute('data-tooltip-source', helpDataSource);
                            }

                            var parentNode = helpTagsButtons[h].parentNode;

                            while (true) {

                                if (parentNode.nodeName === "BODY") {
                                    break;
                                }
                                else {
                                    // Break at rows to speed up the looping
                                    if (parentNode.nodeName === "DIV" && parentNode.classList.contains('cui-row'))  {
                                        break;
                                    }

                                    if (parentNode.nodeName === "DIV" && parentNode.classList.contains('emp-field')) {
                                        fieldWrapper = parentNode;
                                    }

                                    if (parentNode.nodeName === "FIELDSET") {
                                        fieldSetWrapper = parentNode;
                                    }

                                    if (parentNode.nodeName === "TH") {
                                        tableColumnWrapper = parentNode;
                                    }

                                    if (parentNode.nodeName === "SECTION") {
                                        sectionWrapper = parentNode;
                                    }
                                }

                                parentNode = parentNode.parentNode;
                            }

                            var helpTitle = false;

                            if (fieldSetWrapper) {

                                helpTitle = fieldSetWrapper.querySelector('.cui-label legend').innerText;
                            }
                            else if (fieldWrapper) {

                                var fieldLabel = fieldWrapper.querySelector('.cui-label label, .cui-label span');

                                helpTitle = fieldLabel.innerText;
                            }
                            else if (sectionWrapper) {
                                helpTitle = sectionWrapper.querySelector('section h3').innerText;
                            }

                            var helpTagInstruction = newItagContainer(helpTitle, helpTagContents, helpDataSource);

                            newInstructionSection.appendChild(helpTagInstruction);

                        }

                        // Add missing instruction section
                        document.body.appendChild(newInstructionSection);
                    }

                });

            }

            externalApp.init();
        }

        // Execute menu Init!
        externalMenu.init();

        if (typeof cb === "function") {
            cb();
        }

    };

    // Reinitialize a section of code that was added to the page after initial page load
    sectionSetup = function _sectionSetup(section, options) {
        var $section;
        var $tabsetTitleBar;
        var $tables;
        var $dateInputs;
        var $dateCalenders;
        var $selectOtherBoxes;
        var $ratingContainers;
        var $fileUploads;
        var $frameworkErrors;
        var $tooltips;
        var $ajaxTooltips;
        var $printIcon;
        var $groupSection;
        var $employeeSearch;

        function setupTables($tables, options) {
            $tables.each(function () {
                $this = $(this);

                var tableID = $this.attr("id");

                if (tableID) {
                    if (emp.reference.tables[tableID]) {
                        // Remove Stylesheets to avoid conflicts
                        emp.reference.tables[tableID].deleteStyleSheets();
                        // Debind table
                        emp.reference.tables[tableID].debind();
                        // Delete table from emp.references
                        delete emp.reference.tables[tableID];
                    }
                    // Add reference to new table in emp.reference.tables
                    emp.reference.tables[tableID] = this;
                }

                // initialize table
                $this.table();
            });
        }

        function setupSelectOtherBoxes($selectOtherBoxes, options) {
            $selectOtherBoxes.each(function () {
                $(this).on('change', function (evt) {
                    _events.selectOther(evt);
                });
            });
        }

        function setupDateInputs($dateInputs, options) {
            $dateInputs.each(function () {
                dateMask($(this));
            });
        }

        function setupCalendars(dateCalenders, options) {
            $dateCalenders.each(function () {
                $(this).datepicker();
            });
        }

        function setupPrintIcon($printIcon, options) {
            $printIcon.each(function () {
                $(this).on('click', function () {
                    // Not sure why we need this anonymous function wrapper, rather than passing `window.print` directly, but jQuery throws an 'illegal invocation' error without it
                    window.print();
                });
            });
        }

        function setupTooltips($tooltips, options) {
            cui.load('popover', function _loadPopover() {
                $tooltips.each(function () {

                    var $tooltip = $(this);

                    if ($tooltip[0].hasAttribute("data-title")) {

                        $tooltip.popover({
                            display: {
                                className: 'emp-tooltip-style'
                            },
                            html: '<span>' + $tooltip.attr("data-title") + '</span>'
                        });
                    }
                    else {

                        $tooltip.popover({
                            display: {
                                className: 'emp-tooltip-style',
                            }
                        });
                    }
                });
            });
        }

        function setupAjaxTooltips($ajaxTooltips, options) {
            $ajaxTooltips.each(function () {
                ajaxTooltip($(this));
            });
        }

        function setupEmployeeSearch($employeeSearch, options) {
            $employeeSearch.each(function (i) {
                var $select = $(this);
                $select.on('change', function (evt) {
                    _events.employeeSearchDropDown(evt);
                });
            });
        }

        function setupFileUploads($elements, options) {
            $elements.each(function () {
                var $fileUploadContainer = $(this);
                var $fakeButton = $fileUploadContainer.find('button');
                var $realInput = $fileUploadContainer.find('input');
                var $spanText = $fileUploadContainer.find('span');

                var elmObject = {
                    "$button": $fakeButton,
                    "$input": $realInput,
                    "$span": $spanText
                };

                // Bind the button click event
                $fakeButton.on('click', elmObject, _events.fileUploadButton);
                $realInput.on('change', elmObject, _events.fileUploadInput);
            });
        }

        function setupFrameworkErrors($frameworkErrors, options) {
            $frameworkErrors.each(function () {
                $frameworkErrors.on('click', _events.frameworkError);
            });
        }

        if (section instanceof jQuery) {
            $section = section;

            //Find elements within the section
            $searchBox = $section.find('#form_search');
            $headerID = $section.find('#headerID');
            $searchClearButton = $section.find('.emp-button-search-clear');
            $searchClearAllButton = $section.find('.emp-button-search-clear-all');
            $tables = $section.find('.emp-table table');
            $dateInputs = $section.find('.emp-date');
            $dateCalenders = $section.find('.cui-c-datepicker');
            $selectOtherBoxes = $section.find('.emp-select-other-selectbox select');
            $ratingContainers = $section.find('.emp-rating-stars-container');
            $fileUploads = $section.find('.emp-file-upload');
            $frameworkErrors = $section.find('.emp-icon-ghost');
            $tooltips = $section.find('.emp-tooltip');
            $ajaxTooltips = $('.emp-ajax-tooltip');
            $printIcon = $section.find('.emp-icon-print');
            $groupSection = $section.find('section');
            $employeeSearch = $section.find('.emp-employee-search .employee-search-select');
        }

        if ($tables && $tables.length) {
            setupTables($tables, options);
        }

        // Select other page binding
        if ($selectOtherBoxes && $selectOtherBoxes.length) {
            setupSelectOtherBoxes($selectOtherBoxes, options);
        }

        // Add custom binding for when user types dates to auto add '/'s
        if ($dateInputs && $dateInputs.length) {
            setupDateInputs($dateInputs, options);
        }

        // Bind the date picker to all date inputs.
        if ($dateCalenders && $dateCalenders.length) {
            setupCalendars($dateCalenders, options);
        }

        // Check for tooltips on the page
        // If any tooltips are send them to the popover component for binding.
        if ($tooltips && $tooltips.length) {
            setupTooltips($tooltips, options);
        }

        //Ajax Tooltips
        if ($ajaxTooltips && $ajaxTooltips.length) {
            setupAjaxTooltips($ajaxTooltips, options);
        }

        // Employee Search
        if ($employeeSearch && $employeeSearch.length) {
            setupEmployeeSearch($employeeSearch, options);
        }

        // Rating Search
        if ($ratingContainers && $ratingContainers.length) {
            setupRatingContainers($ratingContainers, options);
        }

        // File Uploads
        if ($fileUploads && $fileUploads.length) {
            setupFileUploads($fileUploads, options);
        }

        // Framework Errors
        if ($frameworkErrors && $frameworkErrors.length) {
            setupFrameworkErros($frameworkErrors, options);
        }
    };

    /**
     * Pull date from table hidden fields and fill in other elements with those values
     * @param   {string}    name        OPTIONAL - string name
     * @param   {object}    map         The object ins dest:source format
     * @param   {jQuery}    $source     jQuery reference for a `<table>` element
     * @param   {function}  function    OPTIONAL - callback function
     * @return  {boolean}               return true if it finishes without issue otherwise false
     */
    _priv.dataMap = function _priv_data_map(map, cb) {
        // Stubbing out for now.
    };

    // Sourcer map create an object key value pairs string for all input declared within a given section. Only inputs care collected
    _priv.sourceMap = function _priv_sourceMap($section) {

        var sectionMap = {};

        // We have a form so lets get all of the field
        var $inputs = $section.find('input, select, textarea');

        $inputs.each(function (i) {

            var $input = $(this);

            if ($input[0].nodeName === "INPUT") {

                var type = $input.attr('type');

                // Filter out check and radio
                if ((type === "checkbox" || type === "radio")) {

                    // Check to see if its checked
                    if ($input.is(':checked')) {

                        // Use the name as the key and value as value
                        sectionMap[$input.attr('name')] = $input.val();
                    }
                }
                else {

                    // Use the name as the key and value as value
                    sectionMap[$input.attr('name')] = $input.val();
                }
            }
            else {

                // Use the name as the key and value as value
                sectionMap[$input.attr('name')] = $input.val();
            }


        });

        return sectionMap;
    };

    // Element map is used to update an key value pair object where the current value is the id of an element on the page that holds the true value for the given key.
    _priv.elementMap = function _priv_elementMap(elmMap) {

        function getValue(lookup) {

            var $source = $('#' + lookup);

            if ($source.length === 1) {

                var value;

                switch ($source[0].nodeName) {

                    case 'INPUT':
                    case 'SELECT':
                    case 'TEXTAREA':
                        value = $source.val().trim();
                        break;

                    default:
                        value = $source.text().trim();
                        break;
                }

                return value;

            }
            else {
                journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: '', func: 'elementMap' }, 'Element Map failed, manual source map could not find refernce for source: ', lookup);

                return undefined;
            }

        }

        var returnMap = {};
        var value = null;

        if (Array.isArray(elmMap)) {

            for (var i = 0, len = elmMap.length; i < len; i++) {

                value = getValue(elmMap[i]);

                if (value === undefined) {

                    return false;
                }
                else {

                    returnMap[elmMap[i]] = value;
                }

            }

        }
        else if (typeof elmMap === "object") {

            //  We need to process the source map before making the data request
            for (var key in elmMap) {

                value = getValue(elmMap[key]);

                if (value === undefined) {

                    return false;
                }
                else {

                    returnMap[key] = value;
                }
            }

        }

        return returnMap;
    };

    _priv.processValidation = function _priv_processValidation(validationObj) {

        function processField(field, id) {
            var test;

            var $messageLoc;

            if (field.$reference && field.$reference[0]) {

                $messageParent = $(field.$reference[0]).parent();

                if (field.$reference[0].nodeName === 'TABLE') {
                    $messageParent = field.$reference.parents('.emp-table').eq(0);
                }

                if ($messageParent.find('.cui-messages')[0] || $messageParent.parent('.cui-data').find('.cui-messages')[0]) {

                    $messageLoc = $($messageParent.find('.cui-messages')[0]);
                }
                else {

                    $messageLoc = $('<ul/>', {
                        'class': 'cui-hidden cui-messages cui-field-message'
                    });

                    if (field.$reference[0].nodeName === 'TABLE') {

                        $messageParent.prepend($messageLoc);
                    }
                    else {

                        //append to cui-data instead
                        if($messageParent.hasClass('emp-password-wrapper')){

                            $messageParent =  $($messageParent.parent());

                            $messageParent.append($messageLoc);
                        
                        }else{

                            $messageParent.append($messageLoc);
                        }
                    }
                }
            }

            // check to see if the field is in the reference
            if (!reference.fields.hasOwnProperty(id)) {

                // This field reference is not currently known so add it
                reference.fields[id] = field;

                field = reference.fields[id];

                // Check to see if the field failed validation
                if (!field.result) {

                    // loop through all of the test related to the field.
                    for (test in field.tests) {

                        if (typeof field.tests[test].message === 'string') {

                            if ($messageLoc) {
                                field.tests[test].message = empMessage.createMessage({ text: field.tests[test].message, type: "error" }, { scroll: true, field: id, msgLocation: $messageLoc });
                            }
                            else {
                                // field.tests[test].message = _priv.pageMessage({text:field.tests[test].message, type:"error"}, true);
                                field.tests[test].message = empMessage.createMessage({ text: field.tests[test].message, type: "error" });
                            }
                        }
                    }
                }
            }
            else {

                // Get a reference to each set of tests
                var oldResult = reference.fields[id];
                var newResult = field;
                var oldTests = [];
                var newTests = [];
                var oldOnly = [];
                var newOnly = [];
                var commonTest = [];
                var len;
                var i;

                var changeFieldResult = false;

                // Get the name of all the test in the previous run
                for (test in oldResult.tests) {
                    oldTests.push(test);

                    if (test in newResult.tests) {
                        commonTest.push(test);
                    }
                    else {
                        oldOnly.push(test);
                    }
                }

                // Get the name of all the test in the current run
                for (test in newResult.tests) {
                    newTests.push(test);

                    if (!(test in oldResult.tests)) {
                        newOnly.push(test);
                    }
                }

                // Start by looping common tests
                for (i = 0, len = commonTest.length; i < len; i++) {

                    test = commonTest[i];

                    $parentSections = false;

                    //Add test to determine if result or message has changed or been updated. Navivate the newResult.tests[test] message and determine if it is present on the screen, if not rebuild the message.

                    // Check if this status has changes
                    if (oldResult.tests[test].result !== newResult.tests[test].result) {

                        if (typeof oldResult.tests[test].result === 'boolean' && typeof newResult.tests[test].result === 'boolean') {

                            changeFieldResult = true;

                            // The test state changed, check to see if its now false
                            if (newResult.tests[test].result) {

                                // Since the test is now true, remove the old message
                                empMessage.removeMessage(oldResult.tests[test].message, $messageLoc);

                                //If there are still error messages present, scroll back to the top
                                empMessage.scrollToMessage();
                            }
                            else {

                                if ($messageLoc) {
                                    newResult.tests[test].message = empMessage.createMessage({ text: newResult.tests[test].message, type: "error" }, { scroll: false, field: id, msgLocation: $messageLoc });
                                }
                                else {
                                    newResult.tests[test].message = empMessage.createMessage({ text: newResult.tests[test].message, type: "error" });
                                }
                            }
                        } // Check to see if the string error is just another string error
                        else if (typeof oldResult.tests[test].result === 'string' && typeof newResult.tests[test].result === 'string') {
                            // Remove the old message first
                            empMessage.removeMessage(oldResult.tests[test].message, $messageLoc);

                            // Generate the new message
                            if ($messageLoc) {
                                newResult.tests[test].message = empMessage.createMessage({ text: newResult.tests[test].message, type: "error" }, { scroll: false, field: id, msgLocation: $messageLoc });
                            }
                            else {
                                newResult.tests[test].message = empMessage.createMessage({ text: newResult.tests[test].message, type: "error" });
                            }
                        }
                        else if (typeof oldResult.tests[test].result === 'string' && typeof newResult.tests[test].result === 'boolean') {
                            // This condition should only bee meet when the string error value is returning true.
                            if (newResult.tests[test].result) {

                                // Remove the old message first
                                empMessage.removeMessage(oldResult.tests[test].message, $messageLoc);

                                //If there are still error messages present, scroll back to the top
                                empMessage.scrollToMessage();
                            }
                            else {
                                journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'processValidation' }, 'Validation change from string code to false boolean');
                            }
                        }
                        else if (typeof oldResult.tests[test].result === 'boolean' && typeof newResult.tests[test].result === 'string') {
                            // This condition should only bee meet when old message was true.
                            if (oldResult.tests[test].result) {
                                // Remove the old message first

                                if ($messageLoc) {
                                    newResult.tests[test].message = empMessage.createMessage({ text: newResult.tests[test].message, type: "error" }, { scroll: false, field: id, msgLocation: $messageLoc });
                                }
                                else {
                                    newResult.tests[test].message = empMessage.createMessage({ text: newResult.tests[test].message, type: "error" });
                                }
                            }
                            else {
                                journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'processValidation' }, 'Validation change from string code to false boolean');
                            }
                        }

                        // Update the old reference with the new info
                        oldResult.tests[test] = newResult.tests[test];
                    }
                    else if (!newResult.tests[test].result) {

                        var message = oldResult.tests[test].message;
                        var messageExists;

                        if(field.$reference.hasClass('emp-password-input')){

                            //cui-data
                            messageExists = field.$reference.parents().eq(1).find(message[0]);

                        }else{

                            messageExists = field.$reference.parent().find(message[0]);
                        }

                        //Verify that page message is still set
                        if (messageExists.length === 0 && message) {
                            changeFieldResult = true;
                            if ($messageLoc) {
                                newResult.tests[test].message = empMessage.createMessage({ text: newResult.tests[test].message, type: "error" }, { scroll: false, field: id, msgLocation: $messageLoc });
                            }
                            else {
                                newResult.tests[test].message = empMessage.createMessage({ text: newResult.tests[test].message, type: "error" });
                            }
                            // Update the old reference with the new info
                            oldResult.tests[test].message = newResult.tests[test].message;
                        }
                        else {
                            // make sure field level notifier is present.
                            empMessage.scrollToMessage();
                        }
                    }
                }

                // Now we to look over any new injected tests
                if (newOnly.length > 0) {
                    for (i = 0, len = newOnly.length; i < len; i++) {
                        test = newOnly[i];

                        // Check to see if this new test failed
                        if (!newResult.tests[test].result) {
                            // Mark the overall change to failed
                            changeFieldResult = true;

                            if ($messageLoc) {
                                newResult.tests[test].message = empMessage.createMessage({ text: newResult.tests[test].message, type: "error" }, { scroll: false, field: id, msgLocation: $messageLoc });
                            }
                            else {
                                newResult.tests[test].message = empMessage.createMessage({ text: newResult.tests[test].message, type: "error" });
                            }
                        }

                        // Add the new test.
                        oldResult.tests[test] = newResult.tests[test];
                    }
                }

                // Now we to look over any test that may have been dynamically removed
                if (oldOnly.length > 0) {

                    for (i = 0, len = oldOnly.length; i < len; i++) {

                        test = oldOnly[i];

                        // Check to see if this new test failed
                        if (!oldResult.tests[test].result) {

                            // Since the test is now invalid, remove the old message
                            empMessage.removeMessage(oldResult.tests[test].message, $messageLoc);

                            //If there are still error messages present, scroll back to the top
                            empMessage.scrollToMessage($messageLoc);
                        }

                        // Dump the old test reference
                        delete oldResult.tests[test];

                    }

                }

                if (changeFieldResult) {

                    // Update the over all
                    oldResult.result = newResult.result;
                }
            }
        }

        var field;
        var fieldID;

        var $messageLoc = $('#body-wrapper').find('ul.cui-messages.emp-messages').eq(0);

        // Check to see if this is an array/form of fields
        if (validationObj.fields) {

            // Loop through every field in validation object.
            var fields = validationObj.fields;

            for (var i = 0, len = fields.length; i < len; i++) {

                field = fields[i];
                fieldID = field.$reference.attr('id');

                processField(field, fieldID);

                if (!fields[i].result) {

                    $parentSections = fields[i].$reference.parents('section.emp-collapse');

                    if ($parentSections.length) {

                        $parentSections.each(function () {

                            $(this).removeClass('emp-collapse');
                        });
                    }
                }

            }

        }
        else if (validationObj.$reference) {

            field = validationObj;
            fieldID = field.$reference.attr('id');

            processField(field, fieldID);

            if (!field.result) {

                $parentSections = field.$reference.parents('section.emp-collapse');

                if ($parentSections.length) {

                    $parentSections.each(function () {

                        $(this).removeClass('emp-collapse');
                    });
                }
            }
        }
    };

    _priv.insertCharIntoString = function _priv_insertCharIntoString(pos, source, insertChar) {

        return source.substring(0, pos) + insertChar + source.substring(pos, source.length);
    };

    /**
     * Fills in missing properties of the `fwData` global
     */
    _priv.stubOutFwData = function _stubOutFwData() {
        // Main container
        if (!window.fwData) {
            window.fwData = {};
            window.fwData.context = {};
        }

        if (!window.fwData.context) {
            window.fwData.context = {};
        }

        // Tabset
        if (!window.fwData.context.tabset) {
            window.fwData.context.tabset = {};
        }

        if (!window.fwData.context.tabset.id) {
            window.fwData.context.tabset.id = window.location.href.replace(/\W/g, '_');
        }

        if (!window.fwData.context.tabset.url) {
            window.fwData.context.tabset.url = window.location.pathname;
        }

        if (!window.fwData.context.tabset.name) {
            window.fwData.context.tabset.name = $('.emp-header-tabset-title').find('h1').text();
        }

        // Screen (page)
        if (!window.fwData.context.screen) {
            window.fwData.context.screen = {
                type: "missing"
            };
        }

        if (!window.fwData.context.screen.id) {
            // Try to get a reasonable ID from the URL
            if (window.location.pathname.indexOf('/') !== -1) {
                // The end of the URL after the last slash (i.e. file name)
                window.fwData.context.screen.id = window.location.pathname.substr(window.location.pathname.lastIndexOf('/') + 1);
            }
            else {
                window.fwData.context.screen.id = window.location.pathname;
            }

            window.fwData.context.screen.id = window.fwData.context.screen.id.replace(/\W/g, '_');
        }

        // Notifications
        if (!window.fwData.notifications) {
            window.fwData.notifications = {
                messages: [],
            };
        }

        // Menu
        if (!window.fwData.menus) {
            window.fwData.menus = {};
            window.fwData.menus.global = {};
        }

    };

    _priv.printFormContents = function _print_form_contents ($form) {
        var $inputs = $form.find('input, select, textarea');

        if ($inputs.length > 0) {
            $inputs.each(function (i) {
                var $input = $(this);
                var name = $input.attr('name');
                var value = $input.val();

                if (typeof value === "string") {
                    value = value.trim();
                }

                journal.log({ type: 'info', owner: 'UI', module: 'emp', submodule: '', func: 'printFormContents' }, 'Form input: ', name, ' with value', ((value === '') ? '(empty string)' : value));
            });
        }
        else {
            journal.log({ type: 'info', owner: 'UI', module: 'emp', submodule: '', func: 'printFormContents' }, 'Form contained no contents.');
        }
    };

    /*
     * _priv.setInputSelection and _priv.setInputPos modified from:
     * http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area
     */
    _priv.setInputSelection = function _set_input_selection(input, selectionStart, selectionEnd) {

        if (input.setSelectionRange) {
            input.focus();
            input.setSelectionRange(selectionStart, selectionEnd);
        }
        else if (input.createTextRange) {
            var range = input.createTextRange();
            range.collapse(true);
            range.moveEnd('character', selectionEnd);
            range.moveStart('character', selectionStart);
            range.select();
        }
    };

    _priv.setInputPos = function _set_input_pos(input, pos) {

        _priv.setInputSelection(input, pos, pos);
    };

    _priv.selectionListSetup = function _selection_list_setup(){
    	var selectionListItems = document.querySelectorAll(".emp-selection-list-field-container");

    	for(var i=0; i < selectionListItems.length; i++){
    		var listItem = selectionListItems[i];
    		listItem.addEventListener('expandableChange', function (e) {

    			var selectedRadio = e.target;
    			var radioName = selectedRadio.getAttribute('name').trim();

                // Get all radio groups with this name
                var familyRadios = document.querySelectorAll('input[name="' + radioName + '"]');

                for(var j=0;j<familyRadios.length;j++){
                	var currentRadio = familyRadios[j];
                	var parentSection = $(currentRadio).closest(".emp-selection-list-field-container").get(0);

                	if(parentSection){
                		if(currentRadio.getAttribute("aria-expanded") == "true"){
                			parentSection.classList.add("emp-selection-list-active");
	                	}
	                	else{
	                		parentSection.classList.remove("emp-selection-list-active");
	                	}
                	}
                }
    		}, false);
    	}
    };

    _priv.removeLoadingSplash = function _remove_loading_splash(){
    	var loadingSplash = document.querySelector('#emp-page-loading');

    	if(loadingSplash){
    		loadingSplash.parentNode.removeChild(loadingSplash);
    	}
    };

    // Event driven functions
    var _events = {};

    _events.entityChange = function (evt, $select) {

        // Get current selected value
        var selectedValue = $select.val();

        var $parentContainer = $select.parents('.emp-composite.emp-entity-lookup').eq(0);
        var $containerRoot = $parentContainer.children('.emp-entity-containers');

        // Try and find the container with the same select value as data-entity-key;
        var $openSection = $containerRoot.children('div[data-entity-key="' + selectedValue + '"]');

        if (!$openSection.hasClass('emp-show-container')) {

            var $alreadyOpenContainers = $containerRoot.children('.emp-show-container');

            $alreadyOpenContainers.removeClass('emp-show-container');

            $openSection.addClass('emp-show-container');
        }
        else {

            journal.log({ type: 'info', owner: 'UI', module: 'emp', func: '_events.entityChange' }, 'entity change blocked because section is already open');
        }

    };

    // Formats a date with slashes
    _events.dateMasking = function (evt, $input) {

        if (evt.keyCode >= 35 && evt.keyCode <= 40 || evt.keyCode == 16) {
            // Skip arrow keys, home/end and shift. Allows for highlighting contents within the date field.
        } else {

            // Get the current input value
            var originalText = $input.val().trim();
            var inputText = originalText + '';
            var parts;
            var month;
            var day;
            var year;
            var pressedNonNumber = ((evt.keyCode < 48 || evt.keyCode > 57) && (evt.keyCode < 96 || evt.keyCode > 105));
            var cursorPos;

            currentCursorPos = $input.getCursorPosition();

            if (currentCursorPos !== $input.val().length) {

                cursorPos = true;
            }
            else {

                cursorPos = false;
            }

            //If the user entered two "//" remove the last slash and return.
            if (originalText.length > 1 && ((originalText.substr(originalText.length - 2, 2)) == "//")) {
                evt.target.value = evt.target.value.slice(0, evt.target.value.length - 1);
                if (cursorPos) {

                    _priv.setInputPos($input[0], currentCursorPos);
                }

                return true;
            }


            // Only continue if the user just typed a number. If they pressed any other key (slash, arrow key, backspace) then they are most likely editing the field so we should stay out of the way.
            if (pressedNonNumber || originalText.length === 0 || (originalText.length !== $input.getCursorPosition())) {

                // Remove any stray character keys from the match input
                evt.target.value = evt.target.value.replace(/[^0-9\.\/]/g, '');

                if (cursorPos) {

                    _priv.setInputPos($input[0], currentCursorPos);
                }

                return true;
            }

            // Remove any consecutive slashes
            inputText = inputText.replace(/\/+/g, '/');

            // 1 number typed
            if (/^\d$/.test(inputText)) {
                parts = /^\d$/.exec(inputText);
                month = parseInt(parts[1], 10);
            }
            // 2 numbers typed without a slash
            else if (/^(\d)(\d)$/.test(inputText)) {
                parts = /^(\d)(\d)$/.exec(inputText);
                month = parseInt(parts[1], 10);
            }
            // 3 numbers typed without a slash
            else if (/^\d{3}$/.test(inputText)) {
                // The value could be a month and partial day, or a month and day, or a month and day and partial year (`552` = `05/05/2___`)
                // We need to insert a slash somewhere

                // Split up the digits
                parts = inputText.split('');
                // These variables don't necessarily correspond to the month, day, and year. We're just reusing the variable names for easy access to the individual characters.
                month = parseInt(parts[0], 10);
                day = parseInt(parts[1], 10);
                year = parts[2];

                // Value represents the month plus a partial day (`012` => `01/2_` or `123` => `12/3`)
                if (month === 0 || parseInt(parts[0] + parts[1], 10) < 13) {
                    inputText = '' + month + day + '/'; // Starts out with an empty string to make sure `month + day` is treated as a string concatenation rather than a numerical operation

                    inputText += year;
                }
                // Value represents the month plus the full day (`412` => `04/12`)
                else if (month > 1 || parseInt(parts[1] + year, 10) < 32) {
                    inputText = month + '/' + day + year;
                }
            }
            // 4+ numbers typed without a slash
            else if (/^\d{4,}$/.test(inputText)) {
                // This condition doesn't happen often, but if you press the keys quickly enough in just the right manner it can happen. (Normally, typing 4 numbers would have triggered one of the conditions above which would insert a slash so this condition shouldn't be possible.) For example, you can type `1245` by placing two fingers on the `1` and `1` keys, pressing down on them separately, but releasing both at the same time. Repeat this with `4` and `5` and you will only have triggered two `keyup` events: one after typing `12` (which isn't enough to warrant adding a slash) and the second one after the `45`.

                // We can't say for sure what the user is trying to type. `1111` could be `11/11` or `11/1/1___` or `1/11/1___` or `1/1/11___`. So we just have to make our best guess.
                // Methodology: try to extract the month first, modifying `inputText` to contain the leftovers. Then extract the day from that, and so on.

                // Get the first digit
                parts = parseInt(inputText.substr(0, 1), 10);

                // Month is just the first digit
                // First digit is greater than 1 (Feb-Sep) or the first two characters combined are greater than 12
                if (parts > 1 || (parts === 1 && parseInt(inputText.substr(1, 1), 10) > 2)) {
                    month = parts;

                    // Remove this digit from the rest of the value
                    inputText = inputText.substr(1);
                }
                // Month is formed by the first two characters together
                else {
                    month = inputText.substr(0, 2);

                    // Remove these characters from the rest of the value
                    inputText = inputText.substr(2);
                }

                // Get the new 'first' digit
                parts = parseInt(inputText.substr(0, 1), 10);

                // Day is just the first digit
                // First digit is greater than 3
                if (parts > 3) {
                    day = parts;

                    // Remove this digit from the rest of the value
                    inputText = inputText.substr(1);
                }
                // Day is formed by the first two characters together
                else {
                    day = inputText.substr(0, 2);

                    // Remove these characters from the rest of the value
                    inputText = inputText.substr(2);
                }

                // The rest of the characters, if any, must represent the year
                year = inputText;

                // Reconstruct the date
                inputText = month + '/' + day + '/' + year;
            }
            // 2-4 numbers typed with a slash
            else if (/^(\d{1,2})\/(\d{1,2})$/.test(inputText)) {

            }
            // 3-10 numbers typed with two slashes
            else if (/^(\d{1,2})\/(\d{1,2})\/(\d{1,4})$/.test(inputText)) {

            }
            // 4-10 numbers typed with one slashes
            else if (/^(\d{1,2})\/(\d{3,})$/.test(inputText)) {
                // The value must be month/day and a year, so it needs a slash inserted in front of the year
                parts = /^(\d{1,2})\/(\d{3,})$/.exec(inputText);
                month = parts[1];
                day = parts[2];
                year = '';


                //If the date part is longer than 2 characters, insert the final slash and start the year value.
                if (day.length > 2) {
                    year = day.substr(2);
                    day = day.substr(0, 2);
                }

                inputText = month + '/' + day + '/' + year;
            }
            // Else: it's an invalid format at the moment and/or there's nothing we can do

            if (inputText.length > 10) {
                inputText = inputText.substring(0, 10);
            }

            // Update the input field only if we've changed the value
            if (originalText !== inputText) {
                $input.val(inputText);
            }

        }
    };

    _events.searchHeaderTypeChange = function _search_header_type_change(newValue, type) {

        var ctrl = $('#HEADER_ID_TYPE');

        // Get the searchbox location
        var target = document.getElementById('search-box-inputs');

        // Get the values out of the data store sent with page load
        var headerData = ds.getStore('globalHeader');

        var data = {};

        if (newValue !== undefined && type !== undefined) {

            data = {
                template: 'partialCaller',
                partialTemp: 'searchInputBox',
                arguments: {
                    selection: type,
                    values: newValue,
                },
            };

            render.section(null, data, 'return', function (html) {

                // Apply the new searchbox
                $('#search-box-inputs').html(html);

                ctrl.val(type);

                $('#HEADER_ID_NUMBER').val(newValue);

                if (headerData.search.showDup) {
                    var $showDup = $('#emp-showDup-container');

                    if (headerData.search.showDupApplicable.indexOf(selected) !== -1) {
                        // Check to see if its already hidden and needs to be show
                        if ($showDup.hasClass('cui-hidden')) {
                            $showDup.removeClass('cui-hidden');
                        }
                    }
                    else {
                        // Check to see if its already visible and needs to be hidden
                        if (!$showDup.hasClass('cui-hidden')) {
                            $showDup.addClass('cui-hidden');
                        }
                    }
                }

            });

        }
        else {

            var selected = ctrl.val();

            var inputValues = {};

            // Get a closer look at the default values stored in the orignal header
            var headerDefaults = headerData.search.headerID.defaultValues;

            // Check to see if the header has
            if (headerDefaults.hasOwnProperty(selected)) {
                inputValues = headerDefaults[selected];
            }

            data = {
                template: 'partialCaller',
                partialTemp: 'searchInputBox',
                arguments: {
                    selection: selected,
                    values: inputValues,
                },
            };

            render.section(null, data, 'return', function (html) {
                $('#search-box-inputs').html(html);

                if (headerData.search.showDup) {
                    var $showDup = $('#emp-showDup-container');

                    if (headerData.search.showDupApplicable.indexOf(selected) !== -1) {
                        // Check to see if its already hidden and needs to be show
                        if ($showDup.hasClass('cui-hidden')) {
                            $showDup.removeClass('cui-hidden');
                        }
                    }
                    else {
                        // Check to see if its already visible and needs to be hidden
                        if (!$showDup.hasClass('cui-hidden')) {
                            $showDup.addClass('cui-hidden');
                        }
                    }
                }
            });
        }
    };

    _events.employeeSearchDropDown = function (evt) {

        var $typeDropDown = $(evt.target);

        // Find the parnet container
        var $employeeSearchContainer = $typeDropDown.parents('.emp-employee-search').eq(0);

        var $idInput = $employeeSearchContainer.find('.emp-id-search');
        var $nameInput = $employeeSearchContainer.find('.emp-name-search');

        if ($typeDropDown.val() === 'id') {

            $idInput.removeClass('cui-hidden');
            $nameInput.addClass('cui-hidden');
        }
        else {

            $idInput.addClass('cui-hidden');
            $nameInput.removeClass('cui-hidden');
        }
    };

    _events.employeeLookup = function (evt, mapping) {

        var $button = $(evt.target);
        var $fieldSet = $button.parents('.emp-employee-search');
        var $dropdown = $fieldSet.find('.emp-employee-search');
        var $idContainer = $fieldSet.find('.emp-id-lookup-container');
        var $nameContainer = $fieldSet.find('.emp-name-lookup-container');

        var $id = $idContainer.find('.employee-lookup-id');

        var $fname = $nameContainer.find('.employee-lookup-fname');
        var $mname = $nameContainer.find('.employee-lookup-mname');
        var $lname = $nameContainer.find('.employee-lookup-lname');

        var ajaxURL = $button.attr('data-ajaxurl') || false;


        if (ajaxURL) {

            var req = {
                url: ajaxURL,
                method: 'POST',
                data: {}
            };

            if ($dropdown.val() === "id") {

                req.data.id = $id.val();
            }
            else {

                req.data.fname = $fname.val();
                req.data.mname = $mname.val();
                req.data.lname = $lname.val();
            }

            specialSelectionPopup(evt, req, mapping, false, false, { "type": "employeeLookup" });

        }
        else {

            journal.log({ type: 'error', owner: 'UI', module: 'emp', func: 'employeeLookup' }, 'Employee search button was clicked but does not have teh value for data-ajaxurl');
        }
    };

    _events.frameworkError = function (evt) {

        var $target = $(evt.target);

        function createModal(text) {

            var modal = $.modal({
                autoOpen: true,
                html: text,
                closeDestroy: true,
            });

        }

        // Check to see if the require module
        if (require.defined('modal')) {

            // Create the modal
            createModal($target.text());
        }
        else {

            // Load the require module and then create the modal
            cui.load('modal', function _selection_modal() {
                createModal($target.text());
            });
        }
    };

    _events.checkOther = function(evt) {

        var $checkbox = $(evt.target);
        var $checkboxDiv = $checkbox.parents('.emp-check-other-checkbox').eq(0);
        var $otherDiv = $checkboxDiv.next();

        if ($checkbox.is(':checked')) {

            $otherDiv.removeClass('cui-hidden');
        }
        else {
            $otherDiv.addClass('cui-hidden');
        }

    };

    _events.fileUploadButton = function (evt) {

        evt.preventDefault();

        var elms = evt.data;

        if (elms.$button.val() === undefined || elms.$button.val() === "") {

            elms.$input.trigger('click');
        }
        else {

            elms.$input.val('').trigger('change');
        }
    };

    _events.fileUploadInput = function (evt) {

        var elms = evt.data;

        // Check to see if a file was selected
        if (evt.target.value) {

            elms.$span.text(evt.target.value);

            elms.$button.text("Clear");
            elms.$button.val(true);
        }
        else {

            elms.$span.text("Select a file");

            elms.$button.text("Browse");
            elms.$button.val("");
        }
    };

    _events.resizeDocumentViewer = function (evt) {

        evt.preventDefault();
        evt.stopPropagation();

        $button = $(evt.target);

        var $viewerSection = $button.parents('section.emp-document-viewer').eq(0);

        if ($viewerSection.length === 1) {

            var classes = $viewerSection.attr('class').split(/\s+/);

            var size = false;

            for (var i = 0, len = classes.length; i < len; i++) {

                if (classes[i].indexOf('emp-viewer-size-') !== -1) {

                    size = classes[i];
                    break;
                }

            }

            if (size) {

                size = size.replace('emp-viewer-size-', '');
            }

            switch (size) {

                case "small":

                    $viewerSection.removeClass('emp-viewer-size-' + size);
                    $viewerSection.addClass('emp-viewer-size-medium');
                    break;

                case "medium":

                    $viewerSection.removeClass('emp-viewer-size-' + size);
                    $viewerSection.addClass('emp-viewer-size-large');
                    break;

                case "large":

                    $viewerSection.removeClass('emp-viewer-size-' + size);
                    $viewerSection.addClass('emp-viewer-size-small');
                    break;
            }

        }
    };

    //////////////////////
    // Public Functions //
    //////////////////////
    var init = function init(options, cb) {

        if (options === undefined) {
            options = {};
        }

        if (!_priv.isInitialized) {

            var scripts = require.s.contexts._.config.paths;
            var pageScript = false;

            var targets = {
                header: document.getElementById('header-wrapper'),
                page: document.getElementById('body-wrapper'),
                footer: document.getElementById('footer-wrapper')
            };

            var renderData = {
                header: (fwData.header) ? fwData.header : false,
                page: fwData.page,
                footer: (fwData.footer) ? fwData.footer : false
            };

            // Start by rendering the global page
            if (window.fwData && (window.fwData.page || window.fwData.header || window.fwData.footer)) {

                if (fwData.screen && fwData.screen.id && scripts[fwData.screen.id]) {

                    cui.load(fwData.screen.id, function (script) {

                        // Expose all the scripts
                        emp.pageScripts = script;

                        pageScript = script;

                        render.page(targets, renderData, function _renderPage() {

                            _priv.pageSetup(options, function() {

                                // Check for an init function
                                if (pageScript.init) {

                                    script.init();

                                    journal.log({ type: 'info', owner: 'UI', module: 'emp', func: 'init' }, 'Page script was executed!');
                                }

                                setTimeout(function() {

                                    _priv.removeLoadingSplash();

                                }, 1000);

                                // Initialize main menu
                                // cui.load('menujs', function _loadMenujs() {

                                //     // Create the menu definition
                                //     var menuDefinition = $.extend(true, {}, fwData.menus.global, { display: { className: 'emp' } });

                                //     $('#emp-header-menu-main').menujs(menuDefinition);
                                // });

                            });


                        });

                    });

                }
                else {

                    // Expose all the scripts
                    emp.pageScripts = false;

                    render.page(targets, renderData, function _renderPage() {

                        _priv.pageSetup(options, function() {

                            // Check for an init function
                            if (pageScript.init) {

                                script.init();

                                journal.log({ type: 'info', owner: 'UI', module: 'emp', func: 'init' }, 'Page script was executed!');

                            }

                            setTimeout(function () {

                                _priv.removeLoadingSplash();

                            }, 1000);

                        });

                    });

                }

            }
            else {

                // This could be a mockup, which would not utilize the renderer, so setup the page immediately
                _priv.pageSetup(options, function() {

                    setTimeout(function () {

						_priv.removeLoadingSplash();

                    }, 1000);
                });
            }

            // Make it so init can not be call so easily.
            _priv.isInitialized = true;

            if (typeof cb === "function") {

                cb();
            }
        }
    };

    /*
     * References
     */
    var reference = {
        fields: {},
        tables: {}
    };

    /**
     * Ajax functionality
     * @type  {Object}
     */
    var ajax = {};

    /*
     * Ajax Request
     * ===========
     * req - object
     *         url - [required] - string - valid request url
     *         method - string - either GET or POST
     *         data - object - key value pair of values
     *
     * res - object
     *        done - function - function that executes when a response returns with no errors
     *        fail - function - funtion that executes on connection based errors
     *        always - function - function that executes no matter the type of response and is always last.
     *
     */
    ajax.request = function _request(req, res, noPageWrap, disableRedirect) {

        var ajaxSessionTimeout = function () {

            var href = window.location.href;
            var domain = window.location.host;
            var port = window.location.port;
            var path = "";

            var protocol = href.split(domain)[0];

            var contents = href.split(domain)[1].split('/')[1];

            if (port !== 80 && port !== 443) {

                path = protocol + domain + "/" + contents + "/SessionExplorer.jsp";
            }
            else {

                path = protocol + domain + ":" + port + "/" + context + "/SessionExplorer.jsp";
            }

            window.location.replace(path);
        };

        // The default actions do nothing, Developer must overide these
        var orig = {
            done: function done() {
                try {

                } catch (e) {

                }
            },
            fail: function fail() {
                try {

                } catch (e) {

                }
            },
            always: function always() {
                try {

                } catch (e) {

                }
            }
        };

        var response = {};

        // Function cleans up ajax responses an removes unneeded arrays if they are found
        function cleanResponse(data, cb) {

            if (typeof data === "object") {

                // Check for the status/response attributes
                if ((data.response && data.result) || (data.status && data.result)) {

                    // New standard return everything to the handler function as of 1/4/2017 JAH
                    if (data.status) {

                        cb(undefined, data);
                    }

                    if (data.response) {

                        journal.log({ type: 'warning', owner: 'UI', module: 'emp', submodule: 'ajax', func: 'request => cleanResponse' }, 'AJAX request was wrapped but its using the older standard! This should be updated!');

                        if (data.response === "success") {

                            cb(undefined, data.result);
                        }
                        else {

                            cb(true, data.result);
                        }

                    }

                }
                else {

                    journal.log({ type: 'warning', owner: 'UI', module: 'emp', submodule: 'ajax', func: 'request => cleanResponse' }, 'AJAX request was returned that did not meet the new response.result wrapping standard');

                    cb(undefined, data);
                }

            }
            else if (Array.isArray(data)) {

                if (data.length === 1) {

                    data = data.shift();
                }

                cb(undefined, data);
            }
            else {

                cb(true, false);
            }
        }

        function removePageWrapper(data) {

            // Check to make sure data was recieved, that the page object property exists and it has contes
            if (data && data.hasOwnProperty('page') && data.page.hasOwnProperty('contents')) {

                if (data.page.contents.length === 1) {

                    // Remove the page layer.
                    data = data.page.contents[0];

                    // Check to see if we have a pagebody layer
                    if (data.hasOwnProperty('template') && data.template === 'pagebody' && data.hasOwnProperty('contents')) {

                        if (Array.isArray(data.contents)) {

                            return data.contents;
                        }

                    }

                }

            }

            return data;
        }

        if (typeof req === "string") {

            req = {
                url: req,
                cache: false,
                method: "POST"
            };
        }

        // Make sure there is a request URL provided
        if (typeof req === 'object' && req.hasOwnProperty('url')) {

            if (res === undefined) {
                res = {};
            }

            // Merge the default ajax response actions with any user defined actions
            response = $.extend(true, response, orig, res);

            // Request Cleanup
            // Check to see if the user provided data
            if (req.hasOwnProperty('data')) {

                // Do req.data cleanup
                if (typeof req.data !== 'object') {

                    // We have a data parameter defintion, but its not an object
                    if (typeof req.data === 'string') {

                        // Check to see if we have a form element reference
                        var $section = $('#' + req.data);

                        if ($section.length === 1) {
                            // Get the parameter source map
                            // Change req.data back to an object
                            req.data = _priv.sourceMap($section);
                        }
                        else {
                            journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'ajax', func: 'request' }, 'Request data parameter referenced unknown section or form: ', req.data);

                            return false;
                        }
                    }
                }
                else {
                    // Check to see if the source map has been defined and not an hard coded set of values
                    if (req.hasOwnProperty('sourceMap')) {
                        var elementMap = _priv.elementMap(req.data);

                        if (elementMap !== false) {
                            req.data = elementMap;
                        }
                        else {
                            journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'ajax', func: 'request' }, 'Request data parameter failed because of invalid source map');

                            return false;
                        }
                    }
                }
            }
            else {

                req.data = null;
            }

            // Build the basis request object
            var request = {
                url: req.url,
                data: req.data,
            };

            if (!req.cache) {
                request.cahce = false;
            }

            if ((location.hostname === "localhost" || location.hostname === "127.0.0.1") && location.port === "8888") {

                journal.log({ type: 'warning', owner: 'UI', module: 'emp', submodule: 'ajax', func: 'request' }, 'Request method being forced to "GET"');

                req.method = 'GET';
            }
            else {

                // Add method only if needed
                if (req.method) {
                    request.method = req.method;
                }
                else {
                    request.method = "POST";
                }
            }

            if (!_disableAjax) {

                // Make the request
                $.ajax(request)
                    .done(function (data, status, ajaxObj) {

                        if (data !== undefined) {

                            // Cleaup the data before callback
                            cleanResponse(data, function (err, data) {

                                if (err) {

                                    response.done(data);
                                }
                                else {

                                    if (noPageWrap) {
                                        data = removePageWrapper(data);
                                    }

                                    // Call the done callback
                                    response.done(data);
                                }
                            });
                        }
                        else {

                            console.log("Undefined ajax returned!");
                        }


                    })
                    .fail(function (ajaxObj, status) {

                        switch (ajaxObj.status) {

                            case 0:
                            case 440:

                                if (!disableRedirect) {

                                    ajaxSessionTimeout();
                                }
                                else {

                                    response.fail(ajaxObj);
                                }


                                break;

                            default:

                                if (ajaxObj !== undefined) {

                                    // Cleaup the data before callback
                                    cleanResponse(ajaxObj, function (err, data) {

                                        if (err) {

                                            response.fail(ajaxObj);
                                        }
                                        else {

                                            // Call the done callback
                                            response.fail(ajaxObj);
                                        }
                                    });
                                }
                                else {

                                    response.fail(ajaxObj);
                                }


                                break;
                        }

                    })
                    .always(function (data) {

                        // Cleaup the data before callback
                        cleanResponse(data, function (err, data) {

                            if (err) {

                                response(data);
                            }
                            else {

                                // Call the done callback
                                response.always(data);
                            }
                        });
                    });
            }
            else {

                journal.log({ type: 'info', owner: 'Developer', module: 'emp', submodule: 'ajax', func: 'request' }, 'Ajax Request blocked by developer.', request);

            }

        }
    };

    ajax.requestData = function _requestData(req, res) {

        // Check to see if we need to use our own res object
        if (res === undefined) {

            // Create our own res
            res = {};

            res.done = function _done(data) {

                if (data.body) {
                    data = data.body;
                }

                if (!Array.isArray(data)) {
                    data = [data];
                }

                // Loop through all of the responses
                for (var i = 0, len = data.length; i < len; i++) {

                    var response = data[i];

                    switch (response.type) {

                        case 'data':


                            if (response.strict) {

                                // Execute the process map
                                _priv.processMap(undefined, response.contents, ":strict:", function (result) {
                                    if (!result) {
                                        journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'ajax', func: 'requestData' }, 'Error when processing returned ajax requested data');
                                        return false;
                                    }
                                });

                            }
                            else {

                                // Execute the process map
                                _priv.processMap(response.contents, function (result) {
                                    if (!result) {
                                        journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'ajax', func: 'requestData' }, 'Error when processing returned ajax requested data');
                                        return false;
                                    }
                                });
                            }


                            break;

                        // Check for the possible respons object
                        case 'message':

                            // _priv.pageMessage(response.contents, false, false);
                            empMessage.createMessage(response.contents, { scroll: false });

                            break;

                        case 'error':

                            // _priv.pageMessage(response.contents, true, false);
                            empMessage.createMessage(response.contents, { scroll: true });

                            break;

                        default:
                            journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'ajax', func: 'requestData' }, 'Unknown problem or response has been encountered');

                            break;

                    }

                }

            };

            res.fail = function _fail() {
                journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'ajax', func: 'requestData' }, 'Request data failed');

                return false;
            };

        }

        ajax.request(req, res);
    };

    ajax.requestSection = function _requestSection(req, target, method) {
        // Create our own res
        var res = {};

        res.done = function _done(data) {

            if (data.body) {
                data = data.body;
            }

            // Force into array format
            if (!Array.isArray(data)) {
                data = [data];
            }

            for (var i = 0, len = data.length; i < len; i++) {
                var response = data[i];

                switch (response.type) {
                    case 'section':
                        // Call the render module and build the section out
                        render.section(response.contents, function (html) {
                            if (html !== false) {
                                switch (method) {
                                    case 'prepend':
                                        $target.prepend(html);

                                        break;

                                    case 'replace':

                                        // Special rules on replace
                                        switch ($target[0].nodeName) {
                                            case 'TABLE':
                                                // Flush this reference.
                                                var tableID = $target.attr('id');
                                                var tableDS = $target.attr('data-store-id');

                                                // Remove the old reference as we are replacing the table.
                                                if (emp.reference.tables.hasOwnProperty[tableID]) {
                                                    delete emp.reference.tables[tableID];
                                                }

                                                // Remove the old datastore reference as well
                                                if (ds.hasStore(tableDS)) {
                                                    ds.deleteStore(tableDS);
                                                }

                                                // Update target
                                                $target = $target.parents('.emp-table').eq(0);

                                                // Find the new table reference
                                                var $newTable = $(html).find('table');

                                                $target.replaceWith(html);

                                                // Setup the new table
                                                $newTable.table();

                                                break;

                                            case 'INPUT':
                                            case 'SELECT':
                                            case 'TEXTAREA':
                                                $target = $target.parents('.emp-field').eq(0);

                                                $target.replaceWith(html);

                                                break;

                                            // All 'normal elements that can be simply replaced'
                                            default:

                                                $target.replaceWith(html);

                                                break;
                                        }

                                        break;

                                    case 'append':
                                    case undefined:

                                        break;

                                    default:

                                        $target.append(html);

                                        break;
                                }
                            }
                            else {
                                journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'ajax', func: 'requestData' }, 'Request section failed. Renderer returned false');
                            }
                        });

                        break;

                    // Check for the possible respons object
                    case 'message':

                        // _priv.pageMessage(response.contents, false, true);
                        empMessage.createMessage(response.contents, { scroll: false });

                        break;

                    case 'error':

                        // _priv.pageMessage(response.contents, true, true);
                        empMessage.pageMessage(response.contents, { scroll: true });

                        break;

                    default:
                        journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'ajax', func: 'requestData' }, 'Unknown problem or response has been encountered');

                        break;
                }
            }
        };

        res.fail = function _fail() {
            journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'ajax', func: 'responseFail' }, 'Request section failed');

            return false;
        };

        var $target = (target instanceof jQuery) ? target : $('#' + target);

        if ($target.length === 1) {
            ajax.request(req, res);
        }
        else {
            journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'ajax', func: 'responseFail' }, 'Request section failed. Unknown ID specified: "', target, '"');
        }
    };

    var ajaxSection = function (evt, source, method, req) {

        var $srcControl = $(evt.target);

        if (typeof method !== "string" || ['replace', 'insertBefore', 'insertAfter'].indexOf(method) === -1) {
            req = method;
            method = undefined;
        }

        if (typeof req === "string") {

            req = {
                url: req
            };
        }

        if (req.url) {

            // Check for submit method
            if (req.method) {
                req.method = "POST";
            }

            req.cache = false;

            // We already have a function that will scrap (_priv.sourceMap)
            req.data = source;

            // Build Response object
            var res = {};

            res.done = function _done(data) {

                if (typeof data === "object") {

                    if (data.status) {

                        if (data.status === "success") {

                            // Check for body contents
                            if (data.result && data.result.body) {

                                journal.log({ type: 'info', owner: 'UI', module: 'emp', func: 'ajaxSection' }, 'Response contained new body contents');

                                render.section(source, data.result.body, data.result.method, function (html) {

                                    var $section = null;

                                    if (data.result.method === "replace") {

                                        $section = $('#' + source);
                                    }
                                    else if (data.result.method === "insertBefore") {

                                        $section = $('#' + source).prev();
                                    }
                                    else {

                                        $section = $('#' + source).next();
                                    }

                                    if ($section !== null && $section.length === 1) {

                                        sectionSetup($section);
                                    }

                                });

                            }

                            if (data.result && data.result.message) {
                                _priv.pageMessage(data.result.message, true);
                            }

                        }
                        else if (data.status === "error") {

                            console.log("An error with AJAXSection has occured");

                        }
                        else {

                            journal.log({ type: 'error', owner: 'DEV|FRW', module: 'emp', func: 'ajaxSection' }, 'Response object return unknown response type: ' + data.response);
                        }

                    }
                    else {

                        journal.log({ type: 'error', owner: 'DEV|FRW', module: 'emp', func: 'ajaxSection' }, 'Response object was returned but missing valid response code.');
                    }

                }
                else {
                    journal.log({ type: 'error', owner: 'DEV|FRW', module: 'emp', func: 'ajaxSection' }, 'Request returned but it was not an object');
                }

            };

            res.fail = function _fail(data) {
            };

            ajax.request(req, res);

        }
        else {

            journal.log({ type: 'error', owner: 'DEV|FRW', module: 'emp', func: 'ajaxSection' }, 'Request failed because no URL was provided');
        }
    };

    /*
     * openWindow
     * ==========
     * url - [required] - string - page url
     * title - [required] - string - window title
     * features - [required] - string - window specail features
     */
    var openWindow = function openWindow(url, title, features) {

        // Polyfill missing features with defaults
        if (features === undefined) {
            features = 'scrollbars=yes,menubar=yes,resizable=yes,toolbar=no,width=900,height=700';
        }

        window.open(url, title, features);

        return true;
    };

    /*
     * functionCall
     * ============
     * evt - [required] - object - object event
     * funcName - [required] - string - name of the function to be called
     * args - array - arguments that will be passed to the function
     */
    var functionCall = function functionCall(evt, funcName, args, settings) {

        // Shift variables just in case the event object is not included
        if (typeof evt === 'string' && (Array.isArray(funcName) || funcName === undefined)) {
            // Shift all the variables.
            settings = args;
            args = funcName;
            funcName = evt;
            evt = false;
        }

        // If event exists prevent the default action
        if (evt) {
            evt.preventDefault();
        }

        if (args === undefined) {
            args = [];
        }
        else {
            //console.log(args);
        }

        function callFunction(evt, funcName, args, settings, remainingSteps) {

            var $srcControl = $(evt.target);

            // Check to see if they function is in a namespace
            if (funcName.indexOf('.') === -1) {

                // No namespace assume this is a global (window) function
                // Check to make sure we are calling a real function first.
                if (typeof (window[funcName]) === 'function') {

                    return window[funcName].apply(this, args);
                }
                else {
                    console.error('window[' + funcName + '] is not a function');
                }
            }
            else {

                var context = window;
                var namespace = funcName.split('.');
                var firstPart = namespace.shift();

                if (context[firstPart]) {
                    var textContext = firstPart;

                    context = context[firstPart];

                    // Loop through remaining spaces
                    for (var i = 0, len = namespace.length; i < len; i++) {

                        var testSpace = context[namespace[i]];

                        if (testSpace) {
                            // Update context and text name
                            context = testSpace;
                            textContext += '.' + namespace[i];
                        }
                        else {
                            journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'callFunction' }, 'Namespace breaks down at depth: "', textContext + '.' + namespace[i], '"');

                            return false;
                        }

                    }

                    // We reached the end make sure the namespace is a function
                    if (typeof context === 'function') {

                        switch (funcName) {

                            // Functions that need to include the event.
                            case 'emp.form.submit':

                                // Check to make sure only one argument (the submit options object) is currently in places
                                if (args.length === 1) {

                                    // See if special emp.functionCall setting were past in we can extend.
                                    if (typeof args[0] === 'object' && typeof settings === 'object') {
                                        args[0] = $.extend({}, args[0], settings);
                                    }

                                    // Include the event instance.
                                    args.unshift(evt);

                                }
                                else {
                                    journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'callFunction', func: 'emp.form.submit' }, 'This function should only have 1 argument being passed to it via the arguments array');

                                    return false;
                                }

                                break;

                            case 'emp.confirm':
                            case 'emp.tableConfirm':
                            case 'emp.tableState':

                                // add on the original event object
                                args.unshift(evt);
                                args.push(remainingSteps);

                                break;

                            //case 'emp.processMap':
                            case 'emp.selectionPopup':
                            case 'emp.specialSelectionPopup':
                            case 'emp.referenceCall':
                            case 'emp.download':
                            case 'emp.dropdown':
                            case 'emp.ajaxSection':
                            case 'emp.link.newWindow':
                            case 'emp.form.virtual':

                                args.unshift(evt);
                                break;

                        }

                        var returnCode = context.apply(this, args);

                        return returnCode;
                    }
                    else {
                        journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'callFunction' }, 'Window namespace is not a function: ', textContext);
                    }

                }
                else {
                    journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'callFunction' }, 'Window namespace does not exist');
                }
            }
        }

        // Check to see what the function call type is.
        if (typeof funcName === 'string') {

            journal.log({ type: 'info', owner: 'UI', module: 'emp', submodule: 'callFunction' }, 'Calling function: ' + funcName);

            result = callFunction(evt, funcName, args, settings);

            // Bypass error message
            if (funcName.indexOf('validation') === -1 && funcName.indexOf('validate') === -1) {

                if (!result) {
                    empMessage.createMessage({ text: "An error has occured. Please contact the help desk.", type: "error" }, { scroll: true });
                }
            }

            return result;
        }
        else {

            if (typeof funcName === 'object') {

                // Make a copy of the object of functions
                var functionCalls = $.extend({}, funcName);
                var functionKeys = [];

                for (var func in functionCalls) {
                    functionKeys.push(func);
                }

                var priorReturn;
                var currentIndex = 0;
                var priorReturns = [];

                (function callFunctions(keys) {

                    // Get a copy of the function object
                    var funcObj = functionCalls[keys.shift()];

                    var remainingSteps = {};

                    for (var i = 0, len = keys.length; i < len; i++) {
                        remainingSteps[i] = functionCalls[keys[i]];
                    }

                    // Check to see if we can include the prior return
                    if (priorReturn !== undefined) {

                        if (Array.isArray(funcObj.args)) {
                            funcObj.args.push();
                        }
                        else if (typeof funcObj.args === 'object') {
                            funcObj.args.priorReturn = priorReturn;
                        }
                        else {
                            funcObj.args = [priorReturn];
                        }
                    }

                    try {

                        // Call the function and get its return type
                        var funcReturn = callFunction(evt, funcObj.function, funcObj.args, settings, remainingSteps);

                        priorReturn = funcReturn;
                        priorReturns.push(funcReturn);

                        // Check to see if the return failed.
                        if (funcReturn === false) {
                            // Override the array and make it blank to force the function execution to stop
                            keys = [];

                            journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'callFunction' }, 'EventScript failed - Function ', funcObj.function, ' returned a failure code: ', funcReturn, '. Stoping eventScript execution loop.');

                            empMessage.createMessage({ text: "An error has occured. Please contact the help desk.", type: "error" }, { scroll: true });
                        }
                        else if (funcReturn === "stop") {

                            keys = [];
                        }
                    }
                    catch (e) {

                        keys = [];

                        journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'callFunction' }, 'EventScript failed - Function ', funcObj.function, ' execution failed.', e);
                    }

                    if (keys.length) {

                        // Update the index
                        currentIndex += 1;

                        callFunctions(keys);
                    }
                    else {

                        if (typeof priorReturn === "boolean" || (typeof priorReturn === "object" && !priorReturn.preserveBlocker)) {

                            if (clkblocker.check) {

                                journal.log({ type: 'warning', owner: 'UI', module: 'emp', submodule: 'callFunction' }, 'Removing click blocker because prevereBlocker was not part of the return.');

                                clkblocker.remove();
                            }
                        }

                        return priorReturns;
                    }

                })(functionKeys);
            }
        }
    };

    var referenceCall = function referenceCall(evt, refType, refId, func, args) {

        if (this.emp.reference.hasOwnProperty(refType)) {
            var reference = emp.reference[refType];

            if (reference.hasOwnProperty(refId)) {
                // Update references.
                reference = reference[refId];

                // Check the refernce arguments quick,
                //if (args.length === 0) {

                // Push the event object
                args.unshift(evt);

                // Push the referenced object
                //args.push(reference);
                //}

                // Call the reference function and pass remaining args
                reference[func].apply(reference, args);
            }
            else {
                journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'referenceCall' }, 'Reference call requested a reference not currently in the reference context "', refId, '". Please verify that an element with that reference ID exists');

                return false;
            }
        }
        else {
            journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'referenceCall' }, 'Reference call for type "', refType, '" failed because it does not exist');

            return false;
        }
    };

    /*
     * Download Control
     * ================
     */
    var download = function _download(evt, url, readyText) {
        var spinnerOpts = {
            lines: 7, // The number of lines to draw
            length: 3, // The length of each line
            width: 2, // The line thickness
            radius: 3, // The radius of the inner circle
            corners: 0.5, // Corner roundness (0..1)
            rotate: 75, // The rotation offset
            color: '#000', // #rgb or #rrggbb
            speed: 1, // Rounds per second
            trail: 75, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: true, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: '50%', // Top position relative to parent in px
            left: '13px', // Left position relative to parent in px
        };

        // Get the sourc control
        var $control = $(evt.target);

        // Remove the original onlcikc as it shouldnt be needed
        $control.removeAttr('onclick');
        $control.addClass('emp-active-spinner');

        window.spin = spin;

        var spinner = new spin(spinnerOpts).spin();

        $control[0].appendChild(spinner.el);

        var req = {};

        // Check to see if we have a string url or object
        if (typeof url === 'string') {
            req.url = url;
        }
        else if (typeof url === 'object') {
            req = $.extend(true, {}, url);
        }

        var res = {
            done: function (data) {

                if (data.body) {
                    data = data.body;
                }

                if (data.url) {
                    // window.location = data.url;
                    setTimeout(function () {
                        // Mark the control as finished
                        $control.text(readyText).removeClass('emp-active-spinner');

                        // Stop/remove the spinner
                        spinner.stop();

                        $control.text('Download Letter').on('click', function () {
                            window.location = data.url;
                        });

                        // Initial call to download the generate file.
                        window.location = data.url;
                    }, 2000);
                }
            },
            fail: function () {
                journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'download' }, 'Ajax request failed');
            }
        };

        ajax.request(req, res, false);
    };

    /*
     * Override Private
     * ================
     * name - [require] - string - name of private variable
     * value - [require] - any -  replacement value
     * cb - function - function to execute after change is complete
     */
    var overridePrivate = function overridePrivate(name, value, cb) {

        if (_priv[name]) {

            // Reset private value
            _priv[name] = value;

            if (typeof cb === 'function') {

                cb();

            }
            else {
                return true;
            }

        }
        else {

            return false;
        }
    };

    var specialSelectionPopup = function _special_selection_popup(event, settings) {

        var skipRequest = false;

        if (settings) {

            var selectionPopupPageMessages = function (msgArray) {

                for (var m = 0, mLen = msgArray.length; m < mLen; m++) {

                    if (!msgArray[m].template) {
                        msgArray[m].template = 'message';
                    }

                    empMessage.createMessage(msgArray[m], {});
                }
            };

            var sendIDSecondRequest = function _send_id_second_request(type, modal, table) {

                var req = {
                    url: false,
                    method: false,
                    data: {}
                };

                var $form = modal.$self.find('form');

                // Get the URL
                req.url = $form.attr('action');
                req.method = $form.attr('method');

                req.data.userId = modal.$self.find('#sendIdResults_userId').val();
                req.data.mnemonic = modal.$self.find('#sendIdResults_mnemonicId').val();
                req.data.network = modal.$self.find('#sendIdResults_netNameId').val();
                req.data.empId = modal.$self.find('#sendIdResults_empId').val();
                req.data.intTpId = modal.$self.find('#sendIdResults_intTpId').val();
                req.data.extTpId = modal.$self.find('#sendIdResults_extTpId').val();
                req.data.rowId = modal.$self.find('#sendIdResults_rowId').val();

                return req;
            };

            var getIDSecondRequest = function _get_id_second_request(type, modal, table) {

                var req = {
                    url: false,
                    method: false,
                    data: {}
                };

                var $form = modal.$self.find('form');

                // Get the URL
                req.url = $form.attr('action');
                req.method = $form.attr('method');

                req.data.id = modal.$self.find('#getIdResults_id').val();
                req.data.legalName = modal.$self.find('#getIdResults_legalName').val();
                req.data.tpType = modal.$self.find('#getIdResults_tpType').val();

                return req;
            };

            switch (settings.type) {

                case 'associateSelection':

                    // New selection function
                    settings.selectFunc = function _select_func(event, modal, table, settings) {

                        if (settings && settings.secondRequest && settings.secondRequest.request) {

                            var req = {};

                            var sr = settings.secondRequest;

                            if (typeof sr.request === "string") {

                                req.url = sr.request;
                            }
                            else if (typeof sr.request === "object" && sr.request.url) {

                                req.url = sr.request.url;
                            }

                            var columnValues = table.getHiddenInputValues();

                            for (var col in columnValues) {

                                if (col.indexOf('_temp') === -1 && col.indexOf('_checked_index') === -1 && col.indexOf('_selected_index') === -1) {

                                    if (!req.data) {
                                        req.data = {};
                                    }

                                    req.data[col] = columnValues[col];

                                }
                            }

                            requestAssociate(req, modal, table);

                        }
                        else {

                            journal.log({ type: 'error', owner: 'FW', module: 'emp', func: 'specialSelectionPopup' }, 'Associate Selection failed as its missing the secondRequest Object or secondRequest.request property.');
                        }

                    };

                    // Change a few settings before executing the first request
                    settings.autoSingleSelect = false;

                    if (!settings.removeClear) {
                        settings.removeClear = true;
                    }

                    break;

                case 'duplicatePopup':

                    // New selection function
                    settings.selectFunc = function _select_func(event, modal, table, mapping) {

                        var req = {};
                        var settings = {};

                        if (specialActions.redirect) {
                            settings.redirect = specialActions.redirect;
                        }

                        if (specialActions.url) {

                            req.url = specialActions.url;
                        }
                        else {

                            journal.log({ type: 'error', owner: 'FW', module: 'emp', func: 'specialSelectionPopup' }, 'Sepcial Selection Popup function requires that a url be passed with part of the specialActions object.');

                            return false;
                        }

                        if (specialActions.mapping) {

                            // Loop each column
                            for (var dest in specialActions.mapping) {

                                var value = specialActions.mapping[dest];

                                if (table.config.colmap[value]) {

                                    var name = table.config.colmap[value];

                                    specialActions.mapping[dest] = table.config.hiddenInputs.current[name].val();

                                }
                                else {

                                    journal.log({ type: 'error', owner: 'FW', module: 'emp', func: 'specialSelectionPopup' }, 'Sepcial Selection Popup associate function requested an invalid column from the selection popup table.');
                                }

                            }

                            req.data = specialActions.mapping;

                        }

                        // Pass the ajax request to the associate request
                        requestDuplicate(req, specialActions.action, mapping, modal, table, settings);

                    };

                    if (!settings.removeClear) {
                        settings.removeClear = true;
                    }

                    break;

                case 'sendID':

                    // Controls weather or not if the selection popup pre-renders, if one row is returned,
                    // the modal render is disabled as Framewrok will already know in the context and send
                    // the value to the session. If mutliple records exist the table will be rendered.
                    settings.preRenderCheck = function _pre_render_check_send_id(evt, data) {

                        var errorMsg = false;

                        if (data.messages && data.messages.length) {

                            selectionPopupPageMessages(data.messages);

                            for (var m = 0, mLen = data.messages.length; m < mLen; m++) {

                                if (data.messages[m].type === "error") {
                                    errorMsg = true;
                                }
                            }

                        }

                        if (!errorMsg && data.status === "success") {

                            if (data.result.length === 1) {

                                var formBody = data.result[0].body.contents[0];

                                if (formBody.type === "form" && formBody.contents && formBody.contents.length) {

                                    var tableRef = false;

                                    for (var i = 0, len = formBody.contents.length; i < len; i++) {

                                        if (formBody.contents[i].template === "table") {
                                            tableRef = formBody.contents[i];

                                            break;
                                        }
                                    }

                                    if (tableRef) {

                                        if (tableRef.body && tableRef.body.rows && tableRef.body.rows.length === 1) {

                                            return false;
                                        }
                                        else if (tableRef.body && tableRef.body.rows && tableRef.body.rows.length === 0) {

                                            journal.log({ type: 'error', owner: 'FW', module: 'emp', func: 'specialSelectionPopup' }, 'SendID table has zero rows inside of popup.');
                                        }
                                        else {

                                            // More than one row
                                            return true;
                                        }

                                    }
                                    else {

                                        journal.log({ type: 'error', owner: 'FW', module: 'emp', func: 'specialSelectionPopup' }, 'SendID missing table inside of popup.');
                                    }

                                }
                                else {

                                    journal.log({ type: 'error', owner: 'FW', module: 'emp', func: 'specialSelectionPopup' }, 'SendID missing form inside of popup.');
                                }

                                return true;
                            }

                            return undefined;
                        }

                        return undefined;
                    };

                    // Select Function only executed when the more than one mainframe session is open on the users machine.
                    settings.selectFunc = function _select_func_send_id(event, modal, table, settings) {

                        var errorMsg = [
                            {
                                "type": "error",
                                "template": "message",
                                "text": "Send ID request failed. Please contact the help desk to report this issue."
                            }
                        ];

                        var req = sendIDSecondRequest("send", modal, table);
                        var res = {
                            done: function (data) {

                                if (data.status === "success") {

                                    if (data.messages) {
                                        selectionPopupPageMessages(data.messages);
                                    }

                                    modal.destroy();
                                }
                                else {

                                    res.fail(data);
                                }

                            },
                            fail: function (data) {

                                if (data && data.messages && data.messages.length) {

                                    data.messages.push(errorMsg[0]);

                                    selectionPopupPageMessages(data.messages);
                                }
                                else {

                                    selectionPopupPageMessages(errorMsg);
                                }

                                modal.destroy();
                            }
                        };

                        if (req.url && req.method) {

                            ajax.request(req, res);
                        }
                        else {

                            selectionPopupPageMessages(errorMsg);

                            modal.destroy();

                            journal.log({ type: 'error', owner: 'UI', module: 'emp', func: 'specialSelectionPopup => sendID' }, 'Failed to generate second request from sendID session (selection) popup table.');
                        }
                    };

                    // Function used for auto select
                    settings.autoSingleSelectFunc = function _auto_single_select_func_send_id(data) {

                        var req = {};
                        var res = {};

                        // We know the stucture is valid from the rendercheck so just get the references
                        var formAttributes = data.result[0].body.contents[0].attributes;
                        var tableRef = false;

                        for (var i = 0, len = data.result[0].body.contents[0].contents.length; i < len; i++) {

                            if (data.result[0].body.contents[0].contents[i].template === "table") {

                                tableRef = data.result[0].body.contents[0].contents[i];
                                break;
                            }
                        }

                        if (formAttributes && tableRef) {

                            req.url = formAttributes.action;
                            req.method = formAttributes.method;
                            req.cache = false;

                            var tableID = tableRef.attributes.id;

                            req.data = {};

                            for (var t = 0, tLen = tableRef.head.rows[0].columns.length; t < tLen; t++) {

                                req.data[tableRef.head.rows[0].columns[t].attributes['data-colmap'].split('_')[1]] = tableRef.body.rows[0].columns[t].text;
                            }

                            res.done = function (data) {

                                if (data.status === "success") {

                                    if (data.messages) {
                                        selectionPopupPageMessages(data.messages);
                                    }
                                }
                                else {

                                    res.fail(data);
                                }

                            };

                            res.fail = function (data) {

                                var errorMsg = [
                                    {
                                        "type": "error",
                                        "template": "message",
                                        "text": "Send ID request failed. Please contact the help desk to report this issue."
                                    }
                                ];

                                if (data && data.messages && data.messages.length) {

                                    data.messages.push(errorMsg[0]);

                                    selectionPopupPageMessages(data.messages);
                                }
                                else {

                                    selectionPopupPageMessages(errorMsg);
                                }
                            };

                            ajax.request(req, res);
                        }
                        else {

                            // Error out one is missing
                        }
                    };

                    // Turn auto select off and we will use preRenderCheck to control everything manually
                    settings.autoSingleSelect = true;
                    settings.removeClear = true;

                    break;

                case 'getID':

                    settings.preRenderCheck = function _pre_render_check_get_id(evt, data) {

                        var errorMsg = false;

                        if (data.messages && data.messages.length) {

                            selectionPopupPageMessages(data.messages);

                            for (var m = 0, mLen = data.messages.length; m < mLen; m++) {

                                if (data.messages[m].type === "error") {
                                    errorMsg = true;
                                }
                            }

                        }

                        if (!errorMsg && data.status === "success") {

                            if (data.result.length === 1) {

                                var formBody = data.result[0].body.contents[0];

                                if (formBody.type === "form" && formBody.contents && formBody.contents.length) {

                                    var tableRef = false;

                                    for (var i = 0, len = formBody.contents.length; i < len; i++) {

                                        if (formBody.contents[i].template === "table") {
                                            tableRef = formBody.contents[i];

                                            break;
                                        }
                                    }

                                    if (tableRef) {

                                        if (tableRef.body && tableRef.body.rows && tableRef.body.rows.length === 1) {

                                            return false;
                                        }
                                        else if (tableRef.body && tableRef.body.rows && tableRef.body.rows.length === 0) {

                                            journal.log({ type: 'error', owner: 'FW', module: 'emp', func: 'specialSelectionPopup' }, 'GetID table has zero rows inside of popup.');
                                        }
                                        else {

                                            // More than one row
                                            return true;
                                        }

                                    }

                                }
                            }

                        }

                        return undefined;
                    };

                    settings.selectFunc = function _select_func_get_id(event, modal, table, mapping) {

                        var errorMsg = [
                            {
                                "type": "error",
                                "template": "message",
                                "text": "Get ID request failed. Please contact the help desk to report this issue."
                            }
                        ];

                        var req = getIDSecondRequest("send", modal, table);
                        var res = {
                            done: function (data) {

                                if (data.status === "success") {

                                    if (data.messages) {
                                        selectionPopupPageMessages(data.messages);
                                    }

                                    _events.searchHeaderTypeChange(data.result[0].id, data.result[0].tpType);

                                    modal.destroy();
                                }
                                else {

                                    res.fail(data);
                                }

                            },
                            fail: function(data) {

                                if (data && data.messages && data.messages.length) {

                                    data.messages.push(errorMsg[0]);

                                    selectionPopupPageMessages(data.messages);
                                }
                                else {

                                    selectionPopupPageMessages(errorMsg);
                                }

                                modal.destroy();
                            }
                        };

                        if (req.url && req.method) {

                            ajax.request(req, res);
                        }
                        else {

                            selectionPopupPageMessages(errorMsg);

                            modal.destroy();

                            journal.log({type: 'error', owner: 'UI', module: 'emp', func: 'specialSelectionPopup => sendID'}, 'Failed to generate second request from sendID session (selection) popup table.');
                        }

                    };

                    settings.autoSingleSelectFunc = function _auto_single_select_func_send_id(data) {

                        // We know the stucture is valid from the rendercheck so just get the references
                        var formAttributes = data.result[0].body.contents[0].attributes;
                        var tableRef = false;

                        for (var i = 0, len = data.result[0].body.contents[0].contents.length; i < len; i++) {

                            if (data.result[0].body.contents[0].contents[i].template === "table") {

                                tableRef = data.result[0].body.contents[0].contents[i];
                                break;
                            }
                        }

                        if (tableRef) {

                            var columns = tableRef.body.rows[0].columns;

                            // Now grab the id value and the type value
                            var id = columns[0].text;
                            var type = columns[2].text;

                            // Set the new id and toogle the right view if its not in place
                            _events.searchHeaderTypeChange(columns[0].text, columns[2].text);
                        }
                    };

                    // Turn auto select off and we will use preRenderCheck to control everything manually
                    settings.autoSingleSelect = true;
                    settings.removeClear = true;

                    break;
            }

            if (!skipRequest) {
                selectionPopup(event, settings);
            }

        }
        else {

            journal.log({ type: 'error', owner: 'Developer', module: 'emp', func: 'specialSelectionPopup' }, 'Sepcial Selection Popup function was called, but the additional specialActions parameters is missing. Routing request to the original selectionPopup function.');
        }
    };

    var requestTooltip = function requestTooltip($ajaxTooltip) {

        var spinnerOpts = {
            lines: 7,      // The number of lines to draw
            length: 3,     // The length of each line
            width: 2,      // The line thickness
            radius: 3,     // The radius of the inner circle
            corners: 0.5,  // Corner roundness (0..1)
            rotate: 75,    // The rotation offset
            color: '#000', // #rgb or #rrggbb
            speed: 1,      // Rounds per second
            trail: 75,     // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: true, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 900,   // The z-index (defaults to 2000000000)
            left: '0px',
        };

        var defaultInitialTitleText = "Click to load data.";

        var loadingClass = 'emp-ajax-tooltip-loading';
        var ajaxTooltipClass = 'emp-ajax-tooltip-style';
        var ajaxErrorClass = 'emp-ajax-error';
        var ajaxURL = $ajaxTooltip.attr('data-tooltip-url');

        var retrievalMessages = {};
        retrievalMessages.seeMore = 'Click to see more.';
        retrievalMessages.noData = 'UI: Invalid data returned.';
        retrievalMessages.error = 'UI: Ajax endpoint is down.';

        //Takes a standard ajax messages object. If valid will display the message on the field.
        var showResponseMessages = function (messages) {
            var messageDisplayed = false;
            var messageType = "message";
            var messageOptions = {
                scroll: false,
                field: $ajaxTooltip,
                pageNotifier: false
            };

            for (var m = 0; m < messages.length; m++) {

                if (messages[m].text && (messages[m].text !== "" && messages[m].text !== null)) {

                    messageType = "message";

                    //Set Message Type
                    if (messages[m].type) {
                        messageType = messages[m].type;
                    }

                    //Create Message
                    empMessage.createMessage({ text: messages[m].text, type: messageType }, messageOptions);
                    messageDisplayed = true;
                }
            }
            return messageDisplayed;
        };

        if (ajaxURL !== undefined) {

            var req = {};
            req.url = ajaxURL;
            req.cache = false;

            //Add Default title to tooltip if none is set
            if ($ajaxTooltip.attr('title') === undefined) {
                $ajaxTooltip.attr('title', defaultInitialTitleText);
            }

            var $ajaxTooltipParent = $ajaxTooltip.parent();

            var ajaxRequestValue = $ajaxTooltip.text().trim();

            req.data = { 'entityId': ajaxRequestValue };

            $ajaxTooltip.on('click', function () {
                var messageOptions;

                $ajaxTooltipParent.addClass('emp-ajax-tooltip-loading');
                $ajaxTooltip.removeAttr('title');

                //Setup Spinner
                var spinner = new spin(spinnerOpts).spin();

                fastdom.mutate(function () {
                    $ajaxTooltipParent[0].appendChild(spinner.el);
                });

                var res = {

                    done: function (data) {

                        //Unbind the ajax build click event
                        $ajaxTooltip.unbind('click');

                        var $messageLoc;
                        var messages = false;
                        var messageType;

                        //Check status
                        if (data.status && data.status === "success" && data.result.length === 1) {
                            var tooltipContent = '';

                            data = data.result[0];

                            //Grab employee information
                            tooltipContent = data.body;

                            if (tooltipContent !== '') {
                                cui.load('popover', function _loadPopover() {
                                    $ajaxTooltip.popover({
                                        display: {
                                            className: ajaxTooltipClass
                                        },
                                        html: '<span>' + tooltipContent.trim() + '</span>'
                                    });
                                });

                                $ajaxTooltip.attr('title', tooltipContent.trim());
                            }
                            else {

                                //Check for any second level messages
                                if (data.messages && data.messages.length >= 1) {
                                    //Determine if messages were displayed from the reponse.
                                    if (showResponseMessages(data.messages)) {
                                        messages = true;
                                    }
                                }

                                //No messages were displayed from the ajax response so create an appropriate error message
                                if (!messages) {
                                    messageOptions = {
                                        scroll: false,
                                        field: $ajaxTooltip,
                                        pageNotifier: false
                                    };

                                    empMessage.createMessage({ text: retrievalMessages.noData, type: "error" }, messageOptions);
                                }

                                //Ajax call failed to return valid data, add ajax error class
                                $ajaxTooltip.addClass(ajaxErrorClass);
                            }
                        }
                        else {

                            // If there are any top level messages display them
                            if (data.messages && data.messages.length >= 1) {
                                //Determine if messages were displayed from the reponse.
                                if (showResponseMessages(data.messages)) {
                                    messages = true;
                                }
                            }

                            // If there are any internal messages display them
                            if (data.result) {
                                for (var i = 0; i < data.result.length; i++) {
                                    if (data.result[i].messages && data.result[i].messages.length >= 1) {
                                        if (showResponseMessages(data.result[i].messages)) {
                                            messages = true;
                                        }
                                    }
                                }
                            }

                            //No messages were displayed from the ajax response so create an appropriate error message
                            if (!messages) {
                                messageOptions = {
                                    scroll: false,
                                    field: $ajaxTooltip,
                                    pageNotifier: false
                                };

                                empMessage.createMessage({ text: retrievalMessages.error, type: "error" }, messageOptions);
                            }

                            //Ajax call failed to return valid data, add ajax error class
                            $ajaxTooltip.addClass(ajaxErrorClass);
                        }

                        fastdom.mutate(function () {
                            $ajaxTooltipParent.find('.spinner').remove();
                        });

                        //Loading complete, remove the loading class
                        $ajaxTooltipParent.removeClass('emp-ajax-tooltip-loading');
                    },

                    fail: function (data) {
                        //Unbind the ajax build click event
                        $ajaxTooltip.unbind('click');

                        messageOptions = {
                            scroll: false,
                            field: $ajaxTooltip,
                            pageNotifier: false
                        };

                        empMessage.createMessage({ text: retrievalMessages.error, type: "error" }, messageOptions);

                        $ajaxTooltip.addClass(ajaxErrorClass);

                        fastdom.mutate(function () {
                            $ajaxTooltipParent.find('.spinner').remove();
                        });

                        $ajaxTooltipParent.removeClass('emp-ajax-tooltip-loading');
                    }
                };

                ajax.request(req, res, true);
            });
        }
    };

    /**
     * Use a browser confrim message
     * @param   {string}    msg        Message that should be displayed
     * @param   {function}  yesFunc    OPTIONAL - Function to execute if the user selectes ok
     * @return  {boolean}              return true if it finishes without issue otherwise false
     */
    var confirm = function confirm(origEvt, msg, yesFuncObject) {

        function create_modal() {

            var $confirm;

            // Message
            var $message = $('<p>').text(msg);

            // Button Row
            var $yesButton = $('<button/>', {
                'type': 'button',
                'id': 'emp-confirm-yes-button',
                'class': 'emp-confirm-yes-button'
            }).text('Yes');

            var $noButton = $('<button/>', {
                'type': 'button',
                'id': 'emp-confirm-no-button',
                'class': 'cui-button-primary emp-confirm-no-button'
            })
                .text('No');

            // Create the button container and put it all together
            var $buttonContainer = $('<div/>', {
                "class": "emp-confirm-button-container"
            })
                .append($noButton)
                .append($yesButton);

            var _priv = {};

            _priv.destroyModal = function _destory_modal($modal) {

                $modal.hide();
            };

            _priv.setupModal = function _setup_modal($modal) {

                $modal.$self.find('.emp-confirm-yes-button').on('click', { modal: $modal }, _event.yes);
                $modal.$self.find('.emp-confirm-no-button').on('click', { modal: $modal }, _event.no).focus();
            };

            _priv.onHide = function _on_hide_modal($modal) {
            };

            var _event = {};

            _event.no = function _event_no(event) {

                var $modal = event.data.modal;

                _priv.destroyModal($modal);
            };

            _event.yes = function _event_yes(event) {

                var $modal = event.data.modal;

                _priv.destroyModal($modal);

                if (typeof yesFuncObject === "function") {

                    yesFuncObject();
                }
                else {

                    functionCall(origEvt, yesFuncObject);
                }
            };

            $confirm = $.modal({
                html: $message,
                footer: {
                    "html": $buttonContainer.html()
                },
                modalClass: 'emp-confirm-modal',
                onCreate: function (modal) {

                    _priv.setupModal(modal);
                },
                //onHide: _priv.onHide,
                hideDestroy: true
            });

            $confirm.show();

            // Special return function that will prevent the rest of the functionCall functions from running.
            return "stop";
        }

        // check and load modal if needed
        if (require.defined('modal')) {

            create_modal();
        }
        else{

            cui.load('modal', function _error_report_modal() {

                create_modal();
            });
        }

        return "stop";
    };

    /**
     * Validates table state and confirm user selection
     *
     */
    var tableConfirm = function table_confirm(origEvt, msg, yesFuncObject){

        var evtTargetOffsetParent = origEvt.target.offsetParent;

        var tableID = evtTargetOffsetParent.querySelector('table').getAttribute('id');

        var selectElemID = evtTargetOffsetParent.querySelector('select').getAttribute('id');

        var cuiMessage = evtTargetOffsetParent.querySelector('.' + 'cui-messages');

        var checkedIndex = emp.reference.tables[tableID].getCheckedIndex();

        if(checkedIndex){

            //remove msg
            if(cuiMessage){

                var $cuiEror = $(cuiMessage.children[0]);

                empMessage.removeMessage($cuiEror);

                cuiMessage.parentElement.removeChild(cuiMessage);
            }

            emp.confirm(origEvt, msg, yesFuncObject);

        }else{

            if(!cuiMessage){

                empMessage.createMessage({ text: 'Please select a row. [UI040]', type: "error" }, {field: selectElemID});
            }
        }

        // Special return function that will prevent the rest of the functionCall functions from running.
        return "stop";
    };

    /**
     * Validates table state and footer control action
     *
     */
    var tableState = function _table_state(evt){

        var evtTargetOffsetParent = evt.target.offsetParent;

        var selectElem = evtTargetOffsetParent.querySelector('select');

        var tableID = evtTargetOffsetParent.querySelector('table').getAttribute('id');
        var selectElemID = selectElem.getAttribute('id');

        var cuiMessage = evtTargetOffsetParent.querySelector('.' + 'cui-messages');

        var checkedIndex = emp.reference.tables[tableID].getCheckedIndex();
        var firstSelectOpt = selectElem.querySelector('option');

        if(!checkedIndex || firstSelectOpt.selected){

            //append msg
            if(!cuiMessage){

                empMessage.createMessage({ text: 'Please verify a row and a valid dropdown option is selected. [UI040]', type: "error" }, {field: selectElemID});
            }

            // Special return function that will prevent the rest of the functionCall functions from running.
            return "stop";
        }else{

            //remove msg
            if(cuiMessage){

                var $cuiEror = $(cuiMessage.children[0]);

                empMessage.removeMessage($cuiEror);

                cuiMessage.parentElement.removeChild(cuiMessage);
            }
        }
    };


    /**
     * Adds masking (automatic slashes) to a date input
     *
     * @param   {jQuery}  $input  Input element
     * @return  {Boolean}         Success/failure
     */
    var dateMask = function _dateMask($input) {

        if (typeof $input !== 'object' || !($input instanceof jQuery)) {
            journal.log({ type: 'error', module: 'emp', owner: 'UI', func: 'dateMask' }, 'Input must be a jQuery object');

            return false;
        }

        $input.on('keyup', function _dateMask_onKeyup(evt) {
            _events.dateMasking(evt, $(this));
        });

        return true;
    };

    ///////////
    // Forms //
    ///////////

    var form = {};

    _priv.childWindow = false;

    form.virtual = forms.virtual;

    /**
     * Submits a form
     *
     * @param   {Event}   evt      User event (click, etc)
     * @param   {Object}  options  Includes the form's ID and action
     *
     * @return  {boolean}          Success/failure
     */
    form.submit = function _submit(evt, options, settings) {

        journal.log({ type: 'info', owner: 'Developer', module: 'emp', submodule: 'form', func: 'submit' }, "Submit called: ", arguments);

        var frm = false;
        var validation = true;

        if (evt && evt.target) {

            if (!evt.target.hasAttribute('data-skip-blocker')) {
                clkblocker.add($(evt.target));
            }
            else {
                journal.log({ type: 'info', owner: 'Developer', module: 'emp', submodule: 'form', func: 'submit' }, "Click blocker skipped per developer as data-skip-blocker attribute on element.");
            }

        }
        else {

            clkblocker.add();
        }

        // Look over the event object and verify that it is not an event type object or a jquery event object.
        if (!(evt instanceof Event) && typeof evt !== 'object' && (typeof evt === 'object' && !evt.hasOwnProperty('target'))) {
            options = evt;
            evt = undefined;
        }

        // Extend setting wit options
        var submitSettings = $.extend({}, { id: '', action: '' }, options);

        // Identify the proper form by option id or by the buttons native form
        if (options.id && typeof options.id === 'string') {

            frm = document.getElementById(options.id);
        }
        else if (evt instanceof Event) {

            frm = evt.target.form;

            // default blocker incase the
            evt.preventDefault();
        }

        // Get the event type and use it to get a reference to what was just clicked.
        if (evt instanceof Event || evt instanceof jQuery.Event) {
            var validAttr = $(evt.target).attr('data-validation');

            if (validAttr === false || validAttr === 'false') {
                validation = false;
            }
        }

        if (frm) {

            journal.log({ type: 'info', owner: 'Developer', module: 'emp', submodule: 'form', func: 'submit' }, "Submitting form:", frm);

            if (submitSettings.action && submitSettings.action !== '') {

                frm.setAttribute('action', submitSettings.action);
            }

            if (submitSettings.preventSubmit) {

                clkblocker.remove();

                // Report that the action still completed.
                return true;
            }
            else {

                // Check to see if the form can be validated
                if (validation) {

                    journal.log({ type: 'info', owner: 'UI', module: 'emp', submodule: 'form', func: 'submit' }, "Running validation on form.");

                    // validate the form
                    var formValidation = validate.form(frm);

                    //console.log(formValidation);

                    // If the results passed, allow the form to submit.
                    if (formValidation) {

                        if (!_disableForms) {

                            _priv.printFormContents($(frm));

                            journal.log({ type: 'info', owner: 'UI', module: 'emp', submodule: 'form', func: 'submit' }, "Form Submittion Executing!");

                            frm.submit();

                            return true;
                        }
                        else {
                            journal.log({ type: 'info', owner: 'UI', module: 'emp', submodule: 'form', func: 'submit' }, "Form Submittion blocked by developer, form:", options.id);

                            _priv.printFormContents($(frm));

                            clkblocker.remove();

                            return true;
                        }
                    }
                    else {

                        clkblocker.remove();

                        return true;
                    }
                }
                else {

                    journal.log({ type: 'info', owner: 'UI', module: 'emp', submodule: 'form', func: 'submit' }, "Validation skipped!");

                    if (!_disableForms) {

                        _priv.printFormContents($(frm));

                        journal.log({ type: 'info', owner: 'UI', module: 'emp', submodule: 'form', func: 'submit' }, "Form Submittion Executing!");

                        frm.submit();

                        return true;
                    }
                    else {
                        journal.log({ type: 'info', owner: 'UI', module: 'emp', submodule: 'form', func: 'submit' }, "Form Submittion blocked by developer, form settings:", options.id);

                        _priv.printFormContents($(frm));

                        clkblocker.remove();

                        return true;
                    }
                }

            }

        }
        else {
            // Log the error and quit
            if (submitSettings.id !== '') {
                journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'form', func: 'submit' }, 'No form with ID "', submitSettings.id, '"');
            }
            else if (evt instanceof Event) {
                journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'form', func: 'submit' }, 'Unable to find form related to "#', evt.target.id, '" from element ', evt.target);
            }
            else {
                journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'form', func: 'submit' }, 'Unable to find form ', submitSettings);
            }

            return false;
        }
    };

    var showChild = function _show_child() {

        if (_priv.childWindow) {

            _priv.childWindow.focus();
        }
    };

    // Gets form names and values and submits them via POST to a new window
    //
    // Description:
    //
    // Functionality:
    //  - Breaks down the action into an action and parameters and their values
    //  - Submits the new form via POST into a new popup window
    //  - Updates the values of parameters in the action with new values specified in the sourceForm
    //  - Applies values to parameters that are mapped elsewhere in the sourceForm, denoted by curly braces
    //    Example:     action -> A=1&B=2&C=3
    //                 params -> A=5&C={D}&D=7
    //        Result: A is updated to 5, B is left at 2,
    //                C becomes 7 because it is mapped to D's value, and
    //                D itself is not added to the targetForm because it does not exist in the action initially
    //
    form.externalSubmit = function _externalSubmit(options) {
        var i;
        var temp = [];
        var form = document.createElement('form'); // The form to be submitted
        var defaults = {
            src: '',         // Pre-existing `<form>` element (or the `name` attribute of a form) which will provide the new values
            params: '',      // References to fields in the action which should be updated with values in the `src` form
            dest: '',        // `name` attribute of new `<form>` to which all values are submitted
            action: '',      // URL to be split into form fields and values, as well as the `dest` form's action
            returnURL: false // Whether to return the new URL instead of creating a form and submitting it
        };
        var settings = $.extend({}, defaults, options);

        // Remove braces from a string
        var removeBraces = function removeBraces(s) {
            return s.replace(/\{/, '')
                .replace(/\}/, '');
        };

        // Split a string into the parameters and values and return one of them
        //
        // The string is split on ampersands, followed by equals signs. The 'side'
        // argument dictates whether to return an array of the values on the 'left'
        // or 'right' side of the equals sign.
        //
        var splitContents = function splitContents(stringToSplit, side) {
            var contents = [];
            var theSide = [];
            var i;
            var temp;

            if (stringToSplit) {
                contents = stringToSplit.split('&');

                if (side === 'left') {
                    side = 0;
                }
                else if (side === 'right') {
                    side = 1;
                }

                for (i = 0; i < contents.length; i++) {
                    temp = contents[i].split('=');
                    theSide[i] = temp[side];
                }

                return theSide;
            }
            else {
                return 0;
            }
        };

        // Get parameters or values from a form element
        var getFormData = function getFormData(theForm, mapping) {
            // Get the data from the form
            for (var i = 0; i < theForm.elements.length; i++) {
                if (theForm.elements[i].name === mapping) {
                    if (theForm.elements[i].value) {
                        return theForm.elements[i].value;
                    }
                    else {
                        return '';
                    }
                }
            }
        };

        // Opens a new window and submits the final form
        var openInNewWindow = function openInNewWindow(form) {
            // Create a name for a window so we can target it
            var winName = 'NewWindow_' + getCookie('JSESSIONID').replace(/\W/g, 'a');

            // Open a blank window
            window.open('', winName, 'scrollbars=yes,menubar=yes,resizable=yes,toolbar=no,width=900,height=700');

            // Set the target to the blank window
            form.target = winName;

            // Submit
            form.submit();
        };

        var actn;              // the target form's 'action' value (a URL)
        var urlParamList = []; // stores the parameters only, from the URL, to be passed to the final form
        var urlValueList = []; // stores the values only, from the URL, to be passed to the final form

        // Checks to see if settings.returnURL was sent as a parameter or not (no method overloading in JavaScript - so optional param used)
        if (!settings.returnURL) {
            settings.returnURL = false;
        }

        // Check arguments
        if ((!settings.dest && !settings.returnURL) || !settings.action) {
            journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'form', func: 'externalSubmit' }, 'Missing required arguments');

            return;
        }

        // Check for the source `<form>`
        var srcForm;

        if (typeof settings.src === 'string') {
            srcForm = document.forms[settings.src];
        }
        else {
            srcForm = settings.src;
        }

        if (kind(srcForm) !== 'element') {
            journal.log({ type: 'error', owner: 'UI', module: 'emp', submodule: 'form', func: 'externalSubmit' }, 'Source form not provided');

            return false;
        }

        //
        // Get base URL for form's action
        //

        // Set the action to everything before the question mark
        if (settings.action.substr(0, settings.action.indexOf('?') - 1)) {
            actn = settings.action.substr(0, settings.action.indexOf('?'));
        }
        else if (settings.action) {
            actn = settings.action;
        }

        // Get parameters

        // targetUrl (get everything after the equals sign)
        temp = settings.action.split('?');

        // Parameters and values are present in the URL
        if (temp[1]) {
            urlParamList = temp[1];
            urlValueList = temp[1];
            urlParamList = splitContents(urlParamList, 'left');
            urlValueList = splitContents(urlValueList, 'right');
        }
        // No parameters, so just open the URL as-is without creating or submitting a form
        else if (!settings.params || !settings.params.length) {
            window.open(settings.action, 'window_name_' + getCookie('JSESSIONID').replace(/\W/g, 'a'));

            return;
        }

        // Check to see if the settings.action contained any braced values
        // If so, replaced it with an empty string
        for (i = 0; i < urlValueList.length; i++) {
            if (urlValueList[i].match(/\{/) && urlValueList[i].match(/\}/)) {
                urlValueList[i] = '';
            }
        }

        // Update targetUrl values based on sourceMappingParameters
        //    Check for references to targetUrl parameters in the
        //    sourceMappingParameters. When a reference is found,
        //    update the value that was assigned to the parameter by
        //    the targetUrl.
        //

        // Check that the form was actually found and mappings are defined
        if (settings.params && srcForm) {
            // Create arrays of params/values
            var srcParamList = settings.params;
            var srcValueList = settings.params;
            srcParamList = splitContents(settings.params, 'left');
            srcValueList = splitContents(settings.params, 'right');

            // Find and update values
            for (i = 0; i < srcValueList.length; i++) {
                // If it's just a constant value (no braces)
                if (!(/\{/.test(srcValueList[i]) && /\}/.test(srcValueList[i]))) {
                    // Check that the parameter was in the targetUrl
                    if (urlParamList.indexOf(srcParamList[i]) > -1) {
                        urlValueList[urlParamList.indexOf(srcParamList[i])] = srcValueList[i];
                    }
                    // Otherwise, add it to the list
                    else {
                        urlParamList[urlParamList.length] = srcParamList[i];
                        urlValueList[urlValueList.length] = srcValueList[i];
                    }
                }
                // If it's a mapped value (in braces)
                else if (/\{/.test(srcValueList[i]) && /\}/.test(srcValueList[i])) {
                    // Get the value from the sourceForm, if a value exists, and apply it to the parameter in targetUrl
                    if (getFormData(srcForm, removeBraces(srcValueList[i]))) {
                        urlValueList[urlParamList.indexOf(srcParamList[i])] = getFormData(srcForm, removeBraces(srcValueList[i]));
                    }
                    // If the parameter has no value, assign an empty string
                    else {
                        urlValueList[urlParamList.indexOf(srcParamList[i])] = '';
                    }
                }
            }
        }

        if (settings.returnURL) {
            // Create URL
            //  - Use previously gathered parameters and values
            //  - Returns built URL

            //parameters variable
            var queryString = '?';

            //create <input>s and set attributes
            for (i = 0; i < urlParamList.length; i++) {
                queryString += urlParamList[i] + '=' + urlValueList[i] + '&';
            }

            // Get rid of last empty parameter concatenator
            if (queryString.charAt(queryString.length - 1) === '&') {
                queryString = queryString.substr(0, queryString.length - 1);
            }

            // Return URL with parameters
            return (actn + queryString);
        }
        else {
            // Create form:
            //  - Use previously gathered parameters and values
            //  - One line of HTML for each set of data
            //  - POST method

            var input;

            // Reset and empty the form object
            while (form.hasChildNodes()) {
                form.removeChild(form.firstChild);
            }

            // Set up the form
            form.setAttribute('name', settings.dest);
            form.setAttribute('method', 'post');
            form.setAttribute('target', 'newwindow');
            form.setAttribute('action', actn);

            // Create <input>s and set attributes
            for (i = 0; i < urlParamList.length; i++) {
                input = document.createElement('input');
                input.setAttribute('name', urlParamList[i]);
                input.setAttribute('value', urlValueList[i]);
                input.setAttribute('type', 'hidden');
                form.appendChild(input);
                input = null;
            }

            // Append the form to the document
            document.body.appendChild(form);

            // Open the submitted form in a new window
            openInNewWindow(form);
        }
    };

    var link = {};

    link.newWindow = function _link_new_window(evt) {

        var $link = $(evt.target);

        if (!$link.hasClass('emp-header-preferences')) {
            clkblocker.add($link);
        }


        var dest = false;

        if (arguments.length > 1 && typeof arguments[1] === "object" && arguments[1].url) {

            dest = arguments[1].url;

        }
        else {

            var href = $link.attr('href');

            if (href.length) {
                dest = href;
            }

        }

        if (dest) {

            openWindow(dest);
        }

        if (!$link.hasClass('emp-header-preferences')) {
            clkblocker.remove();
        }

        return true;
    };

    var validate = {};

    validate.field = function _validateField(field) {
        var results = validation.field(field);

        _priv.processValidation(results);

        if (results.result) {
            return true;
        }
        else {
            return false;
        }
    };

    validate.form = function _validateForm(form, skipProc) {

        var results = validation.form(form);

        if (!skipProc) {
            _priv.processValidation(results);
        }

        if (results.endResult) {
            return true;
        }
        else {
            return false;
        }
    };

    // cui load passthrough
    var load = function _load() {

        cui.load.apply(cui, arguments);
    };

    // Utility function for test pages
    var getProperty = function (name) {

        switch (name) {

            case '_disableForms':

                return _disableForms;

            case '_disableAjax':

                return _disableAjax;

            default:

                return null;
        }
    };

    var disable = {};

    disable.form = function _disable_form(bool) {

        if (typeof bool === 'boolean') {
            _disableForms = bool;

            forms.setDisable(bool);
        }
        // Check for string equivalent
        else if (typeof bool === 'string') {

            if (bool === "true") {

                bool = true;
            }

            if (bool === "false") {

                bool = false;
            }

            _disableForms = bool;

            forms.setDisable(bool);
        }

        if (bool) {

            journal.log({ type: 'info', owner: 'Developer', module: 'emp', submodule: 'disable', func: 'form' }, 'Forms submits disabled by the developer.');
        }
        else {

            journal.log({ type: 'info', owner: 'Developer', module: 'emp', submodule: 'disable', func: 'form' }, 'Forms submits enabled by the developer.');
        }

        return true;
    };

    disable.ajax = function _disable_ajax(bool) {

        if (typeof bool === 'boolean') {
            _disableAjax = bool;

        }
        // Check for string equivalent
        else if (typeof bool === 'string') {

            if (bool === "true") {

                bool = true;
            }

            if (bool === "false") {

                bool = false;
            }

            _disableAjax = bool;

        }

        if (_disableAjax) {

            journal.log({ type: 'info', owner: 'Developer', module: 'emp', submodule: 'disable', func: 'ajax' }, 'Ajax submits disabled by the developer.');
        }
        else {

            journal.log({ type: 'info', owner: 'Developer', module: 'emp', submodule: 'disable', func: 'ajax' }, 'Ajax submits enabled by the developer.');
        }

        return true;
    };

    var tracker = {};

    var getPreformance = function _get_preformance(name) {

        if (!tracker[name]) {

            tracker[name] = {
                start: performance.now(),
                end: false
            };
        }
        else {

            tracker[name].end = performance.now();

        }

        if (tracker[name].start && tracker[name].end) {
            console.log("Preformance Tracker for", name, tracker[name].end - tracker[name].start, " in milliseconds.");

            delete tracker[name];
        }

    };

    //flush localStorage -tabsetPrefs
    var flushLocalStorage = function(str, customObj){
        var lStorage = store;

        if(lStorage){
            //remove localStorage tabsetprefs
            lStorage.remove(str);
        }
        //set custom tabsetPrefs to localStages
        lStorage.set('tabsetPrefs', customObj);
    };

    ////////////////
    // Public API //
    ////////////////

    return {
        ajax: {
            request: ajax.request,
            requestData: ajax.requestData,
            requestSection: ajax.requestSection
        },
        ajaxSection: ajaxSection,
        clickblocker: clkblocker,
        confirm: confirm,
        tableConfirm: tableConfirm,
        tableState: tableState,
        dateMask: dateMask,

        // External flag
        external: externalEmpire,
        fw: fw,

        // Exposing for table filters till we can write date.js component
        dateMasking: _events.dateMasking,
        dropdown: dyncDD.dropdown,
        download: download,
        ds: ds,
        load: load,
        functionCall: functionCall,
        referenceCall: referenceCall,

        // Testing item
        getPreformance: getPreformance,
        flushLocalStorage: flushLocalStorage,

        init: init,
        reference: reference,
        selectionPopup: selectionPopup,
        specialSelectionPopup: specialSelectionPopup,
        overridePrivate: overridePrivate,
        openWindow: openWindow,
        //processMap: processMap,
        processMap: processM.directMap,
        form: {
            externalSubmit: form.externalSubmit,
            submit: form.submit,
            virtual: form.virtual,
        },
        disable: {
            ajax: disable.ajax,
            form: disable.form
        },
        validate: {
            form: validate.form,
            field: validate.field
        },

        link: link,

        windows: windowsM,

        showChild: showChild,
        getCookie: getCookie,
        getProperty: getProperty,

        uiPopup: uiPopup,

        defaultErrorMessage: "Our system can't display these contents at this time.",

        pageScripts: pageScripts,
        sectionSetup: sectionSetup,

        isPage: ((protocol) ? true : false),
        isFile: ((!protocol) ? true : false),

        // Cached elements
        $body: $body,
        $window: $window,

        // Expose modules through `emp`
        cui: cui,
        render: render,

        //Message Plugin exposed for testing pages
        empMessage: empMessage,
        store: store,

        //manualInit: manualInit
    };
});
