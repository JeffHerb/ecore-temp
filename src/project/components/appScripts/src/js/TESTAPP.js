define([], function () {

    // Prerender Hook to allow the table to have additional column limits
    var preRenderHook = function (data) {

        console.log("Prerender called!");
    };

    return {
        preRenderHook: preRenderHook
    };
});
