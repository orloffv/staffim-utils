'use strict';
(function() {
    angular.module('staffimUtils.uploader')
        .config(fileManagerWhiteList)
        .service('SUFileManager', SUFileManager);

    SUFileManager.$inject = ['CONFIG', 'SAService'];
    function SUFileManager(CONFIG, SAService) {
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
