(function ()
{
	'use strict';

	angular
		.module('app.abt.manual')
		.controller('ManualTestController', ManualTestController);

	/** @ngInject */
	function ManualTestController($scope, configData, utils, calcService, FileSaver, Blob, Upload, $http)
    {
        var vm = this;

        // Data
        vm.settings = {
            standards: configData.standards, 
            codes: configData.codes
        };

        vm.testData     = {};
        vm.resultData   = {};
        vm.showResults  = false;

        // Methods
        vm.updateTestSettings   = updateTestSettings;
        vm.updatePressureLevels = updatePressureLevels;
        vm.updateFanList        = updateFanList;
        vm.updateCodeSettings   = updateCodeSettings;
        vm.prepareForResults    = prepareForResults;
        vm.uploadTestData       = uploadTestData;
        vm.saveTestData         = saveTestData;

        // update test settings based on new standard selected by user
        function updateTestSettings () {
        	var index = utils.indexOf(vm.settings.standards, 'name', vm.settings.standard);
        	var standard = vm.settings.standards[index];

        	vm.settings.startPressure 		= standard.start_pressure;
        	vm.settings.stopPressure 		= standard.stop_pressure;
        	vm.settings.numberOfSteps		= standard.num_steps;
        	vm.settings.referencePressure 	= standard.reference_pressure;
            
            updatePressureLevels();
        }

        // update code settings base on new code selected by user
        function updateCodeSettings () {
            var index = utils.indexOf(vm.settings.codes, 'name', vm.settings.code);
            var code = vm.settings.codes[index];

            vm.settings.resultMetric            = code.result_metric;
            vm.settings.allowableLeakageRate    = code.leakage_rate;
            vm.settings.pressureExpBounds       = [code.n_min, code.n_max];
            vm.settings.rSquaredMin             = code.r_squared_min;
        }

        // update pressure levels based on change in range
        function updatePressureLevels () {
            vm.settings.levels = calcService.getPressureLevels(vm.settings.startPressure, vm.settings.stopPressure, vm.settings.numberOfSteps);

            vm.testData = {};
            _.each(vm.settings.levels, function(elem, index){
                vm.testData[elem] = {pressure: '', flow: ''};
            });
        }

        // create an array of fans based on count
        function updateFanList () {
            vm.settings.fanList = {};

            for(var i = 1; i <= vm.settings.numberOfFans; i++) {
                vm.settings.fanList[i] = {name: 'Fan #' + i, data: {}};
            }
        }

        // set results view to visible
        function prepareForResults () {
            vm.showResults = true;
        }

        // upload data from json file
        function uploadTestData (file) {
            var reader = new FileReader();

            reader.addEventListener("load", function() {
                $http
                    .get(reader.result)
                    .then(function(res){loadTestData(res.data)});
            }, false);

            reader.readAsDataURL(file);
        }

        // save json data from file to test data object
        function loadTestData (data) {
            _.each(_.keys(data), function (key, index) {
                key !== 'testData' && (vm.settings[key] = data[key]);
            });

            //updateFanList();
            updatePressureLevels();
            updateCodeSettings();

            data.testData && (vm.testData = data.testData);
        }

        // download data and settings as json file
        function saveTestData () {
            var dataToDownload = {};

            // only grab the useful stuff
            var settingsNames = [
                'testName',
                'standard',
                'code',
                'referencePressure',
                'numberOfFans',
                'testDirection',
                'startPressure',
                'stopPressure',
                'numberOfSteps',
                'buildingHeight',
                'elevation',
                'envelopeArea',
                'envelopeVolume',
                'initialBaselinePressure',
                'finalBaselinePressure',
                'initialInsideTemp',
                'finalInsideTemp',
                'initialOutsideTemp',
                'finalOutsideTemp',
                'fanList'
            ];

            _.each(settingsNames, function (setting, index) {
                dataToDownload[setting] = vm.settings[setting];
            });

            dataToDownload.testData = vm.testData;

            var data = new Blob([JSON.stringify(dataToDownload)], { type: 'text/json;charset=utf-8' });
            FileSaver.saveAs(data, dataToDownload.testName + '.json');
        }
    }
})();