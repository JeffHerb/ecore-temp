define(['guid'], function(guid) {

    var CLASSES = {
        activeTab: 'emp-active-tab',
        selected: 'emp-selected',
        hidden: "cui-hidden-for-tabs"
    };

    var _priv = {};

    _priv.defaults = {
        allowCloseAll: true
    };

    _priv.changeTab = function _change_tab_private(tabs, index) {

        var currentHeaderTab = false;
        var currentContainer = false;

        var newHeaderTab = false;
        var newContainer = false;

        if (tabs.currentActiveTab !== index) {

            fastdom.measure(function() {

                if (tabs.currentActiveTab !== false) {
                    currentHeaderTab = tabs.obj.$headerTabs.eq(tabs.currentActiveTab);
                }

                if (tabs.currentActiveTab !== false) {
                    currentContainer = tabs.obj.$containers.eq(tabs.currentActiveTab);

                }

                newHeaderTab = tabs.obj.$headerTabs.eq(index);
                newContainer = tabs.obj.$containers.eq(index);

                fastdom.mutate(function() {

                    // Remove old selected tab class
                    if (currentHeaderTab) {
                        currentHeaderTab.removeClass(CLASSES.selected);
                    }

                    if (currentContainer) {
                        currentContainer.removeClass(CLASSES.activeTab);
                        currentContainer.children(':eq(1)').addClass(CLASSES.hidden);
                    }

                    // Toggle the new active tab
                    newHeaderTab.addClass(CLASSES.selected);
                    newContainer.addClass(CLASSES.activeTab);

                    newContainer.children(':eq(1)').removeClass(CLASSES.hidden);

                    // Update the tab object state
                    tabs.currentActiveTab = index;
                    tabs.$currentActiveTab = newHeaderTab;
                });
            });

        }
        else {

            if (tabs.options.allowCloseAll) {

                currentHeaderTab = tabs.obj.$headerTabs.eq(tabs.currentActiveTab);
                currentContainer = tabs.obj.$containers.eq(tabs.currentActiveTab);

                fastdom.mutate(function() {

                    currentHeaderTab.removeClass(CLASSES.selected);
                    currentContainer.removeClass(CLASSES.activeTab);

                    // Update the tab object state
                    tabs.currentActiveTab = false;
                    tabs.$currentActiveTab = false;
                });

            }
            else {

                journal.log({type: 'warning', owner: 'UI', module: 'tabs', func: '_priv.changeTab'}, 'Tabs change tab request ignored because provided index matched current active tab.');
            }

        }

        //remove collapse class apply by Collapse All Sections button
        if(tabs.elem.classList.contains('emp-collapse')){

            tabs.elem.classList.remove('emp-collapse');
        }
    };

    var _events = {};

    _events.changeTab = function _change_tab(evt, tabs, index) {

        var $source = $(evt.target);

        if ($source[0].hasAttribute('data-tab-index')) {

            _priv.changeTab(tabs, parseInt($source.attr('data-tab-index')));
        }
        else {

            console.log("FAIL!");
        }
    };

    var Tabs = function(elem, options) {

        this.elem = elem;

        this.$self = $(elem);

        this.id = this.$self.attr('id');

        if (typeof this.id !== "string") {

            var id = guid();

            this.$self.attr('id', id);

            this.id = id;
        }

        this.options = $.extend(true, _priv.defaults, options || {});
    };

    Tabs.prototype = {};

    Tabs.prototype.init = function _tabs_init(cb) {

        var tabs = this;

        tabs.obj = {};

        tabs.obj.$desktopHeader = tabs.$self.find('header').eq(0);

        tabs.obj.$tabContainer = tabs.$self.find('.emp-tab-container').eq(0);

        tabs.obj.$headerTabs = tabs.obj.$desktopHeader.find('a.emp-header-tab');
        tabs.obj.$accordionTabs = tabs.obj.$tabContainer.find('a.emp-accordion-tab');

        tabs.obj.$containers = tabs.$self.find('.emp-tab');

        tabs.$currentActiveTab = tabs.obj.$headerTabs.filter('.emp-selected');
        tabs.currentActiveTab = tabs.$currentActiveTab.index();

        tabs.$self.on('click', '.emp-tab-control', function(evt) {

            _events.changeTab(evt, tabs);
        });

        cb(tabs);
    };

    Tabs.prototype.changeTab = function(index) {

        var tabs = this;

        _priv.changeTab(tabs, index);
    };

    window.$.fn.tabs = function (options, callback) {

        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        return this.each(function () {

            new Tabs(this, options).init(function(tabsConfig) {

                if (window.emp) {

                    if (!emp.reference.tabs) {
                        emp.reference.tabs = {};
                    }

                    emp.reference.tabs[tabsConfig.id] = tabsConfig;
                }

                tabsConfig.$self.trigger('setup.table');

                if (typeof callback === "function") {

                    callback(tableConfig);
                }

            });

        });
    };

});
