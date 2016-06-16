(function(){
	'use strict';

	angular
		.module('fuse')
		.factory('utils', utils);

	function utils () {
		var service = {
			indexOf: indexOf
		};

		return service;

		function indexOf(arr, param, value) {
			return _.chain(arr).pluck(param).indexOf(value).value();
		}
	}
})();