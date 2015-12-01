'use strict';
(function() {
    angular.module('staffimUtils')
        .factory('SUPageService', SUPageService);

    SUPageService.$inject = ['$interpolate', '$rootScope'];
    function SUPageService($interpolate, $rootScope) {
        var service = {};

        service.setTitle = setTitle;
        service.setBodyClass = setBodyClass;
        service.stateStatus = null;

        return service;

        function setTitle(state) {
            var title = '';
            if (angular.isDefined(state.data) && angular.isDefined(state.data.title)) {
                if (angular.isDefined(state.data.title)) {
                    title  = $interpolate(state.data.title)(state.locals.globals);
                }
            } else if (angular.isDefined(state.title)) {
                title  = state.title;
            }
            $rootScope.pageTitle = title;
        }

        function setBodyClass(bodyClass) {
            $rootScope.bodyClass = bodyClass;
        }
    }
})();
