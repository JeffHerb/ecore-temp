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
    var drawCounties = function() {

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
            },
            click: function _onClick(evt, d, dShape) {

                console.log(d);

                if (d.properties.NAME === "Albany") {

                    console.log(window.location);

                    var curPath = window.location.href;

                    window.location = curPath.replace('map.html', 'map2.html');

                }
                else {

                    console.log("Ah, ah ah. You didnt say the magic word!")

                }

            }
        }

        _priv.d3Draw.drawMap('counties', oMetaSize, '#nys-counties', oInteractions );
    };

    var init = function _init() {

        // Load the actual D3 library
        cui.load('d3draw', function(d3Draw) {

            _priv.d3Draw = new d3Draw();
            _priv.bInit = true;

            // State outline map
            dMapContainer = document.querySelector('#nys-counties');

            dMapCountiesContainer = document.querySelector('#counties-map');

            _priv.d3Draw.loadMaps(['counties'], function() {

                drawCounties();

            });

        });

    };

    return {
        init: init
    };

});