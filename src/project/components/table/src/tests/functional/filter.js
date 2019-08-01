define(function (require) {
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');

    var testb = "test";
    registerSuite(function(){

        var previousRecordCount;

        return{
            
            name: 'table - filter',            

            
            'Date Filter': {

                setup: function () {
                    previousRecordCount = null;
                },

                'Open Filter Row': function () {
                    return this.remote
                        .get(require.toUrl('http://localhost:8888/tests/table/pages/filter.html'))
                        .setFindTimeout(5000)

                        .findById('intern_test_wrapper')
                            .findByClassName('emp-icon-table-filter-toggle')
                            .click()
                            .end()

                        .sleep(500)
                },

                'Deploy date filter': function () {
                    return this.remote
                        .findById('intern_test_wrapper')
                            .findById('intern_test_data_button_filter_4')
                            .click()
                            .end()

                        .sleep(500)
                },

                'Make sure date filter triggers': function () {
                    return this.remote
                        .findByClassName('emp-tablefilter-optionpane')
                        .sleep(500)
                },        

                'Apply Matching Filter which should clear values.': function () {
                    // var recordCount = 'test';

                    return this.remote
                        .execute(function() {
                            previousRecordCount = $('#intern_test_data tbody').children().length;     
                        })

                        .findByClassName('emp-tablefilter-optionpane-date-month')
                            .type('12')
                            .end()

                        .findByClassName('emp-tablefilter-optionpane-date-day')
                            .type('30')
                            .end()

                        .findByClassName('emp-tablefilter-optionpane-date-year')
                            .type('9999')
                            .end()

                        .findByClassName('emp-tablefilter-optionpane-close')
                            .click()
                            .end()     
                        
                        .sleep(500)

                        .execute(function() {
                            var currentRecordCount = $('#intern_test_data tbody').children().length;
                            return {
                                currentRecordCount
                            };
                        })
                        .then(function (result) {
                                assert.notStrictEqual(result.currentRecordCount, previousRecordCount, 'Filter did not update row count');

                        });
                },  

                'Reset the filter': function () {
                    return this.remote
                  
                        .findByClassName('emp-tablefilter-optionpane-close')
                            .click()
                            .end()
                        
                        .sleep(500)

                        .execute(function() {
                            var currentRecordCount = $('#intern_test_data tbody').children().length;                        
                            return {
                                currentRecordCount
                            };
                        })
                        .then(function (result) {
                                assert.notStrictEqual(result.currentRecordCount, 1, 'There filter should have been cleared.');
                        });
                },        

                'Apply Range Filter with range which should clear values.': function () {
                    return this.remote
                  
                        .execute(function() {
                            recordCount = $('tbody').children().length;
                        })

                        .findById('intern_test_data_filter_button_3_range_begin_date')
                            .type('12309999')
                            .end()

                        .findById('intern_test_data_filter_button_3_range_ending_date')
                            .type('12319999')
                            .end()
          
                        .sleep(500)

                        .execute(function() {
                            var currentRecordCount = $('#intern_test_data tbody').children().length;                        
                            return {
                                currentRecordCount
                            };
                        })
                        .then(function (result) {
                                assert.strictEqual(result.currentRecordCount, 1, 'There should be no records with the above filter settings.');
                        });
                },  
            },

            'Text Filter': {

                setup: function () {
                    previousRecordCount = null;
                },

                'Open Filter Row': function () {
                    return this.remote
                        .get(require.toUrl('http://localhost:8888/tests/table/pages/filter.html'))
                        .setFindTimeout(5000)

                        .findById('intern_test_wrapper')
                            .findByClassName('emp-icon-table-filter-toggle')
                            .click()
                            .end()
                        
                        .sleep(500)
                }, 

                'Apply Partial Match Text Filter': function(){
                    return this.remote
                        .findById('intern_test_wrapper')
                            .findById('intern_test_data_input_filter_1')
                            .clearValue()
                            .type('Test')
                            .end()

                        .sleep(500)

                        .execute(function() {
                            var currentRecordCount = $('#intern_test_data tbody').children().length;                        
                            return {
                                currentRecordCount
                            };
                        })
                        .then(function (result) {
                                assert.strictEqual(result.currentRecordCount, 2, 'There should be one record with the partial match filter settings.');
                        });

                },

                'Apply Full Match Text Filter': function(){
                    return this.remote
                        .findById('intern_test_wrapper')
                            .findById('intern_test_data_input_filter_1')
                            .clearValue()
                            .type('Intern Test Value')
                            .end()

                        .sleep(500)

                        .execute(function() {
                            var currentRecordCount = $('#intern_test_data tbody').children().length;                        
                            return {
                                currentRecordCount
                            };
                        })
                        .then(function (result) {
                                assert.strictEqual(result.currentRecordCount, 2, 'There should be one record with the full match filter settings.');
                        });

                },


                'Apply No Match Text Filter': function(){
                    return this.remote
                        .findById('intern_test_wrapper')
                            .findById('intern_test_data_input_filter_1')
                            .clearValue()
                            .type('1234NOTHINGSHOULDMATCH9876')
                            .end()

                        .sleep(500)

                        .execute(function() {
                            var currentRecordCount = $('#intern_test_data tbody').children().length;                        
                            return {
                                currentRecordCount
                            };
                        })
                        .then(function (result) {
                                assert.strictEqual(result.currentRecordCount, 1, 'There should be no records with the no match filter settings.');
                        });
                },
            },

            'Number Filter': {

                setup: function () {
                    previousRecordCount = null;
                },

                'Open Filter Row': function () {
                    return this.remote
                        .get(require.toUrl('http://localhost:8888/tests/table/pages/filter.html'))
                        .setFindTimeout(5000)

                        .findById('intern_test_wrapper')
                            .findByClassName('emp-icon-table-filter-toggle')
                            .click()
                            .end()
                        
                        .sleep(500)
                },

                'Apply Partial Text Filter': function(){
                    return this.remote
                        .findById('intern_test_wrapper')
                            .findById('intern_test_data_input_filter_2')
                            .clearValue()
                            .type('0')
                            .end()

                        .sleep(500)

                        .execute(function() {
                            var currentRecordCount = $('#intern_test_data tbody').children().length;                        
                            return {
                                currentRecordCount
                            };
                        })
                        .then(function (result) {
                                assert.strictEqual(result.currentRecordCount, 7, 'There should be no records with the no match filter settings.');
                        });
                }, 

                'Apply No Match Text Filter': function(){
                    return this.remote
                        .findById('intern_test_wrapper')
                            .findById('intern_test_data_input_filter_2')
                            .clearValue()
                            .type('99')
                            .end()

                        .sleep(500)

                        .execute(function() {
                            var currentRecordCount = $('#intern_test_data tbody').children().length;                        
                            return {
                                currentRecordCount
                            };
                        })
                        .then(function (result) {
                                assert.strictEqual(result.currentRecordCount, 1, 'There should be no records with the no match filter settings.');
                        });
                }, 

                'Apply Exact Match Text Filter': function(){
                    return this.remote
                        .findById('intern_test_wrapper')
                            .findById('intern_test_data_input_filter_2')
                            .clearValue()
                            .type('5')
                            .end()

                        .sleep(500)

                        .execute(function(){
                            $( "#intern_test_data_filter_input_1 button[value='eq']" ).trigger("click");
                        })

                        .sleep(500)

                        .execute(function() {
                            var currentRecordCount = $('#intern_test_data tbody').children().length;                        
                            return {
                                currentRecordCount
                            };
                        })
                        .then(function (result) {
                                assert.strictEqual(result.currentRecordCount, 2, 'There should only be one record with this filter settings.');
                        });
                },
            },

            'Drop Down Filter': {

                setup: function () {
                    previousRecordCount = null;
                },

                'Open Filter Row': function () {
                    return this.remote
                        .get(require.toUrl('http://localhost:8888/tests/table/pages/filter.html'))
                        .setFindTimeout(5000)

                        .findById('intern_test_wrapper')
                            .findById('intern_test_data_filter')
                            .click()
                            .end()
                        
                        .sleep(1500)
                }, 

                'Apply Partial Text Filter': function(){
                    return this.remote
                        .findById('intern_test_wrapper')
                            .findById('intern_test_data_input_filter_8')
                            .click()                            
                            .end()

                        .sleep(1500)

                        .execute(function(){
                            var dropdown = $("#intern_test_data_input_filter_8");
                            dropdown.find("option[value='ZZZ']").prop('selected', true);
                            dropdown.trigger("input");
                        })

                        .sleep(1500)

                        .findById('intern_test_wrapper')
                            .findById('intern_test_data_input_filter_8')
                            .click()                            
                            .end()

                        .sleep(1500)

                        .execute(function() {
                            var currentRecordCount = $('#intern_test_data tbody').children().length -1;                        
                            return {
                                currentRecordCount
                            };
                        })
                        .then(function (result) {
                                assert.strictEqual(result.currentRecordCount, 1, 'There should be one record with the no match filter settings.');
                        });
                }, 
            },

            'Rating Filter': {

                setup: function () {
                    previousRecordCount = null;
                },

                'Open Filter Row': function () {
                    return this.remote
                        .get(require.toUrl('http://localhost:8888/tests/table/pages/filter.html'))
                        .setFindTimeout(5000)

                        .findById('intern_test_wrapper')
                            .findByClassName('emp-icon-table-filter-toggle')
                            .click()
                            .end()

                        .sleep(500)

                        .execute(function() {
                            previousRecordCount = $('#intern_test_wrapper tbody').children().length;
                        })
                }, 

                'Apply Partial Rating Filter': function(){
                    return this.remote
                        .findById('intern_test_wrapper')
                            .findById('intern_test_data_input_filter_3')
                            .click()                            
                            .end()

                        .sleep(500)

                        .execute(function(){
                            var dropdown = $("#intern_test_data_input_filter_3");
                            dropdown.find("option[value='3']").prop('selected', true);
                            dropdown.trigger("input");
                        })

                        .sleep(500)

                        .findById('intern_test_wrapper')
                            .findById('intern_test_data_input_filter_3')
                            .click()                            
                            .end()

                        .sleep(500)

                        .execute(function() {
                            var currentRecordCount = $('#intern_test_data tbody').children().length;                        
                            return {
                                currentRecordCount
                            };
                        })
                        .then(function (result) {
                                assert.strictEqual(result.currentRecordCount, 2, 'There should be no records with the no match filter settings.');
                        });
                }, 

                'Clear Rating Filter': function(){
                    return this.remote
                        .findById('intern_test_wrapper')
                            .findById('intern_test_data_input_filter_3')
                            .click()                            
                            .end()

                        .sleep(500)

                        .execute(function(){
                            var dropdown = $("#intern_test_data_input_filter_3");
                            dropdown.find("option[value='']").prop('selected', true);
                            dropdown.trigger("input");
                        })

                        .sleep(500)

                        .findById('intern_test_wrapper')
                            .findById('intern_test_data_input_filter_3')
                            .click()                            
                            .end()

                        .sleep(500)

                        .execute(function() {
                            var currentRecordCount = $('#intern_test_data tbody').children().length;                        
                            return {
                                currentRecordCount,
                                previousRecordCount
                            };
                        })
                        .then(function (result) {
                                assert.strictEqual(result.currentRecordCount, result.previousRecordCount, 'The filter should have reset to all values.');
                        });
                },
            },

            'Score Filter': {

                setup: function () {
                    previousRecordCount = null;
                },

                'Open Filter Row': function(){
                    return this.remote
                        .get(require.toUrl('http://localhost:8888/tests/table/pages/filter.html'))
                        .setFindTimeout(5000)

                        .findById('intern_test_wrapper')
                            .findById('intern_test_data_filter')
                            .click()
                            .end()
                        
                        .sleep(2500)

                        .execute(function(){
                            //verify filter row appear
                            var internTableFilterRow = document.querySelector('#intern_test_data tbody tr');
                            var cuiHiddenActive = true;

                            //check if cui-hidden class is active-should not be active
                            if(!internTableFilterRow.classList.contains('cui-hidden')){
                                cuiHiddenActive = false;
                            }

                            return{
                                cuiHiddenActive
                            }
                        }).
                        then(function(result){
                            assert.strictEqual(result.cuiHiddenActive, false, 'The cui-hidden class should not be active at this point');
                        });
                },

                'Apply No Match Filter': function(){
                    return this.remote
                        .findById('intern_test_wrapper')
                            .findById('intern_test_data_input_filter_6')
                            .clearValue()
                            .type('101')
                            .end()

                        .sleep(2500)

                        .execute(function(){
                            //check tbody tr count
                            var currentRecordCount = document.querySelectorAll('#intern_test_data tbody tr').length -1;    
                            //check dataStore skip key                    
                            var dataStore = emp.reference.tables['intern_test_data'].dataStore;
                            var trueSkipRecord = 0;

                            //get rows
                            for(var r = 0, rLen = dataStore.body.rows.length; r < rLen; r++){
                                //get skip key values
                                if(dataStore.body.rows[r].skip === true){
                                    trueSkipRecord += 1;
                                }
                            }

                            return{
                                currentRecordCount,
                                trueSkipRecord
                            };
                        })
                        .then(function(result){
                            assert.strictEqual(result.currentRecordCount, 0, 'No records should be visible.');
                            assert.strictEqual(result.trueSkipRecord, 10, 'There should be 10 records with "false" value');
                        });
                },

                'Apply All Match Filter': function(){
                    return this.remote
                        .findById('intern_test_wrapper')
                            .findById('intern_test_data_input_filter_6')
                            .clearValue()
                            .type('25')
                            .end()

                        .sleep(2500)

                        .execute(function() {
                            //check tbody tr count
                            var currentRecordCount = document.querySelectorAll('#intern_test_data tbody tr').length -1;    
                            //check dataStore skip key                    
                            var dataStore = emp.reference.tables['intern_test_data'].dataStore;
                            var falseSkipRecord = 0;

                            //get rows
                            for(var r = 0, rLen = dataStore.body.rows.length; r < rLen; r++){
                                //get skip key values
                                if(dataStore.body.rows[r].skip === false){
                                    falseSkipRecord += 1;
                                }
                            }

                            return{
                                currentRecordCount,
                                falseSkipRecord
                            };                        
                            
                        })
                        .then(function(result){
                            assert.strictEqual(result.currentRecordCount, 10, '10 record should be shown.');
                            assert.strictEqual(result.falseSkipRecord, 10, 'There should be 10 records with false value');
                        });
                },
            },

            'Notifier Filter':{
            
                setup: function () {
                    previousRecordCount = null;
                },

                'Open Filter Row': function(){
                    return this.remote
                        .get(require.toUrl('http://localhost:8888/tests/table/pages/filter.html'))
                        .setFindTimeout(5000)

                        .findById('intern_test_wrapper')
                            .findById('intern_test_data_filter')
                            .click()
                            .end()
                        
                        .sleep(2500)

                        .execute(function(){
                            //verify filter row appear
                            var internTableFilterRow = document.querySelector('#intern_test_data tbody tr');
                            var cuiHiddenActive = true;

                            //check if cui-hidden does not exist
                            if(!internTableFilterRow.classList.contains('cui-hidden')){
                                cuiHiddenActive = false;
                            }

                            return{
                                cuiHiddenActive
                            }
                        }).
                        then(function(result){
                            assert.strictEqual(result.cuiHiddenActive, false, 'The cui-hidden class should not be active at this point');
                        });
                },

                'Apply ":Any" Filter': function(){
                    return this.remote
                    .findById('intern_test_wrapper')
                        .findById('intern_test_data_input_filter_7')
                        .click()                            
                        .end()

                    .sleep(500)

                    .execute(function(){
                        //change option to ":any"
                        var NotifierDropdown = $("#intern_test_data_input_filter_7");
                        NotifierDropdown.find("option[value=':any']").prop('selected', true);
                        NotifierDropdown.trigger("input");
                    })
                    .sleep(500)
                    
                    .findById('intern_test_wrapper')
                        .findById('intern_test_data_input_filter_7')
                        .click()                            
                        .end()

                    .sleep(2500)

                    .execute(function(){
                        //Check table tbody tr count
                        var currentRecordCount = $('#intern_test_data tbody').children().length -1;
                        //check dataStore skip key                 
                        var dataStore = emp.reference.tables['intern_test_data'].dataStore;
                        var falseSkipRecord = 0;

                        //get rows
                        for(var r = 0, rLen = dataStore.body.rows.length; r < rLen; r++){
                            //get skip key values
                            if(dataStore.body.rows[r].skip === false){
                                falseSkipRecord += 1;
                            }
                        }                        
                        
                        return {
                            currentRecordCount,
                            falseSkipRecord
                        };
                    })
                    .then(function(result){
                        assert.strictEqual(result.currentRecordCount, 6, 'There should only be 6 visible records.');
                        assert.strictEqual(result.falseSkipRecord, 6, 'There should be 6 records with "false" value');
                    });
                },

                'Apply ":None" Filter': function(){
                    return this.remote
                    .findById('intern_test_wrapper')
                        .findById('intern_test_data_input_filter_7')
                        .click()                            
                        .end()

                    .sleep(500)

                    .execute(function(){
                        //change option to ":any"
                        var NotifierDropdown = $("#intern_test_data_input_filter_7");
                        NotifierDropdown.find("option[value=':none']").prop('selected', true);
                        NotifierDropdown.trigger("input");
                    })
                    .sleep(500)
                    
                    .findById('intern_test_wrapper')
                        .findById('intern_test_data_input_filter_7')
                        .click()                            
                        .end()

                    .sleep(2500)

                    .execute(function(){
                        //Check table tbody tr count
                        var currentRecordCount = $('#intern_test_data tbody').children().length -1;
                        //check dataStore skip key                 
                        var dataStore = emp.reference.tables['intern_test_data'].dataStore;
                        var trueSkipRecord = 0;

                        //get rows
                        for(var r = 0, rLen = dataStore.body.rows.length; r < rLen; r++){
                            //get skip key values
                            if(dataStore.body.rows[r].skip === true){
                                trueSkipRecord += 1;
                            }
                        }                        
                        
                        return {
                            currentRecordCount,
                            trueSkipRecord
                        };
                    })
                    .then(function(result){
                        assert.strictEqual(result.currentRecordCount, 4, 'There should only be 4 visible records.');
                        assert.strictEqual(result.trueSkipRecord, 6, 'There should be 6 records with "true" value');
                    });
                },

                'Apply "ABC" Filter': function(){
                    return this.remote
                    .findById('intern_test_wrapper')
                        .findById('intern_test_data_input_filter_7')
                        .click()                            
                        .end()

                    .sleep(500)

                    .execute(function(){
                        //change option to ":any"
                        var NotifierDropdown = $("#intern_test_data_input_filter_7");
                        NotifierDropdown.find("option[value='ABC']").prop('selected', true);
                        NotifierDropdown.trigger("input");
                    })
                    .sleep(500)
                    
                    .findById('intern_test_wrapper')
                        .findById('intern_test_data_input_filter_7')
                        .click()                            
                        .end()

                    .sleep(2500)

                    .execute(function(){
                        //Check table tbody tr count
                        var currentRecordCount = $('#intern_test_data tbody').children().length -1;
                        //check dataStore skip key                 
                        var dataStore = emp.reference.tables['intern_test_data'].dataStore;
                        var falseSkipRecord = 0;

                        //get rows
                        for(var r = 0, rLen = dataStore.body.rows.length; r < rLen; r++){
                            //get skip key values
                            if(dataStore.body.rows[r].skip === false){
                                falseSkipRecord += 1;
                            }
                        }                        
                        
                        return {
                            currentRecordCount,
                            falseSkipRecord
                        };
                    })
                    .then(function(result){
                        assert.strictEqual(result.currentRecordCount, 3, 'There should only be 3 visible records.');
                        assert.strictEqual(result.falseSkipRecord, 3, 'There should be 3 records with "false" value');
                    });
                }

            }
        };
    });
});