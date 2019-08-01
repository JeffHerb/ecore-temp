// Returns the cursor position within an input field
// http://stackoverflow.com/a/2897510/348995
(function ($) {
    $.fn.getCursorPosition = function _getCursorPosition () {
        var input = this.get(0);
        var sel;
        var selLength;

        if (!input) {
            return;
        }

        // Standards-compliant browsers
        if ('selectionStart' in input) {
            return input.selectionStart;
        }
        // IE <9
        else if (document.selection) {
            input.focus();
            sel = document.selection.createRange();
            selLength = document.selection.createRange().text.length;
            sel.moveStart('character', -input.value.length);
            return sel.text.length - selLength;
        }
    };
}(jQuery));
