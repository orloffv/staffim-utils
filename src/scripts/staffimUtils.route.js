'use strict';
(function() {
    angular.module('staffimUtils')
        .config(baseRouter)
        .config(otherwiseRouter)
        .run(stateChangeSuccess)
        .run(locationChangeSuccess)
        .run(stateChangeError);

    stateChangeSuccess.$inject = ['SUPageService', '$rootScope', '$state'];
    function stateChangeSuccess(pageService, $rootScope, $state) {
        $rootScope.$on('$stateChangeSuccess', function(event, toState) {
            pageService.stateStatus = 'loaded';
            pageService.setTitle($state.$current);

            var bodyClass;
            if (toState.data && toState.data.bodyClass) {
                bodyClass = toState.data.bodyClass;
            }
            pageService.setBodyClass(bodyClass);
        });
    }

    locationChangeSuccess.$inject = ['$location', '$rootScope'];
    function locationChangeSuccess($location, $rootScope) {
        $rootScope.$on('$locationChangeSuccess', function(event) {
            var path = $location.path();
            var newPath = path;
            if (path[path.length - 1] === '/') {
                newPath = path.substr(0, path.length - 1);
                event.preventDefault();
                $location.path(newPath);
            }
        });
    }

    stateChangeError.$inject = ['$rootScope', '$state', 'SULogger'];
    function stateChangeError($rootScope, $state, SULogger) {
        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
            if (error.redirect) {
                return $state.go(error.redirect.name, error.redirect.params);
            }


            SULogger.error(event, error);
        });
    }

    baseRouter.$inject = ['$locationProvider'];
    function baseRouter($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }

    otherwiseRouter.$inject = ['$urlRouterProvider'];
    function otherwiseRouter($urlRouterProvider) {
        $urlRouterProvider.otherwise(function($injector) {
            var $state = $injector.get('$state');
            if ($injector.has('SAService')) {
                var SAService = $injector.get('SAService');

                SAService.isAuthorized()
                    .then(function() {
                        $state.go('auth.404', {}, {location: false});
                    })
                    .catch(function() {
                        $state.go('public.login');
                    });
            } else {
                return $state.go('auth.404', {}, {location: false});
            }
        });
    }
})();
