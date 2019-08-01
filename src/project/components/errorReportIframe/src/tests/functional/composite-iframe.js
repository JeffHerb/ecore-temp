define(function(require){
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');
    var iframeDoc;
    var isEmpty;

    registerSuite({
        name: 'composite - iframe',

        //Tests that iframe renders and exist in DOM
        'Check iframe exists': function(){
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/errorReportIframe/pages/composite-iframe.html'))
                .setFindTimeout(5000)
                .findById('E_TEST_ERROR_REPORT_IFRAME')
        },

        //check attributes;
        'Check attributes are pass to iframe': function(){
           return this.remote
                .execute(function(){
                    
                    var iframe = document.querySelector('iframe');

                    var iframeIdAttr = iframe.getAttribute('id');

                    /* for(var a = 0; a < iframe.attributes.length; a++){
                        var iframeAttr = iframe.attributes[a];

                        iframeAttrArr.push(iframeAttr, iframeAttr.value);
                    }*/

                    return{
                        iframeIdAttr: iframeIdAttr
                    }
                }).
                then(function(iframeAttrObj){
                    assert.strictEqual(iframeAttrObj.iframeIdAttr, 'E_TEST_ERROR_REPORT_IFRAME', 'The iframe id attribute value should equal "E_TEST_ERROR_REPORT_IFRAME"');
                });
        },

        //inject content into iframe
        'Inject content into iframe and make sure content loads': function(){
            return this.remote
                .execute(function(){

                    iframeDoc = document.getElementById('E_TEST_ERROR_REPORT_IFRAME').contentWindow.document;

                    //open iframe document for writing
                    iframeDoc.open();
                
                    var header = '<!DOCTYPE html> <html lang="en" class="theme-teal"><head><meta charset="utf-8"/><title>Error Reporting Popup</title><link href="../../../dist/css/main.css" rel="stylesheet" type="text/css" media="all"></head><div id="body-wrapper"></div>';
                        
                    var footer = '<script id="require" src="../../../dist/js/main.js"></script><script>require(["domReady!"], function() {console.log("iframe page is done");});</script></body></html>';
                    
                    var testErrorReportData = fwData.testErrorReportData;
                
                    if(testErrorReportData){
                        
                        testErrorReportData = '<script> var fwData = ' + JSON.stringify(testErrorReportData) + ';</script>';
                
                    }else{
                        console.log('Error data not found');
                        iframeDoc.write('Error data not found');
                    }
                    
                    //write to iframe document
                    iframeDoc.write(header + testErrorReportData + footer);
                
                    //finishes writing to iframe document-
                    iframeDoc.close();
                })
                .sleep(1000)
                .execute(function(){
                    
                    if(iframeDoc.body.childNodes[0].childNodes.length > 0){
                        isEmpty = false;
                    }else{
                        isEmpty = true;
                    }

                    return{
                        isEmpty: isEmpty
                    }
                })
                .then(function(iframeDocObj){
                    assert.strictEqual(iframeDocObj.isEmpty, false, 'The iframe body should contain child element(s)');
                });
        }

    });
});