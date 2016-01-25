(function(){
    angular.module('staffimUtils', ['ui.router']);
    angular.module('staffimUtils.uploader', ['ngFileUpload'])
})();

'use strict';
(function() {
    angular.module('staffimUtils')
        .constant('SU_EVENTS', {
            //INVALID_REQUEST: 'invalid-request',
            APPLICATION_RUN: 'application-run',
            //FAILED_REQUEST_OFFLINE: 'failed-request-offline',
            FAILED_REQUEST_404: 'failed-request-404',
            FAILED_REQUEST_500: 'failed-request-500',
            FAILED_REQUEST_403: 'failed-request-403'
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
        .config(compilerProvider)
        .config(setInterceptor);

    SUhttpInterceptor.$inject = ['$rootScope', 'SU_EVENTS', '$q', 'CONFIG'];
    function SUhttpInterceptor($rootScope, SU_EVENTS, $q, CONFIG) {
        var service = {};

        service.responseError = responseError;

        return service;

        function responseError(response) {
            if (response.config.url.indexOf(CONFIG.apiUrl) !== -1) {
                if (response.status === 404) {
                    $rootScope.$broadcast(SU_EVENTS.FAILED_REQUEST_404, response);
                } else if (response.status === 403) {
                    $rootScope.$broadcast(SU_EVENTS.FAILED_REQUEST_403, response);
                } else if (response.status === 500) {
                    $rootScope.$broadcast(SU_EVENTS.FAILED_REQUEST_500, response);
                }
            }

            return $q.reject(response);
        }
    }

    setInterceptor.$inject = ['$httpProvider'];
    function setInterceptor($httpProvider) {
        $httpProvider.interceptors.push('SUhttpInterceptor');
    }

    compilerProvider.$inject = ['$compileProvider', 'CONFIG'];
    function compilerProvider($compileProvider, CONFIG) {
        if (CONFIG.debug === false) {
            $compileProvider.debugInfoEnabled(false);
        }
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
                title  = $interpolate(state.data.title)(state.locals.globals);
            } else if (angular.isDefined(state.title)) {
                title  = $interpolate(state.title)(state.locals.globals);
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

    stateChangeError.$inject = ['$rootScope'];
    function stateChangeError($rootScope) {
        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
            console.info(error);
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

'use strict';
(function() {
    angular.module('staffimUtils.uploader')
        .value('SUUploaderOptions', {
            url: '/',
            ngfAllowDir: false,
            ngfMaxSize: '10MB',
            accept: 'image/*',
            allowEmptyResponse: false
        })
        .service('SUUploader', function($q, Upload, cfpLoadingBar, SUUploaderOptions) {
            var defaults = {
                ngfAllowDir: SUUploaderOptions.ngfAllowDir,
                ngfMaxSize: SUUploaderOptions.ngfMaxSize,
                accept: SUUploaderOptions.accept,
                allowEmptyResponse: SUUploaderOptions.allowEmptyResponse
            };

            var Uploader = function(opts, object, url, isImage) {
                this.construct = function(opts, object, url, isImage) {
                    object = object || {file: null};
                    object.onChange = _.bind(this.onChange, this);

                    this.object = object;
                    this.isImage = isImage || true;
                    this.url = url || SUUploaderOptions.url;
                    this.options = angular.extend({}, defaults, opts);
                    object.accept = this.options.accept;

                    Upload.setDefaults(this.options);
                };

                this.onChange = function(file) {
                    if (this.isImage) {
                        if (file) {
                            Upload.dataUrl(file)
                                .then(function(url) {
                                    object.data = url;
                                });
                        } else {
                            object.data = null;
                        }
                    }
                };

                this.upload = function(requiredFile) {
                    var that = this;
                    requiredFile = requiredFile || false;
                    var defer = $q.defer();

                    if (this.object.file) {
                        cfpLoadingBar.start();
                        var upload = Upload.upload({
                            url: _.result(this, 'url'),
                            data: {file: this.object.file},
                            ignoreLoadingBar: true
                        });
                        upload
                            .then(function(response) {
                                if (that.isImage) {
                                    object.data = null;
                                }

                                if (!that.options.allowEmptyResponse && _.isObject(response) && _.isObject(response.data) && _.has(response.data, 'id')) {
                                    defer.resolve(response.data.id);
                                } else if (that.options.allowEmptyResponse) {
                                    defer.resolve(response.data);
                                } else {
                                    defer.reject();
                                }
                            }, function(response) {
                                defer.reject(response);
                            }, function(evt) {
                                cfpLoadingBar.set(evt.loaded / evt.total);
                            }
                        )
                            .finally(function() {
                                cfpLoadingBar.complete();
                            });
                    } else if (requiredFile) {
                        defer.reject();
                    } else {
                        defer.resolve();
                    }

                    return defer.promise;
                };

                this.clear = function() {
                    this.object.data = null;
                    this.object.file = null;
                };

                this.construct(opts, object, url, isImage);
            };

            return Uploader;
        });
})();

'use strict';
(function() {
    angular.module('staffimUtils')
        .service('SULogger', SULogger)
        .factory('$exceptionHandler', exceptionHandler);

    exceptionHandler.$inject = ['SULogger'];
    function exceptionHandler(SULogger) {
        return function(exception, cause) {
            var message = exception.toString() + ' (caused by "' + cause + '")';
            SULogger.error(message, exception);
        };
    }

    SULogger.$inject = ['$window', '$injector'];
    function SULogger($window, $injector) {
        var logger,
            faker = {
                error: function() {}
            },
            rollbar = {
                isSupported: function() {
                    return Boolean('Rollbar' in $window && typeof $window.Rollbar === 'object');
                },
                error: function(name, error) {
                    this.configure();

                    return $window.Rollbar.error(name, error);
                },
                configure: function() {
                    var $state = $injector.get('$state');
                    /*
                    if (authManager.getCurrentUser()) {
                        person = {
                            id: authManager.getCurrentUser().id,
                            username: authManager.getCurrentUser().getFullName(),
                            email: authManager.getCurrentUser().email
                        };
                    }
                    */
                    $window.Rollbar.configure({
                        payload: {
                            environment: $window.location.hostname.toLowerCase(),
                            server: {
                                host: $window.location.hostname
                            },
                            //person: person,
                            context: $state.current.name
                        }
                    });
                }
            },
            local = {
                isSupported: function() {
                    return Boolean('console' in $window && $window.console && $window.console.error);
                },
                error: function(name, error) {
                    var params = ['Error: %s. ', name];
                    if (error) {
                        params.push(error);

                        if (error.stack) {
                            params.push(error.stack);
                        }
                    }

                    console.error.apply(console, params);
                }
            };

        if (rollbar.isSupported()) {
            logger = rollbar;
        } else if (local.isSupported()) {
            logger = local;
        } else {
            logger = faker;
        }

        return logger;
    }
})();

'use strict';
(function() {
    angular.module('staffimUtils')
        .factory('SUFormatterDate', function(moment) {
            return {
                formatter: function(val) {
                    return val ? (moment(val).format('YYYY-MM-DDT00:00:00.000') + 'Z') : null;
                },
                parser: function(val) {
                    return val ? moment(val).toDate() : null;
                }
            };
        })
        .factory('SUFormatterDateTime', function(moment) {
            return {
                formatter: function(val) {
                    return val ? (moment(val).format('YYYY-MM-DDTHH:mm:ss') + 'Z') : null;
                },
                parser: function(val) {
                    return val ? moment(val).toDate() : null;
                }
            };
        });
})();

'use strict';
(function() {
    angular.module('staffimUtils')
        .directive('suCompile', suCompile);

    suCompile.$inject = ['$compile'];
    function suCompile($compile) {
        return {
            restrict: 'A',
            link: function($scope, $element, $attr) {
                $scope.$watch($attr.suCompile, function(value) {
                    $element.html(value);
                    $compile($element.contents())($scope);
                });
            }
        };
    }
})();

'use strict';
(function() {
    angular.module('staffimUtils')
        .service('SUUrlService', SUUrlService);

    SUUrlService.$inject = ['$state'];
    function SUUrlService($state) {
        var service = {};
        service.getState = getState;
        service.getUrl = getUrl;
        service.getStateName = getStateName;
        service.goToUrl = goToUrl;

        return service;

        function getState(model, route, params, options) {
            if (_.isUndefined(model._getState)) {
                throw new Error('_getState not found');
            }

            var state = model._getState(route, params);
            if (!$state.get(state.name)) {
                throw new Error('State(' + state.name + ') not found');
            }

            return state;
        }

        function getUrl(model, route, params, options) {
            var state = this.getState(model, route, params, options);

            return $state.href(state.name, state.params, _.extend({inherit: false}, options));
        }

        function getStateName(model, route, params) {
            var state = this.getState(model, route, params);

            return state.name;
        }

        function goToUrl(model, route, params, options) {
            var state = this.getState(model, route, params, options);

            return $state.go(state.name, state.params, _.extend({inherit: false}, options));
        }
    }
})();

'use strict';
(function() {
    angular.module('staffimUtils')
        .directive('suUrl', SUUrlDirective);

    SUUrlDirective.$inject = ['SUUrlService'];
    function SUUrlDirective(SUUrlService) {
        return {
            restrict: 'A',
            scope: {
                model: '=suUrl',
                route: '@suUrlRoute',
                params: '@suUrlParams',
                options: '@suUrlOptions'
            },
            link: function ($scope, element) {
                setHref(element);
                $scope.$watch('model', function(newVal, oldVal) {
                    if (!_.isEqual(getHref(newVal), getHref(oldVal))) {
                        setHref(element);
                    }
                });

                function setHref(element) {
                    element.attr('ui-sref', SUUrlService.getStateName($scope.model, $scope.route, $scope.params));
                    element.attr('href', getHref($scope.model));
                }

                function getHref(model) {
                    return SUUrlService.getUrl(model, $scope.route, $scope.params, $scope.options);
                }
            }
        };
    }
})();

'use strict';
(function() {
    angular.module('staffimUtils')
            .directive('a', aDirective)
            .config(onceEventProvide);

    onceEventProvide.$inject = ['$provide'];
    function onceEventProvide($provide) {
        $provide.decorator('ngClickDirective', ['$delegate', function($delegate) {
            $delegate.shift();

            return $delegate;
        }]);

        $provide.decorator('ngSubmitDirective', ['$delegate', function($delegate) {
            $delegate.shift();

            return $delegate;
        }]);

        $provide.decorator('aDirective', ['$delegate', function($delegate) {
            $delegate.shift();

            return $delegate;
        }]);
    }

    aDirective.$inject = ['SUPageService', '$rootScope', '$parse'];
    function aDirective(page, $rootScope, $parse) {
        return {
            restrict: 'E',
            link: function(scope, element, attr) {
                var preventDefault = false,
                    hasHref = false,
                    stateChangeHandler = null;
                if (!attr.href && !attr.xlinkHref) {
                    if (element[0].nodeName.toLowerCase() !== 'a') {
                        return;
                    }
                    var href = Object.prototype.toString.call(element.prop('href')) === '[object SVGAnimatedString]' ?
                        'xlink:href' : 'href';

                    if (!element.attr(href)) {
                        preventDefault = true;
                    }
                }

                if (element.attr('href')) {
                    if (element.attr('href') !== '#') {
                        hasHref = true;
                    }
                }

                var clickHandler = function(event) {
                    if (hasHref) {
                        if (scope.anchorRunning && page.stateStatus === 'loading') {
                            preventDefault = true;
                        } else {
                            scope.anchorRunning = true;
                            if (!stateChangeHandler) {
                                stateChangeHandler = $rootScope.$on('$stateChangeSuccess', function() {
                                    scope.anchorRunning = false;
                                    stateChangeHandler();
                                });
                            }
                        }
                    }

                    if (preventDefault) {
                        event.preventDefault();
                    } else {
                        if (
                            !event.ctrlKey &&
                            !event.shiftKey &&
                            !event.metaKey && // apple
                            !(event.button && event.button === 1) // middle click, >IE9 + everyone else
                        ) {
                            if (!_.isUndefined(attr.onClick)) {
                                $parse(scope[attr.onClick])();
                            }
                        }
                    }
                };

                if (preventDefault || hasHref) {
                    element.on('click', clickHandler);
                }
            }
        };
    }

    _.each(['click', 'submit'], function(eventName) {
        var directiveName = _.camelize('ng-' + eventName);
        var updateButton = function(button, isRunning) {
            button.prop('disabled', isRunning);
        };

        angular.module('staffimUtils').directive(directiveName, ['$parse', function($parse) {
            return {
                restrict: 'A',
                compile: function($element, attr) {
                    return function(scope, element) {
                        scope.$watch('eventRunning', function(isRunning) {
                            if (!_.isUndefined(isRunning)) {
                                if (eventName === 'submit') {
                                    if (element[0].nodeName === 'FORM') {
                                        updateButton(element.find('button[type="submit"]'), isRunning);
                                    }
                                }
                            }
                        });
                        element.on(eventName, function(event) {
                            if (!scope.eventRunning) {
                                scope.$apply(function() {
                                    scope.eventRunning = true;
                                    var result = $parse(attr[directiveName])(scope, {$event: event});
                                    if (!angular.isUndefined(result) && angular.isObject(result) && !angular.isUndefined(result.finally)) {
                                        result.finally(function() {
                                            scope.eventRunning = false;
                                        });
                                    } else {
                                        scope.eventRunning = false;
                                    }
                                });
                            }
                        });
                    };
                }
            };
        }]);
    });
})();

'use strict';
(function() {
    angular.module('staffimUtils')
        .directive('suBackButton', suBackButton);

    suBackButton.$inject = ['$window', '$compile'];
    function suBackButton($window, $compile) {
        return {
            priority: 1001,
            terminal: true,
            restrict: 'A',
            compile: function(el) {
                el.removeAttr('su-back-button');
                el.attr('ng-click', 'goBack()');
                var fn = $compile(el);

                return function(scope) {
                    scope.goBack = function() {
                        $window.history.back();
                    };
                    fn(scope);
                };
            }
        };
    }
})();
