define([], function() {

    var nameSearchButton = function() {

        var $pageMode = $('.emp-page-title h2 span');

        var mode = false;

        if ($pageMode.length) {

            mode = $pageMode.text().trim();
        }

        // Veryify mode and that it has the word search
        if (mode && mode.indexOf("Search") !== -1) {

            $form = $('main form').eq(0);

            var results = emp.validate.form($form[0]);

            return results;
        }
        else {

            journal.log({type: 'error', owner: 'UI', module: 'pageScript', submodule: 'nameSearchButton'}, 'This is not a valid search page!');

            return false;
        }

    };

    return {
        nameSearchButton: nameSearchButton
    };

});
