# Preferences

User preferences are structured as JSON object which is stored by Framework and applied to the page by UI.

The preferences are represented by two objects: global preferences, which apply to all pages in all tabsets; and tabset preferences, which apply only to the current tabset.

## Usage

An instance of the preferences component is exposed as `emp.prefs`.

The following methods may be used to get and set individual preference properties:

```js
emp.prefs.setGlobal(propertyName, value); // Save a global preference
emp.prefs.getGlobal(propertyName); // Retrieve alobal preference

emp.prefs.setPage(propertyName, value); // Save a abset preference
emp.prefs.getPage(propertyName); // Retrieve a tabset preference
```

Successful calls to `getGlobal()` and `getPage()` will return the property's value. Unsuccessful calls will return `null` and an error will be written to the [journal](../journal/).

Successful calls to `setGlobal()` and `setPage()` will return the updated preference object. Unsuccessful calls will return `null` and an error will be written to the [journal](../journal/).

### Sub-properties

If you are trying to access a top-level propery, such as font size, send the name of the propery:

```js
emp.prefs.getGlobal('fontSize'); // Returns the font size value
```

To access a sub-property, use dot notation to create a "path" to the property:

```js
emp.prefs.getPage('tables.MyTableID.columns.visible'); // Returns the `visible` array for the table with the ID `MyTableID` on the current page
```

## Available options

The following preferences are supported:

**Global**

- Font size
- Visual theme (this includes a high contrast option)
- Whether the tabset menu is pinned open

**Tabset-specific**

- The list of visible columns for each table on each page, if they have been customized

### Global settings

The preferences object contains the following properties

