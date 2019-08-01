define(['jquery', 'kind', 'cui', 'sortable', 'getIndex', 'shortcut', 'store'], function ($, kind, cui, Sortable, getIndex, shortcut, store) {
    ///////////////
    // Constants //
    ///////////////

    var VERSION = '0.1.1';

    var NAMESPACE = 'emp-faves';

    var CLASSES = {
            // Standard CUI and EMP classes
            hidden: 'cui-hidden',
            hideFromScreen: 'cui-hide-from-screen',
            selected: 'emp-selected',
            collapse: 'emp-collapse',
            active: 'emp-active',
            buttonPrimary: 'cui-button-primary',

            // Component-specific classes
            popover: NAMESPACE + '-popover', // Added to the standard popover element
            editMode: NAMESPACE + '-editmode',
            toggleLink: 'emp-header-preferences',

            // Global elements
            wrapper: NAMESPACE + '-wrapper',
            header: NAMESPACE + '-header',

            // List of links and folders
            linkList: NAMESPACE + '-link-list',
            tabsetLinkItem: NAMESPACE + '-link-item', // `<li>`
            tabsetLinkItemWrapper: NAMESPACE + '-link-wrapper', // Flex box wrapper, contains everything but nested list elements
            tabsetLink: NAMESPACE + '-link',
            removeButton: NAMESPACE + '-remove',
            undoButton: NAMESPACE + '-undo',
            moveButton: NAMESPACE + '-move',
            tabsetInput: NAMESPACE + '-input',
            editButton: NAMESPACE + '-button-edit',
            doneButton: NAMESPACE + '-button-done',
            addFolderButton: NAMESPACE + '-button-add-folder',
            removed: NAMESPACE + '-removed', // When the item has just been removed and can still be undone
            hasLinks: NAMESPACE + '-haslinks', // Whether or not any favorite links exist

            // Folders
            folder: NAMESPACE + '-folder',
            folderOpen: NAMESPACE + '-folder-open',
            folderHasLinks: NAMESPACE + '-folder-has-links',
            folderHeader: NAMESPACE + '-folder-header',
            folderInfoIsEmpty: NAMESPACE + '-folder-info-isempty',

            // Search
            searchWrapper: NAMESPACE + '-search',
            searchResults: NAMESPACE + '-search-results',
            searchResultTopRow: NAMESPACE + '-search-result-top-row',
            searchResultTitle: NAMESPACE + '-search-result-title',
            searchResultAddButton: NAMESPACE + '-search-result-add',
            searchResultSubtitle: NAMESPACE + '-search-result-subtitle',
            searchInputFakePlaceholder: NAMESPACE + '-search-fake-placeholder',

            // Add a tabset
            addWrapper:    NAMESPACE + '-add',
            addToggle:     NAMESPACE + '-add-toggle',
            addDialog:     NAMESPACE + '-add-dialog',
            addButton:     NAMESPACE + '-add-button',
            addUndo:       NAMESPACE + '-add-undo',
            addCancel:     NAMESPACE + '-add-cancel-button',
            hideAddToggle: NAMESPACE + '-hide-add-toggle', // Hides the link for the current tabset
            addMode:       NAMESPACE + '-addmode',
            undoMode:      NAMESPACE + '-undomode', // Undo mode, but only for the 'Add' dialog, not the list of links and folders
        };

    var IDS = {
            toggleLink: 'emp-header-favorites', // Link that the user clicks to open the favorites UI
            addName: NAMESPACE + '-add-tabset-name',
            addFolderList: NAMESPACE + '-add-tabset-folder-list',
            addFolderName: NAMESPACE + '-add-tabset-folder-name',
        };

    var TEXT_CONTENT = {
            searchResultSeparator: ' > ',
            searchInputPlaceholder: 'Search the menu and favorites',
        };

    // Default object structures:

    var DEFAULT_FAVORITES = {
            id: 'favorites',
            label: 'Favorites',
            isOpen: true,
            tabsets: [],
            timestamp: 0, // Unix timestamp (in seconds, not milliseconds)
        };

    var DEFAULT_BOOKMARK = {
            name: '',
            label: '',
            id: '',
            url: '',
            parent: '',
            seqno: -1,
        };

    var DEFAULT_FOLDER = {
            label: 'Folder',
            id: '',
            isOpen: false,
            tabsets: [],
            type: "folder",
            seqno: -1,
        };

    var SERVER_THROTTLE = 2000; // How long to wait before calling the server after receiving the last local update (in milliseconds)

    // Global variables and cached jQuery references:

    var favesPopover = null;    // Popover window
    var $popoverToggler = null; // The star icon
    var $linkList = null;       // List of bookmarks
    var $searchWrapper = null;
    var $searchInput = null;
    var $searchList = null; // Search results
    var deleteQueue = [];   // Collection of tabsets that the user has chosen to remove; they will be deleted when the user finishes editing the favorites list
    var lastAddedTabsetId = ''; // Tracks the last tabset to be added (either the current tabset or a search result) so it can be undone

    var $addWrapper = null; // Contains entire "add current tabset" area below the list
    var $addToggle = null; // Enables the "add current tabset" mode
    var $addDialog = null; // Contains the inputs exposed to the user before saving the current tabset
    var $addButton = null; // Button that actually adds the current tabset
    var $addNameDisplay = null; // `<div>` for displaying the tabset's name in the Add dialog
    var $addFolderListInput = null; // `<select>` containing the list of folders
    var $addFolderListLabel = null;
    var $addFolderNameInput = null; // `<input>` for modifying a new folder's name
    var $addFolderNameLabel = null;
    var $addUndoButton = null; // Button to undo adding the current tabset
    var $addCancelButton = null; // Button to undo adding the current tabset

    /////////////////
    // Constructor //
    /////////////////

    var Favorites = function (elem, options) {
        // Store the element upon which the component was called
        this.elem = elem;

        // Create a jQuery version of the element
        this.$self = $(elem);

        // Save off the id
        this.id = $(elem).attr('id');

        this.options = options;
    };

    //////////////////////
    // Plugin prototype //
    //////////////////////

    Favorites.prototype = {};

    ////////////////////
    // Setup and Init //
    ////////////////////

    /**
     * Initializes the plugin
     *
     * May be called multiple times
     */
    Favorites.prototype.init = function _init (faves) {
        var validated;
        var tabsetids;

        $popoverToggler = $('#' + IDS.toggleLink);

        // Fill in the favorites if none were provided
        if (!faves) {

            journal.log({type: 'info', owner: 'UI', module: 'favorites', func: 'init'}, 'Favorites were not passed in during initilzation.');

            // 1. Local storage
            faves = store.get('favorites');

            if (!faves) {

                // 2. Framework JSON
                if (fwData.context && fwData.context.favorites.data) {
                    faves = fwData.context.favorites.data;

                    journal.log({type: 'info', owner: 'UI', module: 'favorites', func: 'init'}, 'Using favorites stored in the page Global Object fwData.favorites.');
                }
                // 3. Create a new copy with default values
                else {
                    faves = $.extend(true, {}, DEFAULT_FAVORITES);

                    journal.log({type: 'warn', owner: 'UI', module: 'favorites', func: 'init'}, 'No data to found from server. Stubbing out default.');

                    faves = $.extend(true, {}, {
                        "tabsets": [],
                        "id": "favorites"
                    });
                }

                store.set('favorites', faves);
            }
            else {

                if (typeof faves !== "object") {

                    journal.log({type: 'warning', owner: 'UI', module: 'favorites', func: 'init'}, 'Favorites localStorage object is not an object, rebuilding!');

                    // 2. Framework JSON
                    if (fwData.context && fwData.context.favorites.data) {
                        faves = fwData.context.favorites.data;

                        journal.log({type: 'info', owner: 'UI', module: 'favorites', func: 'init'}, 'Using favorites stored in the page Global Object fwData.favorites.');
                    }
                    // 3. Create a new copy with default values
                    else {
                        faves = $.extend(true, {}, DEFAULT_FAVORITES);

                        journal.log({type: 'warn', owner: 'UI', module: 'favorites', func: 'init'}, 'No data to found from server. Stubbing out default.');

                        faves = $.extend(true, {}, {
                            "tabsets": [],
                            "id": "favorites"
                        });
                    }
                }
                else {

                    journal.log({type: 'info', owner: 'UI', module: 'favorites', func: 'init'}, 'Loading favorites from localStorage.');
                }

            }

            tabsetids = store.get('tabsetAccess');

            if (!tabsetids) {

                if (fwData.context.favorites.tabsetids) {

                    tabsetids = fwData.context.favorites.tabsetids;

                    journal.log({type: 'info', owner: 'UI', module: 'favorites', func: 'init'}, 'Loading tabset access from Global.');
                }
                else {

                    journal.log({type: 'warning', owner: 'UI', module: 'favorites', func: 'init'}, 'Unable to load tabset access ides from local storage or global reference.');

                }

            }
            else {

                journal.log({type: 'info', owner: 'UI', module: 'favorites', func: 'init'}, 'Loading tabset access from localStorage.');
            }

            // Set the timestamp
            if (!faves.timestamp) {
                faves.timestamp = parseInt((new Date().getTime())/1000, 10);
                store.set('favorites', faves);
            }

        }
        else {

            journal.log({type: 'info', owner: 'UI', module: 'favorites', func: 'init'}, 'Loading favorites from inital options');
        }

        var onFavorite = checkFavoriteTabset(faves);

        // Check for the tabsetids object.
        if (tabsetids) {

            journal.log({type: 'warning', owner: 'UI', module: 'favorites', func: 'init'}, 'Tabset ids object are present, we are now checking all favorites for those that need to be removed.');

            var currentTabset = currentTabsetCheck(faves);

            // check to see if the current tabset is in the favorites menu
            if (currentTabset) {
                $popoverToggler.addClass(CLASSES.selected);

                journal.log({type: 'info', owner: 'UI', module: 'favorites', func: 'init'}, 'Current tabset is listed as a favorite tabset!');
            }

            // Validate them
            validated = _validateFavorites(faves, undefined, tabsetids);

            // Check whether the validation process changed anything
            if (validated !== faves) {
                // Use the validated copy as our definitive version
                faves = validated;

                _updateStore(faves);
            }

        }
        else {
            journal.log({type: 'warning', owner: 'UI', module: 'favorites', func: 'init'}, 'Tabset ids list is missing. We are removing all favorites per the new design');

            faves.tabsets = [];
            tabsetids = {};
        }

        shortcut.register({
            keys: 'shift+f',
            callback: function () {
                            // Use a timer, otherwise the keystroke that invoked this shortcut will enter text into the search box
                            setTimeout(function () {
                                if (!favesPopover) {
                                    _handleToggleClick({data: {faves: faves}});
                                }
                                else {
                                    favesPopover.show();
                                }
                            }, 10);
                        },
            description: 'Display favorites and search tabsets',
            type: 'keydown',
        });


        if (!fwData.context.favorites) {
            fwData.context.favorites = {};

            fwData.context.favorites.data = faves;
            fwData.context.favorites.tabsetids = tabsetids;
        }
        else {

            if (!fwData.context.favorites.data) {
                fwData.context.favorites.data = faves;
            }

            if (!fwData.context.favorites.tabsetids) {
                fwData.context.favorites.tabsetids = tabsetids;
            }

        }

        // Wait for clicks on the toggle link before creating any UI
        $popoverToggler.on('click', {faves: faves, tabsetids: tabsetids}, _handleToggleClick);

        if (onFavorite) {
            $popoverToggler.addClass(CLASSES.selected);
        }

        this.faves = faves;
        this.tabsetids = tabsetids;

        return this;
    };

    /////////////////////////////////////
    // Favorites data store management //
    /////////////////////////////////////

    var _pendingUpdateData = null;
    var _pendingUpdateTimer = null;

    var currentTabsetCheck = function _current_tabset_check(faves, sub) {

        if (faves && faves.tabsets && faves.tabsets.length) {

            var found = false;

            (function nextFav(faves) {

                var fav = faves.shift();

                if (fav.tabsets && fav.tabsets.length) {

                    var subResult = currentTabsetCheck(fav, true);

                    if (subResult) {

                        found = true;
                    }
                }
                else {

                    if (fwData.context.tabset.id === fav.id) {
                        found = true;
                    }
                }

                if (!found && faves.length > 0) {

                    nextFav(faves);
                }
                else {

                    return found;
                }

            })(faves.tabsets.concat());

            return found;

        }
        else {

            return false;
        }

    };

    /**
     * Update the favorites data store and send it to the server after a delay
     *
     * @param   {Object}  faves  Favorites object
     *
     * @return  {Object}         Updated preferences object
     */
    var _updateStore = function _updateStore (faves) {

        var tabsetids = fwData.context.favorites.tabsetids;

        // Validate and cleanup the object
        faves = _validateFavorites(faves, undefined, fwData.context.favorites.tabsetids);

        faves.timestamp = parseInt((new Date().getTime())/1000, 10);
        journal.log({type: 'info', owner: 'UI', module: 'favorites', func: 'init'}, 'Updated data store: ', faves);

        // Update local storage in case the user leaves this page before an ajax request is made
        store.set('favorites', faves);
        store.set('tabsetAccess', tabsetids);

        // Save this data so it can be sent to the server later
        // If `_pendingUpdateData` was already set we want to replace it so only the most recent data is used
        //_pendingUpdateData = faves;

        _pendingUpdateData = {
            data: faves,
            tabsetids: tabsetids
        };

        // Reset the timer
        // We want to wait a full second after the last update to the data store
        clearTimeout(_pendingUpdateTimer);
        _pendingUpdateTimer = null;

        // Push the update in one second
        _pendingUpdateTimer = setTimeout(_pushStoreToServer, SERVER_THROTTLE);

        return _pendingUpdateData;
    };

    /**
     * Sends the updated favorites data to the server
     *
     * @return  {Boolean}  Whether an ajax request was initiated
     */
    var _pushStoreToServer = function _pushStoreToServer () {
        if (!_pendingUpdateData) {
            journal.log({type: 'warn', owner: 'UI', module: 'favorites', func: '_pushStoreToServer'}, 'No data to push to the server');

            return false;
        }

        // Push to server
        if (_pendingUpdateData /* && /\.gov$/.test(document.location.hostname) */) {
            if (fwData.context.urls && fwData.context.urls.favorites && fwData.context.urls.favorites.update) {

                journal.log({type: 'info', owner: 'UI', module: 'favorites', submodule: '_pushStoreToServer'}, 'About to send favorites update to server...');
                journal.log({type: 'info', owner: 'UI', module: 'favorites', submodule: '_pushStoreToServer', func: 'ajax'}, 'Object being sent:', _pendingUpdateData);

                $.ajax({
                    url: fwData.context.urls.favorites.update,
                    method: "POST",
                    data: {
                        data: JSON.stringify(_pendingUpdateData),
                        ts: Math.floor(new Date().getTime() / 1000),
                    },
                })
                .done(function _pushStoreToServer_ajax_done (data) {

                    if (data.status && data.status === "success") {

                        journal.log({type: 'success', owner: 'UI', module: 'favorites', submodule: '_pushStoreToServer'}, 'Favorites updated successfully!');
                    }
                    else {

                        journal.log({type: 'error', owner: 'UI', module: 'favorites', submodule: '_pushStoreToServer'}, 'Favorites failed to update on the server!', data);

                        if (data.messages && data.messages.length) {

                            if (data.messages) {

                                for (var i = 0, len = data.messages.length; i < len; i++) {

                                    if (!data.messages[i].template) {
                                        data.messages[i].template = "message";
                                    }

                                    emp.empMessage.createMessage(data.messages[i], {});
                                }
                            }

                        }
                        else {

                            emp.empMessage.createMessage({
                                "type": "error",
                                "template": "message",
                                "text": "Unable to update favorites please contact the help desk."
                            }, {});
                        }
                    }

                })
                .fail( function _pushStoreToServer_ajax_fail (data) {

                    journal.log({type: 'error', owner: 'UI', module: 'favorites', submodule: '_pushStoreToServer', func: 'ajax_fail'}, 'Favorites failed to update on the server.', data);
                });
            }
            else {
                journal.log({ type: 'error', owner: 'UI', module: 'preferences', submodule: '_pushStoreToServer' }, 'Could not initiate an ajax request because `fwData.context.urls.favorites.update` is not defined. `fwData.context.favorites` = ', fwData.context.favorites);
            }
        }
        //TODO: For testing only
        //else if (_pendingUpdateData) { console.info('UI [favorites._pushStoreToServer => ajax()]  I would have sent your updated favorites to the server just now, but you\'re not running on an actual server. ' + new Date()); }
        else { console.log('Did not update favorites on the server because there are no changes'); }

        // Clear the pending data and timer
        _pendingUpdateData = null;
        clearTimeout(_pendingUpdateTimer);
        _pendingUpdateTimer = null;

        return true;
    };

    /**
     * Validates the favorites object and fills in the meta object if necessary
     *
     * @param   {Object}  container  Folder or Favorites object
     *
     * @return  {Object}             Updated container object
     */
    var _validateFavorites = function _validateFavorites (container, parentId, tabsetids) {
        var tabsetObj;
        var counter;
        var currIndex;
        var numInvalid = 0;


        // Check whether there's anything that we need to do
        if (!container || !container.hasOwnProperty('tabsets')) {
            return container;
        }

        // Tabsets must be an array
        if (kind(container.tabsets) !== 'array') {
            journal.log({type: 'error', owner: 'UI', module: 'favorites', func: '_validateFavorites'}, 'Tabsets property is not an array ', container);

            return true;
        }

        // Top-level favorites object
        if (!parentId) {

            if (typeof container.id !== 'string' || container.id.trim().length === 0) {
                container.id = DEFAULT_FAVORITES.id;
            }

            if (typeof container.label !== 'string' || container.label.trim().length === 0) {
                container.label = DEFAULT_FAVORITES.label;
            }

            container.isOpen = DEFAULT_FAVORITES.isOpen;
        }

        // Loop through each tabset object
        if (container.tabsets.length) {
            counter = 0;
            currIndex = 0;
            while (counter < container.tabsets.length) { // We can't cache the value of `container.tabsets.length` because the length may change within this loop as bad items are removed
                // Keep track of the current index of the array
                currIndex = counter;

                // Get the tabset object we'll be inspecting
                tabsetObj = container.tabsets[currIndex];

                // Increment the counter now so that we can decrement it later if we remove an item from the array. We do it this way (rather than putting the incrementation at the end of the loop) so we can use `continue` as soon as we find a problematic item in the array and avoid doing further checks.
                counter++;

                if (!tabsetObj) {

                    // Remove the object
                    container.tabsets.splice(currIndex, 1);

                    // Skip the rest of the checks
                    counter--;
                    continue;
                }

                // It's a folder
                if (tabsetObj.hasOwnProperty('tabsets')) {

                    // Folders must contain a `tabset` array...
                    if (kind(tabsetObj.tabsets) !== 'array') {
                        journal.log({type: 'error', owner: 'UI', module: 'favorites', func: '_validateFavorites'}, 'Tabsets property is not an array: ', tabsetObj);

                        // Remove the object
                        container.tabsets.splice(currIndex, 1);
                        numInvalid++;

                        // Skip the rest of the checks
                        counter--;
                        continue;
                    }

                    // ...but all other properties are optional so we can just fill them in

                    // ID
                    if (typeof tabsetObj.id !== 'string' || tabsetObj.id.trim().length === 0) {
                        tabsetObj.id = _generateRandomString();
                    }

                    // Name
                    if (typeof tabsetObj.label !== 'string' || tabsetObj.label.trim().length === 0) {
                        tabsetObj.label = DEFAULT_FOLDER.label;
                    }

                    // Opened/closed state
                    if (typeof tabsetObj.isOpen !== 'boolean') {
                        tabsetObj.isOpen = DEFAULT_FOLDER.isOpen;
                    }

                    // The parent has to be favorites since folders cannot be nested
                    tabsetObj.parent = DEFAULT_FAVORITES.id;

                    // Sequence number
                    tabsetObj.seqno = counter;

                    // Recursively call this function to validate its tabsets
                    tabsetObj = _validateFavorites(tabsetObj, tabsetObj.id, tabsetids);
                }
                // It's a bookmark
                else {

                    // Make sure all required properties are in place (ID, label, and URL)
                    if (
                        typeof tabsetObj.id !== 'string'   || tabsetObj.id.trim().length === 0   ||
                        typeof tabsetObj.label !== 'string' || tabsetObj.label.trim().length === 0 ||
                        !tabsetids[tabsetObj.id]) {

                        // Remove the object
                        container.tabsets.splice(currIndex, 1);
                        numInvalid++;

                        if (typeof tabsetObj.label === "string") {
                            journal.log({type: 'warn', owner: 'UI', module: 'favorites', func: '_validateFavorites'}, 'Favorite removed:', tabsetObj.label, 'because the tabset did not show up in the tabsetids property.');
                        }

                        // Skip to next tabset in the loop
                        counter--;
                        continue;
                    }

                    // Parent folder
                    tabsetObj.parent = parentId ? parentId : DEFAULT_FAVORITES.id;

                    // Sequence number
                    tabsetObj.seqno = counter;

                    // Clean up properties that are not needed for favorites (i.e. used for the menu or UI)
                    delete tabsetObj.searchPrefix;
                    delete tabsetObj.isFavorite;
                    delete tabsetObj.searchPosition;
                    delete tabsetObj.searchIsAtBeginningOfWord;
                }
            } // end `while`
        } // end `if (container.tabsets.length)`

        // If the entire favorites property is now empty, remove it from the preferences
        if (container.id !== DEFAULT_FAVORITES.id && !container.tabsets.length && !parentId) {
            //TODO:
            journal.log({type: 'warn', owner: 'UI', module: 'favorites', func: '_validateFavorites'}, 'No valid tabsets were found. The tabsets property is being removed from the folder object.');
        }

        return container;
    };

    /**
     * Adds a tabset to the favorites data store and the UI
     *
     * @param  {Object}  tabset    Tabset object
     * @param  {String}  parentId  ID of the tabset's parent folder (if applicable)
     * @param  {Object}  faves     Favorites object
     *
     * @return  {Mixed}            Result of updating the preferences object
     */
    var _addTabset = function _addTabset (tabset, parentId, faves) {
        var newTabset;
        var $newTabset;

        if (!tabset.label) {
            journal.log({type: 'error', owner: 'UI', module: 'favorites', func: '_addTabset'}, 'Tabset needs a label before it can be added ', tabset);

            return false;
        }

        // Create new object that represents the selected menu item
        newTabset = {
            label: tabset.label,
            id: tabset.id,
        };

        // Fix to grab resourceId if that is provided instead of id
        if (!tabset.id && tabset.resourceId) {
            newTabset.id = tabset.resourceId;
        }

        // Add the tabset id to the list of allowed id. Dont need special logic here as menus and page access should enforce they are "allowed" here.
        if (fwData.context.favorites.tabsetids && !fwData.context.favorites.tabsetids[newTabset.id]) {
            fwData.context.favorites.tabsetids[newTabset.id] = {
                "status": "allowed",
                "url": "/empr2-amp/gateway/" + newTabset.id + ".tabset"
            };
        }

        if (parentId) {
            newTabset.parent = parentId;
        }
        else {
            newTabset.parent = DEFAULT_FAVORITES.id;
        }

        // Create a new `<li>` for that object
        $newTabset = _createLinkElement(newTabset, faves);

        // Add to the data store and update the popover:

        // Add to the top level
        if (newTabset.parent === DEFAULT_FAVORITES.id) {

            journal.log({type: 'info', owner: 'UI', module: 'favorites', func: '_addTabset'}, 'Adding tabset to root favorite container');

            faves.tabsets.push(newTabset);
            $linkList.append($newTabset);
        }
        // Add to a specific folder
        else {

            journal.log({type: 'info', owner: 'UI', module: 'favorites', func: '_addTabset'}, 'Adding tabset to favorite folder');

            faves.tabsets.forEach(function (tabset) {
                if (tabset.id === newTabset.parent) {
                    tabset.tabsets.push(newTabset);
                }
            });

            _getListItem(newTabset.parent).find('ul').append($newTabset);
        }

        favesPopover.$popover.addClass(CLASSES.hasLinks);

        lastAddedTabsetId = newTabset.id;

        // Hide or show 'add current tabset' toggle, forcefully, since we know for sure whether it has been bookmarked
        if (lastAddedTabsetId === fwData.context.tabset.id) {
            _hideOrShowAddToggle(faves, 'hide');
        }
        else {
            _hideOrShowAddToggle(faves);
        }

        return _updateStore(faves);
    };

    /**
     * Removes a tabset from the favorites data store
     *
     * Does not add it to the UI
     *
     * @param   {Object}  tabsetToRemove  Tabset object
     * @param   {Object}  faves           Favorites object
     *
     * @return  {Mixed}                   Result of updating the preferences object
     */
    var _removeTabset = function _removeTabset (tabsetToRemove, faves) {

        var folder = _getFolderById(faves, tabsetToRemove.parent);

        // Make sure we found its parent folder
        if (!folder) {
            // The folder is missing when we are deleting a child tabset after its parent has already been removed. This is acceptable because the child tabset is already deleted, so we can just quit.

            return false;
        }

        // Remove this tabset
        folder.tabsets.splice(folder.tabsets.indexOf(tabsetToRemove), 1);

        // Check if anything is left in the favorites object
        if (folder.tabsets.length === 0) {
            // Update the popover (e.g. don't show the 'Edit' button)
            favesPopover.$popover.removeClass(CLASSES.hasLinks);
        }

        // If we just removed the current tabset, then we need to re-show the Add button
        if (tabsetToRemove.id === fwData.context.tabset.id) {
            $popoverToggler.removeClass(CLASSES.selected);
        }

        _hideOrShowAddToggle(faves);

        return _updateStore(faves);
    };

    /**
     * Updates the data store when the sorting order within a list has changed
     *
     * @param   {Object}  faves     Favorites object
     * @param   {Object}  folder    Folder or tabset containing the moved item
     * @param   {Number}  oldIndex  Previous index of the item within the list
     * @param   {Number}  newIndex  New index of the item within the list
     *
     * @return  {Mixed}             Result of updating the preferences object, or `false` for incorrect parameters
     */
    var _reorderTabset = function _reorderTabset (faves, folder, oldIndex, newIndex) {
        var tabsetThatMoved = folder.tabsets[oldIndex];

        // First, remove from the array
        folder.tabsets.splice(oldIndex, 1);

        // Then, add it back in the correct position
        folder.tabsets.splice(newIndex, 0, tabsetThatMoved);

        // Update the data store
        faves = _updateTabsetStore(folder, faves);

        return _updateStore(faves);
    };

    // Contains information about a tabset that was dragged between lists
    // This is populated by `_onMoveIntoFolder()` and `_onMoveOutOfFolder()`
    var _processItem = {};

    /**
     * Process the movement of a tabset from one folder to another
     *
     * Uses data from `_processItem`
     *
     * @return  {Mixed}      Result of updating the preferences object, or `false` for incorrect parameters
     */
    var _processAddRemove = function _processAddRemove () {
        // Pull the properties we need into their own variables for easier readability
        var faves = _processItem.faves;
        var srcFolder = _processItem.srcFolder;
        var destFolder = _processItem.destFolder;
        var srcIndex = _processItem.srcIndex;
        var destIndex = _processItem.destIndex;
        var tabsetThatMoved = srcFolder.tabsets[srcIndex];
        var destFolderInitialLength = destFolder.tabsets.length;

        if (!tabsetThatMoved) {
            journal.log({type: 'error', owner: 'UI', module: 'favorites', func: '_processAddRemove'}, 'Cannot find tabset that has moved: ', _processItem);

            return;
        }

        // First, remove the tabset from the previous folder
        srcFolder.tabsets.splice(srcIndex, 1);

        // If the folder is now empty, change the class on its list element to update its icon
        if (srcFolder.tabsets.length === 0) {
            $(_processItem.removeEvent.target).closest('.' + CLASSES.folder).removeClass(CLASSES.folderHasLinks);
        }

        // Save source folder to favorites
        faves = _updateTabsetStore(srcFolder, faves);

        // Second, update the tabset's parent
        tabsetThatMoved.parent = destFolder.id;

        // Third, add the tabset to the correct position in the dest folder
        destFolder.tabsets.splice(destIndex, 0, tabsetThatMoved);

        // If the folder was empty before, now we need change the class on its list element to update its icon
        if (destFolderInitialLength === 0) {
            $(_processItem.addEvent.target).closest('.' + CLASSES.folder).addClass(CLASSES.folderHasLinks);
        }

        // Finally, update the data store
        faves = _updateTabsetStore(destFolder, faves);

        // Reset `_processItem` for the next move event
        _processItem = {};

        return _updateStore(faves);
    };

    /**
     * Updates the data store for a single tabset
     *
     * The tabset must already exist in the specified container. Unknown tabsets will not be added.
     *
     * @param   {Object}  updatedTabset  Tabset to be stored
     * @param   {Object}  container      Folder containing the tabset
     *
     * @return  {Object}                 The folder
     */
    var _updateTabsetStore = function _updateTabsetStore (updatedTabset, container) {
        var index = getIndex(container.tabsets, updatedTabset.id);

        // Container is the same as the tabset being updated
        if (container.id === updatedTabset.id) {
            // Nothing to do here, the tabset was already updated in-place by the calling function

            return container;
        }
        // The tabset was not already in this container
        else if (index === -1) {
            journal.log({type: 'error', owner: 'UI', module: 'favorites', func: '_updateTabsetStore'}, 'UI [favorites] Not updating tabset because its index is ', index);

            return container;
        }
        // The tabset does belong to this container, so everything is good
        else {
            container.tabsets[index] = updatedTabset;

            return container;
        }
    };

    /**
     * Adds a new, empty folder to the data store and UI
     *
     * @param  {Object}  faves      Favorites object
     * @param  {jQuery}  $linkList  List element that will contain the folder's UI
     */
    var _addNewFolder = function _addNewFolder (faves, folderSettings, options) {
        var newFolder;
        var $folderItem;
        var $folderItemInput;
        var $nestedList;

        // Create new object
        newFolder = $.extend(true, {}, DEFAULT_FOLDER, folderSettings);

        if (!newFolder.id) {
            newFolder.id = 'folder_' + _generateRandomString();
        }

        if (!newFolder.label) {
            newFolder.label = 'New ' + newFolder.label;
        }

        // Create a new `<li>` for the folder
        $folderItem = _createLinkElement(newFolder, faves, true);

        $folderItem.addClass(CLASSES.folder);

        // Create a nested list element
        $nestedList = _createFolderElement(newFolder, faves);

        // Add the nested list (folder contents) to the folder
        $folderItem.append($nestedList);

        // Dummy item
        $folderItem.append(
                $('<div/>')
                    .addClass(CLASSES.folderInfoIsEmpty)
                    .html('This folder is empty')
            );

        // Add to the main list
        $linkList.append($folderItem);

        favesPopover.$popover.addClass(CLASSES.hasLinks);

        // Enable 'edit' mode so the user can organize and rename the new folder
        if (typeof options === 'undefined' || !options.skipEditMode) {
            favesPopover.$popover.addClass(CLASSES.editMode);
        }

        // Set focus and select the text
        $folderItemInput = $folderItem.find('.' + CLASSES.tabsetInput);
        $folderItemInput.focus();
        $folderItemInput.get(0).select();

        // Make the folder sortable
        Sortable.create($nestedList.get(0), {
            group: NAMESPACE,

            // Draggable elements
            handle: '.' + CLASSES.moveButton,

            // Each event handler has an anonymous function wrapper so we can send the `faves` and `tabset` objects along. The `evt` is provided and customized by Sortable.

            // When the user has reordered a list (but not moved item between lists)
            onUpdate: function (faves, tabset, evt) { _onListUpdate(evt, faves, tabset); }.bind(undefined, faves, newFolder),

            // When an item is dragged into a list
            onAdd: function (faves, tabset, evt) { _onMoveIntoFolder(evt, faves, tabset); }.bind(undefined, faves, newFolder),

            // When an item is removed from a list
            onRemove: function (faves, tabset, evt) { _onMoveOutOfFolder(evt, faves, tabset); }.bind(undefined, faves, newFolder),

            onMove: _onMove,
        });

        // Add it to the data store
        faves.tabsets.push(newFolder);

        // Open this folder (which will close other folders) so that when the user adds a new tabset it will default to being placed in this folder
        _openFolder(newFolder, faves, $folderItem);

        _updateStore(faves);

        return newFolder;
    };

    /**
     * Removes a folder from the favorites data store
     *
     * Does not add it to the UI
     *
     * @param   {Object}  faves           Favorites object
     * @param   {Object}  folderToRemove  Folder object
     *
     * @return  {Mixed}                   Result of updating the preferences object
     */
    var _removeFolder = function _removeFolder (faves, folderToRemove) {
        // Remove the folder from the favorites object
        faves.tabsets.splice(faves.tabsets.indexOf(folderToRemove), 1);

        // Check if anything is left in the favorites object
        if (faves.tabsets.length === 0) {
            // Update the popover (e.g. don't show the 'Edit' button)
            favesPopover.$popover.removeClass(CLASSES.hasLinks);
        }

        return _updateStore(faves);
    };

    ////////////////////
    // User Interface //
    ////////////////////

    var checkFavoriteTabset = function _check_favorite_tabset(faves) {

        var currentTabset = fwData.context.tabset.id;

        var match = false;

        if (faves.tabsets && faves.tabsets.length) {

            var tSets = faves.tabsets.concat();

            for (var t = 0, tLen = tSets.length; t < tLen; t++ ) {

                if (tSets[t].resourceid === currentTabset) {

                    return true;
                }

                if (tSets[t] && tSets[t].tabsets && tSets[t].tabsets.length) {

                    subTabset = checkFavoriteTabset(tSets[t]);

                    if (subTabset) {

                        return true;
                    }
                }

            }

        }

        return false;

    };

    /**
     * Creates the user interface for viewing existing favorites
     *
     * @param   {Object}  faves  Favorites object
     *
     * @return  {jQuery}         Modal element
     */
    var _generateUI = function _generateUI (faves, tabsetids) {
        var $wrapper;
        var $header;
        var $addFolderButton;
        var lists = []; // Contains all the `<ul>` elements that are created

        // Link list. This will be fleshed out further down in this function, but we need to give it a basic definition now so that we can reference it in event handlers
        $linkList = $('<ul/>');

        // Outer container
        $wrapper = $('<div/>')
                        .addClass(CLASSES.wrapper);

        // Search

        // Search area wrapper
        $searchWrapper = $('<div/>');

        // Search input
        $searchInput = $('<input/>')
                            .attr('type', 'text')
                            .attr('placeholder', TEXT_CONTENT.searchInputPlaceholder)
                            .attr('tabindex', '1')
                            .addClass(CLASSES.collapse)
                            .on('keyup', {faves: faves}, _onSearchKeyup)
                            .on('keydown', _onSearchKeydown);

        // Search results
        $searchList = $('<ul/>')
                            .addClass(CLASSES.searchResults)
                            .addClass(CLASSES.collapse);

        // Append the search components to the wrapper
        $wrapper.append(
                    $searchWrapper
                        .addClass(CLASSES.searchWrapper)
                        .append($searchInput)
                        .append($searchList)
                );

        // Fix placeholder bug for IE 11 only (not Edge)
        if (/Trident/.test(navigator.userAgent)) {
            // We need a short delay so the input has time to stretch to its full width and height, otherwise we will get bad readings
            setTimeout(_handleSearchInputPlaceholder, 10);
        }

        // Favorites

        // Header
        $header = $('<div/>')
                        .addClass(CLASSES.header)
                        .append(
                            $('<h1/>')
                                .text('Favorites')
                        );

        // 'Add folder' button
        $addFolderButton = $('<div/>')
                                .addClass(CLASSES.addFolderButton)
                                .append(
                                    $('<div/>')
                                        .text('Add new folder')
                                        .attr('title', 'Add new folder')
                                        .attr('role', 'button')
                                        .attr('tabindex', '1')
                                        .on('click', {faves: faves, $linkList: $linkList}, _onAddFolderClick)
                                )
                                .appendTo($header);

        // 'Edit' button
        $header.append(
                    $('<div/>')
                        .addClass(CLASSES.editButton)
                        .append(
                            $('<div/>')
                                .text('Edit')
                                .attr('role', 'button')
                                .attr('tabindex', '1')
                                .on('click', _onEditClick)
                        )
                );

        // 'Done' button
        $header.append(
                    $('<div/>')
                        .addClass(CLASSES.doneButton)
                        .append(
                            $('<button/>')
                                .addClass(CLASSES.buttonPrimary)
                                .text('Done')
                                .attr('type', 'button')
                                .attr('tabindex', '1')
                                .on('click', {faves: faves}, _onDoneClick)
                        )
                );

        $wrapper.append($header);

        // Link list
        $linkList.addClass(CLASSES.linkList);

        lists.push({
            $list: $linkList,
            tabset: faves,
        });

        // Loop through tabsets
        faves.tabsets.forEach(function (tabset) {
            var $nestedList;
            var $folderItem;

            // Folder of links
            if (tabset.tabsets) {

                // Create an entry for the folder
                $folderItem = _createLinkElement(tabset, faves, true);

                $folderItem.addClass(CLASSES.folder);

                // Create a nested list element
                $nestedList = _createFolderElement(tabset, faves, tabsetids);

                lists.push({
                    $list: $nestedList,
                    tabset: tabset,
                });

                // Add the nested list (folder contents) to the folder
                $folderItem.append($nestedList);

                // Dummy item
                $folderItem.append(
                        $('<div/>')
                            .addClass(CLASSES.folderInfoIsEmpty)
                            .html('This folder is empty')
                    );

                // Add to the main list
                $linkList.append($folderItem);
            }
            // Simple tabset link
            else {

                // Filter out disabled tabsets
                if (tabsetids[tabset.id] && tabsetids[tabset.id].status !== "disable") {
                    $linkList.append(_createLinkElement(tabset, faves));
                }
                else {

                    journal.log({type: 'warn', owner: 'UI', module: 'favorites', func: '_generateUI'}, 'Tabset favorite: "', tabset.label, '"removed because its not marked as "allowed" in the tabsetid property of favorites');
                }
            }
        });

        $wrapper.append($linkList);

        // UI for adding the current tabset:

        // 'Add current tabset' toggle which will reveal the dialog
        $addToggle = $('<div/>')
                        .addClass(CLASSES.addToggle)
                        .text('Add "' + fwData.context.tabset.name + '"...')
                        .attr('role', 'button')
                        .attr('tabindex', '1')
                        .on('click', {faves: faves}, _onAddTabsetClick);

        // Dialog to contain all inputs
        $addDialog = $('<div/>')
                        .addClass(CLASSES.addDialog);

        // 'Cancel' button for adding current tabset
        $addCancelButton = $('<button/>')
                                .addClass(CLASSES.addCancel)
                                .text('Cancel')
                                .attr('role', 'button')
                                .attr('tabindex', '1')
                                .on('click', {faves: faves}, _onCancelAddTabsetClick);

        // 'Undo' button for adding current tabset
        $addUndoButton = $('<button/>')
                                .addClass(CLASSES.addUndo)
                                .text('Undo')
                                .attr('role', 'button')
                                .attr('tabindex', '1')
                                .on('click', {faves: faves}, _onUndoAddTabsetClick);

        // Container for the 'Add current tabset' UI
        $addWrapper = $('<div/>')
                            .addClass(CLASSES.addWrapper)
                            .append($addToggle)
                            .append($addUndoButton)
                            .append($addDialog);

        // Initialize the globally-scoped element variables that we'll populate later
        // By doing it here we can rely on each call to `_populateAddTabsetUI()` to empty those elements and refresh their content but without destroying and recreating the entire DOM each time.
        $addButton = $('<button/>');
        $addNameDisplay = $('<div/>');
        $addFolderListInput = $('<select/>');
        $addFolderListLabel = $('<label/>');
        $addFolderNameInput = $('<input/>');
        $addFolderNameLabel = $('<label/>');

        $addNameDisplay
            .attr('id', IDS.addName);

        // Build the folder picker

        $addFolderListInput
            .attr('id', IDS.addFolderList)
            .attr('tabindex', '1');

        // Folder list label
        $addFolderListLabel
            .attr('for', IDS.addFolderList)
            .html('Add to folder:');

        // Add UI for creating a new folder
        $addFolderNameInput
            .attr('id', IDS.addFolderName)
            .val('New folder')
            .attr('tabindex', '1')
            .attr('placeholder', 'New folder');

        $addFolderNameLabel
            .attr('for', IDS.addFolderName)
            .text('Folder name:');

        // 'Save' button
        $addButton
            .addClass(CLASSES.addButton)
            .addClass(CLASSES.buttonPrimary)
            .html('Add')
            .attr('tabindex', '1');

        // Construct the DOM
        $addDialog
            // Tabset name
            .append(
                $('<div/>')
                    .append($addNameDisplay)
            )
            // Folder list
            .append(
                $('<div/>')
                    .append($addFolderListLabel)
                    .append($addFolderListInput)
                    .append($addButton)
                    .append($addCancelButton)
            )
            // New folder UI
            .append(
                $('<div/>')
                    .addClass(CLASSES.hidden)
                    .append($addFolderNameLabel)
                    .append($addFolderNameInput)
            )
            // Add to the container
            .appendTo($addWrapper);

        // Add to popover
        $wrapper.append($addWrapper);

        // Create Popover object
        favesPopover = $.popover($popoverToggler, {
            html: $wrapper,
            display: {
                className: CLASSES.popover,
                offset: {
                    top: -4,
                    left: -10,
                },
            },
            location: 'below-right',
            hideOnEscape: false, // Don't let the popover plugin handle the Escape key since we're handling it in our own way
            gainFocus: false, // By default the plugin will set focus to the popover, but we need to set focus to the search input
        });

        favesPopover.$popover.on('hide.cui.popover', {faves: faves}, _onPopoverClose);
        favesPopover.$popover.on('show.cui.popover', _onPopoverShow);

        // Create Sortable list objects for the top-level favorites and each folder
        // https://github.com/RubaXa/Sortable#options
        lists.forEach(function (listObj) {
            var tabset = listObj.tabset;

            Sortable.create(listObj.$list.get(0), {
                group: NAMESPACE,

                // Draggable elements
                handle: '.' + CLASSES.moveButton,

                // Each event handler has an anonymous function wrapper so we can send the `faves` and `tabset` objects along. The `evt` is provided and customized by Sortable.

                // When the user has reordered a list (but not moved item between lists)
                onUpdate: function (faves, tabset, evt) { _onListUpdate(evt, faves, tabset); }.bind(undefined, faves, tabset),

                // When an item is dragged into a list
                onAdd: function (faves, tabset, evt) { _onMoveIntoFolder(evt, faves, tabset); }.bind(undefined, faves, tabset),

                // When an item is removed from a list
                onRemove: function (faves, tabset, evt) { _onMoveOutOfFolder(evt, faves, tabset); }.bind(undefined, faves, tabset),

                // When the item is in the process of being dragged
                onMove: _onMove,
            });
        });

        // Designate whether there's something to edit
        if (faves.tabsets.length) {
            favesPopover.$popover.addClass(CLASSES.hasLinks);
        }

        return favesPopover;
    };

    /**
     * Creates the UI for adding the current tabset to the favorites
     *
     * @param   {Object}  faves          Favorites instance
     *
     * @return  {jQuery}                 Updated container
     */
    var _populateAddTabsetUI = function _populateAddTabsetUI (faves, tabsetToAdd) {

        var $defaultOption;
        var $newOption;

        // Enable 'Add' mode
        favesPopover.$popover.addClass(CLASSES.addMode);
        $addWrapper.removeClass(CLASSES.undoMode);

        // If no tabset was provided (i.e. a search result) then assume we're adding the current tabset
        if (!tabsetToAdd) {
            tabsetToAdd = fwData.context.tabset;
            tabsetToAdd.label = fwData.context.tabset.name;
        }

        // Input field for editing the tabset name
        $addNameDisplay.text(tabsetToAdd.label);

        // Build the folder picker's options:

        // Remove old entries from the last time this dialog was shown
        $addFolderListInput.empty();

        // Create a default option
        $defaultOption = $('<option/>')
                            .attr('value', faves.id)
                            .html('(None)')
                            .appendTo($addFolderListInput);

        // Add all existing folders
        faves.tabsets.forEach(function (tabset) {
            var $option;

            // Is a folder
            if (tabset.hasOwnProperty('tabsets')) {
                $option = $('<option/>')
                            .attr('value', tabset.id)
                            .html(tabset.label);

                // Select this folder if it's currently open
                if (tabset.isOpen) {
                    $option.attr('selected', 'selected');
                }

                $option.appendTo($addFolderListInput);
            }
        });

        // Add an option for creating a new folder on the fly
        $newOption = $('<option/>')
                        .attr('value', '<new>')
                        .html('New folder...')
                        .appendTo($addFolderListInput);

        // (Re-)add event listeners

        $addFolderListInput
            .off('change')
            .on('change', {faves: faves, tabset: tabsetToAdd}, _onFolderListChange);

        $addFolderNameInput
            .off('keyup')
            .on('keyup', {faves: faves, tabset: tabsetToAdd}, _onAddTabsetKeyup);

        $addButton
            .off('click')
            .on('click', {faves: faves, tabset: tabsetToAdd}, _onAddTabsetConfirm);

        $addButton.focus();

        return $addDialog;
    };

    /**
     * Creates a folder DOM structure
     *
     * @param   {Object}  tabset  Folder containing tabsets
     * @param   {Object}  faves   Favorites object
     *
     * @return  {jQuery}          A `<ul>` containing all of the folder's tabsets
     */
    var _createFolderElement = function _createFolderElement (tabset, faves, tabsetids) {
        var $nestedList = $('<ul/>');

        // Add tabsets
        tabset.tabsets.forEach(function (ts) {

            if (tabsetids[ts.id] && tabsetids[ts.id].status !== "disable") {
                $nestedList.append(_createLinkElement(ts, faves, false));
            }
            else {

                journal.log({type: 'warn', owner: 'UI', module: 'favorites', func: '_generateUI'}, 'Tabset favorite: "', ts.label, '"removed because its not marked as "allowed" in the tabsetid property of favorites');
            }
        });

        return $nestedList;
    };

    /**
     * Creates the list item for a tabset link and its controls
     *
     * @param   {Object}   tabset          Tabset object
     * @param   {Object}   faves           Favorites instance
     * @param   {Boolean}  isFolderHeader  Whether we're creating a list item that serves as the title of a folder
     *
     * @return  {jQuery}                   The `<li>` element as a jQuery collection
     */
    var _createLinkElement = function _createLinkElement (tabset, faves, isFolderHeader) {

        var favoriteRoot = false;

        if (fwData.context.urls && fwData.context.urls.favorites && fwData.context.urls.favorites.goTo) {
            favoriteRoot = fwData.context.urls.favorites.goTo;
        }

        var $listItem = $('<li/>');
        var $itemWrapper = $('<div/>');
        var $moveButton = $('<div/>');
        var $tabsetLink = $('<a/>');
        var $tabsetInput = $('<input/>');
        var $tabsetLabel = $('<label/>');
        var $removeButton = $('<div/>');
        var $undoButton = $('<div/>');

        // Outer `<li>`
        $listItem
            .addClass(CLASSES.tabsetLinkItem)
            .attr('id', NAMESPACE + '-item-' + tabset.id);

        // Wrapper for all the controls; excludes any nested lists
        $itemWrapper.addClass(CLASSES.tabsetLinkItemWrapper);

        // 'Undo' button
        $undoButton
            .text('Undo')
            .addClass(CLASSES.undoButton)
            .attr('role', 'button')
            .attr('tabindex', '1')
            .on('click', {faves: faves, tabset: tabset, isFolderHeader: isFolderHeader}, _onUndoClick)
            .appendTo($itemWrapper);

        // Link text
        if (isFolderHeader) {

            $tabsetLink
                .addClass(CLASSES.tabsetLink)
                .attr('href', "#")
                .text(tabset.label)   // User's chosen display name
                .appendTo($itemWrapper);
        }
        else {

            $tabsetLink
                .addClass(CLASSES.tabsetLink)
                .attr('href', fwData.context.favorites.tabsetids[tabset.id].url)
                .text(tabset.label)   // User's chosen display name
                .appendTo($itemWrapper);
        }

        if (!isFolderHeader) {
            $tabsetLink
                .attr('tabindex', '1')
                .attr('title', 'Go to ' + tabset.label); // Actual tabset name
        }

        // Input for updating the tabset name
        $tabsetInput
            .addClass(CLASSES.tabsetInput)
            .attr('type', 'text')
            .attr('tabindex', '1')
            .attr('id', 'emp-fave-' + tabset.id)
            .attr('placeholder', tabset.name) // Actual tabset name
            .val(tabset.label)                // User's chosen display name
            .on('keyup', {faves: faves, tabset: tabset, $tabsetLink: $tabsetLink}, _onNameKeyup)
            .on('blur',  {faves: faves, tabset: tabset, $tabsetLink: $tabsetLink}, _onNameBlur)
            .appendTo($itemWrapper);

        // Hidden label for the input (for accessbility)
        $tabsetLabel
            .addClass(CLASSES.hideFromScreen)
            .attr('for', 'emp-fave-' + tabset.id)
            .appendTo($itemWrapper);

        // Label text comes from different attributes for folders and tabsets
        if (isFolderHeader) {
            // User's chosen name for this folder
            $tabsetLabel.text('Custom label for ' + tabset.label);
        }
        else {
            // Canonical tabset name
            $tabsetLabel.text('Custom label for ' + tabset.name);
        }

        // 'Remove' (trash can) button
        $removeButton
            .text('Remove')
            .addClass(CLASSES.removeButton)
            .attr('role', 'button')
            .attr('tabindex', '1')
            .on('click', {faves: faves, tabset: tabset, $listItem: $listItem}, _onRemoveClick)
            .appendTo($itemWrapper);

        // 'Move' button
        $moveButton
            .text('Move')
            .addClass(CLASSES.moveButton)
            .attr('role', 'button')
            .attr('tabindex', '1')
            .appendTo($itemWrapper);

        // Is a folder header
        if (isFolderHeader) {
            $itemWrapper.addClass(CLASSES.folderHeader);

            $listItem
                .attr('tabindex', '1')
                .on('click', {faves: faves, tabset: tabset, $listItem: $listItem}, _onFolderClick)
                .on('keydown', {faves: faves, tabset: tabset, $listItem: $listItem}, _onFolderKeydown);

            if (tabset.tabsets && tabset.tabsets.length) {
                $listItem.addClass(CLASSES.folderHasLinks);
            }

            if (tabset.isOpen) {
                $listItem.addClass(CLASSES.folderOpen);
            }
        }

        // Add the wrapper to the `<li>`
        $listItem.append($itemWrapper);

        // Return the `<li>` element
        return $listItem;
    };

    ////////////
    // Search //
    ////////////

    var _searchPreviousQuery = '';
    var _searchIgnoreKeyup = false;

    /**
     * Updates the search results view
     *
     * This contains a few child functions so that they can reference some variables without having to make those variables global
     *
     * @param   {Object}  faves  Favorites object
     */
    var _searchUpdateResults = function _searchUpdateResults (faves) {
        var query;
        var matches = [];

        /**
         * Recursively searchs for matching leaves in a tree of items (e.g. the main menu)
         *
         * http://codepen.io/patik/pen/VeVpzm?editors=0010
         * release 2 build 3 temp tabset
         *
         * @param   {Object}  parent       Menu item whose direct children are searched
         * @param   {String}  breadcrumbs  Text to be appended to the matching leaf when it is displayed
         */
        var __traverseMenuItem = function __traverseMenuItem (item, breadcrumbs) {
            var position;
            var lastBreadcrumb;
            var labelLowerCase;

            if (!breadcrumbs) {
                breadcrumbs = [];
            }

            // Add this item to the breadcrumbs
            if (item.label) {
                breadcrumbs.push(item);
            }

            // Check for a match in the last breadcrumb
            if (breadcrumbs.length && breadcrumbs[breadcrumbs.length - 1]) {
                // Make a copy of the item for easier reference
                lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];

                // Look for the query
                labelLowerCase = lastBreadcrumb.label.toLowerCase();
                position = labelLowerCase.indexOf(query);

                if (position !== -1) {
                    lastBreadcrumb.searchPosition = position;

                    // Check whether the query represents the beginning of a word in the item's label
                    if (position === 0) {
                        lastBreadcrumb.searchIsAtBeginningOfWord = true;
                    }
                    else if (/\W/.test(labelLowerCase.substr(position - 1, 1))) {
                        lastBreadcrumb.searchIsAtBeginningOfWord = true;
                    }
                    else {
                        lastBreadcrumb.searchIsAtBeginningOfWord = false;
                    }

                    // Update the array with our modified item
                    breadcrumbs[breadcrumbs.length - 1] = lastBreadcrumb;

                    matches.push(breadcrumbs);
                }
            }

            // Check this item's children
            if (item.items) {
                // Loop over the children and recursively call this function to build up `breadcrumbs`
                item.items.forEach(function (item) {
                    __traverseMenuItem(item, breadcrumbs.slice());
                });
            }
        };

        /**
         * Recursively searches favorites for matches
         *
         * This function is similar to `__traverseMenuItem()` however it has to consider both the `label` and `name` properties. It also needs to fill in some properties on the tabset objects that are normally found on menu item objects so that `__createResultElement()` can be used for all results.
         *
         * At one point I tried to first convert the tabset object to a menu-like structure so that both could use `__traverseMenuItem()`. This functioned properly, however this led to some awkwardness when searches could match either the label or name (and users may have forgotten or not known the name), confusion when trying to display the result, and ambiguity when sorting (i.e. is the name or label more important?). This was done in commit 45f62ee: https://github.com/nyfrg/empire/commit/45f62ee3f93a904836514278712e0c274fbdcd54 (CP 2/9/16)
         *
         * @param   {Object}  tabset  Tabset or folder
         */
        var __searchFavorites = function __searchFavorites (tabset) {
            var labelMatchPosition = -1;
            var nameMatchPosition = -1;

            // Ignore folders
            if (!tabset.hasOwnProperty('tabsets')) {
                // Check both the name and label for possible matches
                if (tabset.hasOwnProperty('label')) {
                    labelMatchPosition = tabset.label.toLowerCase().indexOf(query);
                }

                if (tabset.hasOwnProperty('name')) {
                    nameMatchPosition = tabset.name.toLowerCase().indexOf(query);
                }

                // We found a match
                if (nameMatchPosition !== -1 || labelMatchPosition !== -1) {
                    tabset.searchPrefix = 'your Favorites';
                    tabset.isFavorite = true;

                    if (nameMatchPosition !== -1 && labelMatchPosition === -1) {
                        // Copy the `name` to the `label` property, which is what the search results will display (since menu items only have `label` and not `name`). Otherwise, if we used the user-specified `label`, the search string would not match and we wouldn't be able to highlight the match in the results list
                        tabset.label = tabset.name;

                        tabset.searchPosition = nameMatchPosition;
                    }
                    else {
                        tabset.searchPosition = labelMatchPosition;
                    }

                    tabset.searchIsAtBeginningOfWord = (tabset.searchPosition === 0);

                    matches.push([tabset]);
                }
            }
            // Search in folder
            else {
                tabset.tabsets.forEach(function (ts) {
                    __searchFavorites(ts);
                });
            }
        };

        /**
         * Creates the DOM for a search result and appends it to the list
         *
         * @param   {Array}  breadcrumbs  Ordered array of item objects that makes a path from the top menu level to the matching item
         */
        var __createResultElement = function __createResultElement (breadcrumbs) {
            var item = breadcrumbs[breadcrumbs.length - 1]; // The last item in the breadcrumb path is the item that matched the query
            var $anchor; // Outer wrapper for this entry in the results list
            var label;
            var $label = $('<div/>');
            var $topRow;
            var $title;
            var $addButton;
            var $addButtonWrapper;
            var breadcrumbTrail;

            // Ignore items that don't have anywhere to link to
            //TEMP? Ignore this rule for mockups
            if (!item || (!item.url && !fwData.isMockup)) {
                return false;
            }

            // Ignore top-level menu items
            if (!item.isFavorite && breadcrumbs.length === 1) {
                return false;
            }

            // Special message, not a real search result, e.g. "no matches were found"
            if (item.isSpecialMessage) {
                $label.html(item.label);
            }
            // Standard item
            else {
                // Copy the label to the `name` property for use when adding this to the bookmarks
                item.name = item.label;

                // Create the visible link text with a span around the matching segment so we can style it

                // Start with everything before the matching string
                label  = item.label.substr(0, item.searchPosition);
                // Add the opening span tag
                label += '<span>';
                // Add the matching part, but take it from the original label (rather than `query`) to preserve capitalization
                label += item.label.substr(item.searchPosition, query.length);
                // Close the span tag
                label += '</span>';
                // Add the remaining text from the label
                label += item.label.substr(item.searchPosition + query.length);

                // Create the structure of the result item (i.e. the contents of the outer anchor)
                $topRow = $('<div/>');
                $title = $('<div/>');
                $addButton = $('<button/>');
                $addButtonWrapper = $('<div/>');

                $title
                    .addClass(CLASSES.searchResultTitle)
                    .html(label);

                $topRow
                    .addClass(CLASSES.searchResultTopRow)
                    .append($title);

                // Create an 'Add' button, unless it's 1) not marked as un-bookmarkable in the menu JSON, or 2) already a favorite
                if (item.bookmarkable && !item.isFavorite) {
                    $addButton
                        .attr('type', 'button')
                        .attr('title', 'Add to favorites...')
                        .text('Add to favorites...')
                        .on('click', {faves: faves, item: item}, _onAddSearchResultClick);

                    $addButtonWrapper
                        .addClass(CLASSES.searchResultAddButton)
                        .append($addButton);
                }

                $topRow.append($addButtonWrapper);

                $label.append($topRow);

                // Get the breadcrumb trail for the subtitle

                // A matched favorite would have this property instead of a breadcrumb array
                if (item.searchPrefix) {
                    breadcrumbTrail = item.searchPrefix;
                }
                // Menu items will have breadcrumbs
                else {
                    // Create breadcrumb trail by collecting the labels of each breadcrumb
                    breadcrumbTrail = [];
                    breadcrumbs.splice(0, breadcrumbs.length - 1).forEach(function (crumb) {
                        breadcrumbTrail.push(crumb.label);
                    });

                    // Convert the trail to text for display
                    breadcrumbTrail = breadcrumbTrail.join(TEXT_CONTENT.searchResultSeparator);
                }

                // Add the subtitle
                $label.append(
                            '<div class="' + CLASSES.searchResultSubtitle + '">Located in <span>' + breadcrumbTrail + '</span></div>'
                        );
            }

            // Create the link element
            $anchor = $('<a/>')
                        .append($label)
                        .attr('href', item.url)
                        .attr('tabindex', '1')
                        .on('keydown', _onSearchResultKeydown);

            // Add the link to a new `<li>` and append it all to the search list
            $searchList
                .append(
                    $('<li/>')
                        .append($anchor)
                );
        };

        // Clean up search string
        query = $searchInput.val()
                    .replace(/^\s*/g, '') // Trim spaces from the beginning
                    .toLowerCase();

        // Ignore unchanged queries
        // This can happen if the user pressed a non-character key such as an arrow or modifier key
        if (query === _searchPreviousQuery) {
            return true;
        }

        // Empty query
        if (query.length === 0) {
            // Ignore it and clear the results
            _searchClearResults();

            return true;
        }
        // Valid query
        else {
            // Clear previous results list
            $searchList.empty();
        }

        // Make sure the results area is open since `_onAddSearchResultClick()` may have closed it
        if ($searchList.hasClass(CLASSES.collapse)) {
            $searchList.removeClass(CLASSES.collapse);
            $searchInput.removeClass(CLASSES.collapse);
        }

        // Store this query for comparison the next time we search
        _searchPreviousQuery = query;

        // Search for favorites that match
        faves.tabsets.forEach(__searchFavorites);

        // Search for menu items that match
        __traverseMenuItem(fwData.menus.global);

        // Sort results
        // Order:
        //     1. Query matches a whole word
        //     2. Partial word match, but query matches the beginning of a word
        //     3. Other partial matches
        // Within each of those conditions, items are sorted based on the position of the match (beginning = best)
        matches.sort(function (a, b) {
            a = a[a.length - 1];
            b = b[b.length - 1];

            // Favorites come first
            if (a.isFavorite && !b.isFavorite) {
                return -1;
            }
            else if (!a.isFavorite && b.isFavorite) {
                return 1;
            }
            else if (a.isFavorite && b.isFavorite) {
                return 0;
            }

            // Only `a` matches the beginning of a word
            if (a.searchIsAtBeginningOfWord && !b.searchIsAtBeginningOfWord) {
                return -1;
            }
            // Only `b` matches the beginning of a word
            else if (!a.searchIsAtBeginningOfWord && b.searchIsAtBeginningOfWord) {
                return 1;
            }
            // Neither of them, or both of them, match the beginning of a word
            // Sort based on the position of the match (i.e. matches at the beginning of the tabset title take precedence)
            else {
                if (a.searchPosition < b.searchPosition) {
                    return -1;
                }
                else if (a.searchPosition > b.searchPosition) {
                    return 1;
                }
                else {
                    return 0;
                }
            }
        });

        // Build list of results
        matches.forEach(__createResultElement);

        // Expand the results container
        $searchList.removeClass(CLASSES.collapse);
        $searchInput.removeClass(CLASSES.collapse);

        // No matches found
        if (matches.length === 0) {
            // Add an explanatory item
            __createResultElement({
                label: '<em>No matching tabsets were found</em>',
                url: '#',
                isSpecialMessage: true,
            });
        }
    };

    /**
     * Clears the search results UI
     */
    var _searchClearResults = function _searchClearResults () {
        $searchInput
            .val('')
            .addClass(CLASSES.collapse);

        $searchList
            .empty()
            .addClass(CLASSES.collapse);

        // We need to clear the previous query, otherwise `_searchUpdateResults()` might erroneously think we're searching for the same thing again in the following scenario:
        //     1. User searches for a single letter
        //     2. User adds one of the results to their favorites
        //     3. User searches for the same letter again
        _searchPreviousQuery = '';
    };

    /**
     * Handles most keystrokes on the search input
     *
     * This watches for special keys and defers to `_searchUpdateResults()` for anything else
     *
     * @param   {Event}  evt  keyup event
     */
    var _onSearchKeyup = function _onSearchKeyup (evt) {
        // Make sure the `keydown` listener didn't decide that we should ignore this event
        if (_searchIgnoreKeyup) {
            // Reset the flag for next time
            _searchIgnoreKeyup = false;
        }
        // Escape key
        else if (evt.keyCode === 27) {
            // If the search field has contents, clear it
            if ($searchInput.val().replace(/^\s*/g, '').length !== 0) {
                _searchClearResults();
            }
            // If the search field was already empty, hide the popover
            else {
                favesPopover.hide();
            }
        }
        // Everything's fine, go ahead and perform the search
        else {
            _searchUpdateResults(evt.data.faves);
        }
    };

    /**
     * Handles certain key presses that need to be caught before `keyup` fires for the same keystroke
     *
     * This is necessary to handle browser behavior that is performed before `keyup` fires
     *
     * @param   {Event}  evt  keydown event
     *
     * @return  {Boolean}     `false` if the space bar was pressed to prevent the page from scrolling
     */
    var _onSearchKeydown = function _onSearchKeydown (evt) {
        // Check for special key presses
        if (!evt.shiftKey && !evt.ctrlKey) {
            // If the downward arrow key was pressed, just move focus to the first search result, if any
            if (evt.keyCode === 40) {
                // Stop the current event so the page doesn't scroll
                evt.preventDefault();
                evt.stopPropagation();

                // Focus on the first result
                $searchList.find('a').first().focus();

                // The `keyup` event handler will run in a moment, but we don't want it to do anything since we've already taken action in this function, so set this flag to tell the handler to ignore the event
                _searchIgnoreKeyup = true;

                return false;
            }
            // Enter
            else if (evt.keyCode === 13) {
                // We don't need to do anything special in this case, but there's no need to re-query for results
                _searchIgnoreKeyup = true;
            }
        }

        return true;
    };

    /**
     * Handle arrow key presses on search results to move the focus between results
     *
     * @param   {Event}  evt  Keydown event on a search result link
     */
    var _onSearchResultKeydown = function _onSearchResultKeydown (evt) {
        var key = evt.keyCode;
        var $setFocusTo;

        // Make sure the key that was pressed was an arrow key with no modifiers (shift, control, etc)
        if (!evt.shiftKey && !evt.ctrlKey && (key === 38 || key === 40)) {
            // Stop the current event so the page doesn't scroll
            evt.preventDefault();

            // Up arrow was pressed, should move to previous result
            if (key === 38) {
                $setFocusTo = $(evt.target).parent().prev().find('a');
            }
            else {
                $setFocusTo = $(evt.target).parent().next().find('a');
            }

            // If we've reached the first or last search result and there's nowhere else to go, return to the search input instead
            if (!$setFocusTo.length) {
                $setFocusTo = $searchInput;
            }

            $setFocusTo.focus();
        }
    };

    /**
     * Create and control the display of a fake placeholder message for the search input
     *
     * This is only needed for IE (not Edge) because IE does not display placeholder text while the input is empty and has focus. That behavior makes it difficult to understand what the input field is for.
     */
    var _handleSearchInputPlaceholder = function _handleSearchInputPlaceholder () {
        var $fakePlaceholder = $('<div/>');
        var inputComputedStyle = getComputedStyle($searchInput.get(0));

        // Set up the fake placeholder element
        $fakePlaceholder
            .addClass(CLASSES.searchInputFakePlaceholder)
            .html(TEXT_CONTENT.searchInputPlaceholder)
            // Align it with the input. The positioning is with respect to the search wrapper so we shouldn't need to recalculate these values when the window is resized
            .css({
                top: $searchWrapper.css('padding-top'),
                left: $searchWrapper.css('padding-left'),
            })
            // Add it to the DOM before the `<input>`
            .prependTo($searchWrapper);

        // Mimic the input field's look by inheriting its styles. This ensures the placeholder will look right even when the input's styles are changed.
        $fakePlaceholder
            .css({
                height: $searchInput.outerHeight(),
                width: $searchInput.outerWidth(),
                fontSize: inputComputedStyle.fontSize,
                lineHeight: inputComputedStyle.lineHeight,

                // With IE we must get the four padding values separately
                paddingTop: inputComputedStyle.paddingTop,
                paddingRight: inputComputedStyle.paddingRight,
                paddingBottom: inputComputedStyle.paddingBottom,
                paddingLeft: inputComputedStyle.paddingLeft,
            });

        // Hide and show the placeholder when the input gains and loses focus
        $searchInput
            // The `keyup` event fires too late (the user's text will appear before our function gets a chance to hide the placeholder, causing a brief overlap) and `keydown` fires too soon (the value's length is stale). Using the `input` event fixes both issues and results in the placeholder immediately hiding/showing as soon as the user types something.
            .on('input', function _handleSearchInputPlaceholder_onInput (evt) {
                // No text entered yet, so show the placeholder
                if (this.value.length === 0) {
                    $fakePlaceholder.removeClass(CLASSES.hidden);
                }
                // User entered some text, so hide the placeholder
                else {
                    $fakePlaceholder.addClass(CLASSES.hidden);
                }
            });
    };

    ////////////
    // Events //
    ////////////

    /**
     * Handles clicks on the icon that lauches the popover
     *
     * @param   {Event}  evt  Click event on the star icon
     */
    var _handleToggleClick = function _handleToggleClick (evt) {
        // Make sure the plugin has loaded
        if (!$.popover) {
            // Call this same function when the plugin is done loading
            cui.load('popover', function () {
                _handleToggleClick(evt);
            });
        }
        // Create and open the popover if it doesn't exist yet
        else if (!favesPopover) {
            favesPopover = _generateUI(evt.data.faves, evt.data.tabsetids);
            favesPopover.show();
        }
        // Else, the popover plugin will handle the click on the toggler and open it for us
    };

    /**
     * Handles the addition of an item to a list via user dragging
     * This handler is called just before `_onMoveOutOfFolder`
     *
     * @param   {Event}   evt         Event from the Sortable plugin
     * @param   {Object}  faves       Favorites object
     * @param   {Object}  destFolder  The list that now contains the item
     */
    var _onMoveIntoFolder = function _onMoveIntoFolder (evt, faves, destFolder) {
        // We don't yet know which tabset was added without reading from the DOM. So for now we'll just gather the information we know and put it into a queue so that `_onMoveOutOfFolder` can add its own information (including the tabset in question) and process it.
        _processItem.destFolder = destFolder;
        _processItem.destIndex = evt.newIndex;
        _processItem.addEvent = evt;
        _processItem.faves = faves;
    };

    /**
     * Handles the removal of an item from a list via user dragging
     *
     * @param   {Event}   evt        Event from the Sortable plugin
     * @param   {Object}  faves      Favorites object
     * @param   {Object}  srcFolder  The tabset that previously contained the item
     */
    var _onMoveOutOfFolder = function _onMoveOutOfFolder (evt, faves, srcFolder) {
        // Add what we know about this action. See comment in `_onMoveIntoFolder` for an explanation.
        _processItem.srcFolder = srcFolder;
        _processItem.srcIndex = evt.oldIndex;
        _processItem.removeEvent = evt;

        // Process the action now that all information has been gathered
        _processAddRemove();
    };

    /**
     * Evaluates the movement of a list while it's being dragged
     *
     * Namely, it prevents folders from being dragged into other folders since that's not allowed per UI design
     *
     * @param   {Event}  evt  Drag event from the Sortable plugin
     *
     * @return  {Boolean}       Whether or not the dragged item may be dropped into the element it's hovering over
     */
    var _onMove = function _onMove (evt) {

        var $target = $(evt.to); // This is the `<ul>` that the `<li>` represented by evt.dragged` would be dropped into
        var isTargetTheTopLevel = $target.closest('.' + CLASSES.folder).hasClass(CLASSES.linkList);
        var isTargetAFolder = $target.closest('li').hasClass(CLASSES.folder);
        var isDraggedItemAFolder = evt.dragged.classList.contains(CLASSES.folder);

        // Dragging a sub-folder into a sub-folder
        //if (isDraggedItemAFolder && isTargetAFolder /* && !isTargetTheTopLevel */) {
            //return false;
        //}
        // Any other scenario (namely, dragging a tabset, or dragging a folder within the top level)
        //else {
        //}

        return true;
    };

    /**
     * Handles changes to the sorting order within a list (e.g. when the user drags and drops)
     *
     * @param   {Event}   evt     Event from the Sortable plugin
     * @param   {Object}  faves   Favorites object
     * @param   {Object}  tabset  The tabset that contains the item
     */
    var _onListUpdate = function _onListUpdate (evt, faves, tabset) {

        _reorderTabset(faves, tabset, evt.oldIndex, evt.newIndex);
    };

    var _onNameKeyup = function _onNameKeyup (evt) {
        var tabset = evt.data.tabset;
        var faves = evt.data.faves;
        var name = $(this).val().trim();
        var $tabsetLink = evt.data.$tabsetLink;

        // Check for enter key
        if (evt.keyCode === 13 && !evt.ctrlKey && !evt.shiftKey && !evt.altKey) {
            // Exit 'edit' mode
            _onDoneClick(evt);
        }
        // Check if the display name has changed from its previous value
        else if (tabset.label !== name) {
            // Update tabset object
            tabset.label = name;

            // Update the display
            $tabsetLink.text(name);

            // Update data store
            _updateStore(faves);
        }
    };

    var _onNameBlur = function _onNameBlur (evt) {
        var tabset = evt.data.tabset;
        var faves = evt.data.faves;
        var $tabsetLink = evt.data.$tabsetLink;
        var $input = $(this);

        // Field was left empty
        if ($input.val().trim().length === 0) {
            // Update tabset object
            tabset.label = tabset.name;

            // Update the display
            $tabsetLink.text(tabset.name);
            $input.val(tabset.name);

            // Update data store
            _updateStore(faves);
        }
    };

    var _onRemoveClick = function _onRemoveClick (evt) {
        var tabsetObj = evt.data.tabset;

        // Add tabset to the deletion queue
        deleteQueue.push({
            label: tabsetObj.label, //TEMP, for debugging display purposes only
            faves: evt.data.faves,
            tabset: tabsetObj,
            $listItem: evt.data.$listItem,
        });

        // If it was a folder, also remove its children individually
        if (tabsetObj.tabsets) {
            tabsetObj.tabsets.forEach(function (tabset) {
                // Simulate a click on the Remove button
                // Don't bother trying to do by leveraging the data store, you'll need to do a DOM query for the `<li>` anyway (CP 2/3/2016)
                $('#' + NAMESPACE + '-item-' + tabset.id)
                    .find('.' + CLASSES.removeButton)
                        .click();
            });
        }

        // Mark for deletion
        evt.data.$listItem.addClass(CLASSES.removed);
    };

    /**
     * Removes the clicked item from the delete queue
     *
     * Note that we can tell what the goal of the function is based on which parameter was passed. If `evt` is supplied, then it was a click so we know the user wants to undo that item's removal. If `id` is supplied, then it's a pseudo-recursive call, which means we (UI) want to achieve something specific (e.g. undoing a parent folder, but not all of its children).
     *
     * @param   {Event}   evt  Click event. Optional if `id` is provided
     * @param   {String}  id   ID of the parent folder. Optional if `evt` is provided.
     */
    var _onUndoClick = function _onUndoClick (evt, id) {
        var $listItem;
        var listItem;
        var tabset;
        var index = -1;
        var parentId;

        if (evt) {
            $listItem = $(evt.target).closest('li');
        }
        else if (typeof id === 'string') {
            $listItem = $('#' + NAMESPACE + '-item-' + id);
        }
        else if (id instanceof $) {
            $listItem = id;
        }

        listItem = $listItem.get(0);

        // Look for the tabset in the deletion queue
        deleteQueue.forEach(function (tabsetObj, t) {
            // Check for a tabset with the same `<li>` element
            if (tabsetObj.$listItem.get(0) === listItem) {
                tabset = tabsetObj.tabset;
                index = t;
            }
        });

        // Verify that an item was found in the queue
        if (tabset && index !== -1) {
            // Folder
            if (tabset.hasOwnProperty('tabsets')) {
                // If `id` was supplied, then this is a pseudo-recursive call, and not the result of clicking on an 'Undo' button
                // We need to undo the removal of the folder itself but NOT all of its child items (a specific child item chosen by the user was already undone in the previous call to this function).
                if (id) {
                    // Remove item from the queue
                    deleteQueue.splice(index, 1);
                }
                // Otherwise, the user clicked 'Undo' on the folder, so resurrect all child items as well
                else {
                    // Remove folder from the queue
                    deleteQueue.splice(index, 1);

                    // Find children and remove them
                    for (var i = 0; i < deleteQueue.length; i++) {
                        var item = deleteQueue[i];

                        if (item.tabset.parent === tabset.id) {
                            deleteQueue.splice(i, 1);
                            item.$listItem.removeClass(CLASSES.removed);

                            // Decrement the counter to make up for the fact that the array is now smaller
                            i--;
                        }
                    }
                }

                // Update view
                $listItem.removeClass(CLASSES.removed);
            }
            // Single item
            else {
                // Has a parent folder
                if (tabset.parent && tabset.parent !== DEFAULT_FAVORITES.id) {
                    // Look for its folder so we can undo that later
                    parentId = $listItem
                                    .closest('.' + CLASSES.folder)
                                        .attr('id');

                    // We might not have found the folder if it was already removed, but that's okay

                    // If we found the folder element, get its ID so we can make a recursive call with it
                    if (parentId) {
                        parentId = parentId.replace(NAMESPACE + '-item-', '');
                    }
                    // Otherwise, there's nothing to do
                }
                else if (!tabset.parent) {
                    journal.log({type: 'error', owner: 'UI', module: 'favorites', func: '_onUndoClick'}, 'Tabset has no parent: ', tabset);
                }

                // Remove item from the queue
                deleteQueue.splice(index, 1);

                // Update view
                $listItem.removeClass(CLASSES.removed);
            }
        }

        // Undo the parent folder if applicable, but only after the child item was removed, otherwise we'll grab the wrong index of the `deleteQueue` when we call this recursively
        if (parentId) {
            _onUndoClick(null, parentId);
        }

        if (evt) {
            _hideOrShowAddToggle(evt.data.faves);
        }
    };

    /**
     * Handles clicks on the 'Add this tabset' button
     *
     * @param   {Event}  evt  Click event
     *
     * @return  {Mixed}       The jQuery collection for the UI created by `_populateAddTabsetUI()`
     */
    var _onAddTabsetClick = function _onAddTabsetClick (evt) {

        _populateAddTabsetUI(evt.data.faves);

        _hideOrShowAddToggle(evt.data.faves);
    };

    /**
     * Handles clicks on the 'Save' button in the Add Current Tabset UI
     *
     * @param   {Event}    evt  Click event
     *
     * @return  {Boolean}       Result of calling `_addTabset()`
     */
    var _onAddTabsetConfirm = function _onAddTabsetConfirm (evt) {
        var selectedFolderId = $addFolderListInput.val();
        var faves = evt.data.faves;
        var folder;

        // User wants to create a folder
        if (selectedFolderId === '<new>') {
            folder = {
                label: $addFolderNameInput.val().trim() || 'New Folder',
                isOpen: true,
            };

            // Add the folder. This will also give it an ID
            folder = _addNewFolder(faves, folder, {skipEditMode: true});

            // Use this ID in a moment when we store the new bookmark
            selectedFolderId = folder.id;
        }
        else {
            // If there was no folder currently open we should use the Favorites object as the target
            if (!selectedFolderId) {
                selectedFolderId = faves.id;
            }

            folder = faves.tabsets[getIndex(faves.tabsets, selectedFolderId)];
        }

        // Update the UI:

        // Change the star icon to clarify that this tabset has been bookmarked
        $popoverToggler.addClass(CLASSES.selected);

        // Turn off 'add' mode
        favesPopover.$popover.removeClass(CLASSES.addMode);

        // Reveal 'Undo' button
        $addWrapper.addClass(CLASSES.undoMode);

        // Make sure the bookmark's folder is open
        if (folder) {
            _openFolder(folder, faves, _getListItem(selectedFolderId));
        }

        // Update the data store
        return _addTabset(evt.data.tabset, selectedFolderId, faves);
    };

    /**
     * Watches for the Enter key to be pressed within the Add Tabset UI
     * @param   {Event}  evt  Keyup event in an `<input>`
     */
    var _onAddTabsetKeyup = function _onAddTabsetKeyup (evt) {
        // Pressed enter key
        if (evt.keyCode === 13) {
            // Save the entered data
            _onAddTabsetConfirm(evt);
        }
    };

    /**
     * User selects an entry in the 'add to folder' dropdown
     *
     * @param   {Event}  evt  Change event on a `<select>`
     */
    var _onFolderListChange = function _onFolderListChange (evt) {
        var selectedFolderId = $addFolderListInput.val();

        // User wants to create a folder
        if (selectedFolderId === '<new>') {
            // Unhide the New Folder UI
            $addFolderNameInput.parent().removeClass(CLASSES.hidden);

            // Set focus to the input and highlight the contents
            $addFolderNameInput.focus();
            $addFolderNameInput.get(0).select();
        }
        // User wants to use an existing folder
        else {
            // Hide the New Folder UI
            $addFolderNameInput.parent().addClass(CLASSES.hidden);
        }
    };

    /**
     * Disables 'Add current tabset' mode
     */
    var _onCancelAddTabsetClick = function _onCancelAddTabsetClick (evt) {
        // Turn off 'add mode'
        favesPopover.$popover.removeClass(CLASSES.addMode);

        _hideOrShowAddToggle(evt.data.faves);
    };

    /**
     * Removes the current tabset from the favorites and re-instates 'Add current tabset' mode
     *
     * @param   {Event}  evt  Click event
     *
     * @return  {[type]}      [description]
     */
    var _onUndoAddTabsetClick = function _onUndoAddTabsetClick (evt) {
        var faves = evt.data.faves;

        // Remove tabset from data store
        _removeTabset(_getTabsetById(faves, lastAddedTabsetId), faves);

        // Remove the UI
        _getListItem(lastAddedTabsetId).remove();

        // Go back to 'add mode'
        favesPopover.$popover.addClass(CLASSES.addMode);

        // Turn off 'undo mode'
        $addWrapper.removeClass(CLASSES.undoMode);

        _hideOrShowAddToggle(faves);
    };

    /**
     * Handles clicks on the 'Add folder' button
     *
     * @param   {Event}  evt  Click event
     */
    var _onAddFolderClick = function _onAddFolderClick (evt) {
        _addNewFolder(evt.data.faves);
    };

    /**
     * Handles clicks on a folder name
     *
     * @param   {Event}  evt  Click event
     */
    var _onFolderClick = function _onFolderClick (evt) {
        var tabset = evt.data.tabset;
        var faves = evt.data.faves;

        // Ignore clicks during edit mode since the user will be clicking on specific controls and toggling isn't possible
        if (!favesPopover.$popover.is('.' + CLASSES.editMode)) {
            _toggleFolder(tabset, faves, evt.data.$listItem);
        }
    };

    /**
     * Toggles a folder between opened and closed
     *
     * @param   {Object}  folder     Folder object
     * @param   {Object}  faves      Favorites object
     * @param   {jQuery}  $listItem  Element representing the folder in the UI
     *
     * @return  {Mixed}              Result of updating the data store
     */
    var _toggleFolder = function _toggleFolder (folder, faves, $listItem) {
        // Folder is currently opened, need to close it
        if (folder.isOpen) {
            return _closeFolder(folder, faves, $listItem);
        }
        // Folder is currently closed, need to open it
        else if (folder) {
            return _openFolder(folder, faves, $listItem);
        }
        else {
            journal.log({type: 'error', owner: 'UI', module: 'favorites', func: '_toggleFolder'}, 'No folder provided to _toggleFolder ', arguments);

            return false;
        }
    };

    /**
     * Set a folder to the 'opened' state in both the UI and the data store
     *
     * @param   {Object}  folder     Folder/tabset object
     * @param   {Object}  faves      Favorites object
     * @param   {jQuery}  $listItem  Element representing the folder in the UI
     *
     * @return  {Mixed}              Result of updating the data store
     */
    var _openFolder = function _openFolder (folder, faves, $listItem) {
        // Close all other folders that are currently open
        faves.tabsets.forEach(function (tabset) {
            if (tabset.isOpen === true) {
                _closeFolder(tabset, faves, _getListItem(tabset.id), {doNotUpdateStore: true});
            }
        });

        // Update view
        $listItem.addClass(CLASSES.folderOpen);

        // Update data store
        faves.tabsets[getIndex(faves.tabsets, folder.id)].isOpen = true;

        return _updateStore(faves);
    };

    /**
     * Set a folder to the 'closed' state in both the UI and the data store
     *
     * The settings object has a boolean property `doNotUpdateStore`. Setting this to `true` will avoid updating the data store, i.e. if the calling function will do that anyway and you want to avoid redundant updates.
     *
     * @param   {Object}  folder     Folder/tabset object
     * @param   {Object}  faves      Favorites object
     * @param   {jQuery}  $listItem  Element representing the folder in the UI
     * @param   {Object}  settings   Optional settings
     *
     * @return  {Mixed}              Result of updating the data store
     */
    var _closeFolder = function _closeFolder (folder, faves, $listItem, settings) {
        // Update view
        $listItem.removeClass(CLASSES.folderOpen);

        // Update data store
        faves.tabsets[getIndex(faves.tabsets, folder.id)].isOpen = false;

        // Update data store, unless instructed not to
        if (!settings || (typeof settings === 'object' && !settings.doNotUpdateStore)) {
            return _updateStore(faves);
        }
        else {
            return true;
        }
    };

    /**
     * Handle keyboard navigation of folder header
     *
     * @param   {Event}  evt   Keydown event
     */
    var _onFolderKeydown = function _onFolderKeydown (evt) {
        if (!evt.shiftKey && !evt.ctrlKey) {
            // Space bar or enter
            if (evt.keyCode === 13 || evt.keyCode === 32) {
                _toggleFolder(evt.data.tabset, evt.data.faves, evt.data.$listItem);

                // Prevent the page from scrolling if the space bar was pressed outside of the input
                if (evt.keyCode === 32 && evt.target.nodeName !== 'INPUT') {
                    evt.preventDefault();
                }
            }
            // Right arrow on a closed folder should open it
            else if (evt.keyCode === 39 && evt.data.tabset.isOpen === false) {
                _openFolder(evt.data.tabset, evt.data.faves, evt.data.$listItem);
            }
            // Left arrow on an opened folder should close it
            else if (evt.keyCode === 37 && evt.data.tabset.isOpen === true) {
                _closeFolder(evt.data.tabset, evt.data.faves, evt.data.$listItem);
            }
        }
    };

    /**
     * Enables 'Edit' mode
     *
     * @param   {Event}  evt  Click event
     */
    var _onEditClick = function _onEditClick (/*evt*/) {
        favesPopover.$popover.addClass(CLASSES.editMode);
    };

    /**
     * Disables 'Edit' mode and deletes all items marked for removal
     *
     * @param   {Event}  evt  Click event
     */
    var _onDoneClick = function _onDoneClick (evt) {
        favesPopover.$popover.removeClass(CLASSES.editMode);

        // Trigger the blur event on each input (e.g. to check for empty fields)
        // The blur event handler will check if they're empty and fill in default values as needed. This is preferable to handling the situation here because the blur event data will contain references to the necessary objects
        favesPopover.$popover.find('.' + CLASSES.tabsetInput).blur();

        // Delete any tabsets in the queue
        deleteQueue.forEach(function (tabsetObj) {
            // Folder
            if (tabsetObj.tabset.hasOwnProperty('tabsets')) {
                _removeFolder(tabsetObj.faves, tabsetObj.tabset);
            }
            // Tabset
            else {
                _removeTabset(tabsetObj.tabset, tabsetObj.faves);
            }

            // Remove the UI
            tabsetObj.$listItem.remove();
        });

        _hideOrShowAddToggle(evt.data.faves);
    };

    /**
     * Adds the clicked search result to the favorites
     *
     * @param   {Event}  evt  Click event
     *
     * @return  {Mixed}       Result of updating the preferences object (via calling `_addTabset()`)
     */
    var _onAddSearchResultClick = function _onAddSearchResultClick (evt) {
        var tabsetToAdd = evt.data.item;

        // Don't let the click event bubble to the enclosing `<a>`
        evt.preventDefault();
        evt.stopPropagation();

        // Clear and collapse the search results
        _searchClearResults();

        // Setup the 'Add' dialog
        _populateAddTabsetUI(evt.data.faves, tabsetToAdd);

        // Hide the link to add the current tabset since it's a bit confusing next to the dialog
        _hideOrShowAddToggle(evt.data.faves, 'hide');
    };

    /**
     * Runs when the popover is displayed
     */
    var _onPopoverShow = function _onPopoverShow (/*evt*/) {
        $searchInput.focus();
        $popoverToggler.addClass(CLASSES.active);
    };

    /**
     * Runs when the popover becomes hidden
     */
    var _onPopoverClose = function _onPopoverClose (evt) {
        // Clear search results
        _searchClearResults();

        // Undo all deletions in the queue without deleting any of them
        // We cannot use `forEach` since each run of this loop will modify the `deleteQueue` array
        while (deleteQueue.length) {
            // Undo the next item in the queue
            _onUndoClick(null, deleteQueue[0].$listItem);
        }

        // Turn off Edit Mode so it's not enabled next time the popover is opened
        // This must be done after clearing the delete queue above. That process will trigger clicks on the folder that will bubble up to `_onFolderClick()` which calls `_toggleFolder()` and that will change the opened/closed state of the folder.
        favesPopover.$popover
            .removeClass(CLASSES.editMode)
            .removeClass(CLASSES.addMode);

        // Turn off Add Mode
        favesPopover.$popover.removeClass(CLASSES.addMode);
        _hideOrShowAddToggle(evt.data.faves);

        // Turn off Undo Mode
        $addWrapper.removeClass(CLASSES.undoMode);

        // Reset the toggler icon
        $popoverToggler.removeClass(CLASSES.active);

        // Set focus back to the toggler so keyboard shortcuts will continue to work
        setTimeout(function () {
            $popoverToggler.focus();
        }, 100);
    };

    ///////////////
    // Utilities //
    ///////////////

    /**
     * Hide or show the 'Add current tabset' link, as applicable
     *
     * Will hide the link if the tabset is currently bookmarked, or if add mode is enabled
     *
     * @param   {Object}  faves  Favorites instance
     * @param   {String}  force  Override the logic and either 'hide' or 'show' the link
     *
     * @return  {Number}         0 for hidden, 1 for shown
     */
    var _hideOrShowAddToggle = function _hideOrShowAddToggle (faves, force) {
        // Force it to be hidden or visible
        if (typeof force !== 'undefined') {
            if (force === 'hide') {
                $addWrapper.addClass(CLASSES.hideAddToggle);

                return 0;
            }
            else {
                $addWrapper.removeClass(CLASSES.hideAddToggle);

                return 1;
            }
        }
        // Hide if Add mode is enabled or the current tabset is already bookmarked
        else if (_getTabsetById(faves, fwData.context.tabset.id)) {
            $addWrapper.addClass(CLASSES.hideAddToggle);

            return 0;
        }
        // Hide if Add mode is enabled or the current tabset is already bookmarked
        else if (favesPopover.$popover.hasClass(CLASSES.addMode)) {
            $addWrapper.addClass(CLASSES.hideAddToggle);

            return 0;
        }
        else {
            $addWrapper.removeClass(CLASSES.hideAddToggle);

            return 1;
        }
    };

    /**
     * Retrives the `<li>` element for a given folder or bookmark
     *
     * @param   {Mixed}  query  ID (string) or tabset/folder (object)
     *
     * @return  {jQuery}        jQuery collection containing the element
     */
    var _getListItem = function _getListItem (query) {
        if (typeof query === 'object') {
            query = query.id;
        }

        return $('#emp-faves-item-' + query);
    };

    /**
     * Returns the tabset with the specified ID
     *
     * This searches for the tabset within `container` which may be either the Favorites instance or a folder
     * This function is not meant for finding folders. Use `_getFolderById()` instead.
     *
     * @param   {Object}  container  Folder or favorites object
     * @param   {String}  id         ID of the target tabset
     *
     * @return  {Object}             Tabset object, or `undefined` if none was found
     */
    var _getTabsetById = function _getTabsetById (container, id) {
        var target;

        container.tabsets.some(function (tabset) {
            // Is a folder
            if (tabset.hasOwnProperty('tabsets') && tabset.tabsets.length) {
                // Search its tabsets
                tabset.tabsets.some(function (ts) {
                    if (ts.id === id) {
                        target = ts;

                        // Quit the loop
                        return true;
                    }
                });
            }
            else if (tabset.id === id) {
                target = tabset;

                // Quit the loop
                return true;
            }
        });

        return target;
    };

    /**
     * Returns the folder with the specified ID
     *
     * This searches for the folder within `container` and it's fine if the folder we're looking for is the `container` itself
     *
     * @param   {Object}  container  Folder or favorites object
     * @param   {String}  id         ID of the target folder
     *
     * @return  {Object}             Folder object, or `undefined` if none was found
     */
    var _getFolderById = function _getFolderById (container, id) {
        if (container.id === id) {
            return container;
        }
        else if (container.hasOwnProperty('tabsets')) {
            return container.tabsets[
                                        container.tabsets
                                            .map(
                                                function (x) { return x.id; }
                                            )
                                            .indexOf(id)
                                    ];
        }
        else {
            journal.log({type: 'error', owner: 'UI', module: 'favorites', func: '_getFolderById'}, 'Could not find a folder with the ID "', id, '". Arguments: ', arguments);

            return undefined;
        }
    };

    /**
     * Generates a random string
     *
     * @return  {String}  Alphanumeric string
     */
    var _generateRandomString = function _generateRandomString () {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };

    ////////////////////
    // Public methods //
    ////////////////////

    /**
     * Add a tabset to the favorties list
     *
     * All arguments are optional if you wish to save the current tabset. Otherwise, the first three arguments are required.
     *
     * @param   {String}  tabsetId     ID of the tabset to be saved
     * @param   {String}  url          URL of the tabset
     * @param   {String}  name         Name of the tabset
     * @param   {String}  label        User-specified display name of the tabset (optional; will default to the tabset's actual name)
     *
     * @return  {Mixed}                Result of updating the preferences object, or `false` for incorrect parameters
     */
    Favorites.prototype.add = function _add (tabsetId, url, name, label) {
        var newTabset;
        var isCurrentTabset = false;

        if (typeof tabsetId !== 'string' || !tabsetId) {
            // Use the current tabset
            tabsetId = fwData.context.tabset.id;
            isCurrentTabset = true;
        }

        // Make sure the favorite doesn't exist already
        if (getIndex(this.faves.tabsets, tabsetId) !== -1) {
            journal.log({type: 'warn', owner: 'UI', module: 'favorites', func: 'add'}, 'Attempted to favorite a tabset that was already saved: "', tabsetId, '"');

            return false;
        }

        // Create a new object
        newTabset = $.extend(true, {}, DEFAULT_BOOKMARK);

        newTabset.id = tabsetId;
        newTabset.parent = DEFAULT_FAVORITES.id;

        // Gather data from the current tabset
        if (isCurrentTabset) {
            newTabset.url.name = fwData.context.tabset.name;
            newTabset.url.attributes.href = fwData.context.tabset.url;
        }
        // We're adding some other tabset
        else {
            // Make sure we got the optional arguments
            if (typeof name !== 'string' || typeof url !== 'string' || !name.trim().length || !url.trim().length) {
                journal.log({type: 'error', owner: 'UI', module: 'favorites', func: 'add'}, 'Cannot add favorite because the name and/or URL were not supplied');

                return false;
            }

            newTabset.name = name.trim();
            newTabset.url = url.trim();

            if (typeof label === 'string' && label.trim().length) {
                newTabset.label = label.trim();
            }
            else {
                newTabset.label = newTabset.name;
            }
        }

        // Add to the list of favorites
        this.faves.tabsets.push(newTabset);

        // Update the data store and server
        return _updateStore(this.faves);
    };

    ///////////////////////////
    // Expose public methods //
    ///////////////////////////

    Favorites.version = VERSION;

    // Define and expose the component to jQuery
    window.$.fn.favorites = function (options) {
        return this.each(function () {
            new Favorites(this, options).init();
        });
    };

    window.$.favorites = function (options) {
        return new Favorites(options).init();
    };
});
