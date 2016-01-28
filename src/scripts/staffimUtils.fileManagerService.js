'use strict';
(function() {
    angular.module('staffimUtils')
        .service('SUFileManager', SUFileManager);

    SUFileManager.$inject = ['CONFIG'];
    function SUFileManager(CONFIG) {
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
            }
        };
    }
})();
