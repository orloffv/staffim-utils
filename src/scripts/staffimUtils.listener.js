'use strict';
(function() {
    angular.module('staffimUtils')
        .run(appListener);

    appListener.$inject = ['$rootScope', '$state', 'SU_EVENTS'];
    function appListener($rootScope, $state, SU_EVENTS) {
        $rootScope.$on(SU_EVENTS.FAILED_REQUEST_404, error404);

        function error404() {
            $state.syncUrl();
            $state.go('auth.404', {}, {location: false});
        }
    }
})();
