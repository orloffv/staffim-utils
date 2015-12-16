'use strict';
(function() {
    angular.module('staffimUtils')
        .factory('SUhttpInterceptor', SUhttpInterceptor)
        .config(setInterceptor);

    SUhttpInterceptor.$inject = ['$rootScope', 'SU_EVENTS', '$q', 'CONFIG'];
    function SUhttpInterceptor($rootScope, SU_EVENTS, $q, CONFIG) {
        var service = {};

        service.responseError = responseError;

        return service;

        function responseError(response) {
            if (response.status === 404) {
                if (response.config.url.indexOf(CONFIG.apiUrl) !== -1) {
                    $rootScope.$broadcast(SU_EVENTS.FAILED_REQUEST_404, response);
                }
            }

            return $q.reject(response);
        }
    }

    setInterceptor.$inject = ['$httpProvider'];
    function setInterceptor($httpProvider) {
        $httpProvider.interceptors.push('SUhttpInterceptor');
    }
})();
