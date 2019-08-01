# Badge

## Overview

The badge plugin displays an indication of new or unread items superimposed over an element. Usually the badge is attached to a clickable element. The badge may display a value, e.g. a count of unread messages.

## Usage

Create a badge instance by passing an element and an [options](#options) object to `$.badge()`:

```js
var myBadge = $.badge($('.my-button'), {value: 4});
```

The above example will display the badge showing the number '4' on top of the element described by `$('.my-button')`. It will define `myBadge` as the newly-created instance which may be manipulated throughout the life of the page.

### Changing the value

There are three methods that can change the displayed value:

```js
myBadge.set(4); // Directly set the value to 4
myBadge.increment(); // Increase the current value by 1 (only supports numbers and single letters unless a custom increment function is provided, see below)
myBadge.decrement(); // Decrease the current value by 1 (only supports numbers and single letters unless a custom decrement function is provided, see below)
```

### Other methods and properties

To reposition or destroy a badge programmatically, use these methods:

```js
myBadge.position();
myBadge.destroy();
```

You may also refer to additional properties and elements:

```js
myBadge.$badge   // The badge container element, as a jQuery collection
myBadge.$target  // The element over which the the badge is displayed, as a jQuery collection
myBadge.isOpen   // Whether the badge is currently displayed (Boolean)
```

## Options

Property | Type | Description
--- | --- | ---
`html` | String | Contents to be displayed (required)
`display` | Object | Defines the display properties of the badge. See [display options](#display-options) below.
`location` | String | Describes where the badge should be positioned, relative to its button. The default value is `'above-right'`. See [location options](#location-options) below.
`increment` | Function | A user-supplied function which will return an incremented value to be displayed in the badge. [See below](#custom-incremement-and-decrement-functions).
`decrement` | Function | A user-supplied function which will return a decremented value to be displayed in the badge. [See below](#custom-incremement-and-decrement-functions).

### Display options

Property | Type | Description
--- | --- | ---
`css` | Object | A jQuery-style object of CSS properties and values to be applied to the badge container
`className` | String | Optional class name(s) to be added to the badge

### Location options

The location value is treated as a request rather than a mandate &mdash; that is, if the badge will not fit it in the desired location without being clipped by the browser window, the plugin will find a suitable alternative location. These fallbacks are listed below.

The terms `left` and `right` refer to the direction the badge will be facing. The opposite edge of the badge will be aligned with the button that toggles the badge. For example, the default location `below-right` will extend the badge to the *right* of the button, but the badge's *left* edge will be aligned with the button's left edge.

```
  ┌────────┐
  │ Button │
  └────────┘
  ┌─────────────────────────────────────┐
  | badge with 'below-right' location   |
  └─────────────────────────────────────┘
```

The term `center` means that the badge will be horizontally centered with its button, and `inline` means the badge will be vertically centered with its button.

Note that if your badge is wider than the browser window, the right side of the badge will be clipped from view. Be sure to style your badge such that elements will flow and wrap to avoid being too wide.

#### Acceptable location values

- `below-left`
    + Fallback: When clipped by the left edge of the window, the badge will shift to the right just enough to keep from being clipped by the browser window.
- `below-right`
    + Fallback: When clipped by the right edge of the window, it will shift to the left just enough to keep from being clipped by the browser window.
- `below-center`
    + Fallback: When clipped by the left edge of the window, it will shift right just enough to remain in view. When clipped by the right edge of the window, it will switch to `below-right`.
- `above-left`
    + Fallback: When clipped by the top of the window, it will switch to `below-left`. When clipped by the left edge of the window, it will shift right just enough to remain in view.
- `above-right`
    + Fallback: When clipped by the right edge of the window, it will shift left just enough to remain in view. When clipped by the top edge of the window, it will switch to `below-right`.
- `above-center`
    + Fallback: When clipped by the top of the window, it will switch to `below-center`. When clipped by the left, it will shift right just enough to remain in view. When clipped by the right, it will shift left just enough to remain in view.
- `inline-left`
    + Fallback: When clipped by the left edge of the window it will switch to `below-left`.
- `inline-right`
    + Fallback: When clipped by the right edge of the window it will switch to `below-right`.

## Example with default values

```js
$('.my-button').badge({
    value: 0,
    display: {
        css: {},
        className: '',
        offset: {
            top: 0,
            left: 0
        }
    },
    location: 'above-right',
    increment: null,
    decrement: null
});
```

## Incremement and decrement functions

By default, you may call `myBadge.increment()` and `myBadge.decrement()` to increase and decrease the badge's value as long as the value is a number or a single letter.

### Options and callback

You may supply these functions with an options object and/or a callback function. If you supply both, the options must come first.

The **options** object will be passed along to your custom increment and decrement functions. You may include any data you wish in addition to the following supported properties:

Property | Type | Description
--- | --- | ---
`animate` | Boolean | Whether to animate the badge when its value changes. The default is `true`. You should only set this to `false` if the badge is updating based on a direct user action, for example when the user clicks a button that will intuitively affect the badge's value.

The **callback** function will be called after the incrementation/decrementation has taken place. It will receive the badge instance as a parameter.

### Custom incremement and decrement functions

If you are displaying other types of values, or you would like more control over what it means to increment or decrement the value, you may specify your own functions.

Your function should **return** the new value as a string or number. If you return something else (e.g. `undefined`, empty string, etc) the badge will become hidden.

Your function will be **provided with** the following parameters:

- The current value. This parameter's type will match what you supplied when you initiated the plugin with `{value: yourValue}` or the result of the last call to your custom increment/decrement function.
- The instance of the plugin. This includes a variety of information, notably your settings (under `badge.config`) and the other properties listed above in the [usage section](#other-methods-and-properties).
- An options object that was passed (by you) to the public function `myBadge.increment()`

## Specifications

Only one badge may be displayed at a time on a given element. If a badge is present when a second badge is initialized, the first badge is removed before creating the second badge on that element.

The badge container has the class `.cui-badge`.
