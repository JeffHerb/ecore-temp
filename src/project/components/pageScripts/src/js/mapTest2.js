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

    // Example function creating the counties map
    var drawCounty = function() {

        var oMetaSize = {
            iWidth: 640,
            iHeight: 480,
            oMargin: {
                iTop: 10,
                iLeft: 10,
                iRight: 10,
                iBottom: 10
            }
        };

        var oInteractions = {
            mouseover: function _onMouseOver(evt, d, dShape) {

                dShape.transition()
                .duration(200)
                .style("fill", "#09464c");
            },
            mouseleave: function _onMouseLeave(evt, d, dShape) {

                dShape.transition()
                .duration(200)
                .style("fill", "#FFF");
            }
        }

        _priv.d3Draw.drawMap('albany_county', oMetaSize, '#nys-counties', oInteractions );
    };

    var init = function _init() {

        // Load the actual D3 library
        cui.load('d3draw', function(d3Draw) {

            _priv.d3Draw = new d3Draw();
            _priv.bInit = true;

            // State outline map
            dMapContainer = document.querySelector('#nys-counties');

            dMapCountiesContainer = document.querySelector('#counties-map');

            _priv.d3Draw.loadMaps(['albany_county'], function() {


                drawCounty();

            });

        });

    };

    return {
        init: init
    };

});