Name | Description | Possible values | Default value
-----|-------------|-----------------|--------------
`fontSize` | Font size in pixels for informational text (labels, data, table data, etc). Other UI elements, such has headers, may use different sizes which are usually kept in proportion to the `fontSize` value. | `8..32` | `14`
`theme` | Name of a skin that defines the general look and feel. Usually this is a color scheme or high contrast theme. | *String* | `'teal'`
`tabsetPinned` | Whether the tabset menu is pinned open | *Boolean* | `false`
`page` | Specific settings for the current page | *Object* | *[See page settings below](#page-settings)*

### Page settings

The `page` object contains user settings specific to pages under the current tabset. It can contain the following properties:

Name | Description | Possible values | Default value
-----|-------------|-----------------|--------------
`tables` | Object containing table sub-objects with specific settings | *Object* | *[See table settings below](#table-settings)*

```json
"page": {
    "ABC123": { // Screen ID
        "tables": { ... },
    }
}
```

#### Table settings

The `tables` object contains sub-objects with the following properties. The table's ID serves as the sub-object's property name.

Name | Description | Possible values
-----|-------------|----------------
`columns` | An object containing arrays of columns that are `visible` and `hidden`. Each of those arrays contains integers representing the columns' indices. | *Object*

```json
"page": {
    "ABC123": {
        "tables": {
            "table1": { // Table ID
                "columns": {
                    "visible": [1, 2, 4],
                    "hidden": [3, 5]
                }
            },
            "table2": { // Table ID
                "columns": {
                    "visible": [1, 2, 3, 4, 5],
                    "hidden": []
                }
            }
        },
    }
}
```

## User interface

A modal dialog will present the user with all of the customizable preferences.

## Framework notes

User preferences are represented by JSON objects. They are applied to each page at runtime via JavaScript maintained by the UI team. The JSON objects are updated and stored on the server whenever the user makes a change. Every user has the global preferences object even if they have not customized Empire at all.

The global preferences object is assigned to `fwData.globalPrefs` and the tabset-specific preferences object is assigned to `fwData.tabsetPrefs`. The objects are available immediately on page load.

The objects' structures and content are validated and maintained by UI. UI may add, remove, or change features in the future; Framework should store and retrieve JSON from the database as-is.

In both objects, Framework must provide the URL used for ajax updates as well as a Unix timestamp of when the object was last updated:

```json
var fwData = {
    "globalPrefs": {
        "data": { ... },
        "url": {
            "update": "https://example.com/setGlobalPreferences"
        },
        "timestamp": 1404802877
    },
    "tabsetPrefs": {
        "data": { ... },
        "url": {
            "update": "https://example.com/setTabsetPreferences"
        },
        "timestamp": 1405053884
    },
    ...
};
```

### How UI updates the preferences data

The global and tabset preferences are updated via ajax using separate endpoints. The actual requests will be sent using POST but are shown below in the GET format for clarity.

UI will send the entire JSON object. For example, even if the user changes only the font size, the ajax request will contain the entire global preferences object.

#### Global preferences request

*Request:*

```
https://example.com/setGlobalPreferences?data=JSON_STRING&ts=1404802877
```

where `JSON_STRING` is a stringified JSON object. The structure of the object will be identical to the one rendered in `fwData.globalPrefs`, however Framework should store `data` as-is.

#### Tabset-specific preferences request

*Request:*

```
https://example.com/setTabsetPreferences?data=JSON_STRING&ts=1405053884&tabseId=ABC123
```

where `ABC123` is the tabset ID and `JSON_STRING` is a stringified JSON object. The structure of the object will be identical to the one rendered in `fwData.tabsetPrefs`, however Framework should store `data` as-is.

#### Responses

For both types of requests, if the update was successful the HTTP code should be `200` and the body should be a JSON object:

```js
{
    "result": "success"
}
```

Failures should use the applicable HTTP codes (`403`, `500`, etc) and should include a JSON object in the body where possibe:

```js
{
    "result": "failure"
}
```

In the future, the value of `"result"` may become more specific (e.g. "malformed request body"). Other items may be added to the response object, such as user-facing messages.

## Examples

The **global preferences** object below has the minimum amount of information and contains default values. This is what would be generated for a new user or a user who has not yet set any preferences.

```json
var fwData = {
    "globalPrefs": {
        "data": {
            "fontSize": 14,
            "tabsetPinned": false,
            "theme": "teal"
        },
        "url": {
            "update": "https://example.com/setGlobalPreferences"
        },
        "timestamp": 1404802877
    },
    ...
};
```

By default, **tabset-specific preferences** would be represented by a simple object:

```json
var fwData = {
    "tabsetPrefs": {
        "data": { ... },
        "url": {
            "update": "https://example.com/setTabsetPreferences"
        },
        "timestamp": 1405053884
    },
    ...
};
```

This example has global customizations for font size and tabset pinning, and page-specific settings for two tables:

```json
var fwData = {
    "globalPrefs": {
        "data": {
            "fontSize": 16,
            "tabsetPinned": true,
            "theme": "teal"
        },
        "url": {
            "update": "https://example.com/setGlobalPreferences"
        },
        "timestamp": 1404802877
    },
    "tabsetPrefs": {
        "data": {
            "pages": {
                "CM0060S": {
                    "tables": {
                        "liabilityPeriods": {
                            "columns" {
                                "visible": [1, 2, 4, 7, 8],
                                "hidden": [3, 5, 6]
                            }
                        },
                        "compositionDetails": {
                            "columns" {
                                "visible": [3, 4, 6, 7, 8, 9],
                                "hidden": [1, 2, 5]
                            }
                        }
                    }
                }
            }
        },
        "url": {
            "update": "https://example.com/setGlobalPreferences"
        },
        "timestamp": 1405053884
    },
    ...
};
```

### Conversion from Empire 1

All user preferences from Empire 1 are retained in Empire 2. Use the following chart to "translate" settings between the two environments.

Empire 1 preference | Empire 2 property and value
--------------------|----------------------------
**Font Size** | *The corresponding pixel values are different*
"Large" (13px) | `fontSize: 18`
"Medium" (12px) | `fontSize: 16`
"Optimal (Default)" (11px) | `fontSize: 14`
"Small" (10px) | `fontSize: 12`
**Page Colors** | *These are now "themes"*
"Blue (Default)" | `theme: "teal"`
"Brown" | `theme: "hazel"`
"Green" | `theme: "lilypad"`
**Page Contrast** | *Contrasts are now considered themes just like any other skin*
"Low (Default)" | `theme: "teal"` (or replace `teal` with their page color)
"High" | `theme: "contrast"`
"GrayScale" | `theme: "contrast"`
**Accessibility options** | This section can be ignored. Those enhancements are baked into Empire 2 for all users so there's no need for a user preference.
"Enable accessibility features for screen readers" | *n/a*

## Additional framework requirements

This component relies on the following properties to be specified in the `fwData` object:

```js
var fwData = {
    "tabset": {
        "id": "CMTEST01", // ID of the current tabset
        "url": "\/empr2-amp\/gateway\/CMTEST01.tabset\/CM0060S", // URL of the current tabset
        "name": "Employee Maintenance", // Tabset title, unabbreviated
    },
    "screen": {
        "id": "CM0060S", // ID of the current screen
    }
};
```
