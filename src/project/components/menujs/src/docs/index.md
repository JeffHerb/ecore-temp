# MenuJS

Demos: [Empire 2](../../../dist/tests/menujs/empire.html), [generic](../../../dist/tests/menujs/generic.html)

## Usage

Call the `.menujs()` method on any jQuery collection and pass in at least one configuration object. In this example the menu will be appended to the `<div id="main-menu">` element:

```js
$('#main-menu').menujs(config);
```

Normally the menu will be initialized inside a `require()` block and lazy-loaded:

```js
cui.load('menujs', function () {
    var config = {
            display:{className:'emp'},
            items: fwData.menu
        };

    $('#emp-header-menu-main').menujs(config);
});
```

## Configuration objects

At minimum, a configuration object needs an array of item objects to display:

```js
$('#main-menu').menujs({
    items: [
        { ... },
        { ... },
        { ... }
    ]
});
```

There are other global properties that may be defined at the top level of the configuration object:

- `display` &mdash; an object that defines the menu's appearance
    + `className` &mdash; a space-separated string containing classes to be applied to the menu element
- `interaction` &mdash; an object that defines the menu's behavior
    + `activationEvent` &mdash; a string that defines which user action causes menu items to be opened and closed. Currently only `'click'` is supported.

Example with default values:

```js
$('#main-menu').menujs({
    display: {
        className: ''
    },
    interaction: {
        activationEvent: 'click'
    },
    items: []
});
```

## Item objects

Each item in the menu is represented by an object with one or more of the following properties:

