// jshint ignore: start
define(['render'], function(render) {


    var ecManageGroupComp = function _ec_manage_group_component(oConfig, oData, dTargat) {

        var dActualComponent = null;
        var dEditControl = null;
        var dAddEmailButton = null;
        var dAddEmailInput = null;
        var dAddPhoneButton = null;
        var dAddPhoneInput = null;
        var dEmailPillList = null;
        var dPhonePillList = null;
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

        _priv.newPill = function _create_new_pill(sValue, bEmail) {

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

            if (bEmail) {
                dNewButton.addEventListener('click', _events.removeEmailPill);
            }
            else {
                dNewButton.addEventListener('click', _events.removePhonePill);
            }

            dNewPillWrapper.appendChild(dNewPillTextWrapper);
            dNewPillWrapper.appendChild(dNewButton);

            dNewPill.appendChild(dNewPillWrapper);

            return dNewPill;
        }

        _priv.generateShell = function(oConfig, oData, dTarget, cb) {

            let oRenderTemplate = {
                "template": "ec-manage-group-component",
                "sTitle": oConfig.sTitle,
                "aEmails": [],
                "aEmailAvaliable": [],
                "aPhones": [],
                "aPhoneAvaliable": []
            }

            if (oData.oSubscriptions[oConfig.sSubId]) {

                if (oData.oSubscriptions[oConfig.sSubId].email) {

                    // Loop through all the phones and match the appropriate bucket
                    for (var e = 0, eLen = oData.aEmailItems.length; e < eLen; e++) {

                        if (oData.oSubscriptions[oConfig.sSubId].email.indexOf(oData.aEmailItems[e].id) !== -1) {

                            oRenderTemplate.aEmails.push(oData.aEmailItems[e]);
                        }
                        else {

                            oRenderTemplate.aEmailAvaliable.push(oData.aEmailItems[e]);
                        }

                    }

                }
                else {

                    oRenderTemplate.aEmailAvaliable = [].concat(oData.aEmailItems);
                }

                if (oData.oSubscriptions[oConfig.sSubId].phone) {

                    // Loop through all the phones and match the appropriate bucket
                    for (var p = 0, pLen = oData.aPhoneItems.length; p < pLen; p++) {

                        if (oData.oSubscriptions[oConfig.sSubId].phone.indexOf(oData.aPhoneItems[p].id) !== -1) {

                            oRenderTemplate.aPhones.push(oData.aPhoneItems[p]);
                        }
                        else {

                            oRenderTemplate.aPhoneAvaliable.push(oData.aPhoneItems[p]);
                        }

                    }

                }
                else {

                    oRenderTemplate.aPhoneAvaliable = [].concat(oData.aPhoneItems);
                }

            }
            else {

                oRenderTemplate.aEmailAvaliable = [].concat(oData.aEmailItems);
                oRenderTemplate.aPhoneAvaliable = [].concat(oData.aPhoneItems);

            }

            while(dTargat.firstElementChild) {
                dTargat.removeChild(dTargat.firstElementChild);
            }

            render.section(dTarget, oRenderTemplate, 'append', function() {

                var dShortContainer = dTargat.querySelector('.ec-short-instructions');

                if (oConfig.adShortInstructions.children) {

                    while (oConfig.adShortInstructions.firstElementChild) {

                        dShortContainer.appendChild(oConfig.adShortInstructions.firstElementChild.cloneNode(true));
                        oConfig.adShortInstructions.removeChild(oConfig.adShortInstructions.firstElementChild);
                    }

                }

                var dLongContainer = dTarget.querySelector('.ec-long-instructions');

                if (oConfig.adLongInstructions.children) {

                    while (oConfig.adLongInstructions.firstElementChild) {

                        dLongContainer.appendChild(oConfig.adLongInstructions.firstElementChild.cloneNode(true));
                        oConfig.adLongInstructions.removeChild(oConfig.adLongInstructions.firstElementChild);
                    }

                }

                dTarget.classList.remove('cui-hide-from-screen');

                dActualComponent = dTargat.firstElementChild;

                // Collapse/Expand
                dEditControl = dActualComponent.querySelector('.ec-manage-edit-control');
                dEditControl.addEventListener('click', _events.clickEditLink);

                dAddEmailInput = dActualComponent.querySelector('.add-email-input');
                dAddEmailButton = dActualComponent.querySelector('.add-email-button');
                dEmailPillList = dActualComponent.querySelector('.email-subscriptions');

                dAddEmailButton.addEventListener('click', _events.clickAddEmailButton);

                var adPills = dActualComponent.querySelectorAll('.email-subscriptions .ec-pill button');

                for (var p = 0, pLen = adPills.length; p < pLen; p++) {
                    adPills[p].addEventListener('click', _events.removeEmailPill);
                }


                dAddPhoneInput = dActualComponent.querySelector('.add-phone-input');
                dAddPhoneButton = dActualComponent.querySelector('.add-phone-button');
                dPhonePillList = dActualComponent.querySelector('.phone-subscriptions');

                dAddPhoneButton.addEventListener('click', _events.clickAddPhoneButton);

                adPills = dActualComponent.querySelectorAll('.phone-subscriptions .ec-pill button');

                for (var p = 0, pLen = adPills.length; p < pLen; p++) {
                    adPills[p].addEventListener('click', _events.removePhonePill);
                }

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

        _events.clickAddEmailButton = function _click_add_email_button(evt) {

            sValue = dAddEmailInput.value;

            if (sValue && sValue.length) {

                oSettings = {
                    fCancel: function() {
                        console.log("Do nothing!");
                    },
                    fConfirm: function() {

                        var dNewPill = _priv.newPill(sValue)

                        dEmailPillList.appendChild(dNewPill);

                        dAddEmailInput.value = "";

                        if (dEmailPillList.children.length > 1) {
                            dEmailPillList.firstElementChild.classList.add('cui-hide-from-screen');
                        }

                    }
                }

                var sEmailModal = "You are about to add a new email subscription. You should receive a welcome email shortly.";

                if (require.s.contexts._.defined['modal2']) {

                    var modal2 = require.s.contexts._.defined['modal2'];

                    var dModalContents = document.createElement('p');
                    dModalContents.appendChild(document.createTextNode(sEmailModal));

                    new modal2(evt.target, oSettings, dModalContents);

                }
                else {

                    emp.load('modal2', function(modal2) {

                        var dModalContents = document.createElement('p');
                        dModalContents.appendChild(document.createTextNode(sEmailModal));

                        new modal2(evt.target, oSettings, dModalContents);

                    })

                }

            }

        };

        _events.clickAddPhoneButton = function _click_add_phone_button(evt) {

            sValue = dAddPhoneInput.value;

            if (sValue && sValue.length) {

                oSettings = {
                    fCancel: function() {
                        console.log("Do nothing!");
                    },
                    fConfirm: function() {

                        var dNewPill = _priv.newPill(sValue)

                        dPhonePillList.appendChild(dNewPill);

                        dAddPhoneInput.value = "";

                        if (dPhonePillList.children.length > 1) {
                            dPhonePillList.firstElementChild.classList.add('cui-hide-from-screen');
                        }

                    }
                }

                var sPhoneModal = "By adding this phone subscription you agree to receive SMS reminders sent to this phone number " + dAddPhoneInput.value + ". Data rates and fees may apply. A confirmation will be sent after subscription is added.";

                if (require.s.contexts._.defined['modal2']) {

                    var modal2 = require.s.contexts._.defined['modal2'];

                    var dModalContents = document.createElement('p');
                    dModalContents.appendChild(document.createTextNode(sPhoneModal));

                    new modal2(evt.target, oSettings, dModalContents);

                }
                else {

                    emp.load('modal2', function(modal2) {

                        var dModalContents = document.createElement('p');
                        dModalContents.appendChild(document.createTextNode(sPhoneModal));

                        new modal2(evt.target, oSettings, dModalContents);

                    })

                }

            }

        };

        _events.removeEmailPill = function _click_remove_email_pill(evt) {

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

                        dEmailPillList.removeChild(dRemoveLIElem);

                        if (dEmailPillList.children.length === 1) {
                            dEmailPillList.firstElementChild.classList.remove('cui-hide-from-screen');
                        }
                    }
                }

                var sRemoveMessage = "Are you sure you want to discontunue your subscription with: " + sPillText + "?";

                if (require.s.contexts._.defined['modal2']) {

                    var modal2 = require.s.contexts._.defined['modal2'];

                    var dModalContents = document.createElement('p');
                    dModalContents.appendChild(document.createTextNode(sRemoveMessage));

                    new modal2(evt.target, oSettings, dModalContents);

                }
                else {

                    emp.load('modal2', function(modal2) {

                        var dModalContents = document.createElement('p');
                        dModalContents.appendChild(document.createTextNode(sRemoveMessage));

                        new modal2(evt.target, oSettings, dModalContents);

                    })

                }

            }

        };

        _events.removePhonePill = function _click_remove_phone_pill(evt) {

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

                        dEmailPillList.removeChild(dRemoveLIElem);

                        if (dEmailPillList.children.length === 1) {
                            dEmailPillList.firstElementChild.classList.remove('cui-hide-from-screen');
                        }
                    }
                }

                var sRemoveMessage = "Are you sure you want to discontunue your subscription with: " + sPillText + "?";

                if (require.s.contexts._.defined['modal2']) {

                    var modal2 = require.s.contexts._.defined['modal2'];

                    var dModalContents = document.createElement('p');
                    dModalContents.appendChild(document.createTextNode(sRemoveMessage));

                    new modal2(evt.target, oSettings, dModalContents);

                }
                else {

                    emp.load('modal2', function(modal2) {

                        var dModalContents = document.createElement('p');
                        dModalContents.appendChild(document.createTextNode(sRemoveMessage));

                        new modal2(evt.target, oSettings, dModalContents);

                    })

                }

            }

        };

        _priv.generateShell(oConfig, oData, dTargat);


        return dActualComponent;

    }

    var init = function init(oData, fCB) {

        var adSubscriptions = document.querySelectorAll('#subscriptions .ec-sub-component-source');

        for (var s = 0, sLen = adSubscriptions.length; s < sLen; s++) {

            var sSubId = adSubscriptions[s].getAttribute('id');

            var dShortSection = adSubscriptions[s].querySelector(".ec-short-section");
            var dLongSection = adSubscriptions[s].querySelector(".ec-long-section");

            if (dShortSection && dLongSection) {

                var oConfig = {
                    sTitle: dLongSection.querySelector('header .emp-section-title h3').textContent,
                    adLongInstructions: dLongSection.querySelector('.emp-section-instructions').cloneNode(true),
                    adShortInstructions: dShortSection.querySelector('.emp-section-instructions').cloneNode(true),
                    sSubId: sSubId
                }

                new ecManageGroupComp(oConfig, oData, adSubscriptions[s]);
            }

        }

    };

    return {
        init: init
    };

});
