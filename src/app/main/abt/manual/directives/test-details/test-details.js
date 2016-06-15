(function(){
	'use strict';

	angular
		.module('app.abt')
		.directive('testDetails', testDetails);

	/** @ngInject */
	function testDetails () {
		return {
			restrict: 'E',
			templateUrl: '/app/main/abt/manual/directives/test-details/test-details.html',
			scope: {
				settings: '=',
				updateSettings: '&',
				updateLevels: '&',
				updateFans: '&',
				updateCode: '&'
			}
		}
	}
})();