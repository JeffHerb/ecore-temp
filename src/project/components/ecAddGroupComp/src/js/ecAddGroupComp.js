// jshint ignore: start
define(['render'], function(render) {


    var ecAddGroupComp = function _ec_add_group_component(oConfig, aData, dTargat) {

        var dActualComponent = null;
        var dEditControl = null;
        var dAddButton = null;
        var dAddInput = null;
        var dPillList = null;
        var aData = aData;

        var _priv = {
            _this: null
        };

        _priv.stringReplace = function _sub_header_replace(sBase, sCount, sReplaceChar, bRemoveLast) {

            var sReturn = sBase.replace(sReplaceChar, sCount).trim();

            if (bRemoveLast) {
                sReturn = sReturn.slice(0, sReturn.length -1);
            }

            return sReturn;
        }

        _priv.newPill = function _create_new_pill(sValue) {

            var dNewPill = document.createElement('li');

            var dNewPillWrapper = document.createElement('span');
                dNewPillWrapper.classList.add('ec-pill');

            var dNewPillTextWrapper = document.createElement('span');
                dNewPillTextWrapper.classList.add('ec-pill-item-text');
                dNewPillTextWrapper.appendChild(document.createTextNode(sValue));

            var dNewButton = document.createElement('button');
                dNewButtonText = document.createElement('span');
                dNewButtonText.innerHTML = '&times;';

                dNewButton.appendChild(dNewButtonText);

            dNewPillWrapper.appendChild(dNewPillTextWrapper);
            dNewPillWrapper.appendChild(dNewButton);

            dNewPill.appendChild(dNewPillWrapper);

            return dNewPill;
        }

        _priv.generateShell = function(oConfig, aData, dTarget, cb) {

            let oRenderTemplate = {
                "template": "ec-add-group-component",
                "sAddLabel": _priv.stringReplace("Add $", oConfig.sNotItemName, '$', true) + ":",
                "sAddId": (oConfig.sNotItemName + "-input").toLowerCase(),
                "sTitle": oConfig.sTitle,
                "sSubTitle": _priv.stringReplace(oConfig.sSubTitle, aData.length, '$'),
                "sContentHeader": _priv.stringReplace("Current $", oConfig.sNotItemName, '$'),
                "sNoItemsText": _priv.stringReplace("No $ provided", oConfig.sNotItemName, '$'),
                "aItems": aData
            }

            render.section(dTarget, oRenderTemplate, 'append', function (html) {
                cb(dTarget.firstElementChild);
            });

        }

        var _events = {};

        _events.clickEditLink = function _click_edit_link(evt) {

            evt.preventDefault();

            if (dActualComponent.classList.contains('emp-collapse')) {

                dActualComponent.classList.remove('emp-collapse');
                evt.target.textContent = "Close";
            }
            else {

                dActualComponent.classList.add('emp-collapse');
                evt.target.textContent = "Edit";
            }

        };

        _events.removePill = function _click_remove_pill(evt) {

            var dCurrentElem = null;
            var dRemoveTarget = null;
            var dRemoveLIElem = null;
            var sPillText = null;
            var dPillList = null;
            var bContinue = false;

            dCurrentElem = evt.target;

            while (true) {

                if (dCurrentElem && dCurrentElem.nodeName === "body") {
                    break;
                }

                if (bContinue === true) {
                    break;
                }

                // Choice what we are looking for
                if (!dRemoveTarget) {

                    if (dCurrentElem.nodeName !== "BUTTON") {
                        dCurrentElem = dCurrentElem.parentNode;
                    }
                    else {
                        dRemoveTarget = dCurrentElem;

                        sPillText = dRemoveTarget.previousElementSibling.textContent.trim();
                    }

                }
                else if (!dRemoveLIElem) {

                    if (dCurrentElem.nodeName !== "LI") {
                        dCurrentElem = dCurrentElem.parentNode;
                    }
                    else {
                        dRemoveLIElem = dCurrentElem;
                    }

                }
                else if (!dPillList) {

                    if (dCurrentElem.nodeName !== "UL") {
                        dCurrentElem = dCurrentElem.parentNode;
                    }
                    else {
                        dPillList = dCurrentElem;
                        bContinue = true;
                    }

                }

            }

            if (bContinue) {

                oSettings = {
                    fCancel: function() {
                        console.log("Do nothing!");
                    },
                    fConfirm: function() {

                        dPillList.removeChild(dRemoveLIElem);
                    }
                }

                var dModalContents = null;

                // Fake out a check for the demo
                if (sPillText === "jsmith1950@gmail.com") {

                    var sRemoveMessage = "Are you sure you want to remove " + sPillText + "?";

                    dModalContents = document.createElement('p');
                    dModalContents.appendChild(document.createTextNode(sRemoveMessage));
                }
                else {

                    var dP1 = document.createElement('p');
                        dP1.appendChild(document.createTextNode("Are you sure you want to remove " + sPillText + "? This email is currently being used for the following subscriptions:"));

                    var dUl = document.createElement('ul');
                    var dLi = document.createElement('li');
                        dLi.appendChild(document.createTextNode('Installment payment agreement'));
                        dUl.appendChild(dLi);

                    dModalContents = document.createElement('div');

                    dModalContents.appendChild(dP1);
                    dModalContents.appendChild(dUl);


                }


                if (require.s.contexts._.defined['modal2']) {

                    var modal2 = require.s.contexts._.defined['modal2'];

                    new modal2(evt.target, oSettings, dModalContents);
                }
                else {

                    emp.load('modal2', function(modal2) {;

                        new modal2(evt.target, oSettings, dModalContents);

                    })

                }

                if (dPillList.children.length === 1) {
                    dPillList.firstElementChild.classList.remove('cui-hide-from-screen');
                }

            }

        };

        _events.addControl = function _click_add_control(evt) {

            var sValue = dAddInput.value;

            if (sValue && sValue.length) {

                oSettings = {
                    fCancel: function() {
                        console.log("Do nothing!");
                    },
                    fConfirm: function() {

                        var dNewPill = _priv.newPill(sValue)

                        dPillList.appendChild(dNewPill);

                        dAddInput.value = "";

                        if (dPillList.children.length > 1) {
                            dPillList.firstElementChild.classList.add('cui-hide-from-screen');
                        }

                    }
                }

                if (require.s.contexts._.defined['modal2']) {

                    var modal2 = require.s.contexts._.defined['modal2'];

                    var dModalContents = document.createElement('p');
                    dModalContents.appendChild(document.createTextNode(oConfig.sAddParagraph));

                    var dModal = new modal2(evt.target, oSettings, dModalContents);

                }
                else {

                    emp.load('modal2', function(modal2) {

                        var dModalContents = document.createElement('p');
                        dModalContents.appendChild(document.createTextNode(oConfig.sAddParagraph));

                        var dModal = new modal2(evt.target, oSettings, dModalContents);

                    })

                }

            }

        };

        // Call the render function
        _priv.generateShell(oConfig, aData, dTargat, function(dComponent) {

            dActualComponent = dComponent;

            dEditControl = dActualComponent.querySelector('.ec-add-edit-control');
            dEditControl.addEventListener('click', _events.clickEditLink);

            adPills = dActualComponent.querySelectorAll('.ec-pill button');

            for (var p = 0, pLen = adPills.length; p < pLen; p++) {
                adPills[p].addEventListener('click', _events.removePill);
            }

            dPillList = dActualComponent.querySelector('.ec-pill-list');

            dAddInput = dActualComponent.querySelector('.add-input');
            dAddButton = dActualComponent.querySelector('.add-button');
            dAddButton.addEventListener('click', _events.addControl);


        });


        return dActualComponent;

    }

    var init = function init(oConfig, aData, dTargat) {

        return new ecAddGroupComp(oConfig, aData, dTargat);

    };

    return {
        init: init
    };

});
