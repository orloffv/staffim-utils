'use strict';
(function() {
    angular.module('staffimUtils')
        .run(appListener);

    appListener.$inject = ['$rootScope', '$state', 'SU_EVENTS'];
    function appListener($rootScope, $state, SU_EVENTS) {
        $rootScope.$on(SU_EVENTS.FAILED_REQUEST_404, error404);
        $rootScope.$on(SU_EVENTS.FAILED_REQUEST_403, error403);
        $rootScope.$on(SU_EVENTS.FAILED_REQUEST_500, error500);

        function error404() {
            $state.syncUrl();
            $state.go('auth.404', {}, {location: false});
        }

        function error403() {
            $state.syncUrl();
            $state.go('auth.403', {}, {location: false});
        }

        function error500() {
            $state.syncUrl();
            $state.go('auth.500', {}, {location: false});
        }
    }
})();
