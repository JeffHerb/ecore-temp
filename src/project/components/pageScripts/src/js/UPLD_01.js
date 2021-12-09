define([], function () {

    /*DEBUG: START*/
    console.log('Page script initalized');
    /*DEBUG: END*/

    //After page renders
    var init = function _init() {
        /*DEBUG: START*/
        console.log('init');
        /*DEBUG: END*/

        var button = document.querySelector('.cui-button-primary');
        /*DEBUG: START*/
        console.log(button);
        /*DEBUG: END*/

        /* jshint ignore:start */
        // debugger;
        /* jshint ignore:end */

    };

    var preRender = function _pre_render(cb){
        /*DEBUG: START*/
        console.log('preRender');
        /*DEBUG: END*/



        if (typeof cb === "function") {    
            cb();
        } 
    }

    return {
        preRender: preRender,
        init: init
    };

});

