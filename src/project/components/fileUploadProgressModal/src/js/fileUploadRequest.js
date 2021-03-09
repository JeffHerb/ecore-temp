define(['jquery', 'render'], function($, render) {

    var _priv = {};
        _priv.loadendResponse;
        _priv.progressBarModal;

    var _events = {};

    _priv.createProgressBarModal = function _create_progress_bar_modal(){

        var progressBarModalCancelBtnJSON = {
            "contents": [
                {
                    "type": "row",
                    "template": "buttonGroup",
                    "style": "upload-modal",
                    "contents": [
                        {
                            "type": "column",
                            "template": "buttonGroup",
                            "style": "align-right",
                            "width": "full",
                            "contents": [
                                {
                                    "type": "button",
                                    "template": "field",
                                    "input": {
                                        "attributes": {
                                            "id": "cancel-upload",
                                        },
                                        "text": "Cancel",
                                    },
                                    "noFieldWrap": true
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        render.section(undefined, progressBarModalCancelBtnJSON, 'return', function(htmlContents) {
    
            var progressBarModal = $.modal({
                    html: htmlContents,
                    hideDestroy: true,
                    buildInvisible: true,
                    autoOpen: true,
                    progressBar: true
                    //onCreate: function(modal){}
            });

            _priv.progressBarModal = progressBarModal;
        });
    };

    _priv.blockModalOverlayClick = function _modal_overlay_click_blocker(){
        
        setTimeout(function(){

            //click blocker Source
            var modalOverlay = document.querySelector('.cui-modal-overlay');

            if(modalOverlay !== null){

                $modalOverlay = $(modalOverlay);

                emp.clickblocker.add($modalOverlay);
            }

        }, 500);
    }; 

    _events.removeClickBlocker = function _remove_click_blocker(){

        var bodyElem = document.querySelector('body');

        bodyElem.addEventListener('click', function(evt){

            var targetElem = evt.target;

            if(targetElem.classList.contains('cui-modal-hide') || targetElem.id == 'cancel-upload'){

                if(emp.clickblocker.check()) {
                    emp.clickblocker.remove();
                }
            }

            //destroy modal
            if(targetElem.id == 'cancel-upload'){
                _priv.progressBarModal.destroy();
            }
        });
    };

    _priv.calculateProgressPercentage = function _calculate_progress_percentage(progressEvt){

        if(progressEvt.lengthComputable){
            
            var progressPercentage = (progressEvt.loaded / progressEvt.total * 100).toFixed();

            //update modal
            var modalElem = document.querySelector('.cui-modal');
            
            if(modalElem){

                var progressBarFillElem= modalElem.querySelector('.cui-modal-progress-bar-fill'),
                    progressBarPercentageElem = progressBarFillElem.querySelector('.cui-modal-progress-bar-percentage'),
                    modalActionText = modalElem.querySelector('.cui-modal-progress-bar-action-text');

                    progressBarFillElem.style.width = progressPercentage + '%';
                    progressBarPercentageElem.textContent = progressPercentage + '%';

                    //console.log(progressPercentage);

                //upload completed - update message
                if(progressPercentage == 100){

                    console.log(_priv.loadendResponse);

                    var loadendResponseJSONParse = JSON.parse(_priv.loadendResponse);

                    modalActionText.innerText = loadendResponseJSONParse.message;

                    //destroy modal
                    setTimeout(function(){

                        _priv.progressBarModal.destroy();

                        //remove click click blocker
                        if(emp.clickblocker.check()) {
                            emp.clickblocker.remove();
                        }

                    }, 500);
                }
            }
        }
    };

    _priv.handleFileUploadError = function _handle_file_upload_errr(evt, xhr){

        //wait for modal to render
        setTimeout(function(){

            //update modal
            var modalElem = document.querySelector('.cui-modal');

            if(modalElem){

                var modalActionText = modalElem.querySelector('.cui-modal-progress-bar-action-text');
                    modalActionText.innerText = 'An error has occurred.';
                    modalActionText.style.color = '#b52c2c';
            }
            
        }, 500);

        //abort the request
        xhr.abort();

        journal.log({ type: 'error', owner: 'UI', module: 'fileUploadModal', func: '_priv.handleFileUploadError' }, 'Error occured with request!');

        journal.log({ type: 'error', owner: 'UI', module: 'fileUploadModal', func: '_priv.handleFileUploadError' }, 'Request has been aborted!');
    };

    _events.abortFileUpload = function _abort_file_upload(xhr){

        setTimeout(function(){

            var modalElem = document.querySelector('.cui-modal'),
                modalCloseBtn = modalElem.querySelector('.cui-modal-hide'),
                cancelUploadBtn = modalElem.querySelector('#cancel-upload');

            if(modalCloseBtn !== null && cancelUploadBtn !== null){

                modalCloseBtn.addEventListener('click', function(){
                    xhr.abort();
                });

                cancelUploadBtn.addEventListener('click', function(){
                    xhr.abort();
                });
            }

        }, 500);
    };

    //sets up formData
    /* _priv.processForm = function _process_form(form){

        form = form[0];
    }; */

    //xhr file upload request
    _priv.xhrUploadFileRequest = function _fetch_upload_file(uploadUrl, file){

        var req = {
            method: "POST",
            url: uploadUrl,
            data: file
        };

        //create new xhr object
        var xhr = new XMLHttpRequest();
        //xhr.setRequestHeader('Content-Type', 'multipart/form-data');

        //upload progress listener
        xhr.upload.addEventListener('progress', function(evt){
            setTimeout(function(){
                _priv.calculateProgressPercentage(evt);
            }, 500);
        });

        //upload error listener - error during the upload
        xhr.upload.addEventListener('error', function(evt){
            _priv.handleFileUploadError(evt, xhr);
        });

        //check status
        xhr.addEventListener('loadend', function(evt){

            if(this.status == 200){
                _priv.loadendResponse = this.response;
            }
        });

        //prevent click outside of modal content
        _priv.blockModalOverlayClick();

        //remove click block after modal close or Cancel btn is clicked
        _events.removeClickBlocker();

        //abort upload listener
        _events.abortFileUpload(xhr);

        //setup request
        xhr.open(req.method, req.url);

        //send request
        xhr.send(req.data);
    };

    var setup = function _init(evt, args){


        //validate form
        var bodyWrapper = document.querySelector('#body-wrapper'),
            mainForm = bodyWrapper.querySelector('form');

        //needs to be converted to a jQuery obj for now
        mainForm = $(mainForm);

        var validationResult = emp.validate.form(mainForm);

        if(validationResult == true){

            if(args && args.url && args.url !==''){

                // Check to see if the require module
                if (require.defined('modal')) {
                    _priv.createProgressBarModal();
                }
                else {

                    // Load the require module and then create the modal
                    cui.load('modal', function _progress_bar_modal() {
                        _priv.createProgressBarModal();
                    });
                }

                //_priv.processForm(mainForm);

                var formData = new FormData(mainForm[0]);                

                _priv.xhrUploadFileRequest(args.url, formData);
            }
        }
    };

    return{
        setup: setup
    };
});