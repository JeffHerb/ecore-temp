# Analytics

## Setup

Call `analytics.init()` once to inject the Google Analytics tracking library. (This is already done in the `feta` component.)

Note that tracking data will only be sent to Google's servers when this component is running on a web server with a `.gov` domain. For local testing, a custom debug version of `window.ga()` is defined and event tracking is logged to the console.

## Event tracking

Call `analytics.trackEvent()` to [event tracking](https://developers.google.com/analytics/devguides/collection/analyticsjs/events). This may be called at any time&nbsp;tracking requests made before calling `.init()` or before the Google Analytics library has loaded will be queued and processed once the library is ready.

Parameter | Type | Required | Description
----------|------|----------|------------
category | String | Yes | Name of general category
action | String | Yes | Name of action
label | String | No | Associated label
value | Number | No | Integer value
isNonInteraction | Boolean | No | Whether the event is not a user action (and should not affect the Bounce Rate). This is useful for tracking e.g. how many times a component is successfully loaded or gathering diagnostic info about the client.

Examples:

```js
analytics.trackEvent('footer', 'Link click', linkElement.textContent);
analytics.trackEvent('tablerows', 'Expand all rows');
analytics.trackEvent('tooltip', 'Open', feta.pageInfo.appCode + '|' + tooltipId);
analytics.trackEvent('removeitem', 'Confirm dialog declined', feta.pageInfo.appCode + '|' + feta.pageInfo.pageTitle + '|', confirmDialogDisplayText);
```

### Category

The name of the category must exactly match a pre-approved name. This ensures consistency and prevents the GA logs from becoming cluttered due to typos (e.g. `calendar` and `Calendar` are considered different categories by Google because it is case sensitive).

Acceptable category names:

**Diagnostics**
- `client` (for device-related info)
- `app` (for app- and page-related info)

**User actions**
- `banner`
- `footer`
- `extlink` (clicking a link external to the app [not necessarily external to DTF])
- `intlink` (clicking an internal link)
- `tooltip`
- `datepicker`
- `removeitem` (i.e. for removing a row from a table)
- `tablerows` (for expandable table rows)
