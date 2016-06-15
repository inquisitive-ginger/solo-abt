(function ()
{
    'use strict';

    angular
        .module('app.dashboard', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, msApiProvider, msNavigationServiceProvider)
    {
        // State
        $stateProvider
            .state('app.dashboard', {
                url    : '/dashboard',
                views  : {
                    'content@app': {
                        templateUrl: 'app/main/dashboard/dashboard.html',
                        controller : 'DashboardController as vm'
                    }
                }
            });


        // Api
        // msApiProvider.register('sample', ['app/data/sample/sample.json']);

        // Navigation
        msNavigationServiceProvider.saveItem('dashboard', {
            title    : 'Dashboard',
            icon     : 'icon-tile-four',
            state    : 'app.dashboard',
            weight   : 1
        });
    }
})();