Handlebars.registerHelper('tableIter', function(context, options) {

  var ret = "";

  var hash = options.hash

  var limit = ((hash.limit) ? hash.limit : 50) - 1;

  var start = (hash.start) ? hash.start : 0;

  if (options.data) {
    data = Handlebars.createFrame(options.data);
  }

  var rendered = 0;

  for(var i=start, j=context.length; i<j; i++) {

    // Index of the row we are on
    data.index = i;

    // Reference to the limit provided
    data.limit = limit;

    data.rendered = rendered;

    // Check to see if this is a usable column.
    if (!context[i].skip || context[i].skip === false) {

      // Render this row
      ret = ret + options.fn(context[i], { data: data });

      // Increment render
      rendered++;

    }

  }

  return ret;
});
