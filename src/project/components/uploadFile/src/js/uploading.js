define(['jquery', 'render'], function($, render) {

    var _priv = {};

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
                                            "id": "cancelUpload",
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
                    hideDestroy: false,
                    buildInvisible: true,
                    autoOpen: true,
                    progressBar: true,
                    onCreate: function(modal) {
                        
                    }

            });

        });
    };

    //post file
    _priv.xhrUploadFile = function _fetch_upload_file(uploadUrl, file){

        var req = {
            method: "POST",
            url: uploadUrl,
            data: file
        };

        //create new xhr object
        var xhr = new XMLHttpRequest();
        var okStatus = false;

        //open request
        xhr.open(req.method, req.url);
        //xhr.setRequestHeader('Content-Type', 'multipart/form-data');
        
        //check status

        console.log(xhr.statusText);
        if(xhr.upload){
            console.log('dsfdsfds');
        }else{console.log('------');}

        xhr.upload.addEventListener('progress', function(evt){

            console.log(xhr.status);
        
            setTimeout(function(){
                _priv.calculateProgressPercentage(evt);
            }, 500);
        });

        //send request
        xhr.send(req.data);
    };

    _priv.calculateProgressPercentage = function _calculate_progress_percentage(progressEvt){

        if(progressEvt.lengthComputable){
            
            var progressPercentage = (progressEvt.loaded / progressEvt.total * 100).toFixed();

            //update modal
            var modalElem = document.querySelector('.cui-modal'),
                progressBarFillElem= modalElem.querySelector('.cui-modal-progress-bar-fill'),
                progressBarPercentageElem = progressBarFillElem.querySelector('.cui-modal-progress-bar-percentage');

                progressBarFillElem.style.width = progressPercentage + '%';
                progressBarPercentageElem.textContent = progressPercentage + '%';

            console.log(progressPercentage);
        }
    };

    var setup = function _init(evt, args){

        if(args && args.url && args.url !==''){

            // Check to see if the require module
            if (require.defined('modal')) {
                _priv.createProgressBarModal();
            }
            else {

                // Load the require module and then create the modal
                cui.load('modal', function _progress_bar_modal() {
                    _priv.createProgressBarModal()
                });
            }

            //var empFileUploadName = document.querySelector('form');

            var fData = new FormData();
            fData.append('file', document.querySelector('form input').files[0]);

            //console.log(fData.get('file'));
            _priv.xhrUploadFile(args.url, fData);
        }
    };

    return{
        setup: setup
    };
});