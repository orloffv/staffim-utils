(function(){
    angular.module('staffimUtils', []);
})();

'use strict';
(function() {
    angular.module('staffimUtils')
        .constant('SU_EVENTS', {
            //INVALID_REQUEST: 'invalid-request',
            APPLICATION_RUN: 'application-run',
            //FAILED_REQUEST_OFFLINE: 'failed-request-offline',
            FAILED_REQUEST_404: 'failed-request-404'
            //FAILED_REQUEST_403: 'failed-request-403',
            //FAILED_REQUEST_SERVER: 'failed-request-server'
        })
        .constant('moment', moment)
        .constant('jQuery', window.$);
})();

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

'use strict';
(function() {
    angular.module('staffimUtils')
        .directive('suMenu', suMenu);

    suMenu.$inject = ['$rootScope', '$state', '$timeout', '$interpolate'];
    function suMenu($rootScope, $state, $timeout, $interpolate) {
        return {
            restrict: 'A',
            scope: {
                sectionPrefix: '='
            },
            link: function($scope, element, $attrs) {
                var activeClass = $attrs.navMenu || 'active';
                var markActiveLink = function(stateName, currentState) {
                    var activeLink;
                    element.find('> li > [data-section]').each(function() {
                        $(this).closest('li').removeClass(activeClass);
                        var $section = $(this);

                        var sections = $(this).data('section').split(',');
                        _.each(sections, function(section) {
                            var sectionPrefixes = $scope.sectionPrefix ? $scope.sectionPrefix.split(',') : [''];
                            _.each(sectionPrefixes, function(sectionPrefix) {
                                var fullSection = sectionPrefix + section;

                                if ($state.includes(fullSection)) {
                                    if ($section.data('section-verify-expression') && $section.data('section-verify-value')) {
                                        if ($interpolate('{{' + $section.data('section-verify-expression') + '}}')(currentState.locals.globals) === $section.data('section-verify-value')) {
                                            activeLink = $section;
                                        }
                                    } else {
                                        activeLink = $section;
                                    }
                                }
                            });
                        });
                    });

                    if (activeLink && activeLink.length) {
                        activeLink.closest('li').addClass(activeClass);
                    }
                };

                $rootScope.$on('$stateChangeSuccess', function() {
                    markActiveLink($state.current.name, $state.$current);
                });

                $timeout(function() {
                    markActiveLink($state.current.name, $state.$current);
                }, 10);
            }
        };
    }
})();

'use strict';
(function() {
    angular.module('staffimUtils')
        .factory('SUhttpInterceptor', SUhttpInterceptor)
        .config(setInterceptor);

    SUhttpInterceptor.$inject = ['$rootScope', 'SU_EVENTS', '$q'];
    function SUhttpInterceptor($rootScope, SU_EVENTS, $q) {
        var service = {};

        service.responseError = responseError;

        return service;

        function responseError(response) {
            if (response.status === 404) {
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

'use strict';
(function() {
    angular.module('staffimUtils')
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

    stateChangeError.$inject = ['$rootScope'];
    function stateChangeError($rootScope) {
        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
            console.info(error);
        });
    }
})();

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

'use strict';
(function() {
    _.mixin(s.exports());
})();

'use strict';
(function() {
    angular.module('staffimUtils')
        .directive('btn', function() {
            return {
                restrict: 'C',
                link: function(scope, element) {
                    if (element.hasClass('btn-icon') || element.hasClass('btn-float')) {
                        Waves.attach(element, ['waves-circle']);
                    }

                    else if (element.hasClass('btn-light')) {
                        Waves.attach(element, ['waves-light']);
                    }

                    else {
                        Waves.attach(element);
                    }

                    Waves.init();
                }
            };
        });
})();
