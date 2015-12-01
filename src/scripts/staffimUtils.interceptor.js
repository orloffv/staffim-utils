'use strict';
(function() {
    angular.module('staffimUtils')
        .factory('SUhttpInterceptor', SUhttpInterceptor)
        .config(setInterceptor);

    SUhttpInterceptor.$inject = ['$rootScope', 'SA_EVENTS', 'SU_EVENTS', '$q'];
    function SUhttpInterceptor($rootScope, SA_EVENTS, SU_EVENTS, $q) {
        var service = {};

        service.responseError = responseError;

        return service;

        function responseError(response) {
            if (response.status === 401) {
                $rootScope.$broadcast(SA_EVENTS.ACCESS_TOKEN_EXPIRED, response);
            } else if (response.status === 404) {
                $rootScope.$broadcast(SU_EVENTS.FAILED_REQUEST_404, response);
            }

            return $q.reject(response);
        }
    }

    setInterceptor.$inject = ['$httpProvider'];
    function setInterceptor($httpProvider) {
        $httpProvider.interceptors.push('SUhttpInterceptor');
    }
})();
