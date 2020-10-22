define([], function() {

    var _priv = {
        dMapContainer: false,
        bInit: false,
        d3Draw: false,
        loadedMapes: {}
    };

    /// Page Script function to request the appropriate mapes to load as its page buisness logic
    var loadMap = function(sMap, fCB) {

        if (!_priv.loadedMapes[sMap]) {

            cui.load(_priv.d3Draw.loadMap(sMap), fCB());

        }
        else {

            fCB();
        }

    };

    var drawCounties = function() {

        var oMetaSize = {
            iWidth: 900,
            iHeight: 600,
            oMargin: {
                iTop: 10,
                iLeft: 10,
                iRight: 10,
                iBottom: 10
            }
        };

        _priv.d3Draw.drawMap('outline', 'counties', oMetaSize, '#emp-map', function(bResult) {
            console.log("Drawing!");
        });
    };

    var init = function _init() {

        // Load the actual D3 library
        cui.load('d3draw', function(d3Draw) {

            _priv.d3Draw = new d3Draw();
            _priv.bInit = true;

            dMapContainer = document.querySelector('#emp-map');

            // Load the state outline map
            _priv.d3Draw.loadMap('state', true, function() {

                // Load the counties shapes
                _priv.d3Draw.loadMap('counties', true, function() {

                    drawCounties();

                });

            });

        });

    };

    return {
        init: init
    };

});