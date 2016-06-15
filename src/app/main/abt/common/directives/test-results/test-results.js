(function(){
	'use strict';

	angular
		.module('app.abt')
		.directive('testResults', testResults);

	/** @ngInject */
	function testResults () {

		var testResultsController = function($scope, calcService) {
			var vm = this;

			// temperature and baseline
			vm.avgInsideTemp	= 0.5 * (vm.settings.initialInsideTemp + vm.settings.finalInsideTemp);
			vm.avgOutsideTemp	= 0.5 * (vm.settings.initialOutsideTemp + vm.settings.finalOutsideTemp);
			vm.avgBaseline 		= 0.5 * (vm.settings.initialBaselinePressure + vm.settings.finalBaselinePressure);

			// air density and viscosity
			vm.insideDensity 	= calcService.airDensity(vm.avgInsideTemp, vm.settings.elevation);
			vm.outsideDensity 	= calcService.airDensity(vm.avgOutsideTemp, vm.settings.elevation);
			vm.insideViscosity	= calcService.dynamicViscosity(vm.avgInsideTemp);
			vm.outsideViscosity = calcService.dynamicViscosity(vm.avgOutsideTemp);
			vm.densityRatio 	= vm.settings.testDirection == 'Positive' ? vm.outsideDensity / vm.insideDensity : vm.insideDensity / vm.outsideDensity;

			vm.correctedData 	= calcService.correctedData(vm.data, vm.avgBaseline, vm.densityRatio);
			vm.lnData 			= calcService.lnData(vm.correctedData);
			vm.rSquared 		= calcService.rSquared(vm.lnData);

			// actual results that people care about
			vm.regParams		= calcService.regParameters(vm.lnData);
			vm.pressureExponent	= vm.regParams[0];

			vm.flowCoefficient 	= calcService.correctedFlowCoefficient(
									vm.regParams[1], 
									vm.pressureExponent, 
									vm.settings.pressureDirection == 'Positive' ? vm.insideDensity : vm.outsideDensity, 
									vm.settings.pressureDirection == 'Positive' ? vm.insideViscosity : vm.outsideViscosity);

			vm.powerData 		= calcService.powerData(vm.settings.levels, vm.regParams[1], vm.pressureExponent);
			vm.totalLeakage 	= calcService.flowValue(vm.regParams[1], vm.pressureExponent, vm.settings.referencePressure);
			vm.allowableLeakage = vm.settings.envelopeArea * vm.settings.allowableLeakageRate;
			vm.leakageRate 		= calcService.normalizedFlow(vm.totalLeakage, vm.settings.envelopeArea);

			vm.effectiveLA 		= calcService.effectiveLeakageArea(
									vm.flowCoefficient, 
									vm.pressureExponent, 
									vm.settings.pressureDirection == 'Positive' ? vm.insideViscosity : vm.outsideViscosity,
									vm.settings.referencePressure);

			vm.totalLeakageResult = {
				parameter: 'Total Leakage',
				parameterUnits: 'CFM',
				parameterValue: vm.totalLeakage,
				referenceUnits: 'Pa',
				referenceValue: vm.settings.referencePressure,
				allowableValue: vm.allowableLeakage,
				allowableUnits: 'CFM',
				pfResult: vm.totalLeakage < vm.allowableLeakage ? 'PASS' : 'FAIL',
				decimals: 0
			}

			vm.normalizedFlowResult = {
				parameter: 'Normalized Leakage Rate',
				parameterUnits: 'CFM/ft²',
				parameterValue: vm.leakageRate,
				referenceUnits: 'Pa',
				referenceValue: vm.settings.referencePressure,
				pfResult: vm.leakageRate < vm.settings.allowableLeakageRate ? 'PASS' : 'FAIL',
				allowableValue: vm.settings.allowableLeakageRate,
				allowableUnits: 'CFM/ft²',
				decimals: 2
			}

			vm.elaResult = {
				parameter: 'Effective Leakage Area',
				parameterUnits: 'ft²',
				parameterValue: vm.effectiveLA,
				referenceUnits: 'Pa',
				referenceValue: vm.settings.referencePressure,
				decimals: 2
			}

			vm.flowCoefficientResult = {
				parameter: 'Flow Coefficient',
				parameterValue: vm.flowCoefficient,
				decimals: 2
			}

			vm.pressureExponent = {
				parameter: 'Pressure Exponent',
				parameterValue: vm.pressureExponent,
				pfResult: 	vm.pressureExponent > vm.settings.pressureExpBounds[0] && 
							vm.pressureExponent < vm.settings.pressureExpBounds[1] ? 
							'PASS' : 'FAIL',
				allowableValue: vm.settings.pressureExpBounds[0] + ' < n < ' + vm.settings.pressureExpBounds[1],
				decimals: 2
			}

			vm.rSquaredResult = {
				parameter: 'R²',
				parameterValue: vm.rSquared,
				pfResult: vm.rSquared > vm.settings.rSquaredMin ? 'PASS' : 'FAIL',
				allowableValue: 'R² > ' + vm.settings.rSquaredMin,
				decimals: 4
			}

			vm.pfTableData = {
				columns: ['Target Pressure (Pa)', 'Corrected Pressure (Pa)', 'Corrected Flow (CFM)'],
				rows: formatDataForTable(vm.correctedData)
			};

			vm.ciTableData = {
				columns: ['Parameter', 'Lower Bound', 'Upper Bound'],
				rows: [
					[
						{	value: 'Total Flow (CFM)', 
							classes:'font-weight-600'
						},
						{
							value: 95453,
							classes: ''
						},
						{
							value: 96453,
							classes: ''
						}
					],
					[
						{	value: 'Normalized Flow (CFM/ft²)', 
							classes:'font-weight-600'
						},
						{
							value: 0.32,
							classes: ''
						},
						{
							value: 0.35,
							classes: ''
						}
					],
					[
						{	value: 'Equivalent Leakage Area (in²)', 
							classes:'font-weight-600'
						},
						{
							value: 129.5,
							classes: ''
						},
						{
							value: 131.2,
							classes: ''
						}
					]
				]
			};
			
			vm.scatterChart = {
	            options: {
		            chart: {
		                type: 'multiChart',
		                height: 450,
		                color: d3.scale.category10().range(),
		                useInteractiveGuideline: false,
		                x: function(d){ return d.x; },
              			y: function(d){ return d.y; },
						tooltip: {
							contentGenerator: function (e) {
								var series = e.series[0];
								if (series.value === null) return;

								var rows = 
									"<tr>" +
										"<td class='key'>" + 'Pressure: ' + "</td>" +
										"<td class='x-value'>" + e.value + "</td>" + 
									"</tr>" +
									"<tr>" +
										"<td class='key'>" + 'Air Leakage: ' + "</td>" +
										"<td class='x-value'><strong>" + (series.value?series.value.toFixed(2):0) + "</strong></td>" +
									"</tr>";

								var header = 
									"<thead>" + 
										"<tr>" +
											"<td class='legend-color-guide'><div style='background-color: " + series.color + ";'></div></td>" +
											"<td class='key'><strong>" + series.key + "</strong></td>" +
										"</tr>" + 
									"</thead>";

								return 	"<table>" +
											header +
											"<tbody>" + 
												rows + 
											"</tbody>" +
										"</table>";
							}
						},
		                duration: 500,
		                xAxis: {
		                    tickFormat: function(d){
		                        return d3.format(',f')(d);
		                    },
		                    axisLabel: 'Pressure (Pa)'
		                },
		                yAxis1: {
		                    tickFormat: function(d){
		                        return d3.format(',.1f')(d);
		                    },
		                    axisLabel: 'Air Leakage (CFM)'
		                }
		            }
		        },
	            data   : [
	            	{
	            		key: vm.settings.testDirection == 'Positive' ? 'Pressurization Data' : 'Depressurization Data',
	            		values: formatDataForChart(vm.correctedData),
	            		yAxis: 1,
	            		type: 'scatter'
			        },
			        {
			        	key: 'Trendline',
			        	values: vm.powerData,
	            		yAxis: 1,
	            		type: 'line'
			        }
	            ]
	        };

	        // return array of data in format that can be easily consumed by table
	        function formatDataForTable (data) {
	        	var tableData = [];

	        	_.each(data, function(data, index) {
	        		tableData.push([
	        			{value: data.target, decimals: 0, classes: 'text-boxed w-50 m-0 md-accent-bg md-hue-2 white-fg'},
	        			{value: data.x, decimals: 1, classes: ''},
	        			{value: data.y, decimals: 0, classes: ''}
	        		]);
	        	});

	        	return tableData;
	        }

	        // return format for chart
	        function formatDataForChart (data) {
	        	var chartData = [];

	        	_.each(data, function(data, index) {
	        		chartData.push({x: data.x, y: data.y});
	        	})

	        	return chartData;
	        }
		}

		return {
			restrict: 'E',
			templateUrl: '/app/main/abt/common/directives/test-results/test-results.html',
			scope: {
				data: '=',
				settings: '='
			},
			controller: testResultsController,
			controllerAs: 'vm',
			bindToController: true
		}
	}
})();