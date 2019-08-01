# Favorites

User favorites are structured as a JSON object which is stored by Framework and displayed and managed by UI.

The favorites data is contained in the `fwData.favorites` object. It contains a `tabsets` property which lists the bookmarks and folders. The `tabsets` array contains a child object for each bookmarked tabset and folder.

Note that there may only be one level of folders. That is, a folder cannot contain further folders.

## Usage

Favorites are normally maintained via the user interface. A tabset may be added programmatically by calling `$.favorites().add()` and specifying the tabset ID, URL, name, and display label:

```js
$.favorites().add(tabsetId, url, name, label);
```

All arguments are strings. `label` may be omitted, in which case the value of `name` will be used for the label. The function will return the updated `favorites` object if the operation was successful, or `false` along with a console log if it failed.

## Object structure

### Bookmark object

Name | Type | Description
-----|------|------------
`id` | String | Tabset ID
`url` | String | Tabset URL
`name` | String | Tabset name
`label` | String | User-specified name for the tabset. This is used for display purposes only. It is optional and will be populated with the value of `name` if it is not specified.
`parent` | String | ID of the parent tabset
`seqno` | Number | Order of the bookmark within the tabset (for Framework use)

### Folder object

Name | Type | Description
-----|------|------------
`id` | String | Folder ID
`label` | String | Folder display name
`tabsets` | Array | A list of bookmark objects
`seqno` | Number | Order of the bookmark within the tabset (for Framework use)

### Examples

Example with three tabsets and no folders:

```json
{
    "favorites": {
        "tabsets": [
            {
                "id": "CPERSI01",
                "url":  "CPERSI01.gateway?jadeAction=TB0822N_BUSINESS_SUMMARY_RETRIEVE_ACTION&amp;fwFromNav=Y",
                "name": "Individual Taxpayer Profile Inquiry",
                "label": "Individual Taxpayer Profile Inquiry",
                "seqno": 1
            },
            {
                "id": "CBUSII01",
                "url":  "CBUSII01.gateway?jadeAction=TB0110N_BUSINESS_TP_PROFILE_RETRIEVE_ACTION&amp;fwFromNav=Y",
                "name": "Business Profile Inquiry",
                "label": "Business Profile Inquiry",
                "seqno": 2
            },
            {
                "id": "SEDMSI01",
                "url":  "SEDMSI01.gateway?jadeAction=NDD181S1_RETRIEVE_DOCUMENT_SEARCH_RESULTS&amp;fwFromNav=Y",
                "name": "EDMS",
                "label": "EDMS",
                "seqno": 3
            }
        ]
    }
}
```

Example with three tabsets, two of which are inside a folder:


```json
{
    "favorites": {
        "tabsets": [
            {
                "id": "ABC123",
                "url:"  "ABC123.gateway?fwFromNav=Y",
                "name": "Accounting General",
                "label": "Accounting General",
                "seqno": 1
            },
            {
                "id": "folder1",
                "label": "Inquiry",
                "tabsets": [
                    {
                        "id": "CPERSI01",
                        "url:"  "CPERSI01.gateway?jadeAction=TB0822N_BUSINESS_SUMMARY_RETRIEVE_ACTION&amp;fwFromNav=Y",
                        "name": "Individual Taxpayer Profile Inquiry",
                        "label": "Individual TP",
                        "seqno": 1
                    },
                    {
                        "id": "CBUSII01",
                        "url:"  "CBUSII01.gateway?jadeAction=TB0110N_BUSINESS_TP_PROFILE_RETRIEVE_ACTION&amp;fwFromNav=Y",
                        "name": "Business Profile Inquiry",
                        "label": "Business Profile",
                        "seqno": 2
                    }
                ],
                "seqno": 2
            },
            {
                "id": "SRCHS01",
                "url:"  "SRCHS01.gateway?fwFromNav=Y",
                "name": "Search on Account",
                "label": "Search on Account",
                "seqno": 3
            }
        ]
    }
}
```

## Framework notes

