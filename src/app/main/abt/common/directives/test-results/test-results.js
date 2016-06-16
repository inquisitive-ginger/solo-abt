(function(){
	'use strict';

	angular
		.module('app.abt')
		.directive('testResults', testResults);

	/** @ngInject */
	function testResults () {

		var testResultsController = function($scope, $filter, calcService) {
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
									
			// statistical analysis
			vm.correctedData 	= calcService.correctedData(vm.data, vm.avgBaseline, vm.densityRatio);
			vm.lnData 			= calcService.lnData(vm.correctedData);
			vm.rSquared 		= calcService.rSquared(vm.lnData);
			vm.lnPVariance 		= calcService.sampleVariance(_.unzip(vm.lnData)[0]);
			vm.lnQVariance 		= calcService.sampleVariance(_.unzip(vm.lnData)[1]);
			vm.lnDataCovariance	= calcService.sampleCovariance(_.unzip(vm.lnData));


			// actual results that people care about
			// vm.regParams			= calcService.regParameters(vm.lnData);
			vm.pressureExponent		= vm.lnDataCovariance / vm.lnPVariance; // vm.regParams[0];
			vm.rawFlowCoefficient	= Math.exp(ss.mean(_.unzip(vm.lnData)[1]) - vm.pressureExponent * ss.mean(_.unzip(vm.lnData)[0])); //vm.regParams[1];

			vm.flowCoefficient 	= calcService.correctedFlowCoefficient(
									vm.rawFlowCoefficient, 
									vm.pressureExponent, 
									vm.settings.pressureDirection == 'Positive' ? vm.insideDensity : vm.outsideDensity, 
									vm.settings.pressureDirection == 'Positive' ? vm.insideViscosity : vm.outsideViscosity);
			vm.powerData 		= calcService.powerData(vm.settings.levels, vm.rawFlowCoefficient, vm.pressureExponent);
			vm.totalLeakage 	= calcService.flowValue(vm.rawFlowCoefficient, vm.pressureExponent, vm.settings.referencePressure);
			vm.allowableLeakage = vm.settings.envelopeArea * vm.settings.allowableLeakageRate;
			vm.leakageRate 		= calcService.normalizedFlow(vm.totalLeakage, vm.settings.envelopeArea);

			vm.effectiveLA 		= calcService.effectiveLeakageArea(
									vm.flowCoefficient, 
									vm.pressureExponent, 
									vm.settings.pressureDirection == 'Positive' ? vm.insideViscosity : vm.outsideViscosity,
									vm.settings.referencePressure);

			// confidence intervals for measured and derived quantities
			vm.N 					= _.size(_.unzip(vm.lnData)[0]);
			vm.nVariance 			= calcService.nVariance(vm.lnPVariance, vm.lnQVariance, vm.lnDataCovariance, vm.pressureExponent, vm.N);
			vm.lnCVariance 			= calcService.lnCVariance(vm.nVariance, _.unzip(vm.lnData)[0]);
			vm.regVarianceAtRef 	= calcService.regVariance(vm.nVariance, vm.N, vm.lnPVariance, Math.log(vm.settings.referencePressure), ss.mean(_.unzip(vm.lnData)[0]));
			vm.pressureExponentCI 	= calcService.ciBounds(vm.pressureExponent, vm.nVariance, vm.N);
			vm.flowCoefficientCI	= calcService.ciBoundsReg(vm.rawFlowCoefficient, vm.lnCVariance);
			vm.totalLeakageCI 		= calcService.ciBoundsReg(vm.totalLeakage, vm.regVarianceAtRef);
			vm.leakageRateCI		= calcService.ciBoundsReg(vm.leakageRate, vm.regVarianceAtRef);
			vm.leakageAreaCI		= calcService.ciBoundsReg(vm.effectiveLA, vm.regVarianceAtRef);

			console.log(vm);

			vm.totalLeakageResult = {
				parameter: 'Total Leakage',
				parameterUnits: 'CFM',
				parameterValue: $filter('number')(vm.totalLeakage, 0),
				referenceUnits: 'Pa',
				referenceValue: vm.settings.referencePressure,
				allowableValue: $filter('number')(vm.allowableLeakage, 0),
				allowableUnits: 'CFM',
				pfResult: vm.totalLeakage < vm.allowableLeakage ? 'PASS' : 'FAIL'
			}

			vm.normalizedFlowResult = {
				parameter: 'Normalized Leakage Rate',
				parameterUnits: 'CFM/ft²',
				parameterValue:$filter('number')(vm.leakageRate, 2),
				referenceUnits: 'Pa',
				referenceValue: vm.settings.referencePressure,
				pfResult: vm.leakageRate < vm.settings.allowableLeakageRate ? 'PASS' : 'FAIL',
				allowableValue: vm.settings.allowableLeakageRate,
				allowableUnits: 'CFM/ft²'
			}

			vm.elaResult = {
				parameter: 'Effective Leakage Area',
				parameterUnits: 'ft²',
				parameterValue: $filter('number')(vm.effectiveLA, 2),
				referenceUnits: 'Pa',
				referenceValue: vm.settings.referencePressure
			}

			vm.flowCoefficientResult = {
				parameter: 'Flow Coefficient (C)',
				parameterValue: $filter('number')(vm.rawFlowCoefficient, 0)
			}

			vm.pressureExponentResult = {
				parameter: 'Pressure Exponent (n)',
				parameterValue: $filter('number')(vm.pressureExponent, 2),
				pfResult: 	vm.pressureExponent > vm.settings.pressureExpBounds[0] && 
							vm.pressureExponent < vm.settings.pressureExpBounds[1] ? 
							'PASS' : 'FAIL',
				allowableValue: vm.settings.pressureExpBounds[0] + ' < n < ' + vm.settings.pressureExpBounds[1]
			}

			vm.rSquaredResult = {
				parameter: 'R²',
				parameterValue: $filter('number')(vm.rSquared, 4),
				pfResult: vm.rSquared > vm.settings.rSquaredMin ? 'PASS' : 'FAIL',
				allowableValue: 'R² > ' + vm.settings.rSquaredMin
			}

			vm.pfTableData = {
				columns: ['Target Pressure (Pa)', 'Corrected Pressure (Pa)', 'Corrected Flow (CFM)'],
				rows: pfTableData(vm.correctedData)
			};

			
			vm.ciTableData = {
				columns: ['Parameter', 'Lower Bound', 'Upper Bound'],
				rows: ciTableData()
			}
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
										"<td class='x-value'><strong>" + (series.value?series.value.toFixed(0):0) + "</strong></td>" +
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
		                        return d3.format(',f')(d);
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
	            		type: 'scatter',
						strokeWidth: 10
			        },
			        {
			        	key: 'Trendline',
			        	values: vm.powerData,
	            		yAxis: 1,
	            		type: 'line',
						classed: 'dashed'
			        }
	            ]
	        };

			// return confidence interval table
			function ciTableData () {
				var dataTable = [];
				var rows = {
					'Total Leakage'		: [vm.totalLeakageCI, 0],
					'Leakage Rate'		: [vm.leakageRateCI, 3],
					'Leakage Area'		: [vm.leakageAreaCI, 2],
					'Flow Coefficient'	: [vm.flowCoefficientCI, 0],
					'Pressure Exponent'	: [vm.pressureExponentCI, 3]
				}

				_.each(_.keys(rows), function(param) {
					dataTable.push([
						{value: param, classes: 'text-bold'},
						{value: $filter('number')(rows[param][0][0], rows[param][1])},
						{value: $filter('number')(rows[param][0][1], rows[param][1])}
					])
				});

				return dataTable;
			}

	        // return array of data in format that can be easily consumed by table
	        function pfTableData (data) {
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
	        		chartData.push({x: data.x, y: data.y, size: .5});
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