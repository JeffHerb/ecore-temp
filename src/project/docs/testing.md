# Intern Testing

## Overview
The Intern Testing suite allows you to perform functional tests written against various project components.


## Usage
To run the standard test call `grunt test` in the command line.

### Options
There are various flags that can be included in the `grunt test` call. These include:

Flag | Description
--- | ---
`--testReport` | Creates a report document of all test results
`--testQuiet` | Hides all logs displayed from `grunt.log()` until the intern task has been run. All calls made to `console.log()` will still be displayed normally
`--runTests=componentName` | Runs the intern test runner for only the specified componenet
`--runTests=["comp1","comp2","comp3"...]` | Runs the intern test runner for a list of componenet. *Note there can not be any white space within flag call

