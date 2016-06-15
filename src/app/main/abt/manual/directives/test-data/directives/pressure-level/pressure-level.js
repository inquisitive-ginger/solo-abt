(function(){
	'use strict';

	angular
		.module('app.abt')
		.directive('pressureLevel', pressureLevel);

	/** @ngInject */
	function pressureLevel () {
		var pressureLevelController = function ($scope, $mdDialog, calcService) {
			var vm = this;

			vm.editFanData = editFanData;

			function editFanData(fanCount) {
				$mdDialog.show({
					templateUrl: '/app/main/abt/manual/directives/test-data/templates/fan-data.html',
					controller: function($scope) {
						$scope.fanList = vm.fanList;
						$scope.target = vm.target;

						$scope.updateAveragePressure = updateAveragePressure;
						$scope.updateTotalFlow = updateTotalFlow;

						function updateAveragePressure () {
							vm.data[vm.target].pressure = calcService.averagePressure($scope.fanList, $scope.target);
						}

						function updateTotalFlow () {
							vm.data[vm.target].flow = calcService.totalFlow($scope.fanList, $scope.target);
						}
					},
					clickOutsideToClose: true
				});
			}
		}

		return {
			restrict: 'E',
			templateUrl: '/app/main/abt/manual/directives/test-data/directives/pressure-level/pressure-level.html',
			scope: {
				target: '=',
				fanList: '=',
				data: '='
			},
			controller: pressureLevelController,
			controllerAs: 'vm',
			bindToController: true
		}
	}

})();