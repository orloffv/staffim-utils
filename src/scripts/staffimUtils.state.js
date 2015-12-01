'use strict';
(function() {
    angular.module('staffimUtils')
        .config(stateConfig);

    stateConfig.$inject = ['$provide'];
    function stateConfig($provide) {
        $provide.decorator('$state', stateDecorator);

        stateDecorator.$inject = ['$delegate', '$stateParams', '$rootScope', '$location'];
        function stateDecorator($delegate, $stateParams, $rootScope, $location) {
            $delegate.forceReload = function() {
                return $delegate.go($delegate.current, $stateParams, {
                    reload: true,
                    inherit: false,
                    notify: true
                });
            };

            $delegate.syncUrl = function() {
                if ($rootScope.nextState) {
                    var nextUrl = $delegate.href($rootScope.nextState.state, $rootScope.nextState.params);

                    if ($location.url() !== nextUrl) {
                        $location.url(nextUrl);
                        $location.replace();
                    }
                }
            };

            return $delegate;
        }
    }
})();
