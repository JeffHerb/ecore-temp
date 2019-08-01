define([], function() {

    var findDeltaIndex = function _find_delta_index(delta, index) {

        var iDeltaLenCounter = 0;
        var iPreviousLineCount = 0;

        for (var iDo = 0, doLen = delta.ops.length; iDo < doLen; iDo++) {

            var iCurrentDeltalLength = delta.ops[iDo].insert.length;

            iPreviousLineCount = iDeltaLenCounter;
            iDeltaLenCounter += iCurrentDeltalLength;

            if (iDeltaLenCounter < index) {

                continue;
            }
            else {

                return {
                    iDeltaIndex: iDo,
                    iQuillCurPos: index,
                    iCursorPos: index - iPreviousLineCount
                };

            }

        }

        return false;

    };

    var updateEditor = function _update_editor(oEditor, sVariable, dEditor) {

        var oEditorDelta = oEditor.editor.delta;

        var oCurrentCursorPos = oEditor.getSelection();

        // Check the focus index incase getSelection was lost.
        if (!oCurrentCursorPos) {
            var iAttrLastCursor = dEditor.getAttribute('data-editor-last-cursor');

            if (iAttrLastCursor) {

                oCurrentCursorPos = {
                    index: iAttrLastCursor
                }
            }
        }

        if (oCurrentCursorPos) {

            // Find right deltaIndex
            var oDeltaConfig = findDeltaIndex(oEditorDelta, oCurrentCursorPos.index);

            oEditorDelta.ops[oDeltaConfig.iDeltaIndex].insert =
                oEditorDelta.ops[oDeltaConfig.iDeltaIndex].insert.slice(0, oDeltaConfig.iCursorPos) +
                sVariable +
                oEditorDelta.ops[oDeltaConfig.iDeltaIndex].insert.slice(oDeltaConfig.iCursorPos);

            // Update the editor
            oEditor.setContents(oEditorDelta);

        }
        else {

            var iLastDeltaOps = oEditorDelta.ops.length - 1;

            oEditorDelta.ops[iLastDeltaOps].insert = oEditorDelta.ops[iLastDeltaOps].insert + sVariable;

            // Update the editor
            oEditor.setContents(oEditorDelta);
        }

    };

    var updateInput = function _update_input(dInput, sVariable) {

        // Get the current or last cursor position
        var iCursorPos = dInput.getAttribute('data-input-last-cursor');

        var sInputValue = dInput.value;
        var sUpdateValue;

        if (iCursorPos) {

            iCursorPos = parseInt(iCursorPos);

            sUpdateValue = sInputValue.slice(0, iCursorPos) + sVariable + sInputValue.slice(iCursorPos);

            dInput.value = sUpdateValue;
        }
        else {

            if (sInputValue.length) {

                iCursorPos = sInputValue.length;

                sUpdateValue = sInputValue.slice(0, iCursorPos) + sVariable;

                dInput.value = sUpdateValue;
            }
            else {

                dInput.value = sVariable;
            }

        }

    };

    var init = function _init() {

        if (!fwData.readOnly) {

            // Get the button that will force the variable into the input
            var dInsertButton = document.querySelector('#E_BTN_INSERT_JS_16');

            var dInsertElem = document.querySelector('#E_INSERT_IN');
            var sInsertElemValue = dInsertElem.value;

            // Select all of the normal inputs
            var dNonEditors = document.querySelectorAll('#E_TEMPLATE_DESCRIPTION, #E_EMAIL_SUBJECT, #E_MESSAGE_SUBJECT');

            // Loop through and bind the normal input with the default functions needed get the cursor position
            for (var d = 0, dLen = dNonEditors.length; d < dLen; d++) {

                var dInput = dNonEditors[d];

                // Get current cursors based on clicking the input
                dInput.addEventListener('click', function(e) {

                    var dInput = event.target;

                    var currentCursorPos = dInput.selectionStart;

                    dInput.setAttribute('data-input-last-cursor', currentCursorPos);

                });

                // Get current cursors based on keyup the input
                dInput.addEventListener('keyup', function(e) {

                    var dInput = event.target;

                    var currentCursorPos = dInput.selectionStart;

                    dInput.setAttribute('data-input-last-cursor', currentCursorPos);

                });

            }

            // Add insert button click event
            dInsertButton.addEventListener('click', function(event) {

                event.preventDefault();

                var oVariableTableColValues = emp.reference.tables['variableResultSet'].getHiddenInputValues();

                if (oVariableTableColValues['variableResultSet_variableName'] && oVariableTableColValues['variableResultSet_variableName'].length) {

                    var sTemplateVariable = '{' + oVariableTableColValues['variableResultSet_variableName'].trim() + '}';

                    var sInsertElemValue = dInsertElem.value;

                    switch (sInsertElemValue) {

                        case "02":

                            var oEditor = emp.reference.editor['E_EMAIL_BODY'].editor;

                            updateEditor(oEditor, sTemplateVariable, emp.reference.editor['E_EMAIL_BODY'].dEditor);

                            break;

                        case "01":

                            var dInput = document.querySelector('#E_EMAIL_SUBJECT');

                            updateInput(dInput, sTemplateVariable)

                            break;

                        case "04":

                            var oEditor = emp.reference.editor['E_MESSAGE_BODY'].editor;

                            updateEditor(oEditor, sTemplateVariable, emp.reference.editor['E_MESSAGE_BODY'].dEditor);

                            break;

                        case "03":

                            var dInput = document.querySelector('#E_MESSAGE_SUBJECT');

                            updateInput(dInput, sTemplateVariable)

                            break;

                        case "05":

                            var dInput = document.querySelector('#E_TEMPLATE_DESCRIPTION');

                            updateInput(dInput, sTemplateVariable)

                            break;

                    }
                }


            });

        }

    };

    return {
        init: init
    };

});
