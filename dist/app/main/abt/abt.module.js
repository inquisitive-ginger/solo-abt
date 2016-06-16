(function ()
{
    'use strict';

    angular
        .module('app.abt', [
            'app.abt.manual',
            'app.abt.automated'
        ])
        .config(config);

    /** @ngInject */
    function config(msNavigationServiceProvider)
    {
        // Navigation
        msNavigationServiceProvider.saveItem('abt', {
            title : 'Test',
            icon  : 'icon-chart-line',
            weight: 1
        });

        msNavigationServiceProvider.saveItem('abt.auto', {
            title: 'Automated',
            state: 'app.abt_automated'

        });

        msNavigationServiceProvider.saveItem('abt.manual', {
            title: 'Manual',
            state: 'app.abt_manual'
        });
    }

})();