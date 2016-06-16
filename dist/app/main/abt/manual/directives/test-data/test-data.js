(function(){
	'use strict';

	angular
		.module('app.abt')
		.directive('testData', testData);

	/** @ngInject */
	function testData () {
		return {
			restrict: 'E',
			templateUrl: '/app/main/abt/manual/directives/test-data/test-data.html',
			scope: {
				settings: '=',
				data: '='
			}
		}
	}
})();