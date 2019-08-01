define(['guid'], function (guid) {

    var CLASSES = {
        hover: "emp-hover-star"
    };

    // Private method namespace
    var _priv = {};

    _priv.findHover = function _find_stars_on_hover(rating, $currentStar) {

        // Get the current and previous stars
        $currentRatingStars = $currentStar.prevAll().andSelf();
        $remainingStars = $currentStar.nextAll();

        // Setup the hover tracking object
        if (!rating.hover) {

            rating.hover = {};
        }

        rating.hover.$currentStar = $currentStar;
        rating.hover.$currentRatingStars = $currentRatingStars;
        rating.hover.$reamingStars = $remainingStars;

        fastdom.mutate(function() {

            $currentRatingStars.addClass(CLASSES.hover);
            $remainingStars.removeClass(CLASSES.hover);

        });

    };

    var _events = {};

    _events.mouseenter = function _events_mouse_enter(evt) {

        // Get the rating object
        var rating = evt.data.rating;

        // Get the current hover elements
        var $currentStar = $(evt.target);

        while ($currentStar[0].tagName !== "A") {

            $currentStar = $currentStar.parent();
        }

        // Filter events if we are hovering over the same star
        if (!rating.hover || (rating.hover.$currentStar.get(0) !== $currentStar.get(0))) {

            _priv.findHover(rating, $currentStar);
        }

    };

    _events.mouseleave = function _events_mouse_leave(evt) {

        // Get the rating object
        var rating = evt.data.rating;

        var $currentElement = $(evt.target);

            fastdom.mutate(function() {

                // Flush hover tracking
                delete rating.hover;

                // Remove any hover classes as the container has been left.
                rating.$stars.removeClass(CLASSES.hover);
            });

    };

    _events.click = function _events_click(evt) {

        var rating = evt.data.rating;
        var $star = $(evt.target);

        while ($star[0].tagName !== "A") {

            $star = $star.parent();
        }

        // Get index
        var number = $star.index() + 1;

        // Update the hidden input
        rating.$hidden.val(number);

        // Get all the rating stars and the remainder.
        var $currentRatingStars = $star.prevAll().andSelf();
        var $remainingStars = $star.nextAll();

        $currentRatingStars.addClass('emp-selected-star');
        $remainingStars.removeClass('emp-selected-star');

    };

    ///////////////////
    // Public method //
    ///////////////////

    var Rating = function (elem, options) {
        // Store the element upon which the component was called
        this.elem = elem;

        // Create a jQuery version of the element
        this.$self = $(elem);

        // Save off the id
        this.id = $(elem).attr('id');

        this.options = options;
    };

    Rating.prototype.init = function _init (cb) {

        var rating = this;

        // Find all of the stars
        rating.$stars = rating.$self.children('a.emp-rating-star');

        rating.$stars.on('mouseenter', {rating: rating}, _events.mouseenter);
        rating.$stars.on('click', {rating: rating}, _events.click);
        rating.$self.on('mouseleave', {rating: rating}, _events.mouseleave);

        rating.$hidden = rating.$self.children('input');

        return rating;
    };

    // Define and Expose the table component to jQeury
    window.$.fn.rating = function (options, callback) {

        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        // Loop through all of the discovered tables
        return this.each(function () {

            var id = $(this).attr('id');

            if (!id) {
                id = guid();
            }

            new Rating(this, options).init(function(ratingConfig) {

                if (!window.emp.reference.rating) {

                    emp.reference.rating = {};
                }

                emp.reference.rating[id] = ratingConfig;

            });

        });
    };

});
