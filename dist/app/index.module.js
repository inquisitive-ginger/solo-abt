(function ()
{
    'use strict';

    /**
     * Main module of the Fuse
     */
    angular
        .module('fuse', [

            // Core
            'app.core',

            // Navigation
            'app.navigation',

            // Toolbar
            'app.toolbar',

            // Quick panel
            'app.quick-panel',

            // Dashboard
            'app.dashboard',

            // Test Platform
            'app.abt',

            // 3rd Party
            'angularUtils.directives.dirPagination',
            'nvd3',
            'ngFileSaver',
            'ngFileUpload',
            'filereader'
        ]);
})();