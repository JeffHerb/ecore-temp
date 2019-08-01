define([], function() {

    var _events = {};

    _events.staticToggle = function _static_toggle(evt) {

        evt.stopPropagation();

        var targetControl = evt.target;
        var canContinue = true;

        while(true) {

            if (targetControl.nodeType === 1) {

                if (targetControl.nodeName === "BODY") {
                    canContinue = false;
                    break;
                }

                if (targetControl.classList.contains("emp-expanding-control")) {
                    break;
                }
                else {
                    targetControl = targetControl.parentNode;
                }
                
                break;
            }
            else {

                targetControl = targetControl.parentNode;
            }

        }

        if (targetControl.classList.contains('emp-collapse-children')) {
            targetControl.classList.remove('emp-collapse-children');
        }
        else{
            targetControl.classList.add('emp-collapse-children');
        }

    };

    var StaticTree = function _staticTree(dStaticTree) {

        this.self = dStaticTree;

        this.self.addEventListener('click', function(evt) {
            _events.staticToggle(evt);
        });
    };

    var init = function _tree_init() {
        
        dStaticTrees = document.querySelectorAll('.emp-static-tree.emp-tree-root');

        for (var dST = 0, dSTLen = dStaticTrees.length; dST < dSTLen; dST++) {

            var dStaticTree = dStaticTrees[dST];

            if (dStaticTree.nodeType === 1) {

                var staticTreeRef = new StaticTree(dStaticTree);
            } 

        }

    };

    return {
        init: init
    };

});