define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');

    registerSuite({
        name: 'Table - Responsive',

        // ===============================
        // MULTIPLE (CHECKBOX) TABLE TESTS
        // ===============================
        //Custom config tabsetprefs table
        'Flush localStorage and generate custom tabsetPrefs': function(){
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/table/pages/responsive.html'))
                .maximizeWindow()
                .setFindTimeout(2000)
                .findById('test_table4_for_selenium_custom_tabsetprefs')
                    .end()
                    .sleep(1000)

                .execute(function(){
                    //custom tabsetprefs
                    var customTabSetPrefs = [
                        {
                            "id": "http___localhost_8888_tests_table_pages_responsive_html",
                            "prefs": {
                                "pages": {
                                    "responsive_html": {
                                        "tables": {
                                            "test_table4_for_selenium_custom_tabsetprefs": {
                                                "columns": {
                                                    "hidden": [
                                                        3,
                                                        6
                                                    ],
                                                    "visible": [
                                                        0,
                                                        1,
                                                        2,
                                                        4,
                                                        5,
                                                        7,
                                                        8,
                                                        9,
                                                        10,
                                                        11,
                                                        12,
                                                        13,
                                                        14
                                                    ]
                                                }
                                            }
                                        }
                                    }
                                },
                                "timestamp": 9509636237
                            }
                        }
                    ]
                    //pass emp module flushLocalStorage function 
                    emp.flushLocalStorage('tabsetPrefs', customTabSetPrefs);
                });
        },
        // ------Tests that the preselected table options are correct via dataStore/physical-Old Rendering Method Table------
        'Check table-OLD RENDERING dataStore and physical column count': function(){
            return this.remote
                .get(require.toUrl('http://localhost:8888/tests/table/pages/responsive.html'))
                .maximizeWindow()
                .execute(function(){
 
                    // Find the table 1 and the viewWrapper around it
                    var tableOne = document.querySelector('table#test_table1_for_selenium');
                    var viewWrapper = tableOne.parentElement;
                    
                    //check column dataStore count
                    var TableDataStore = emp.reference.tables['test_table1_for_selenium'];
                    var tableData = TableDataStore.dataStore;

                    var dataStoreCount = 0;

                    for (var c = 0, len = tableData.head.rows[0].columns.length; c < len; c++) {
                        dataStoreCount += 1;
                    }
                
                    //check column physical count
                    var physicalCount = 0;
                    
                    var tableTH = tableOne.querySelectorAll('th');

                    for(var i = 0; i < tableTH.length; i++){
                        physicalCount += 1;
                    } 

                    // Return everything
                    return{
                        dataStoreCount: dataStoreCount,
                        physicalCount: physicalCount
                    };

                }).
                then(function (tableObj) {
                    // Check to make sure that the lengths of the number of preselected inputs matches the length of found checkboxes
                    assert.strictEqual(tableObj.dataStoreCount, 21, 'Table dataStore should contain 21 columns (th).');
                    assert.strictEqual(tableObj.physicalCount, 20, 'Table physical th count should be 20');
                });
        },
        'Find and open the columns drop down menu' :function(){
            return this.remote
                .setFindTimeout(2000)
                //clikc column button
                .findById('test_table1_for_selenium_columns')
                    .click()
                    .end()
                    .sleep(500)
                
                .execute(function(){
                    var columnButtonUl = document.querySelector('#test_table1_for_selenium_column_menu');
                    var columnButtonLi = columnButtonUl.querySelectorAll('li');
    
                    columnLiCount = 0;
    
                    for(var i = 0; i < columnButtonLi.length; i++){
                        if(columnButtonLi[i].hasAttribute('data-col-index')){
                            columnLiCount +=1;
                        }
                    }
                    return{
                        columnButtonLiFound: columnLiCount
                    }
                })
                .then(function(columnButtonObj){
                    assert.strictEqual(columnButtonObj.columnButtonLiFound, 15, 'There should be 15 li(s) with "data-col-index"');
                });
        },
        'Close the columns drop down by selecting the "Close" button': function(){
            return this.remote
                .setFindTimeout(2000)
                //clikc column button
                .findById('test_table1_for_selenium_close_control')
                    .click()
                    .end()
                    .sleep(800)

                .execute(function(){
                    //check and make sure emp-selected class does not exist
                   var selectedButtonMenu = document.querySelector('#test_table1_for_selenium_column_menu');
                   var empSelectedExist = true;

                    if(selectedButtonMenu.classList.contains('emp-selected')){
                       empSelectedExist = true;
                   }else{
                       empSelectedExist = false;
                   }

                   return{
                       empSelectedExist: empSelectedExist
                   }
                })
               .then(function(empSelectedObj){
                   assert.strictEqual(empSelectedObj.empSelectedExist, false, 'The emp-selected class should not be active');
               });
        }, 
        'Open the columns drop down again' :function(){
            return this.remote
                .setFindTimeout(2000)
                //clikc column button
                .findById('test_table1_for_selenium_columns')
                    .click()
                    .end()
                    .sleep(500)
                
                .execute(function(){
                    //check and make sure emp-selected class is active
                    var selectedButtonMenu = document.querySelector('#test_table1_for_selenium_column_menu');
                    var empSelectedExist = false;

                    if(selectedButtonMenu.classList.contains('emp-selected')){
                        empSelectedExist = true;
                    }else{
                        empSelectedExist = false;
                    }

                    return{
                        empSelectedExist: empSelectedExist
                    }
                })
                .then(function(empSelectedObj){
                    assert.strictEqual(empSelectedObj.empSelectedExist, true, 'The emp-selected class should be active');
                });
        },
        'Hide the following columns. 1, 3, 5, 7': function(){
            return this.remote
                .setFindTimeout(2000)
                .findById('test_table1_for_selenium_Column_1_column')
                    .click()
                    .end()
                    .sleep(200)
                .findById('test_table1_for_selenium_Column_3_column')
                    .click()
                    .end()
                    .sleep(200)
                .findById('test_table1_for_selenium_Column_5_column')
                    .click()
                    .end()
                    .sleep(200)
                .findById('test_table1_for_selenium_Column_7_column')
                    .click()
                    .end()
                    .sleep(1500)

                .execute(function(){
                    //make sure the emp-selected class is not active on the clicked li(s)
                    var columnButton1 = document.querySelector('#test_table1_for_selenium_Column_1_column');
                    var columnButton3 = document.querySelector('#test_table1_for_selenium_Column_3_column');
                    var columnButton5 = document.querySelector('#test_table1_for_selenium_Column_5_column');
                    var columnButton7 = document.querySelector('#test_table1_for_selenium_Column_7_column');

                    var empSelectedIsActive = false;

                    if(columnButton1.classList.contains('emp-selected') && columnButton3.classList.contains('emp-selected') && columnButton5.classList.contains('emp-selected') && columnButton7.classList.contains('emp-selected')){
                        empSelectedIsActive = true;
                    }else{
                        empSelectedIsActive = false;
                    }
                    //check and make sure selected th(s) are not visible in the DOM
                    var oldRenderingTable = document.querySelector('#test_table1_for_selenium');
                    var columnTH = oldRenderingTable.querySelectorAll('th[data-col-index]');

                    var visibleTH = [];
                    var invisibleTH = [];

                    for(var i = 0; i < columnTH.length; i++){
                        if(columnTH[i].offsetWidth > 0 && columnTH[i].offsetHeight > 0){
                            visibleTH.push(i);
                        }else{
                            invisibleTH.push(i);
                        }
                    }
                    //---Pull the local LocalStorage columns config- should be empty at this point
                    var lStorage = emp.prefs.getPage();

                    //Verify the local table dataStore--0,2,4,6 should be hidden
                    var ColumnsPrefs = emp.reference.tables['test_table1_for_selenium'].config.plugins.responsive.colState;
                    var userPrefs = ColumnsPrefs.hidden; 
                    
                    return{
                        empSelectedIsActive: empSelectedIsActive,
                        hiddenTH: invisibleTH,
                        userPrefs: userPrefs //dataStore
                    }
                })
                .then(function(empSelectedActiveObj){
                    assert.strictEqual(empSelectedActiveObj.empSelectedIsActive, false, 'The emp-selected class shoud not be active');
                    assert.deepEqual(empSelectedActiveObj.hiddenTH, [0,2,4,6,18], 'The values should match values in invisibleTH');                
                    assert.deepEqual(empSelectedActiveObj.userPrefs, [0,2,4,6], 'The local dataStore hidden array should include 0,2,4,6'); //dataStore
                });
        },
        'Close the columns drop down menu': function(){
            return this.remote
                .setFindTimeout(2000)
                //clikc column button
                .findById('test_table1_for_selenium_close_control')
                    .click()
                    .end()
                    .sleep(800)

                .execute(function(){
                    //check and make sure emp-selected class does not exist
                    var selectedButtonMenu = document.querySelector('#test_table1_for_selenium_column_menu');
                    var empSelectedExist = true;

                    if(selectedButtonMenu.classList.contains('emp-selected')){
                        empSelectedExist = true;
                    }else{
                        empSelectedExist = false;
                    }

                    return{
                        empSelectedExist: empSelectedExist
                    }
                })
                .then(function(empSelectedObj){
                    assert.strictEqual(empSelectedObj.empSelectedExist, false, 'The emp-selected class should not be active');
               });
        },
        'Find and click the "Save" command button.': function(){
            return this.remote
                .setFindTimeout(2000)
                    //clikc column button
                    .findById('test_table1_for_selenium_columns')
                    .click()
                    .end()
                    .sleep(500)

                .findById('test_table1_for_selenium_save_control')
                    .click()
                    .end()
                    .sleep(900)

                    .execute(function(){
                        var selectedButtonMenu = document.querySelector('#test_table1_for_selenium_column_menu');
                        var empSelectedExist = false;
     
                        if(selectedButtonMenu.classList.contains('emp-selected')){
                            empSelectedExist = true;
                        }else{
                            empSelectedExist = false;
                        } 

                        var lStorage = emp.prefs.getPage();
                        var deselectedColumns = lStorage.pages.responsive_html.tables.test_table1_for_selenium.columns.hidden;
                        
                        var ColumnsPrefs = emp.reference.tables['test_table1_for_selenium'].config.plugins.responsive.colState;
                        var userPrefs = ColumnsPrefs.hidden; 

                        return{
                            empSelectedExist: empSelectedExist,
                            deselectedColumns:deselectedColumns,
                            columnsMatch: userPrefs
                        }
                    })
                    .then(function(columnsMatchObj){
                        assert.strictEqual(columnsMatchObj.empSelectedExist, false, 'The emp-selected class should not be active');
                        assert.deepEqual(columnsMatchObj.deselectedColumns, [0,2,4,6], 'The hidden array should include 0,2,4,6'); //localStorage
                        assert.deepEqual(columnsMatchObj.columnsMatch, [0,2,4,6], 'The values should be 0,2,4,6');//dataStore
                        
                    });
        },
        'Check physical count of th(s) after deselection': function(){
            return this.remote
                .setFindTimeout(2000)
                .findById('test_table1_for_selenium')
                    .end()
                    .sleep(500)
                
                .execute(function(){
                    //check and make the appropriate th(s) are not in the DOM
                    var oldRenderingTable = document.querySelector('#test_table1_for_selenium');
                    var columnTH = oldRenderingTable.querySelectorAll('th[data-col-index]');

                    var visibleTH = [];
                    var invisibleTH = [];

                    for(var i = 0; i < columnTH.length; i++){
                        if(columnTH[i].offsetWidth > 0 && columnTH[i].offsetHeight > 0){
                            visibleTH.push(i);
                        }else{
                            invisibleTH.push(i);
                        }
                    }

                    return{
                        hiddenTH: invisibleTH
                    }    
                }).
                then(function(hiddenTHObj){
                    assert.deepEqual(hiddenTHObj.hiddenTH, [0,2,4,6,18], 'The values should match values in invisibleTH');
                });

        },
        'Find and click the "Revert button"': function(){
            return this.remote
                .setFindTimeout(2000)
                .findById('test_table1_for_selenium_columns')
                    .click()
                    .end()
                    .sleep(200)

                .findById('test_table1_for_selenium_revert_control')
                    .click()
                    .end()
                    .sleep(200)
                
                    .findById('test_table1_for_selenium_save_control')
                    .click()
                    .end()
                    .sleep(200)

                .execute(function(){
                    //---Verify the revert button was click---
                    var selectedButtonMenu = document.querySelector('#test_table1_for_selenium_column_menu');
                    var revertLI = selectedButtonMenu.querySelector('li.emp-table-static-revert-link');
                    
                    var cuiHiddenActive = false;
 
                    if(revertLI.classList.contains('cui-hidden')){
                        cuiHiddenActive = true;
                    }else{
                        cuiHiddenActive = false;
                    } 
                    //---Verify all columns th are displayed as expected---
                    var oldRenderingTable = document.querySelector('#test_table1_for_selenium');
                    var columnTH = oldRenderingTable.querySelectorAll('th[data-col-index]');

                    var visibleTH = [];
                    var invisibleTH = [];

                    for(var i = 0; i < columnTH.length; i++){
                        if(columnTH[i].offsetWidth > 0 && columnTH[i].offsetHeight > 0){
                            visibleTH.push(i);
                        }else{
                            invisibleTH.push(i);
                        }
                    }
                    //---Pull the local preferences columns config-hidden array should be empty---
                    var lStorage = emp.prefs.getPage();
                    var deselectedColumns = lStorage.pages.responsive_html.tables.test_table1_for_selenium.columns.hidden;

                    //Verify the local table dataStore shows no columns are hidden
                    var ColumnsPrefs = emp.reference.tables['test_table1_for_selenium'].config.plugins.responsive.colState;
                    var userPrefs = ColumnsPrefs.hidden; 

                    return{
                        cuiHiddenActive: cuiHiddenActive,
                        hiddenTH: invisibleTH, //visible/invisible in DOM
                        deselectedColumns: deselectedColumns, //localStorage
                        userPrefs: userPrefs //dataStore
                    }    
                }).
                    then(function(colMatchObj){
                    assert.strictEqual(colMatchObj.cuiHiddenActive, true, 'The revert button should be hidden.');
                    assert.deepEqual(colMatchObj.hiddenTH, [18], 'The values should match values in invisibleTH, only 18 should be hidden'); //visible/invisible in DOM
                    assert.deepEqual(colMatchObj.deselectedColumns, [], 'The hidden array should be empty'); //localStorage
                    assert.deepEqual(colMatchObj.userPrefs, [], 'The should be no column showing in the array'); //dataStore
                });
        },
        'Find and click the "Undo" button': function(){
            return this.remote
                .setFindTimeout(2000)
                .findById('test_table1_for_selenium_columns')
                   .click()
                   .end()
                   .sleep(500)
                
                   .findById('test_table1_for_selenium_undo_control')
                   .click()
                   .end()
                   .sleep(700)

                .execute(function(){
                    //check and make sure emp-selected class is active
                    var selectedButtonMenu = document.querySelector('#test_table1_for_selenium_column_menu');
                    var empSelectedExist = false;

                    if(selectedButtonMenu.classList.contains('emp-selected')){
                        empSelectedExist = true;
                    }else{
                        empSelectedExist = false;
                    }
                    //---Verify the Undo button was click---
                    var selectedButtonMenu = document.querySelector('#test_table1_for_selenium_column_menu');
                    var revertLI = selectedButtonMenu.querySelector('li.emp-table-static-undo-revert-link');
                    
                    var cuiHiddenActive = false;
 
                    if(revertLI.classList.contains('cui-hidden')){
                        cuiHiddenActive = true;
                    }else{
                        cuiHiddenActive = false;
                    } 
                    //Verify the the selected columns are hidden in the DOM
                    var oldRenderingTable = document.querySelector('#test_table1_for_selenium');
                    var columnTH = oldRenderingTable.querySelectorAll('th[data-col-index]');

                    var visibleTH = [];
                    var invisibleTH = [];

                    for(var i = 0; i < columnTH.length; i++){
                        if(columnTH[i].offsetWidth > 0 && columnTH[i].offsetHeight > 0){
                            visibleTH.push(i);
                        }else{
                            invisibleTH.push(i);
                        }
                    }
                    //---Pull the local preferences columns config-hidden array should be empty---
                    var lStorage = emp.prefs.getPage();
                    var deselectedColumns = lStorage.pages.responsive_html.tables.test_table1_for_selenium.columns.hidden;

                    //Verify the local table dataStore showing no columns are hidden
                    var ColumnsPrefs = emp.reference.tables['test_table1_for_selenium'].config.plugins.responsive.colState;
                    var userPrefs = ColumnsPrefs.hidden; 

                    
                    return{
                        empSelectedExist: empSelectedExist,
                        cuiHiddenActive: cuiHiddenActive,
                        hiddenTH: invisibleTH,
                        deselectedColumns: deselectedColumns, //localStorage
                        userPrefs: userPrefs //dataStore 
                    }
                })
                .then(function(undoObj){
                    assert.strictEqual(undoObj.empSelectedExist, true, 'The emp-selected class should be active');
                    assert.strictEqual(undoObj.cuiHiddenActive, true, 'The undo button should be hidden.');
                    assert.deepEqual(undoObj.hiddenTH, [0,2,4,6,18], 'The values should match values in invisibleTH');
                    assert.deepEqual(undoObj.deselectedColumns, [0,2,4,6], '0,2,4,6 should be hidden'); //localStorage
                    assert.deepEqual(undoObj.userPrefs, [0,2,4,6], 'The following values should be in the hidden array; 0,2,4,6'); //dataStore 
                });
        },
        'Close dropdown menu after Undo is clicked': function(){
            return this.remote
                .setFindTimeout(2000)
                //clikc column button
                .findById('test_table1_for_selenium_close_control')
                    .click()
                    .end()
                    .sleep(1000)

                .execute(function(){
                    //check and make sure emp-selected class does not exist
                    var selectedButtonMenu = document.querySelector('#test_table1_for_selenium_column_menu');
                    var empSelectedExist = true;

                    if(selectedButtonMenu.classList.contains('emp-selected')){
                        empSelectedExist = true;
                    }else{
                        empSelectedExist = false;
                    }

                    return{
                        empSelectedExist: empSelectedExist
                    }
                })
                .then(function(empSelectedObj){
                    assert.strictEqual(empSelectedObj.empSelectedExist, false, 'The emp-selected class should not be active');
                });
        },
        'Find and open the td button menu': function(){
            return this.remote
                .setFindTimeout(2000)
                .findById('test_table1_for_selenium')
                    .findByClassName('emp-icon-responsive-table-menu')
                        .click()
                        .end()
                        .sleep(700)

                .execute(function(){
                    //verify the button contain data-menu attr
                    var tdButtonMenu = document.querySelector('#test_table1_for_selenium');
                    var tdHamburgerButton = tdButtonMenu.querySelector('td button.emp-icon-responsive-table-menu');

                    var dataMenuAttr = false;

                    if(tdHamburgerButton.hasAttribute('data-menu')){
                        dataMenuAttr = true;
                    }else{
                        dataMenuAttr = false;
                    }
                    //verify number of li buttons in menu - == 
                    var tdMenu = document.querySelector('#test_table1_for_selenium_0_0');
                    var tdMenuLi = tdMenu.querySelectorAll('li button[tabindex]');
                    var liCount = 0;

                    for(var i = 0; i < tdMenuLi.length; i++){
                        liCount += 1;
                    }


                    return{
                        dataMenuAttr: dataMenuAttr,
                        liCount: liCount
                    }

                })
                .then(function(tdButtonMenuObj){
                    assert.strictEqual(tdButtonMenuObj.dataMenuAttr, true, 'The data-menu attribute should be active');
                    assert.strictEqual(tdButtonMenuObj.liCount, 2, 'There should be 2 li(s) in the menu');
                });
        },
        'Close the td button menu by clicking "Close" button': function(){
            return this.remote
            .setFindTimeout(2000)
            .findById('test_table1_for_selenium_0_0_closeButton')
                .click()
                .end()
                .sleep(700)


            .execute(function(){
                //verify the menu was closed- menu should not visible in DOM
                var tdMenu = document.querySelector('#test_table1_for_selenium_0_0');

                var menuExist = (tdMenu) ? true: false;

                return{
                    menuExist: menuExist
                }
            }).
            then(function(tdMenuObj){
                assert.strictEqual(tdMenuObj.menuExist, false, 'The td menu ul should not exist');
            });
        },
        
        //----New Rendering Method Table---------
        'Check table-NEW RENDERING dataStore and physical column count': function(){          
            return this.remote
                .execute(function() {
                    // Find the table 1 and the viewWrapper around it
                    var tableTwo = document.querySelector('table#test_table2_for_selenium');
                    var viewWrapper = tableTwo.parentElement;
                    
                    //check column dataStore count
                    var TableDataStore = emp.reference.tables['test_table2_for_selenium'];
                    var tableData = TableDataStore.dataStore;

                    var dataStoreCount = 0;

                    for (var c = 0, len = tableData.head.rows[0].columns.length; c < len; c++) {
                        dataStoreCount += 1;
                    }

                    //check column physical count
                    var physicalCount = 0;
                    
                    var tableTH = tableTwo.querySelectorAll('th');

                    for(var i = 0; i < tableTH.length; i++){
                        physicalCount += 1;
                    } 

                    // Return everything
                    return {
                        dataStoreCount: dataStoreCount,
                        physicalCount: physicalCount
                    };
                }).
                then(function (tableObj, dataStoreCount, physicalCount) {
                    // Check to make sure that the lengths of the number of preselected inputs matches the length of found checkboxes
                    assert.strictEqual(tableObj.dataStoreCount, 18, 'Table dataStore should contain 18 columns (th).');
                    assert.strictEqual(tableObj.physicalCount, 19, 'Table physical th count should be 19');
                });
        },
        'Find and open the columns drop down menu- New rendering table' :function(){
            return this.remote
                .setFindTimeout(2000)
                //clikc column button
                .findById('test_table2_for_selenium_columns')
                    .click()
                    .end()
                    .sleep(500)
                
                .execute(function(){
                    var columnButtonUl = document.querySelector('#test_table2_for_selenium_column_menu');
                    var columnButtonLi = columnButtonUl.querySelectorAll('li');

                    columnLiCount = 0;
    
                    for(var i = 0; i < columnButtonLi.length; i++){
                        if(columnButtonLi[i].hasAttribute('data-col-index')){
                            columnLiCount +=1;
                        }
                    }
                    return{
                        columnButtonLiFound: columnLiCount
                    }
                })
                .then(function(columnButtonObj){
                    assert.strictEqual(columnButtonObj.columnButtonLiFound, 15, 'There should be 15 li(s) with "data-col-index"');
                });
        },
        'Close the columns drop down by selecting the "Close" button- New rendering table': function(){
            return this.remote
                .setFindTimeout(2000)
                //clikc column button
                .findById('test_table2_for_selenium_close_control')
                    .click()
                    .end()
                    .sleep(800)

                .execute(function(){
                    //check and make sure emp-selected class does not exist
                    var selectedButtonMenu = document.querySelector('#test_table2_for_selenium_column_menu');
                    var empSelectedExist = true;

                    if(selectedButtonMenu.classList.contains('emp-selected')){
                        empSelectedExist = true;
                    }else{
                        empSelectedExist = false;
                    }

                    return{
                        empSelectedExist: empSelectedExist
                    }
                })
                .then(function(empSelectedObj){
                    assert.strictEqual(empSelectedObj.empSelectedExist, false, 'The emp-selected class should not be active');
                });
        },
        'Open the columns drop down again- New rendering table' :function(){
            return this.remote
                .setFindTimeout(2000)
                //clikc column button
                .findById('test_table2_for_selenium_columns')
                    .click()
                    .end()
                    .sleep(500)
                
                .execute(function(){
                    //check and make sure emp-selected class is active
                    var selectedButtonMenu = document.querySelector('#test_table2_for_selenium_column_menu');
                    var empSelectedExist = false;

                    if(selectedButtonMenu.classList.contains('emp-selected')){
                        empSelectedExist = true;
                    }else{
                        empSelectedExist = false;
                    }

                    return{
                        empSelectedExist: empSelectedExist
                    }
                })
                .then(function(empSelectedObj){
                    assert.strictEqual(empSelectedObj.empSelectedExist, true, 'The emp-selected class should be active');
                });
        },
        'Hide the following columns. 2, 4, 6, 8- New rendering table': function(){
            return this.remote
                .setFindTimeout(2000)
                .findById('test_table2_for_selenium_Column_2_column')
                    .click()
                    .end()
                    .sleep(200)
                .findById('test_table2_for_selenium_Column_4_column')
                    .click()
                    .end()
                    .sleep(200)
                .findById('test_table2_for_selenium_Column_6_column')
                    .click()
                    .end()
                    .sleep(200)
                .findById('test_table2_for_selenium_Column_8_column')
                    .click()
                    .end()
                    .sleep(200)

                .execute(function(){
                    var columnButton2 = document.querySelector('#test_table2_for_selenium_Column_2_column');
                    var columnButton4 = document.querySelector('#test_table2_for_selenium_Column_4_column');
                    var columnButton6 = document.querySelector('#test_table2_for_selenium_Column_6_column');
                    var columnButton8 = document.querySelector('#test_table2_for_selenium_Column_8_column');

                    var empSelectedIsActive = false;

                    if(columnButton2.classList.contains('emp-selected') && columnButton4.classList.contains('emp-selected') && columnButton6.classList.contains('emp-selected') && columnButton8.classList.contains('emp-selected')){
                        empSelectedIsActive = true;
                    }else{
                        empSelectedIsActive = false;
                    }
                    //check and make the appropriate th(s) are not visible in the DOM
                    var oldRenderingTable = document.querySelector('#test_table2_for_selenium');
                    var columnTH = oldRenderingTable.querySelectorAll('th[data-col-index]');

                    var visibleTH = [];
                    var invisibleTH = [];

                    for(var i = 0; i < columnTH.length; i++){
                        if(columnTH[i].offsetWidth > 0 && columnTH[i].offsetHeight > 0){
                            visibleTH.push(i);
                        }else{
                            invisibleTH.push(i);
                        }
                    }
                    //---Pull the local LocalStorage columns config- should be empty at this point
                    var lStorage = emp.prefs.getPage();
                    //check if obj is empty
                    var isEmpty = (Object.keys(lStorage.pages).length === 0) ? true : false;

                    //Verify the local table dataStore--0,2,4,6 should be hidden
                    var ColumnsPrefs = emp.reference.tables['test_table2_for_selenium'].config.plugins.responsive.colState;
                    var userPrefs = ColumnsPrefs.hidden; 
                    
                     return{
                        empSelectedIsActive: empSelectedIsActive,
                        hiddenTH: invisibleTH,
                        userPrefs: userPrefs //dataStore
                    }
                })
                .then(function(empSelectedActiveObj){
                    assert.strictEqual(empSelectedActiveObj.empSelectedIsActive, false, 'The emp-selected class shoud not be active');
                    assert.deepEqual(empSelectedActiveObj.hiddenTH, [1,3,5,7], 'The values should match values in invisibleTH');            
                    assert.deepEqual(empSelectedActiveObj.userPrefs, [1,3,5,7], 'The local dataStore hidden array should include 1,3,5,7'); //dataStore
                });
        },
        'Close the columns drop down menu- New rendering table': function(){
            return this.remote
            .setFindTimeout(2000)
            //clikc column button
            .findById('test_table2_for_selenium_close_control')
                .click()
                .end()
                .sleep(800)

            .execute(function(){
                //check and make sure emp-selected class does not exist
                var selectedButtonMenu = document.querySelector('#test_table2_for_selenium_column_menu');
                var empSelectedExist = true;

                if(selectedButtonMenu.classList.contains('emp-selected')){
                    empSelectedExist = true;
                }else{
                    empSelectedExist = false;
                }

                return{
                    empSelectedExist: empSelectedExist
                }
            })
            .then(function(empSelectedObj){
                assert.strictEqual(empSelectedObj.empSelectedExist, false, 'The emp-selected class should not be active');
            });
        },
        'Find and click the "Save" command button- New rendering table': function(){
            return this.remote
                .setFindTimeout(2000)
                .findById('test_table2_for_selenium_columns')
                    .click()
                    .end()
                    .sleep(500)

                .findById('test_table2_for_selenium_save_control')
                    .click()
                    .end()
                    .sleep(900)

                    .execute(function(){
                        var selectedButtonMenu = document.querySelector('#test_table2_for_selenium_column_menu');
                        var empSelectedExist = true;
     
                        if(selectedButtonMenu.classList.contains('emp-selected')){
                            empSelectedExist = true;
                        }else{
                            empSelectedExist = false;
                        }

                        var lStorage = emp.prefs.getPage();
                        var deselectedColumns = lStorage.pages.responsive_html.tables.test_table2_for_selenium.columns.hidden;
                        
                        //var ColumnsPrefs = emp.reference.tables['test_table2_for_selenium'].config.plugins.responsive.colState;
                        //var userPrefs = ColumnsPrefs.hidden; 

                        return{
                            empSelectedExist: empSelectedExist,
                            columnsMatch: deselectedColumns
                        }
                    })
                    .then(function(columnsMatchObj){
                        assert.strictEqual(columnsMatchObj.empSelectedExist, false, 'The emp-selected class should not be active');
                        assert.deepEqual(columnsMatchObj.columnsMatch, [1,3,5,7], 'The values should be 1,3,5,7');
                    });
        },
        'Check physical count of th(s) after deselection-New rendering table': function(){
            return this.remote
                .setFindTimeout(2000)
                .findById('test_table2_for_selenium')
                    .end()
                    .sleep(500)
                
                .execute(function(){
                    var oldRenderingTable = document.querySelector('#test_table2_for_selenium');
                    var columnTH = oldRenderingTable.querySelectorAll('th[data-col-index]');

                    var visibleTH = [];
                    var invisibleTH = [];

                    for(var i = 0; i < columnTH.length; i++){
                        if(columnTH[i].offsetWidth > 0 && columnTH[i].offsetHeight > 0){
                            visibleTH.push(i);
                        }else{
                            invisibleTH.push(i);
                        }
                    }

                    return{
                        hiddenTH: invisibleTH
                    }    
                }).
                then(function(hiddenTHObj){
                    assert.deepEqual(hiddenTHObj.hiddenTH, [1,3,5,7], 'The values should match values in invisibleTH');
                });

        },
        'Find and click the "Revert button"- New Rendering': function(){
            return this.remote
                .setFindTimeout(2000)
                .findById('test_table2_for_selenium_columns')
                    .click()
                    .end()
                    .sleep(200)

                .findById('test_table2_for_selenium_revert_control')
                    .click()
                    .end()
                    .sleep(200)

                    .findById('test_table2_for_selenium_save_control')
                    .click()
                    .end()
                    .sleep(200)

                .execute(function(){
                    //---Verify the revert button was click---
                    var selectedButtonMenu = document.querySelector('#test_table2_for_selenium_column_menu');
                    var revertLI = selectedButtonMenu.querySelector('li.emp-table-static-revert-link');
                    
                    var cuiHiddenActive = false;
 
                    if(revertLI.classList.contains('cui-hidden')){
                        cuiHiddenActive = true;
                    }else{
                        cuiHiddenActive = false;
                    } 
                    //---Verify all columns th are displayed as expected---
                    var oldRenderingTable = document.querySelector('#test_table2_for_selenium');
                    var columnTH = oldRenderingTable.querySelectorAll('th[data-col-index]');

                    var visibleTH = [];
                    var invisibleTH = [];

                    for(var i = 0; i < columnTH.length; i++){
                        if(columnTH[i].offsetWidth > 0 && columnTH[i].offsetHeight > 0){
                            visibleTH.push(i);
                        }else{
                            invisibleTH.push(i);
                        }
                    }
                    //---Pull the local preferences columns config-hidden array should be empty---
                    var lStorage = emp.prefs.getPage();
                    var deselectedColumns = lStorage.pages.responsive_html.tables.test_table2_for_selenium.columns.hidden;

                    //Verify the local table dataStore showing no columns are hidden
                    var ColumnsPrefs = emp.reference.tables['test_table2_for_selenium'].config.plugins.responsive.colState;
                    var userPrefs = ColumnsPrefs.hidden; 

                    return{
                        cuiHiddenActive: cuiHiddenActive,
                        hiddenTH: invisibleTH, //visible/invisible in DOM
                        deselectedColumns: deselectedColumns, //localStorage
                        userPrefs: userPrefs //dataStore
                    }    
                }).
                then(function(colMatchObj){
                    assert.strictEqual(colMatchObj.cuiHiddenActive, true, 'The revert button should be hidden.');
                    assert.deepEqual(colMatchObj.hiddenTH, [], 'The values should match values in invisibleTH'); //visible/invisible in DOM
                    assert.deepEqual(colMatchObj.deselectedColumns, [], 'The hidden array should be empty'); //localStorage
                    assert.deepEqual(colMatchObj.userPrefs, [], 'The should be no column showing in the array'); //dataStore
                });
        },
        'Find and click the "Undo" button- New rendering table': function(){
            return this.remote
                .setFindTimeout(2000)
                .findById('test_table2_for_selenium_columns')
                    .click()
                    .end()
                    .sleep(500)
                
                .findById('test_table2_for_selenium_undo_control')
                    .click()
                    .end()
                    .sleep(700)

                .execute(function(){
                    //check and make sure emp-selected class is active
                    var selectedButtonMenu = document.querySelector('#test_table2_for_selenium_column_menu');
                    var empSelectedExist = false;

                    if(selectedButtonMenu.classList.contains('emp-selected')){
                        empSelectedExist = true;
                    }else{
                        empSelectedExist = false;
                    }
                    //---Verify the Undo button was click---
                    var selectedButtonMenu = document.querySelector('#test_table2_for_selenium_column_menu');
                    var revertLI = selectedButtonMenu.querySelector('li.emp-table-static-undo-revert-link');
                    
                    var cuiHiddenActive = false;
 
                    if(revertLI.classList.contains('cui-hidden')){
                        cuiHiddenActive = true;
                    }else{
                        cuiHiddenActive = false;
                    } 
                    //Verify the the selected columns are hidden in the DOM
                    var oldRenderingTable = document.querySelector('#test_table2_for_selenium');
                    var columnTH = oldRenderingTable.querySelectorAll('th[data-col-index]');

                    var visibleTH = [];
                    var invisibleTH = [];

                    for(var i = 0; i < columnTH.length; i++){
                        if(columnTH[i].offsetWidth > 0 && columnTH[i].offsetHeight > 0){
                            visibleTH.push(i);
                        }else{
                            invisibleTH.push(i);
                        }
                    }
                    //---Pull the local preferences columns config-hidden array should be empty---
                    var lStorage = emp.prefs.getPage();
                    var deselectedColumns = lStorage.pages.responsive_html.tables.test_table2_for_selenium.columns.hidden;

                    //Verify the local table dataStore showing no columns are hidden
                    var ColumnsPrefs = emp.reference.tables['test_table2_for_selenium'].config.plugins.responsive.colState;
                    var userPrefs = ColumnsPrefs.hidden; 

                    
                    return{
                        empSelectedExist: empSelectedExist,
                        cuiHiddenActive: cuiHiddenActive,
                        hiddenTH: invisibleTH,
                        deselectedColumns: deselectedColumns, //localStorage
                        userPrefs: userPrefs //dataStore
                    }
                })
                .then(function(undoObj){
                    assert.strictEqual(undoObj.empSelectedExist, true, 'The emp-selected class should be active');
                    assert.strictEqual(undoObj.cuiHiddenActive, true, 'The undo button should be hidden.');
                    assert.deepEqual(undoObj.hiddenTH, [1,3,5,7], 'The values should match values in invisibleTH');
                    assert.deepEqual(undoObj.deselectedColumns, [1,3,5,7], '1,3,5,7 should be hidden'); //localStorage
                    assert.deepEqual(undoObj.userPrefs, [1,3,5,7], 'The following values should be in the hidden array; 1,3,5,7'); //dataStore 
                });
        },
        'Close dropdown menu after Undo is clicked- New Rendering table': function(){
            return this.remote
                .setFindTimeout(2000)
                //clikc column button
                .findById('test_table2_for_selenium_close_control')
                    .click()
                    .end()
                    .sleep(1000)

                .execute(function(){
                    //check and make sure emp-selected class does not exist
                    var selectedButtonMenu = document.querySelector('#test_table2_for_selenium_column_menu');
                    var empSelectedExist = true;

                    if(selectedButtonMenu.classList.contains('emp-selected')){
                        empSelectedExist = true;
                    }else{
                        empSelectedExist = false;
                    }

                    return{
                        empSelectedExist: empSelectedExist
                    }
                })
                .then(function(empSelectedObj){
                    assert.strictEqual(empSelectedObj.empSelectedExist, false, 'The emp-selected class should not be active');
            });
        },
        'Find and open the td button menu- New rendering table': function(){
            return this.remote
                .setFindTimeout(2000)
                .findById('test_table2_for_selenium')
                    .findByClassName('emp-icon-responsive-table-menu')
                        .click()
                        .end()
                        .sleep(700)

                .execute(function(){
                    //verify the button contain data-menu attr
                    var tdButtonMenu = document.querySelector('#test_table2_for_selenium');
                    var tdHamburgerButton = tdButtonMenu.querySelector('td button.emp-icon-responsive-table-menu');

                    var dataMenuAttr = false;

                    if(tdHamburgerButton.hasAttribute('data-menu')){
                        dataMenuAttr = true;
                    }else{
                        dataMenuAttr = false;
                    }
                    //verify number of li buttons in menu - == 2
                    var tdMenu = document.querySelector('#test_table2_for_selenium_0_0');
                    var tdMenuLi = tdMenu.querySelectorAll('li button[tabindex]');
                    var liCount = 0;

                    for(var i = 0; i < tdMenuLi.length; i++){
                        liCount += 1;
                    }

                    return{
                        dataMenuAttr: dataMenuAttr,
                        liCount: liCount
                    }

                })
                .then(function(tdButtonMenuObj){
                    assert.strictEqual(tdButtonMenuObj.dataMenuAttr, true, 'The data-menu attribute should be active');
                    assert.strictEqual(tdButtonMenuObj.liCount, 2, 'There should be 2 li(s) in the menu');
                });
        },
        'Close the td button menu by clicking "Close" button- New rendering table': function(){
            return this.remote
            .setFindTimeout(2000)
            .findById('test_table2_for_selenium_0_0_closeButton')
                .click()
                .end()
                .sleep(700)

            .execute(function(){
                //verify the menu was closed- menu should not visible in DOM
                var tdMenu = document.querySelector('#test_table2_for_selenium_0_0');

                var menuExist = (tdMenu) ? true: false;

                return{
                    menuExist: menuExist
                }
            }).
            then(function(tdMenuObj){
                assert.strictEqual(tdMenuObj.menuExist, false, 'The td menu ul should not exist');
            });
        }, 
        //------New Rendering Method Table with Priority
        'Find Priority table and make sure it exists': function(){
            return this.remote
                .setFindTimeout(2000)
                .findById('test_table3_for_selenium_priority')
                    .end()
                    .sleep(500)
            
                .execute(function(){
                    //verify and make sure the table exists
                    var PriorityTable = document.querySelector('#test_table3_for_selenium_priority');

                    var tableExist = (PriorityTable) ? true: false;

                    return{
                        tableExist: tableExist 
                    }
                }).
                then(function(tableObj){
                    assert.strictEqual(tableObj.tableExist, true, 'The priority table should exist in the DOM');
                });                
        },
        'Shrink browser window size to 1207px and make sure column 4 disappear': function(){
            return this.remote
                .setWindowSize(1207, 888)
                .setFindTimeout(2000)
                .findById('test_table3_for_selenium_priority')
                    .end()
                    .sleep(1500)

                .execute(function(){
                    //verify the dataStore--column 4 hidden
                    var ColumnsPrefs = emp.reference.tables['test_table3_for_selenium_priority'].config.plugins.responsive.colState;
                    var userPrefs = ColumnsPrefs.hidden; 

                    //verify column th is not visible in the DOM--column 4 hidden
                    var PriorityTable = document.querySelector('#test_table3_for_selenium_priority');
                    var columnTH = PriorityTable.querySelectorAll('th[data-col-index]');

                    var visibleTH = [];
                    var invisibleTH = [];

                    for(var i = 0; i < columnTH.length; i++){
                        if(columnTH[i].offsetWidth > 0 && columnTH[i].offsetHeight > 0){
                            visibleTH.push(i);
                        }else{
                            invisibleTH.push(i);
                        }
                    }

                    return{
                        userPrefs: userPrefs, //dataStore
                        hiddenTH: invisibleTH, //physical count in DOM
                        visibleTH: visibleTH //physical count in DOM
                    }
                }).
                then(function(columnObj){
                    assert.deepEqual(columnObj.userPrefs, [3], 'Column 4 should be hidden'); //dataStore
                    assert.deepEqual(columnObj.hiddenTH, [3], 'Column 4 should not be visible in the DOM'); //physical check-invisible
                    assert.deepEqual(columnObj.visibleTH, [0,1,2,4,5,6,7,8,9,10,11,12,13,14,15,16,17], 'Should match visible array'); //physical check-visible
                });
        },
        'Shrink browser window size to 1133px and make sure column 7 disappear': function(){
            return this.remote
                .setWindowSize(1133, 888)
                .setFindTimeout(2000)
                .findById('test_table3_for_selenium_priority')
                    .end()
                    .sleep(1500)

                .execute(function(){
                    //verify the dataStore--column 4,7 hidden
                    var ColumnsPrefs = emp.reference.tables['test_table3_for_selenium_priority'].config.plugins.responsive.colState;
                    var userPrefs = ColumnsPrefs.hidden; 

                    //verify column th is not visible in the DOM--column 4,7 hidden
                    var PriorityTable = document.querySelector('#test_table3_for_selenium_priority');
                    var columnTH = PriorityTable.querySelectorAll('th[data-col-index]');

                    var visibleTH = [];
                    var invisibleTH = [];

                    for(var i = 0; i < columnTH.length; i++){
                        if(columnTH[i].offsetWidth > 0 && columnTH[i].offsetHeight > 0){
                            visibleTH.push(i);
                        }else{
                            invisibleTH.push(i);
                        }
                    }

                    return{
                        userPrefs: userPrefs, //dataStore
                        hiddenTH: invisibleTH, //physical count in DOM
                        visibleTH: visibleTH //physical count in DOM
                    }
                }).
                then(function(columnObj){
                    assert.deepEqual(columnObj.userPrefs, [3, 6], 'Column 4, 7 should be hidden'); //dataStore
                    assert.deepEqual(columnObj.hiddenTH, [3, 6], 'Column 4, 7 should not be visible in the DOM'); //physical check-invisible
                    assert.deepEqual(columnObj.visibleTH, [0,1,2,4,5,7,8,9,10,11,12,13,14,15,16,17], 'Should match visible array'); //physical check-visible
                });
        },
        'Shrink browser window size to 1043px and make sure column 12 disappear': function(){
            return this.remote
                .setWindowSize(1043, 888)
                .setFindTimeout(2000)
                .findById('test_table3_for_selenium_priority')
                    .end()
                    .sleep(2000)

                .execute(function(){
                    //verify the dataStore--column 4,7,12 hidden
                    var ColumnsPrefs = emp.reference.tables['test_table3_for_selenium_priority'].config.plugins.responsive.colState;
                    var userPrefs = ColumnsPrefs.hidden; 

                    //verify column th is not visible in the DOM--column 4,7,12 hidden
                    var PriorityTable = document.querySelector('#test_table3_for_selenium_priority');
                    var columnTH = PriorityTable.querySelectorAll('th[data-col-index]');

                    var visibleTH = [];
                    var invisibleTH = [];

                    for(var i = 0; i < columnTH.length; i++){
                        if(columnTH[i].offsetWidth > 0 && columnTH[i].offsetHeight > 0){
                            visibleTH.push(i);
                        }else{
                            invisibleTH.push(i);
                        }
                    }

                    return{
                        userPrefs: userPrefs, //dataStore
                        hiddenTH: invisibleTH, //physical count in DOM
                        visibleTH: visibleTH //physical count in DOM
                    }
                }).
                then(function(columnObj){
                    assert.deepEqual(columnObj.userPrefs, [3, 6, 11], 'Column 4, 7, 12 should be hidden'); //dataStore
                    assert.deepEqual(columnObj.hiddenTH, [3, 6, 11], 'Column 4, 7, 12 should not be visible in the DOM'); //physical check-invisible
                    assert.deepEqual(columnObj.visibleTH, [0,1,2,4,5,7,8,9,10,12,13,14,15,16,17], 'Should match visible array'); //physical check-visible
                });
        },
        'Expand browser window size to 1207px and make sure column 12 reappear': function(){
            return this.remote
                .setWindowSize(1207, 888)
                .setFindTimeout(2000)
                .findById('test_table3_for_selenium_priority')
                    .end()
                    .sleep(1500)

                .execute(function(){
                    //verify the dataStore--column 4,7 hidden
                    var ColumnsPrefs = emp.reference.tables['test_table3_for_selenium_priority'].config.plugins.responsive.colState;
                    var userPrefs = ColumnsPrefs.hidden; 

                    //verify column 12 is visible in DOM
                    var PriorityTable = document.querySelector('#test_table3_for_selenium_priority');
                    var columnTH = PriorityTable.querySelectorAll('th[data-col-index]');

                    var visibleTH = [];
                    var invisibleTH = [];

                    for(var i = 0; i < columnTH.length; i++){
                        if(columnTH[i].offsetWidth > 0 && columnTH[i].offsetHeight > 0){
                            visibleTH.push(i);
                        }else{
                            invisibleTH.push(i);
                        }
                    }

                    return{
                        userPrefs: userPrefs, //dataStore
                        hiddenTH: invisibleTH, //physical count in DOM
                        visibleTH: visibleTH //physical count in DOM
                    }
                }).
                then(function(columnObj){
                    assert.deepEqual(columnObj.userPrefs, [3, 6], 'column 11 should not be hidden-only 4 and 7'); //dataStore
                    assert.deepEqual(columnObj.hiddenTH, [3, 6], 'Only column 4 and 7 should be hidden'); //physical check-invisible
                    assert.deepEqual(columnObj.visibleTH, [0,1,2,4,5,7,8,9,10,11,12,13,14,15,16,17], 'Should match visible array'); //physical check-visible
                });
        },
        'Expand browser window size to 1165px and make sure column 7 reappear': function(){
            return this.remote
                .setWindowSize(1165, 888)
                .setFindTimeout(2000)
                .findById('test_table3_for_selenium_priority')
                    .end()
                    .sleep(1500)

                .execute(function(){
                    //verify the dataStore--column 4 hidden
                    var ColumnsPrefs = emp.reference.tables['test_table3_for_selenium_priority'].config.plugins.responsive.colState;
                    var userPrefs = ColumnsPrefs.hidden; 

                    //verify column 12,7 are visible in DOM
                    var PriorityTable = document.querySelector('#test_table3_for_selenium_priority');
                    var columnTH = PriorityTable.querySelectorAll('th[data-col-index]');

                    var visibleTH = [];
                    var invisibleTH = [];

                    for(var i = 0; i < columnTH.length; i++){
                        if(columnTH[i].offsetWidth > 0 && columnTH[i].offsetHeight > 0){
                            visibleTH.push(i);
                        }else{
                            invisibleTH.push(i);
                        }
                    }

                    return{
                        userPrefs: userPrefs, //dataStore
                        hiddenTH: invisibleTH, //physical count in DOM
                        visibleTH: visibleTH //physical count in DOM
                    }
                }).
                then(function(columnObj){
                    assert.deepEqual(columnObj.userPrefs, [3], 'column 4 should be hidden'); //dataStore
                    assert.deepEqual(columnObj.hiddenTH, [3], 'Only column 4 should be hidden'); //physical check-invisible
                    assert.deepEqual(columnObj.visibleTH, [0,1,2,4,5,6,7,8,9,10,11,12,13,14,15,16,17], 'Should match visible array'); //physical check-visible
                });
        },
        'Expand browser window size to 1399px and make sure column 4 reappear': function(){
            return this.remote
                .setWindowSize(1399, 888)
                .setFindTimeout(2000)
                .findById('test_table3_for_selenium_priority')
                    .end()
                    .sleep(1500)

                .execute(function(){
                    //verify the dataStore--hidden array should be empty
                    var ColumnsPrefs = emp.reference.tables['test_table3_for_selenium_priority'].config.plugins.responsive.colState;
                    var userPrefs = ColumnsPrefs.hidden; 

                    //verify column 12,7,4 are visible in DOM
                    var PriorityTable = document.querySelector('#test_table3_for_selenium_priority');
                    var columnTH = PriorityTable.querySelectorAll('th[data-col-index]');

                    var visibleTH = [];
                    var invisibleTH = [];

                    for(var i = 0; i < columnTH.length; i++){
                        if(columnTH[i].offsetWidth > 0 && columnTH[i].offsetHeight > 0){
                            visibleTH.push(i);
                        }else{
                            invisibleTH.push(i);
                        }
                    }

                    return{
                        userPrefs: userPrefs, //dataStore
                        hiddenTH: invisibleTH, //physical count in DOM
                        visibleTH: visibleTH //physical count in DOM
                    }
                }).
                then(function(columnObj){
                    assert.deepEqual(columnObj.userPrefs, [], 'Hidden array should be empty'); //dataStore
                    assert.deepEqual(columnObj.hiddenTH, [], 'Zero columns should be hidden'); //physical check-invisible
                    assert.deepEqual(columnObj.visibleTH, [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17], 'Should match visible array'); //physical check-visible
                });
        },
        'Check and make sure table with custom table tabsets exist': function(){
            return this.remote
            .setFindTimeout(2000)
            .findById('test_table4_for_selenium_custom_tabsetprefs')
                .end()
                .sleep(500)
        
            .execute(function(){
                //verify and make sure the table exists
                var customPrefsTable = document.querySelector('#test_table4_for_selenium_custom_tabsetprefs');

                var tableExist = (customPrefsTable) ? true: false;

                return{
                    tableExist: tableExist 
                }
            }).
            then(function(tableObj){
                assert.strictEqual(tableObj.tableExist, true, 'The table with custom tabsetprefs should exist in the DOM');
            });  
        },
        'Validate flushLocalStorage function, verify customs tabsetsPrefs were set': function(){
            return this.remote
                .setFindTimeout(2000)
                .findById('test_table4_for_selenium_custom_tabsetprefs')
                .end()
                .sleep(500)

                .execute(function(){
                    //check and make sure custom tabsetsPrefs were set
                    var customPrefsTable = document.querySelector('#test_table4_for_selenium_custom_tabsetprefs');
                    var columnTH = customPrefsTable.querySelectorAll('th[data-col-index]');

                    var visibleTH = [];
                    var invisibleTH = [];

                    for(var i = 0; i < columnTH.length; i++){
                        if(columnTH[i].offsetWidth > 0 && columnTH[i].offsetHeight > 0){
                            visibleTH.push(i);
                        }else{
                            invisibleTH.push(i);
                        }
                    }
                    //verify table config were set
                    var ColumnsPrefs = emp.reference.tables['test_table4_for_selenium_custom_tabsetprefs'].config.plugins.responsive.colState;
                    var userPrefs = ColumnsPrefs.hidden; 

                    return{
                        visibleTH: visibleTH,
                        invisibleTH: invisibleTH,
                        userPrefs: userPrefs //dataStore
                    }
                }).
                then(function(customPrefsObj){             
                    assert.deepEqual(customPrefsObj.visibleTH, [0,1,2,4,5,7,8,9,10,11,12,13,14,15,16,17], 'Should match visible array'); //physical check-visible 
                    assert.deepEqual(customPrefsObj.invisibleTH, [3,6,18], 'columns 3,6,9 should be hidden'); //physical check-invisible            
                    assert.deepEqual(customPrefsObj.userPrefs, [3,6], 'Hidden array should contain 3,6,9'); //dataStore
                });
        },
        'Revert the custom configs': function(){
            return this.remote
                .setFindTimeout(2000)
                .findById('test_table4_for_selenium_custom_tabsetprefs_columns')
                    .click()
                    .end()
                    .sleep(200)

                .findById('test_table4_for_selenium_custom_tabsetprefs_revert_control')
                    .click()
                    .end()
                    .sleep(1000)
            
                .findById('test_table4_for_selenium_custom_tabsetprefs_save_control')
                    .click()
                    .end()
                    .sleep(1000)
                
                .execute(function(){
                    //---Verify the revert button was click---
                    var selectedButtonMenu = document.querySelector('#test_table4_for_selenium_custom_tabsetprefs_column_menu');
                    var revertLI = selectedButtonMenu.querySelector('li.emp-table-static-revert-link');
                    
                    var cuiHiddenActive = false;
    
                    if(revertLI.classList.contains('cui-hidden')){
                        cuiHiddenActive = true;
                    }else{
                        cuiHiddenActive = false;
                    } 
                    //---Verify all columns th are displayed as expected---
                    var customPrefsTable = document.querySelector('#test_table4_for_selenium_custom_tabsetprefs');
                    var columnTH = customPrefsTable.querySelectorAll('th[data-col-index]');

                    var visibleTH = [];
                    var invisibleTH = [];

                    for(var i = 0; i < columnTH.length; i++){
                        if(columnTH[i].offsetWidth > 0 && columnTH[i].offsetHeight > 0){
                            visibleTH.push(i);
                        }else{
                            invisibleTH.push(i);
                        }
                    }
                    //---Pull the local preferences columns config-hidden array should be empty---
                    var lStorage = emp.prefs.getPage();
                    var deselectedColumns = lStorage.pages.responsive_html.tables.test_table4_for_selenium_custom_tabsetprefs.columns.hidden;

                    //Verify the local table dataStore shows no columns are hidden
                    var ColumnsPrefs = emp.reference.tables['test_table4_for_selenium_custom_tabsetprefs'].config.plugins.responsive.colState;
                    var userPrefs = ColumnsPrefs.hidden;

                    return{
                        cuiHiddenActive: cuiHiddenActive, 
                        hiddenTH: invisibleTH, //visible/invisible in DOM
                        deselectedColumns: deselectedColumns, //localStorage
                        userPrefs: userPrefs //dataStore
                    }
                }).
                then(function(revertObj){
                    assert.strictEqual(revertObj.cuiHiddenActive, true, 'The revert button should be hidden.');
                    assert.deepEqual(revertObj.hiddenTH, [18], 'The values should match values in invisibleTH, only 18 should be hidden'); //visible/invisible in DOM
                    assert.deepEqual(revertObj.deselectedColumns, [], 'The hidden array should be empty'); //localStorage
                    assert.deepEqual(revertObj.userPrefs, [], 'The should be no column showing in the array'); //dataStore
                });
        },
        'Undo the Revert of the custom configs': function(){
            return this.remote
            .setFindTimeout(2000)
            .findById('test_table4_for_selenium_custom_tabsetprefs_columns')
               .click()
               .end()
               .sleep(500)
            
            .findById('test_table4_for_selenium_custom_tabsetprefs_undo_control')
               .click()
               .end()
               .sleep(700)

            .execute(function(){
                //check and make sure emp-selected class is active
                var selectedButtonMenu = document.querySelector('#test_table4_for_selenium_custom_tabsetprefs_column_menu');
                var empSelectedExist = false;

                if(selectedButtonMenu.classList.contains('emp-selected')){
                    empSelectedExist = true;
                }else{
                    empSelectedExist = false;
                }
                //---Verify the Undo button was click---
                var selectedButtonMenu = document.querySelector('#test_table4_for_selenium_custom_tabsetprefs_column_menu');
                var revertLI = selectedButtonMenu.querySelector('li.emp-table-static-undo-revert-link');
                
                var cuiHiddenActive = false;

                if(revertLI.classList.contains('cui-hidden')){
                    cuiHiddenActive = true;
                }else{
                    cuiHiddenActive = false;
                }
                //Verify the the custom config columns are hidden in the DOM
                var customPrefsTable = document.querySelector('#test_table4_for_selenium_custom_tabsetprefs');
                var columnTH = customPrefsTable.querySelectorAll('th[data-col-index]');

                var visibleTH = [];
                var invisibleTH = [];

                for(var i = 0; i < columnTH.length; i++){
                    if(columnTH[i].offsetWidth > 0 && columnTH[i].offsetHeight > 0){
                        visibleTH.push(i);
                    }else{
                        invisibleTH.push(i);
                    }
                }
                //---Pull the local preferences columns config-hidden array should be empty---
                var lStorage = emp.prefs.getPage();
                var deselectedColumns = lStorage.pages.responsive_html.tables.test_table4_for_selenium_custom_tabsetprefs.columns.hidden;

                //Verify the local table dataStore showing no columns are hidden
                var ColumnsPrefs = emp.reference.tables['test_table4_for_selenium_custom_tabsetprefs'].config.plugins.responsive.colState;
                var userPrefs = ColumnsPrefs.hidden;

                return{
                    empSelectedExist: empSelectedExist,
                    cuiHiddenActive: cuiHiddenActive,
                    hiddenTH: invisibleTH,
                    deselectedColumns: deselectedColumns, //localStorage
                    userPrefs: userPrefs //dataStore
                }
                
            })
            .then(function(undoObj){
                assert.strictEqual(undoObj.empSelectedExist, true, 'The emp-selected class should be active');
                assert.strictEqual(undoObj.cuiHiddenActive, true, 'The undo button should be hidden.');
                assert.deepEqual(undoObj.hiddenTH, [3,6,18], 'The values should match values in invisibleTH');
                assert.deepEqual(undoObj.deselectedColumns, [3,6], '3,6 should be hidden'); //localStorage
                assert.deepEqual(undoObj.userPrefs, [3,6], 'The following values should be in the hidden array; 3,6'); //dataStore 
            });
        } 
    });
});








