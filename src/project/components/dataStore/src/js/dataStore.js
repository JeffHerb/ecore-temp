define(['guid'], function (guid) {
    var store = {};
    var templateStore = {};

    var createStore = function (data, id) {

        // Check to see if the create store was passed with a pre-selected ID.
        if (id !== undefined) {
            // Check to see if the id is in use
            if (store.hasOwnProperty(id)) {
                // The id was already in use, do we will still generate one
                id = guid();

                while (store.hasOwnProperty(id)) {
                    id = guid();
                }
            }
        }
        else {
            // The id was already in use, do we will still generate one
            id = guid();

            while (store.hasOwnProperty(id)) {
                id = guid();
            }
        }

        // Store the data
        store[id] = data;

        var template = data.template;

        if (typeof template === "string") {

            if (!templateStore[template]) {

                templateStore[template] = [];
            }

            templateStore[template].push(id);
        }

        return id;
    };

    var deleteStore = function (id) {
        if (store.id) {

            var template = store.id.template;

            if (typeof template === "string") {

                var index = templateStore[template].indexof(id);

                if (index !== -1) {
                    templateStore[template].splice(index, 1);
                }
            }

            delete store[id];

            return true;
        }
        else {
            return false;
        }
    };

    var getStore = function (id) {
        if (store.hasOwnProperty(id)) {
            return store[id];
        }
        else {

            return false;
        }
    };

    /**
     * Check whether a particular store exists
     * @param   {String}   id  The key to be looked up
     * @return  {Boolean}      Whether the key has been defined in the data store
     */
    var hasStore = function (id) {
        return store.hasOwnProperty(id);
    };

    var updateStore = function (id, data) {

        // Hook to prevent error when id is not provided.
        if (id !== undefined) {

            if (store.hasOwnProperty(id)) {
                store[id] = data;
            }
            else {
                console.error('Data store update failed for: "', id, '". Data store does not exist');
            }

            return store[id];
        }

        return false;
    };

    var getStoreType = function (template) {

        if (templateStore[template]) {

            return templateStore[template];
        }

        return false;
    };

    var returnStore = function () {
        return store;
    };

    // Expose public functions
    return {
        createStore: createStore,
        deleteStore: deleteStore,
        getStore: getStore,
        getStoreType: getStoreType,
        hasStore: hasStore,
        returnStore: returnStore,
        updateStore: updateStore,
    };
});
