'use strict';
(function() {
    angular.module('staffimUtils')
        .run(notifyConfig)
        .service('SUNotify', SUNotify);

    SUNotify.$inject = ['ngNotify'];
    function SUNotify(ngNotify) {
        var service = {};
        service.success = success;
        service.error = error;
        service.info = info;

        function success(message, options) {
            return ngNotify.set(message, _.extend({type: 'success'}, options));
        }

        function error(message, options) {
            return ngNotify.set(message, _.extend({type: 'error', duration: 3000}, options));
        }

        function info(message, options) {
            return ngNotify.set(message, _.extend({type: 'info'}, options));
        }

        return service;
    }

    notifyConfig.$inject = ['ngNotify'];
    function notifyConfig(ngNotify) {
        ngNotify.config({
            theme: 'pure',
            position: 'top',
            duration: 1000,
            button: true,
            html: true
        });
    }
})();
