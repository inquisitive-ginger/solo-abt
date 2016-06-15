(function(){
	'use strict';

	angular
		.module('app.abt')
		.directive('parameterCard', parameterCard);

	/** @ngInject */
	function parameterCard () {

		var parameterCardController = function($scope) {
			var vm = this;
		}

		return {
			restrict: 'E',
			templateUrl: '/app/main/abt/common/directives/parameter-card/parameter-card.html',
			scope: {
				data: '=',
				cardSize: '='
			},
			controller: parameterCardController,
			controllerAs: 'vm',
			bindToController: true
		}
	}
})();