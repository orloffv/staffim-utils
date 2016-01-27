'use strict';
(function() {
    angular.module('staffimUtils')
        .service('SUFileManager', SUFileManager);

    SUFileManager.$inject = ['CONFIG'];
    function SUFileManager(CONFIG) {
        return {
            remote: function(id) {
                return CONFIG.apiUrl + '/images/' + id;
            },
            local: function(path) {
                return CONFIG.assetsUrl + path;
            }
        };
    }
})();
