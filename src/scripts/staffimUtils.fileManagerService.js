'use strict';
(function() {
    angular.module('staffimUtils')
        .config(fileManagerWhiteList)
        .service('SUFileManager', SUFileManager);

    SUFileManager.$inject = ['CONFIG', '$injector'];
    function SUFileManager(CONFIG, $injector) {
        return {
            remote: function(id, params) {
                var queryString = '';
                if (!_.isUndefined(params)) {
                    params = _.extend({
                        type: 'thumbnail'
                    }, params);

                    queryString = '?' + $.param({q: JSON.stringify(params)});
                }

                return CONFIG.apiUrl + '/images/' + id + queryString;
            },
            local: function(path) {
                return CONFIG.assetsUrl + path;
            },
            remoteWithAccesToken: function(path, params) {
                var SAService = {
                    getAccessToken: function() {
                        return null;
                    }
                };
                if ($injector.has('SAService')) {
                    SAService = $injector.get('SAService');
                }
                params = _.extend({
                    token: SAService.getAccessToken()
                }, params || {});

                var queryString = '?' + $.param(params);

                if (_.startsWith(path, 'http')) {
                    return path + queryString;
                } else {
                    return CONFIG.apiUrl + path + queryString;
                }
            }
        };
    }

    fileManagerWhiteList.$inject = ['CONFIG', '$sceDelegateProvider'];
    function fileManagerWhiteList(CONFIG, $sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist([
            'self',
            'data:**',
            CONFIG.apiUrl + '/**'
        ]);
    }
})();
