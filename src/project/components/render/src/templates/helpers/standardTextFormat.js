Handlebars.registerHelper('standardTextFormat', function(context, options){
	if (typeof context === "string") {
    	
    	var replaceMultiSpace = true;
        var newString = context;

        var data = options.data.root;

        // Detect if this is an element that should preserve spaces as is
        if(data && data.type && data.type == "textarea"){
        	replaceMultiSpace = false;
        }

        newString = newString.trim().replace(/\n/g, '<br>').trim();        

        if(replaceMultiSpace){
        	var multispaceCheck = /[^\s]([ ]{2,})[^\s]/g

        	// Detect if there are any occurances of two or more spaces
	        var spaceCaptureGroup = context.match(multispaceCheck);

	        if (spaceCaptureGroup) {
	        	//Replace the all paired spaces
	            newString = newString.replace(/\s\s/g, '&nbsp&nbsp');

	            //Replace trailing single spaces if they exist.
	            newString = newString.replace(/&nbsp\s/g, '&nbsp&nbsp');
	        }	
        }

        return newString;

    } else {

        return context;
    }

});