Favorites are represented by a JSON object. They are applied to each page at runtime via JavaScript maintained by the UI team. The JSON object is updated and stored on the server whenever the user makes a change.

The favorites object is assigned to `fwData.favorites`. The object is available immediately on page load. The object may be omitted if the user does not have any bookmarks or folders.

The object's structure and content is validated and maintained by UI. UI may add, remove, or change features in the future; Framework should store and retrieve the JSON from the database as-is.

In both objects, Framework must provide the URL used for ajax updates as well as a Unix timestamp of when the object was last updated:

```json
var fwData = {
    "favorites": {
        "data": { ... },
        "url": {
            "update": "https://example.com/setFavorites"
        },
        "timestamp": 1404802877
    },
    ...
};
```

### Conversion from Empire 1

Below is an example of how Framework has rendered favorites in Empire 1 and how the same bookmarks would be rendered in Empire 2.

Notes:

- The Empire 1 example array contains eight items, however the first four are links that will be present elsewhere in the UI and should not be included in the favorites JSON for Empire 2. Only the last four items, `favs_1_5` through `favs_1_7_1`, are of concern.

**Empire 1**

```js
var favsArray = [
    [favs_1 = [
            ['favs_1_1'],
            ['Add Favorite...', 'PUBLIC.gateway?jadeAction=EMPIRE_LOAD_ADD_FAVORITE_ACTION&amp;fwFromNav=Y', 0]
        ],
        [
            ['favs_1_2'],
            ['Organize Favorites...', 'PUBLIC.gateway?jadeAction=EMPIRE_LOAD_ORG_FOLDERS_ACTION&amp;fwFromNav=Y', 0]
        ],
        [
            ['favs_1_3'],
            ['Preferences...', 'PUBLIC.gateway?jadeAction=EMPIRE_PREFERENCES_RETRIEVE_ACTION&amp;fwFromNav=Y', 0]
        ],
        [
            ['favs_1_4'],
            ['Update Employee List...', 'PUBLIC.gateway?jadeAction=FWRKEMLS_UPDATE_EMPLOYEE_LIST_RETRIEVE_ACTION&amp;fwFromNav=Y', 0]
        ],
        [
            ['favs_1_5'],
            ['Ind TP Inquiry', 'CPERSI01.gateway?jadeAction=TB0822N_BUSINESS_SUMMARY_RETRIEVE_ACTION&amp;fwFromNav=Y', 0]
        ],
        [
            ['favs_1_6'],
            ['Business Profile Inquiry', 'CBUSII01.gateway?jadeAction=TB0110N_BUSINESS_TP_PROFILE_RETRIEVE_ACTION&amp;fwFromNav=Y', 0]
        ],
        [
            ['favs_1_7'],
            ['My folder', '#', 1]
        ],
        [
            ['favs_1_7_1'],
            ['My custom name', 'ABC123.gateway?fwFromNav=Y', 0]
        ]
    ]
];
```

**Empire 2**

```json
{
    "favorites": {
        "tabsets": [
            {
                "id": "CPERSI01",
                "url:"  "CPERSI01.gateway?jadeAction=TB0822N_BUSINESS_SUMMARY_RETRIEVE_ACTION&amp;fwFromNav=Y",
                "name": "Individual Taxpayer Profile Inquiry",
                "label": "Ind TP Inquiry",
                "seqno": 1
            },
            {
                "id": "CBUSII01",
                "url:"  "CBUSII01.gateway?jadeAction=TB0110N_BUSINESS_TP_PROFILE_RETRIEVE_ACTION&amp;fwFromNav=Y",
                "name": "Business Profile Inquiry",
                "label": "Business Profile Inquiry",
                "seqno": 2
            },
            {
                "id": "folder1",
                "label": "My folder",
                "tabsets": [
                    {
                        "id": "ABC123",
                        "url:"  "ABC123.gateway?fwFromNav=Y",
                        "name": "Accounting General Inq",
                        "label": "My custom name",
                        "seqno": 1
                    }
                ],
                "seqno": 3
            }
        ]
    }
}
```

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
