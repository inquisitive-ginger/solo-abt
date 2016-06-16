(function ()
{
    'use strict';

    angular
        .module('app.abt.automated', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, msApiProvider, msNavigationServiceProvider)
    {
        // State
        $stateProvider
            .state('app.abt_automated', {
                url    : '/abt/automated',
                views  : {
                    'content@app': {
                        templateUrl: 'app/main/abt/automated/automated.html',
                        controller : 'AutomatedTestController as vm'
                    }
                }
            });
    }
})();