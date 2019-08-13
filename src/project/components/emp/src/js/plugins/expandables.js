/*jshint loopfunc: true */
define([], function () {

    var _priv = {};

    _priv.expandRegion = function _expand_region(regionElem, expand) {

        if (expand) {

            // Check region to see if its already open or not
            if (regionElem.classList.contains('emp-collapse')) {

                regionElem.classList.remove('emp-collapse');
            }

        }
        else {

            // Check region to see if its already open or not
            if (!regionElem.classList.contains('emp-collapse')) {

                regionElem.classList.add('emp-collapse');
            }

        }

    };

    _priv.setExpandState = function _set_expand_state(controlElem, state) {

        controlElem.setAttribute('aria-expanded', state);

    };

    _priv.setupRegion = function _setup_regions(ariaControls) {


        // Now that we know all the expandable sections we need to add a targetting class
        for (var ac = 0, acLen = ariaControls.length; ac < acLen; ac++) {

            var expandRegion = document.querySelector('#' + ariaControls[ac]);

            if (expandRegion) {

                if (!expandRegion.classList.contains('emp-expandable-region')) {

                    expandRegion.classList.add('emp-expandable-region');
                }
            }
            else {

                journal.log({ type: 'error', owner: 'DEV', module: 'emp', submodule: 'expandables', func: '_priv.setupRegion' }, 'Expandable region with id: ' + ariaControls[ac] + ' does not exist on this page.');
            }

        }

    };

    var setup = function _expandable_setup() {

        var expandableControls = document.querySelectorAll('.emp-expandable-control');

        // Loop through
        for (var ec = 0, ecLen = expandableControls.length; ec < ecLen; ec++){

            var eControl = expandableControls[ec];

            switch (eControl.nodeName) {

                case "INPUT":

                    // Filter out radio lists as they only allow for a single
                    if (eControl.getAttribute('type') === "radio") {

                        //console.log(eControl);

                        var radioName = eControl.getAttribute('name').trim();

                        var allAriaControls = [];

                        // Get all radio groups with this name
                        var radios = document.querySelectorAll('input[name="' + radioName + '"]');

                        // Loop through all radios to collect the needed aria-controls
                        for (var r = 0, rLen = radios.length; r < rLen; r++) {

                            var radio = radios[r];

                            var ariaControls = radio.getAttribute('aria-controls');

                            if (ariaControls) {

                                ariaControls = ariaControls.split(' ');

                                allAriaControls = allAriaControls.concat(ariaControls);

                            }

                        }

                        var ariaBreakdown = {};

                        // Loop through agaim, this time identifying the controlling breakdown
                        for (var r2 = 0, r2Len = radios.length; r2 < r2Len; r2++) {

                            var radio2 = radios[r2];

                            var radioValue = radio2.value;

                            var ariaControls2 = radio2.getAttribute('aria-controls');

                            if (ariaControls2) {

                                ariaControls2 = ariaControls2.split(' ');

                                var ariaCollapse = [];
                                var ariaExpand = [];

                                for (var a = 0, aLen = allAriaControls.length; a < aLen; a++) {

                                    if (allAriaControls.indexOf(ariaControls2[a]) !== -1) {
                                        ariaExpand.push(ariaControls2[a]);
                                    }
                                    else {
                                        ariaCollapse.push(ariaControls2[a]);
                                    }
                                }

                                ariaBreakdown[radioValue] = {
                                    expand: ariaExpand.slice(0),
                                    collapse: ariaCollapse.slice(0),
                                    radio: radio2
                                };

                            }
                            else {

                                ariaBreakdown[radioValue] = {
                                    expand: [],
                                    collapse: allAriaControls.slice(0),
                                    radio: radio2
                                };
                            }

                        }

                        var radioFieldSet = radios[0].parentNode;

                        while(radioFieldSet.nodeName !== "FIELDSET") {

                            if (radioFieldSet.nodeName === "body") {
                                break;
                            }

                            radioFieldSet = radioFieldSet.parentNode;
                        }

                        _priv.setupRegion(allAriaControls);

                        // Bind even to root fieldset
                        radioFieldSet.addEventListener('change', function(ariaBreakdown, evt) {

                            var radio = evt.target;
                            var radioValue = radio.value;

                            if (ariaBreakdown[radioValue]) {

                                // Get the active radios expands for reference
                                var activeRadio = ariaBreakdown[radioValue];

                                // Loop through all collapse first
                                for (var c = 0, cLen = activeRadio.collapse.length; c < cLen; c++) {

                                    var collapseSection = document.querySelector('#' + activeRadio.collapse[c]);

                                    if (!collapseSection.classList.contains('emp-collapse')) {
                                        collapseSection.classList.add('emp-collapse');
                                    }
                                }

                                // Loop through and expand all items that need to be
                                for (var e = 0, eLen = activeRadio.expand.length; e < eLen; e++) {

                                    var expandSection = document.querySelector('#' + activeRadio.expand[e]);

                                    if (expandSection.classList.contains('emp-collapse')) {
                                        expandSection.classList.remove('emp-collapse');
                                    }

                                }

                                //Update aria-expanded values for all items in ariaBreakdown
                                var ariaKeys = Object.keys(ariaBreakdown);
		                        for(var i = 0; i < ariaKeys.length; i++){
		                        	if(ariaKeys[i] == radioValue){
		                        		ariaBreakdown[ariaKeys[i]].radio.setAttribute("aria-expanded", "true");
		                        	}
		                        	else{
										ariaBreakdown[ariaKeys[i]].radio.setAttribute("aria-expanded", "false");
		                        	}
		                        }

								//Send custom event that section has been expanded
								var event = document.createEvent('Event');
								event.initEvent('expandableChange', true, true);
								radio.dispatchEvent(event);
                            }

                    	//}.bind(null, JSON.parse(JSON.stringify(ariaBreakdown))), false);
                    	}.bind(null, ariaBreakdown), false);

                    }
                    else {

                        checkboxAriaControls = eControl.getAttribute('aria-controls');

                        if (checkboxAriaControls) {
                            checkboxAriaControls = checkboxAriaControls.split(' ');

                            _priv.setupRegion(checkboxAriaControls);
                        }

                        eControl.addEventListener('change', function(evt) {

                            var check = evt.target;
                            var checkedState = evt.target.checked;
                            var ariaControls = (check.hasAttribute('aria-controls')) ? check.getAttribute('aria-controls').split(' ') : false;

                            var checkExpands = [];

                            if (ariaControls && ariaControls.length) {

                                for(var containerID = 0; containerID < ariaControls.length; containerID++){

                                    var containerElem = document.getElementById(ariaControls[containerID]);

                                    if (containerElem) {

                                        checkExpands.push(containerElem);
                                    }
                                }

                                if (checkedState) {
                                    _priv.setExpandState(check, true);
                                }
                                else {
                                    _priv.setExpandState(check, false);
                                }

                                if (checkExpands.length) {
                                    for (var ce = 0, ceLen = checkExpands.length; ce < ceLen; ce++) {

                                        if (checkedState) {

                                            _priv.expandRegion(checkExpands[ce], true);
                                        }
                                        else {

                                            _priv.expandRegion(checkExpands[ce], false);
                                        }

                                    }
                                }

                            }

                        });

                    }

                    break;

                case "SELECT":

                    // Pull the expandableRegionId from the select control
                    var selectAriaControls = eControl.getAttribute('aria-controls');

                    if (selectAriaControls) {
                        selectAriaControls = selectAriaControls.split(' ');

                        _priv.setupRegion(selectAriaControls);
                    }

                    eControl.addEventListener('change', function (evt) {

                        var selectElem = evt.target;
                        var selectElemValue = evt.target.value;
                        var selectOptionElems = selectElem.querySelectorAll('option');

                        var regionToExpand = [];
                        var regionToClose = [];

                        for (var o = 0, oLen = selectOptionElems.length; o < oLen; o++) {

                            var option = selectOptionElems[o];
                            var optionValue = selectOptionElems[o].getAttribute('value');

                            // Check to see if this option controls a section
                            if (option.hasAttribute('data-expands')) {

                                var optionExpandTargets = false;

                                if (option.dataset) {
                                    optionExpandTargets = option.dataset.expands.split(' ');
                                }
                                else {
                                    optionExpandTargets = option.getAttribute('data-expands').split(' ');
                                }

                                for(var containerID = 0; containerID < optionExpandTargets.length; containerID++){

                                    var containerElem = document.getElementById(optionExpandTargets[containerID]);

                                    if (containerElem) {

                                        // Check to see if this option is the option we are currently looking at
                                        if (selectElemValue === optionValue) {

                                            regionToExpand.push(containerElem);
                                        }
                                        else {

                                            regionToClose.push(containerElem);
                                        }
                                    }
                                }

                            }

                        }

                        if (regionToExpand.length) {
                            _priv.setExpandState(selectElem, true);
                        }
                        else {
                            _priv.setExpandState(selectElem, false);
                        }

                        // Collapse any sections that need to be hidden
                        if (regionToClose.length) {
                            for (var rtc = 0, rtcLen = regionToClose.length; rtc < rtcLen; rtc++) {

                                _priv.expandRegion(regionToClose[rtc], false);

                            }
                        }

                        // Expand any sections that need to be hidden
                        if (regionToExpand.length) {
                            for (var rte = 0, rteLen = regionToExpand.length; rte < rteLen; rte++) {

                                _priv.expandRegion(regionToExpand[rte], true);

                            }
                        }

                    });

                    break;

            }

        }

    };

    return {
        setup: setup
    };

});
