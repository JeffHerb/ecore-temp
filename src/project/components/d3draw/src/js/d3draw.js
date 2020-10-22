// The d3 library needs to be custom build from source in the AMD output format to get it to work!
define(['d3', 'topoClient'], function(d3, topojson) {

    var _priv = {
        bInit: false,
        oLoadedMaps: {}
    };

    var dMainScript = document.querySelector('script#require');

    var sMainScriptPath = dMainScript.getAttribute('src');

    // Get Script 
    var sScriptRootPaths = sMainScriptPath.split('/main.js?')[0] + "/scripts/_map";

    var d3Draw = function() {
        return this;
    };

    d3Draw.prototype.loadMap = function _d3Draw_load_map(sMapName, bPrefix, fCB) {



        var sMapFullName = null;

        if (bPrefix) {
            sMapFullName = "_nys_" + sMapName;
        }
        else {

            sMapFullName = "_" + sMapName;
        }

        var sLoadMapPath = sScriptRootPaths + sMapFullName;

        console.log("Loading: " + sLoadMapPath);

        if (!_priv.oLoadedMaps[sMapName]) {
            
            cui.load(sLoadMapPath, function(oMap) {

                // Store the map in a usable area
                _priv.oLoadedMaps[sMapName] = oMap;

                fCB(sMapName); 
            });

        }
        else {

            fCB(sMapName);
        }

    };

    d3Draw.prototype.drawMap = function _d3Draw_load_map(sOutline, sMapName, oMeta, sTargetID, fCB) {

        if (_priv.oLoadedMaps[sMapName]) {

            var iWidth = oMeta.iWidth || 800;
            var iHeight = oMeta.iHeight || 600;

            console.log(d3);
            console.log(_priv.oLoadedMaps);
            console.log("Draw Map Called!");
            console.log("<<<< ======================================== >>>>");

            var dSVG = d3
                .select("#emp-map")
                .append("svg")
                .attr("width", iWidth)
                .attr("height", iHeight)
            
            var dG = dSVG.append("g");

            console.log("New York State Outline");

            console.log("Raw Load");
            console.log(_priv.oLoadedMaps['state']);

            // Get the proper object outline
            var outlineObjectName = Object.keys(_priv.oLoadedMaps['state'].objects)[0];

            var outlineData = topojson.feature(_priv.oLoadedMaps['state'], _priv.oLoadedMaps['state'].objects[outlineObjectName]).features;

            console.log(outlineData);

            var projection = d3.geoMercator();
            var path = d3.geoPath().projection(null);
            var bounds = path.bounds(_priv.oLoadedMaps['state']);

            console.log(bounds);

            console.log(dG);

            dG.selectAll("path").data(outlineData).enter().append("path")
                .attr("d", path)
                .style("fill", "none")
                .style("stroke", "black");

        }
        else {

            console.log(_priv.oLoadedMaps);

            journal.log({ type: 'error', owner: 'UI', module: 'd3Draw', submodule: '', func: 'drawMap' }, 'Requested Map Topo "' + sMapName + '" is not loaded.');

        }

    };

    return d3Draw;

    // var dMap = document.querySelector('#emp-map');

    // const dSVG = d3
    //     .select("#emp-map")
    //     .append("svg")
    //     .attr("width", iWidth + oMargin.iLeft + oMargin.iRight)
    //     .attr("height", iHeight + oMargin.iTop + oMargin.iBottom)
    //     .append("g")
    //     .attr("transform", `translate(${oMargin.iLeft}, ${oMargin.iTop})`);

    // var projection =    d3.geoAlbersUsa();
    // var path =          d3.geoPath(projection);
    // var color =         d3.scaleSequential(d3.interpolateBlues);

    // d3.json("https://cdn.jsdelivr.net/npm/us-atlas/states-10m.json").then((us) => {
    //   const states = topojson.feature(us, us.objects.states).features;
    //   const nation = topojson.feature(us, us.objects.nation).features[0];

    //   // scale to fit bounds
    //   projection.fitSize([iWidth, iHeight], nation);

    //   const data = states.map((feature) => ({
    //     feature: feature,
    //     name: feature.properties.name,
    //     value: Math.random(), // random value
    //   }));

    //   const paths = dSVG
    //     .selectAll("path")
    //     .data(data)
    //     .join((enter) => {
    //       const p = enter.append("path");
    //       p.on("mouseenter", function () {
    //         // move the SVG element after all other elements to be on the top
    //         d3.select(this).raise();
    //       });
    //       p.append("title");
    //       return p;
    //     })
    //     .attr("d", (d) => path(d.feature))
    //     .style("fill", (d) => color(d.value));
    //   paths.select("title").text((d) => d.name);
    // });

});
