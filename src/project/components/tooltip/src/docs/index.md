# Tooltips

## Overview

The tooltip plugin displays HTML in a container that overlays the page near. It is triggered by clicking on a button or other UI element and the container is positioned near the element. The tooltip can be displayed and hidden at will.

Note that the tooltip plugin is an extension of the [popover plugin](../popover/) and supports the same settings and methods.

## Usage

It is recommended that the plugin is invoked on a link that points to an element containing the tooltip's contents. For example, you would invoke the plugin on `<a href="#help-item-1">` and the tooltip would display the contents of `<div id="help-item-1">`. For other usage patterns you must use the [options](#options) object to pass in the content.

### Simple

The plugin must be provided with an options object and a jQuery collection of elements.

```js
$('#my-button').tooltip(options);
```

Clicking `#my-button` will toggle display of the tooltip.

To show or close a tooltip programmatically, trigger a `click` event on the element:

```js
$('#my-button').click();
```

### Advanced

You may store a reference to the tooltip instance by invoking the plugin this way:

```js
var myTooltip = $.tooltip($('#my-button'), options);
```

The above example will 'link' the tooltip to the element described by `$('#my-button')`.

To show, hide, (re)position, or destroy a tooltip programmatically, use the same [methods available to popovers](../popover/#advanced):

```js
myTooltip.show();
myTooltip.hide();
myTooltip.position();
myTooltip.destroy();
```

You may also refer to additional properties and elements:

```js
myTooltip.$tooltip // The tooltip container element, as a jQuery collection
myTooltip.$link    // The element that will toggle the tooltip when clicked, as a jQuery collection
myTooltip.popover  // The popover plugin instance that is associated with the tooltip
```

Many [additional properties](../popover/#advanced) are found in the `myTooltip.popover` object.

## Options

Follow the guidelines for the [popover options](../popover/#options). One exception is that you do not need to define the `html` property if your link points to an existing element on the page.

See also [display options](../popover/#display-options) and [location options](../popover/#location-options).

## Example

**HTML**:

```html
<label for="dob">Date of birth</label>
<input type="text" id="dob">
<!-- Link which displays the tooltip: -->
<a href="#help-dob" class="help">Help</a>
<!-- ... -->
<!-- Tooltip contents: -->
<!-- This should be hidden once the tooltip successfully initializes -->
<div id="help-dob">Enter the date in MM/DD/YYYY format</div>
```

**JavaScript**:

```js
$('.help').tooltip();
```

## Specifications

Clicking outside of an open tooltip will close it.

Only one tooltip may be open at a time. If a tooltip is open when a second tooltip is triggered, the first tooltip is closed before opening the second tooltip.

The tooltip container has the class `.feta-tooltip`.
