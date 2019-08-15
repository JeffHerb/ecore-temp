define(['jquery', 'cui', 'kind', 'render'], function ($, cui, kind, render) {

    //Functionality.
    /*
    Field Messages:
        - Add field message
        - Remove field message
        - supress page message

    Page Messages:
        - Display message(determine filed/page);
        - Add page message
        - remove page message

    Message reference store:
        - Add message to store
        - Remove message from store and update page/field messages accordingly
        - Check if message exists

    Field Message Page Notifier:
        - Determine When to display based on field level messages and options (pageNotifier)

    Suppress field error page notifier with in fwData:
        "screen":{
            "suppressPageNotifier":true
        },
    */

    var CLASSES = {
        iconControl: 'emp-icon-hide-icon',
        textControl: 'emp-no-icon-hide-text',
        pageNotifier: 'cui-field-error-notifier',
        hideFromScreen: 'cui-hide-from-screen'
    };

    var ARIA_DESCRIPTIONS = {
        warning:"Warning message:",
        success:"Success message:",
        error:"Error message:",
        informational:"Informational message:",
        info:"Informational message:",
        default:"Message:"
    };

    var _priv = {};
    var _defaults = {
        options : {
            pageNotifier: true, //Only applies to field level messages
            field: false, //jquery field object or id. Determines if message is field or page level message
            msgLocation: false,
            scroll: true //Scroll to top of page when page message or notifier is displayed
        }
    };

    //Page level suppression flag.
    var suppressPageNotifier = false;

    //Check if page suppression is enabled.
    if (window.fwData && fwData.context && fwData.context.screen && fwData.context.screen.suppressPageNotifier && fwData.context.screen.suppressPageNotifier === true){
        suppressPageNotifier = true;
    }

    _priv.$pageBody = $("html,body");

    /*
    Public Functions
    */

    //Returns message object
    var createMessage = function _createMessage(msgObj, options){
        var $messageLoc;
        var $fieldParent;
        var newMsg;
        var $newMsg;
        var $message;

        options = _priv.extendOptions(options);

        //Determine wether to call page or field message.
        if(options.field && typeof options.field[0] === 'object'){
            $message = _priv.createFieldMessage(msgObj, options);
        }
        else if(options.field && typeof options.field === 'object'){
            $message = _priv.createFieldMessage(msgObj, options);
        }
        else if(options.field && typeof options.field === 'string'){
            if(options.field.indexOf('#')>0){
                options.field = $(options.field);
            }
            else{
                options.field = $('#'+options.field);
            }

            $message = _priv.createFieldMessage(msgObj, options);
        }
        else{

            $message = _priv.createPageMessage(msgObj, options);
        }

        return $message;
    };

    var removeMessage = function _removeMessage($msg, options){

        options = _priv.extendOptions(options);

        //Remove message from emp.references object.
        if (emp.reference.message && emp.reference.message.length) {

            for (var i = 0, len = emp.reference.message.length; i < len; i++) {

                if (emp.reference.message[i].ref && emp.reference.message[i].ref.is($msg)) {

                    emp.reference.message.splice(i, 1);

                    break;
                }
            }
        }

        var location = options.msgLocation;

        // If the location is not specified look for it.
        if (!location) {

            var $pageMessage = [];
            var $fieldMessage = [];

            if($('ul.cui-messages.emp-messages')){
                $pageMessage = $msg.parents('ul.cui-messages.emp-messages').eq(0);
            }
            if($('.cui-messages.cui-field-message')){
                $fieldMessage = $msg.parents('.cui-messages.cui-field-message').eq(0);
            }

            if ($pageMessage.length === 1) {

                // Remove message
                $msg.remove();

                if ($pageMessage.children().length === 0) {
                    $pageMessage.addClass('cui-hidden');
                }
            }
            else if($fieldMessage.length === 1) {

                $fieldWrapper = $fieldMessage.parents('.emp-field').eq(0);

                // Remove message
                $msg.remove();

                if ($fieldMessage.children().length === 0) {

                    $fieldMessage.addClass('cui-hidden');
                    $fieldWrapper.removeClass('cui-in-error');
                }

                _priv.updatePageNotifier(options);
            }
            else{
                // Remove message
                // $msg.remove();
            }
        }
        else if(typeof location === 'object'){
            $msg.remove();

            if (location.children().length === 0) {
                    location.addClass('cui-hidden');
            }

            _priv.updatePageNotifier(options);
        }
        else {

        }
    };

    var scrollToMessage = function _scrollToMessage($messageLoc){
        var scrollPage = false;

        if($messageLoc === undefined){
            $pageMessages = $('#body-wrapper').find('ul.cui-messages.emp-messages').eq(0);

            if(!$pageMessages.hasClass('cui-hidden') && $pageMessages.children().length >= 1){
                $messageLoc = $pageMessages;
            }
        }

        if (emp.reference.message && emp.reference.message.length) {
            for (var j = 0, leng = emp.reference.message.length; j < leng; j++) {

                if(emp.reference.message[j].options.field){
                    if (emp.reference.message[j].options.pageNotifier && emp.reference.message[j].options.pageNotifier !== false) {
                        scrollPage = true;
                    }
                }
                else{
                    scrollPage = true;
                }

            }
        }

        if(scrollPage && $messageLoc !== undefined){
            if(!_priv.$pageBody.is(':animated')){
                _priv.$pageBody.animate({scrollTop: 0}, 800);
            }
        }
    };

    /*
    Private Functions
    */
    _priv.extendOptions = function _extendOptions(options){
        // Extend options object with defaults
        if (options === undefined) {
            options = $.extend(true, {}, _defaults.options);
        }
        else{
            options = $.extend(true, {}, _defaults.options, options);
        }

        return options;
    };

     _priv.getAriaDescriptionElementFromType = function _getAriaDescriptionElementFromType (type) {
        var ariaDescription;
        var $desriptionElement;

        switch(type) {
            case 'success':
                ariaDescription = ARIA_DESCRIPTIONS.success;
            break;

            case 'error':
                ariaDescription = ARIA_DESCRIPTIONS.error;
            break;

            case 'warning':
                ariaDescription = ARIA_DESCRIPTIONS.warning;
            break;

            case 'informational':
                ariaDescription = ARIA_DESCRIPTIONS.informational;
            break;

            case 'info':
                ariaDescription = ARIA_DESCRIPTIONS.info;
            break;

            default:
                ariaDescription = ARIA_DESCRIPTIONS.default;
            break;
        }


        $descriptionElement = $('<span/>', {
                            'class':CLASSES.hideFromScreen,
                            'text': ariaDescription,
                        });

        return $descriptionElement;
    };


    _priv.createPageMessage = function _createPageMessage(msgObj, options){

        options = _priv.extendOptions(options);
        var $messageLoc;
        var messageType;

        if(options.msgLocation && options.msgLocation !== false){
            $messageLoc = options.msgLocation;
        }
        else{
            $messageLoc = $('#body-wrapper').find('ul.cui-messages.emp-messages').eq(0);
        }

        // Figure out if we need to build the messages or if we can use append them
        if (kind(msgObj) === 'object') {

            var baseTemplate = {
                template: 'message',
                list: [],
            };

            baseTemplate.list.push({
                type: msgObj.type,
                text: msgObj.text
            });

            messageType = msgObj.type;

            render.section(null, baseTemplate, 'return', function (html) {

                if (html) {
                    // Get all of the li's out of the message response
                    newMsg = $(html).find('li');
                }
                else {
                    journal.log({type: 'error', owner: 'UI', module: 'emp', submodule: '', func: 'pageMessage'}, 'Failed to build message');
                }
            });

        }
        else {
            journal.log({type: 'error', owner: 'UI', module: 'emp', submodule: '', func: 'pageMessage'}, 'Unsupported page message call: ', kind(msgObj));
        }

        if (newMsg !== undefined) {

            //Get aria description element
            var $ariaDescriptionElement = _priv.getAriaDescriptionElementFromType(messageType);

            //Add aria text
            newMsg.prepend($ariaDescriptionElement);

            // Append the messages
            $messageLoc.append(newMsg);

            // Display the message section if its marked as hidden
            if ($messageLoc.hasClass('cui-hidden')) {
                $messageLoc.removeClass('cui-hidden');
            }

            if (options.scroll) {
                if(!_priv.$pageBody.is(':animated')){
                    _priv.$pageBody.animate({scrollTop: 0}, 800);
                }
            }

            if (!emp.reference.message) {
                emp.reference.message = [];
            }

            emp.reference.message.push({
                ref: $(newMsg),
                options: options
            });

            return $(newMsg);
        }
    };

    _priv.createFieldMessage = function _createFieldMessage(msgObj, options){
        options = _priv.extendOptions(options);

        var $messageLoc;
        var messageType;
        var newMsg;
        var $newMsg;
        var fieldMessage;
        var $field = options.field;
        var $fieldParent = $field.parent();
        var $filedWrapper = $field.parents('.emp-field').eq(0);

        if($field instanceof jQuery){

            if(options.msgLocation && options.msgLocation !== false){
                $messageLoc = options.msgLocation;
            }
            else{

                if($field[0].nodeName === 'TABLE') {
                    $fieldParent = $field.parents('.emp-table').eq(0);
                }

                if($fieldParent.find('.cui-messages')[0]){
                    $messageLoc = $($fieldParent.find('.cui-messages')[0]);
                }
                
                if($fieldParent.parents('.emp-composite').eq(0)){

                    $compositeWrapper = $fieldParent.parents('.emp-composite').eq(0);

                    $messageLoc = $('<div/>', {
                                    'class': 'cui-messages'
                                }).wrap('</div>', {
                                    'class': 'emp-composite-message'
                                });

                    $compositeWrapper.append($messageLoc);
                }
                else{

                    $messageLoc = $('<ul/>', {
                                    'class': 'cui-hidden cui-messages cui-field-message'
                                });
                    $fieldParent.prepend($messageLoc);
                }
            }
            //Determine to suppress page message
            if($field.data('page-notifier') !== undefined && $field.data('page-notifier') === false){
                options.pageNotifier = false;
            }

            // Figure out if we need to build the messages or if we can use append them
            if (kind(msgObj) === 'object') {

                var baseTemplate = {
                    template: 'message',
                    list: [],
                };

                baseTemplate.list.push({
                    type: msgObj.type,
                    text: msgObj.text
                });

                messageType = msgObj.type;

                render.section(null, baseTemplate, 'return', function (html) {

                    if (html) {
                        // Get all of the li's out of the message response
                        newMsg = $(html).find('li');
                    }
                    else {
                        journal.log({type: 'error', owner: 'UI', module: 'emp', submodule: '', func: 'fieldMessage'}, 'Failed to build message');
                    }
                });

            }
            else {
                journal.log({type: 'error', owner: 'UI', module: 'emp', submodule: '', func: 'fieldMessage'}, 'Unsupported page message call: ', kind(msgObj));
            }

            if (newMsg !== undefined) {

                $filedWrapper.addClass('cui-in-error');

                //Get aria description element
                var $ariaDescriptionElement = _priv.getAriaDescriptionElementFromType(messageType);

                //Add aria text
                newMsg.prepend($ariaDescriptionElement);

                // Appen the messages
                $messageLoc.append(newMsg);

                // Display the message section if its marked as hidden
                if ($messageLoc.hasClass('cui-hidden')) {
                    $messageLoc.removeClass('cui-hidden');
                }

                if (!emp.reference.message) {
                    emp.reference.message = [];
                }

                emp.reference.message.push({
                    ref: $(newMsg),
                    options: options
                });

                if(options.pageNotifier && !suppressPageNotifier){
                    _priv.setPageNotifier(options);
                }

                return $(newMsg);
            }
        }
    };

    //Adds page notifier if it does not exist, set to visible.
    _priv.setPageNotifier = function _setPageNotifier(options){

        //identify form with validation issue
        var fieldLoc = "below";
        var fieldFormContainer = options.field[0].form;

        if(fieldFormContainer && fieldFormContainer.id === 'form_search'){

            fieldLoc = "search box";
        }

        var $messageLoc = $('#body-wrapper').find('ul.cui-messages.emp-messages').eq(0);
        var fieldPageNotifierClass = "cui-field-error-notifier";
        var fieldPageNotifierMessage = "UI: There are one or more errors on this page. Please see " + fieldLoc + ".";

        if($messageLoc.find('.cui-field-error-notifier').eq(0).length === 0){
            $message = $('<li/>', {
                    'class':'cui-error '+ fieldPageNotifierClass,
                    'html': fieldPageNotifierMessage
            });

            //remove success msg - if error found
            var $messageLocChildren = $messageLoc.children();

            $messageLocChildren.each(function(){
                var $message = $(this);

                if($message.hasClass('cui-success')){

                    $message.addClass('cui-hidden');

                    journal.log({ type: 'info', owner: 'UI', module: 'emp', submodule: 'message' }, "Success message found - set to hidden!");

                }else{

                    journal.log({ type: 'info', owner: 'UI', module: 'emp', submodule: 'message' }, "success message class not found");
                }
            });

            // Appen the messages
            $messageLoc.append($message);

            // Display the message section if its marked as hidden
            if ($messageLoc.hasClass('cui-hidden')) {
                $messageLoc.removeClass('cui-hidden');
            }
        }

        if(!_priv.$pageBody.is(':animated') && options.scroll){
            _priv.$pageBody.animate({scrollTop: 0}, 800);
        }
    };

    //Determines if page notifier should be displayed
    _priv.updatePageNotifier = function _updatePageNotifier(){
        var $messageLoc = $('#body-wrapper').find('ul.cui-messages.emp-messages').eq(0);
        var $notifier = $messageLoc.find('.'+CLASSES.pageNotifier).eq(0);

        var displayNotifier = false;

        if (emp.reference.message && emp.reference.message.length) {
            for (var i = 0, len = emp.reference.message.length; i < len; i++) {
                if (emp.reference.message[i].options.pageNotifier) {
                    displayNotifier = true;
                }
            }
        }

        if($notifier !== undefined && !displayNotifier){
            $notifier.remove();
            if($messageLoc.children().length <= 0){
                $messageLoc.addClass('cui-hidden');
            }
        }
    };

    return {
        createMessage: createMessage,
        removeMessage: removeMessage,
        scrollToMessage: scrollToMessage,
        notifier: _priv.updatePageNotifier
    };

});
