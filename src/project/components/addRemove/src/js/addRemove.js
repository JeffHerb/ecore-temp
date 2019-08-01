define(['guid'], function (guid) {

    var CLASSES = {};

    // Private method namespace
    var _priv = {};

    _priv.updateHiddenInput = function _priv_update_hidden_input(addRemove) {

        addRemove.$selectedHidden.val(addRemove.currentSelected.join(','));
    };

    _priv.changeOrder = function _priv_change_order (addRemove, direction) {

        var currentInPlace = false;
        var currentLength = addRemove.currentSelected.length;
        var currentIndex = addRemove.currentSelected.indexOf(addRemove.focus.value);

        // Check to see if the item is in the current set
        if (currentIndex !== -1) {

            var newIndex = (direction === "up") ? currentIndex - 1 : currentIndex + 1;

            if ((direction === "up" && currentIndex !== 0) || (direction === "down" && currentIndex !== (currentLength - 1) )) {

                // Fix the hidden input array first
                addRemove.currentSelected.splice(currentIndex, 1);
                addRemove.currentSelected.splice(newIndex, 0, addRemove.focus.value);

                journal.log({type: 'info', owner: 'UI', module: 'emp', submodule: 'addRemove', func: 'changeOrder'}, "Moving Index:", currentIndex, "to", newIndex);
                
                // Detach the current focus element;
                addRemove.focus.$elem.detach();

                if (newIndex === 0) {
                    addRemove.$selectedContainer.prepend(addRemove.focus.$elem);
                }
                else if (newIndex + 1 === currentLength) {

                    addRemove.$selectedContainer.append(addRemove.focus.$elem);
                }
                else {
                    addRemove.$selectedContainer.find('li').eq(newIndex).before(addRemove.focus.$elem);
                }

                _priv.updateHiddenInput(addRemove);
            }
        }
        else {
            journal.log({type: 'error', owner: 'UI', module: 'emp', submodule: 'addRemove', func: 'changeOrder'}, 'We dont have a value, but we called focus order change call!');
        }
    };

    _priv.updateFocus = function _priv_update_focus (addRemove) {

        var $currentSelected = addRemove.$selectedContainer.find('li.emp-selected-item');

        if ($currentSelected.length) {
            $currentSelected.removeClass('emp-selected-item');
        }

        addRemove.focus.$elem.addClass('emp-selected-item');
    };

    var _events = {};

    _events.checkbox = function _event_checkbox(evt, indivudalTick, addRemove) {

        var $checkbox = $(evt.target);
        var $label = $('label[for="' + $checkbox.attr('id') + '"]');

        var value = $checkbox.val();
        var currentIndex = addRemove.currentSelected.indexOf(value);

        if ($checkbox.is(':checked')) {

            if (addRemove.currentSelected.indexOf(value) === -1) {

                var newLI = $('<li>', {
                    'data-checkvalue': value
                });

                var newSPAN = $('<span>').text($label.text());

                newSPAN.appendTo(newLI);

                addRemove.$selectedContainer.append(newLI);

                addRemove.currentSelected.push(value);

                if (indivudalTick) {
                    addRemove.focus.$elem = newLI;
                    addRemove.focus.value = value;

                    _priv.updateFocus(addRemove);
                }

                _priv.updateHiddenInput(addRemove);
            }

        }
        else {

            if (addRemove.currentSelected.indexOf(value) !== -1) {

                // Remove the Li
                addRemove.$selectedContainer.find('li[data-checkvalue="' + value + '"]').remove();

                addRemove.currentSelected.splice(currentIndex, 1);

                // Flush out current focus if its unchecked!
                if (addRemove.focus.value === value) {
                    addRemove.focus.$elem = false;
                    addRemove.focus.value = false;
                }

                _priv.updateHiddenInput(addRemove);
            }
        }

    };

    _events.checkAll = function _event_check_all(evt, addRemove) {

        var $checkAll = $(evt.target);

        if ($checkAll.is(':checked')) {

            addRemove.addAll = true;

            addRemove.$options.each(function(i) {

                var $option = $(this);

                if (!$option.is(':checked')) {

                    $option.trigger('click');
                }

            });
           
            addRemove.addAll = false;
        }
        else {

            // Remove all checkmarks
            addRemove.$options.trigger('click');

        }

    };

    _events.selectedLI = function _events_selectedLI(evt, addRemove) {

        var $item = $(evt.target);

        if ($item[0].nodeName === "SPAN") {
            $item = $item.parent();
        }

        if ($item.hasClass('emp-selected-item')) {

            $item.removeClass('emp-selected-item');

            addRemove.focus.$elem = false;
            addRemove.focus.value = false;

        }
        else {

            if (addRemove.focus.$elem) {
                addRemove.focus.$elem.removeClass('emp-selected-item');
            }

            $item.addClass('emp-selected-item');

            // Update Focus
            addRemove.focus.$elem = $item;
            addRemove.focus.value = $item.attr('data-checkvalue');
        }

    };

    _events.selectedUp = function _events_selected_up(evt, addRemove) {

        if (addRemove.focus.value) {

            _priv.changeOrder(addRemove, 'up');
        }
        else {
            journal.log({type: 'warning', owner: 'UI', module: 'emp', submodule: 'addRemove', func: 'selectedUp'}, 'There is no selected value to move.');
        }

    };

    _events.selectedDown = function _events_selected_down(evt, addRemove) {

        if (addRemove.focus.value) {

             _priv.changeOrder(addRemove, 'down');
        }
        else {
            journal.log({type: 'warning', owner: 'UI', module: 'emp', submodule: 'addRemove', func: 'selectedDown'}, 'There is no selected value to move.');
        }

    };

    ///////////////////
    // Public method //
    ///////////////////

    var addRemove = function (elem, options) {
        // Store the element upon which the component was called
        this.elem = elem;

        // Create a jQuery version of the element
        this.$self = $(elem);

        var id = this.$self.attr('id');

        if (!id) {
            id = guid();
        }

        this.id = id;

        this.options = options;
    };

    addRemove.prototype.init = function _init (cb) {

        var addRemove = this;

        addRemove.buttons = {};

        addRemove.buttons.$up = addRemove.$self.find('.emp-add-remove-up-button');
        addRemove.buttons.$down = addRemove.$self.find('.emp-add-remove-down-button');

        addRemove.$options = addRemove.$self.find('.emp-add-remove-container input:not(".emp-check-include-all")');
        addRemove.$checkAll = addRemove.$self.find('.emp-add-remove-container input.emp-check-include-all');
        addRemove.$selectedContainer = addRemove.$self.find('.emp-order-list-container ol');
        addRemove.$selected = addRemove.$self.find('.emp-order-list-container li');

        addRemove.$selectedHidden = addRemove.$self.find('.emp-add-remove-list-box input[type="hidden"]');

        addRemove.currentSelected = addRemove.$selectedHidden.val();

        if (addRemove.currentSelected.length) {
            addRemove.currentSelected = addRemove.currentSelected.split(',');
        }
        else {
            addRemove.currentSelected = [];
        }

        addRemove.addAll = false;

        addRemove.focus = {
            $elem: false,
            value: false
        };

        // Bind the click for the include all.
        addRemove.$checkAll.on('click', function(evt) {
            _events.checkAll(evt, addRemove);
        });

        // Bind click event on checkbox itself
        addRemove.$options.on('click', function(evt) {

            if (addRemove.addAll) {

                _events.checkbox(evt, false, addRemove);
            }
            else {

                _events.checkbox(evt, true, addRemove);
            }

        });

        // Bind click event on selected li
        addRemove.$selectedContainer.on('click', function(evt) {
            _events.selectedLI(evt, addRemove);
        });

        // Bind up click event
        addRemove.buttons.$up.on('click', function(evt) {
            _events.selectedUp(evt, addRemove);
        });

        addRemove.buttons.$down.on('click', function(evt) {
            _events.selectedDown(evt, addRemove);
        });


        return addRemove;
    };

    // Define and Expose the table component to jQeury
    window.$.fn.addRemove = function (options, callback) {

        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        // Loop through all of the discovered tables
        return this.each(function (options, callback) {

            new addRemove(this, options).init(function(addRemoveInstance) {

                if (!window.emp.reference.addRemove) {

                    emp.reference.addRemove = {};
                }

                emp.reference.addRemove[addRemoveInstance.id] = addRemoveInstance;

            });

        });
    };

});
