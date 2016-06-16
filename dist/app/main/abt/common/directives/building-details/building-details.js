(function(){
	'use strict';

	angular
		.module('app.abt')
		.directive('buildingDetails', buildingDetails);

	/** @ngInject */
	function buildingDetails () {
		return {
			restrict: 'E',
			templateUrl: '/app/main/abt/common/directives/building-details/building-details.html',
			scope: {
				settings: '='
			}
		}
	}
})();