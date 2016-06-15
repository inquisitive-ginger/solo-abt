(function ()
{
    'use strict';

    var fuseThemes = {
        'default'  : {
            primary   : {
                name: 'fuse-pale-blue',
                hues: {
                    'default': '700',
                    'hue-1'  : '500',
                    'hue-2'  : '600',
                    'hue-3'  : '400'
                }
            },
            accent    : {
                name: 'light-blue',
                hues: {
                    'default': '600',
                    'hue-1'  : '400',
                    'hue-2'  : '700',
                    'hue-3'  : 'A100'
                }
            },
            warn      : {name: 'red'},
            background: {
                name: 'grey',
                hues: {
                    'default': 'A100',
                    'hue-1'  : '100',
                    'hue-2'  : '50',
                    'hue-3'  : '300'
                }
            }
        },
        "bee" : {
            "primary":{
                "name":"grey",
                "hues":{
                    "default":"700",
                    "hue-1":"500",
                    "hue-2":"600",
                    "hue-3":"400"}
                },
            "accent":{
                "name":"amber",
                "hues":{
                    "default":"600",
                    "hue-1":"400",
                    "hue-2":"700",
                    "hue-3":"A100"
                }
            },
            "warn":{
                "name":"fuse-pale-blue",
                "hues":{
                    "default":"500",
                    "hue-1":"300",
                    "hue-2":"800",
                    "hue-3":"A100"
                }
            },
            "background":{
                "name":"grey",
                "hues":{
                    "default":"A100",
                    "hue-1":"100",
                    "hue-2":"50",
                    "hue-3":"300"
                }
            }
        }

    };

    angular
        .module('app.core')
        .constant('fuseThemes', fuseThemes);
})();