define(['dataStore', 'processTemplates', 'handlebars', 'handlebars-templates', 'handlebars-partials','handlebars-helpers'], function(ds, procTemplates, Handlebars, templates, partial) {

    var _priv = {};

    var data = function _section_data_shiv(data, parentList) {

        // // console.log("group shiv");
        // // console.log(data, parentList);

        // if (data && data.contents && data.contents.length) {

        //     console.log("We have stuff to check!");
            
        //     console.log(data.contents);

        //     var aIGroupIndexs = [];

        //     // Loop through each data content item looking for groups
        //     for (var d = 0, dLen = data.contents.length; d < dLen; d++) {

        //         if (data.contents[d].template === "group") {

        //             // Check to see if the group needs to be inlined
        //             if (data.contents[d].style && data.contents[d].style.indexOf("inline-group") !== -1) {

        //                 aIGroupIndexs.push(d);
        //             }

        //         }

        //     }

        //     console.log("aIGroupIndexs:" + aIGroupIndexs.length);

        //     if (aIGroupIndexs.length >= 2) {

        //         aIGroupIndexs = aIGroupIndexs.reverse();

        //         var iEndIndex = null;
        //         var iStartIndex = null;

        //         var iTotalLength = aIGroupIndexs.length;

        //         for (var a = 0, aLen = iTotalLength; a < aLen; a++) {

        //             if (iEndIndex === null) {
        //                 iEndIndex = aIGroupIndexs[a];
        //             }

        //             console.log((a + 1) + " <= " + iTotalLength);

        //             if ((a + 1) <= iTotalLength) {

        //                 if (iStartIndex === null) {

        //                     if ((iEndIndex - 1) === aIGroupIndexs[a + 1]) {

        //                         iStartIndex = aIGroupIndexs[a + 1];
        //                     }
        //                     else {

        //                         // Just null out end index, this group is a solo
        //                         iEndIndex = null;
        //                     }

        //                 }
        //                 else {

        //                     if ((iStartIndex - 1) === aIGroupIndexs[a + 1]) {

        //                         // Need to update the start index, the group contains more inline
        //                         iStartIndex = aIGroupIndexs[a + 1];
        //                     }
        //                     else {

        //                     }

        //                 }

        //             }
        //             else {

        //                 console.log("We are on the last index");
        //             }

        //         }


        //     }

        // }


        return data;
    };


    return {
        'data': data
    };

});
