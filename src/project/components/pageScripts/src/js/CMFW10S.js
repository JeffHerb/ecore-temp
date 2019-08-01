define([], function() {

    // Prerender Hook to allow the table to have additional column limits
    var preRenderHook = function(data) {

        if (data.template === "table") {

            console.log(data);

            data.limit = 100;
        }

        return data;
    };

    return {
        preRenderHook: preRenderHook
    };
});