Property | Type | Description
--- | --- | ---
`label` | String | Text to be displayed (not required if you use `dividerType`)
`items` | Array | A list of item objects that are children of this object
`url` | String | URL that the item should link to
tTarget` | String | The value of the `target` attribute when a `url` is provided (e.g. `_blank` to open the URL in a new window or tab)
`id` | String | ID for the item's DOM element. If the item is a tabset, this is required and the value must match the tabset's ID.
`tooltip` | String | Text to display when the user hovers over the item
`dividerType` | String | Setting this property turns the item into a visual separator. Available options are "blank" (an empty item) and "line" (draws a line between sibling items).
`jsAction` | Function | A function to be executed when the item is selected. The function will receive three arguments: the `event` object, the item object, and a jQuery collection of the item's DOM element. Note that if both `url` and `jsAction` are defined, `jsAction` will be called first.
`width` | String | A CSS-style value (e.g. `250px`) to be applied inline on the DOM element

Generally, an item becomes a "branch" by having the `items` array defined, while a "leaf" would use the other properties instead.

Note that while none of the properties are required it's highly recommended that you set `label` for branches and either `label` or `dividerType` for leaves.

Additionally, some combinations of properties are not practical. Generally a parent item will only have `items` defined. A leaf or child item will have at least one of `url` or `jsAction` and likely will not have `items`.

## Branch Item Example

This item contains two items, one of which contains a further four items.

```js
{
    label: 'Europe',
    items: [
        {
            label: 'France',
            url: 'http://www.france.fr/en.html'
        },
        {
            label: 'Germany',
            items: [
                {
                    label: 'München',
                    jsAction: function(ev, item, $item) {
                        alert('You clicked on ' + item.label);
                    }
                },
                {
                    label: 'Füssen',
                    url: 'http://www.fuessen.de'
                },
                {
                    dividerType: 'blank'
                },
                {
                    label: 'Rothenburg ob der Tauber',
                    url: 'http://www.tourismus.rothenburg.de/?id=467'
                }
            ]
        }
    ]
}
```

## Large example

```js
{
    id: 'emp-menu-main',
    display: {
        container: '#emp-menu-main',
        className: 'emp'
    },
    interaction: {
        activationEvent: 'click'
    },
    items: [
        {
            label: 'Client Information',
            items: [
                {
                    label: 'Inquire On Client',
                    items: [
                        {
                            label: 'Item 1',
                            items: [
                                {
                                    label: 'Item 1.1',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                },
                                {
                                    label: 'Long List',
                                    items: [
                                        {
                                            label: 'Item 1.2.1',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.2',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.3',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.4',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.5',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.6',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.7',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.8',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.9',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.10',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.11',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.12',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.13',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.14',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.15',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.16',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.17',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.18',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.19',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.20',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        }
                                    ]
                                },
                                {
                                    label: 'Item 1.3',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                }
                            ]
                        },
                        {
                            label: 'Item 2',
                            items: [
                                {
                                    label: 'Item 2.1',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                },
                                {
                                    label: 'Item 2.2',
                                    items: [
                                        {
                                            label: 'Item 2.2.1',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        }
                                    ]
                                },
                                {
                                    label: 'Item 2.3',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                }
                            ]
                        },
                        {
                            label: 'Item 3',
                            jsAction: function(ev, itm, $itm) {
                                demoItemClick(ev, itm, $itm);
                            }
                        }
                    ]
                },
                {
                    label: 'Maintain Client',
                    items: [
                        {
                            label: 'Item 1',
                            items: [
                                {
                                    label: 'Item 1.1',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                },
                                {
                                    label: 'Long List',
                                    items: [
                                        {
                                            label: 'Item 1.2.1',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.2',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.3',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.4',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.5',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.6',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.7',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.8',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.9',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.10',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.11',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.12',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.13',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.14',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.15',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.16',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.17',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.18',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.19',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.20',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        }
                                    ]
                                },
                                {
                                    label: 'Item 1.3',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                }
                            ]
                        },
                        {
                            label: 'Item 2',
                            items: [
                                {
                                    label: 'Item 2.1',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                },
                                {
                                    label: 'Item 2.2',
                                    items: [
                                        {
                                            label: 'Item 2.2.1',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        }
                                    ]
                                },
                                {
                                    label: 'Item 2.3',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                }
                            ]
                        },
                        {
                            label: 'Item 3',
                            jsAction: function(ev, itm, $itm) {
                                demoItemClick(ev, itm, $itm);
                            }
                        }
                    ]
                },
                {
                    label: 'Search for Client',
                    tooltip: 'Looking for a client? Try here.',
                    url: 'http://tax.ny.gov',
                    target: '_blank'
                },
                {
                    label: 'Event Management'
                },
                {
                    label: 'Inquire on Account',
                    items: [
                        {
                            label: 'Item 1',
                            items: [
                                {
                                    label: 'Item 1.1',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                },
                                {
                                    label: 'Long List',
                                    items: [
                                        {
                                            label: 'Item 1.2.1',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.2',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.3',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.4',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.5',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.6',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.7',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.8',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.9',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.10',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.11',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.12',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.13',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.14',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.15',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.16',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.17',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.18',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.19',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.20',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        }
                                    ]
                                },
                                {
                                    label: 'Item 1.3',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                }
                            ]
                        },
                        {
                            label: 'Item 2',
                            items: [
                                {
                                    label: 'Item 2.1',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                },
                                {
                                    label: 'Item 2.2',
                                    items: [
                                        {
                                            label: 'Item 2.2.1',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        }
                                    ]
                                },
                                {
                                    label: 'Item 2.3',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                }
                            ]
                        },
                        {
                            label: 'Item 3',
                            jsAction: function(ev, itm, $itm) {
                                demoItemClick(ev, itm, $itm);
                            }
                        }
                    ]
                },
                {
                    label: 'Maintain Account',
                    items: [
                        {
                            label: 'Item 1',
                            items: [
                                {
                                    label: 'Item 1.1',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                },
                                {
                                    label: 'Long List',
                                    items: [
                                        {
                                            label: 'Item 1.2.1',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.2',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.3',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.4',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.5',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.6',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.7',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.8',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.9',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.10',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.11',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.12',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.13',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.14',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.15',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.16',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.17',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.18',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.19',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.20',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        }
                                    ]
                                },
                                {
                                    label: 'Item 1.3',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                }
                            ]
                        },
                        {
                            label: 'Item 2',
                            items: [
                                {
                                    label: 'Item 2.1',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                },
                                {
                                    label: 'Item 2.2',
                                    items: [
                                        {
                                            label: 'Item 2.2.1',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        }
                                    ]
                                },
                                {
                                    label: 'Item 2.3',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                }
                            ]
                        },
                        {
                            label: 'Item 3',
                            jsAction: function(ev, itm, $itm) {
                                demoItemClick(ev, itm, $itm);
                            }
                        }
                    ]
                },
                {
                    label: 'Business Profile Inquiry'
                },
                {
                    label: 'Address Inq'
                },
                {
                    label: 'Disabled item',
                    state: 'disabled'
                },
                {
                    label: 'You should never see this and its label length should have no impact on the other items in this group',
                    dividerType: 'blank'
                },
                {
                    label: 'Close'
                }
            ]
        },
        {
            label: 'Account Information',
            items: [
                {
                    label: 'Inquire on Account',
                    items: [
                        {
                            label: 'Converstion Inq',
                            tooltip: 'I have a JavaScript action',
                            jsAction: function(ev, itm, $itm) {
                                demoItemClick(ev, itm, $itm);
                            }
                        },
                        {
                            label: 'Accounting Inq',
                            items: [
                                {
                                    label: 'Item 1.1',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                },
                                {
                                    label: 'Long List',
                                    items: [
                                        {
                                            label: 'Item 1.2.1',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.2',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.3',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.4',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.5',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.6',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.7',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.8',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.9',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.10',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.11',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.12',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.13',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.14',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.15',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.16',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.17',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.18',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.19',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.20',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        }
                                    ]
                                },
                                {
                                    label: 'Item 1.3',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                }
                            ]
                        },
                        {
                            label: 'Taxpayer Account Inq'
                        },
                        {
                            label: 'Reqturns Inq'
                        },
                        {
                            label: 'ABT Return Inq'
                        },
                        {
                            label: 'HUT Return Inq'
                        },
                        {
                            label: 'Audit Screening',
                            items: [
                                {
                                    label: 'Audit Screening 1',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                },
                                {
                                    label: 'Aud. Scr. 2',
                                    items: [
                                        {
                                            label: 'Audit Screening 2.1',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Audit Screening 2.2',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Audit Screening 2.3',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Audit Screening 2.4',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Audit Screening 2.5',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Audit Screening 2.6',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Audit Screening 2.7',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Audit Screening 2.8',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Audit Screening 2.9',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Audit Screening 2.10',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Audit Screening 2.11',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Audit Screening 2.12',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Audit Screening 2.13',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Audit Screening 2.14',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Audit Screening 2.15',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Audit Screening 2.16',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Audit Screening 2.17',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Audit Screening 2.18',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Audit Screening 2.19',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Audit Screening 2.20',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        }
                                    ]
                                },
                                {
                                    label: 'Audit Screening 3',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                }
                            ]
                        },
                        {
                            label: 'Associations'
                        }
                    ]
                },
                {
                    label: 'Maintain Account wrapped over 2 lines',
                    items: [
                        {
                            label: 'Item 1',
                            items: [
                                {
                                    label: 'Item 1.1',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                },
                                {
                                    label: 'Long List',
                                    items: [
                                        {
                                            label: 'Item 1.2.1',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.2',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.3',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.4',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.5',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.6',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.7',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.8',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.9',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.10',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.11',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.12',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.13',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.14',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.15',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.16',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.17',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.18',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.19',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.20',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        }
                                    ]
                                },
                                {
                                    label: 'Item 1.3',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                }
                            ]
                        },
                        {
                            label: 'Item 2',
                            items: [
                                {
                                    label: 'Item 2.1',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                },
                                {
                                    label: 'Item 2.2',
                                    items: [
                                        {
                                            label: 'Item 2.2.1',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        }
                                    ]
                                },
                                {
                                    label: 'Item 2.3',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                }
                            ]
                        },
                        {
                            label: 'Item 3',
                            jsAction: function(ev, itm, $itm) {
                                demoItemClick(ev, itm, $itm);
                            }
                        }
                    ]
                },
                {
                    label: 'Search on Account'
                },
                {
                    label: 'Collection Agency'
                }
            ]
        },
        {
            label: 'Work Management',
            items: [
                {
                    label: 'Worklist Management'
                },
                {
                    label: 'Work Item Search'
                }
            ]
        },
        {
            label: 'Special Services',
            items: [
                {
                    label: 'Reporting'
                },
                {
                    label: 'EDMS'
                },
                {
                    label: 'X Tools'
                },
                {
                    label: 'Order Forms'
                },
                {
                    label: 'Reference Tables',
                    items: [
                        {
                            label: 'Reference Tables Inq'
                        }
                    ]
                },
                {
                    label: 'Tools',
                    items: [
                        {
                            label: 'Item 1',
                            items: [
                                {
                                    label: 'Item 1.1',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                },
                                {
                                    label: 'Long List',
                                    items: [
                                        {
                                            label: 'Item 1.2.1',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.2',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.3',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.4',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.5',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.6',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.7',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.8',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.9',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.10',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.11',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.12',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.13',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.14',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.15',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.16',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.17',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.18',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.19',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        },
                                        {
                                            label: 'Item 1.2.20',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        }
                                    ]
                                },
                                {
                                    label: 'Item 1.3',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                }
                            ]
                        },
                        {
                            label: 'Item 2',
                            items: [
                                {
                                    label: 'Item 2.1',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                },
                                {
                                    label: 'Item 2.2',
                                    items: [
                                        {
                                            label: 'Item 2.2.1',
                                            jsAction: function(ev, itm, $itm) {
                                                demoItemClick(ev, itm, $itm);
                                            }
                                        }
                                    ]
                                },
                                {
                                    label: 'Item 2.3',
                                    jsAction: function(ev, itm, $itm) {
                                        demoItemClick(ev, itm, $itm);
                                    }
                                }
                            ]
                        },
                        {
                            label: 'Item 3',
                            jsAction: function(ev, itm, $itm) {
                                demoItemClick(ev, itm, $itm);
                            }
                        }
                    ]
                },
                {
                    label: 'STAR',
                    state: 'disabled'
                },
                {
                    label: 'You should never see this and its label length should have no impact on the other items in this group',
                    dividerType: 'blank'
                },
                {
                    label: 'Online Tax Center'
                }
            ]
        },
        {
            label: 'Document Processing',
            items: [
                {
                    label: 'Tax Profile',
                    items: [
                        {
                            label: 'Maintain Corp Tax Profile'
                        },
                        {
                            label: 'Maintain PIT Tax Profile'
                        }
                    ]
                }
            ]
        },
        {
            label: 'Accounting',
            items: [
                {
                    label: 'Account Maintenance',
                    items: [
                        {
                            label: 'Business Summary',
                            items: [
                                {
                                    label: 'Corporation'
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            label: 'User Services',
            items: [
                {
                    label: 'Address',
                    items: [
                        {
                            label: 'Taxpayer Address'
                        },
                        {
                            label: 'Taxpayer Information'
                        }
                    ]
                }
            ]
        },
        {
            label: 'EDMS',
            items: [
                {
                    label: 'EDMS'
                }
            ]
        }
    ]
};
```
