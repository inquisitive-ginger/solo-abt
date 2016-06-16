(function ()
{
    'use strict';

    angular
        .module('app.abt.manual', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, msApiProvider)
    {
        // State
        $stateProvider
            .state('app.abt_manual', {
                url    : '/abt/manual',
                views  : {
                    'content@app': {
                        templateUrl: 'app/main/abt/manual/manual.html',
                        controller : 'ManualTestController as vm'
                    }
                },
                resolve: {
                    configData: function (msApi) {
                        return msApi.resolve('abt.config@get');
                    }
                }
            });

        msApiProvider.register('abt.config', ['app/data/abt/settings.json']);
    }
})();