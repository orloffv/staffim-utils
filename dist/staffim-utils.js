(function(){
    angular.module('staffimUtils', ['ui.router', 'ngCookies', 'ngSanitize', 'ngNotify']);
    angular.module('staffimUtils.uploader', ['ngFileUpload', 'staffimAuth']);
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
            FAILED_REQUEST_403: 'failed-request-403',
            //FAILED_REQUEST_SERVER: 'failed-request-server',
            'WINDOW_UNLOAD': 'window_unload'
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

                var cleanstateChangeSuccess = $rootScope.$on('$stateChangeSuccess', function() {
                    markActiveLink($state.current.name, $state.$current);
                });

                $timeout(function() {
                    markActiveLink($state.current.name, $state.$current);
                }, 10);

                $scope.$on('$destroy', function() {
                    cleanstateChangeSuccess();
                });
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

    SUhttpInterceptor.$inject = ['$rootScope', 'SU_EVENTS', '$q', 'CONFIG', '$injector'];
    function SUhttpInterceptor($rootScope, SU_EVENTS, $q, CONFIG, $injector) {
        var service = {};

        service.responseError = responseError;

        return service;

        function responseError(response) {
            var SAService = $injector.get('SAService');
            if (_.has(response, 'config') && response.config.url.indexOf(CONFIG.apiUrl) !== -1) {
                if (SAService.isValidAccessToken()) {
                    if (response.config.method === 'GET') {
                        if (response.status === 404) {
                            $rootScope.$broadcast(SU_EVENTS.FAILED_REQUEST_404, response);
                        } else if (response.status === 403) {
                            $rootScope.$broadcast(SU_EVENTS.FAILED_REQUEST_403, response);
                        } else if (response.status === 500) {
                            $rootScope.$broadcast(SU_EVENTS.FAILED_REQUEST_500, response);
                        }
                    }
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

    stateChangeSuccess.$inject = ['SUPageService', '$rootScope', '$state', '$anchorScroll', 'SUAnalytic', 'SULogger'];
    function stateChangeSuccess(pageService, $rootScope, $state, $anchorScroll, SUAnalytic, SULogger) {
        $rootScope.$on('$stateChangeSuccess', function(event, toState) {
            pageService.stateStatus = 'loaded';
            pageService.setTitle($state.$current);

            var bodyClass;
            if (toState.data && toState.data.bodyClass) {
                bodyClass = toState.data.bodyClass;
            }
            pageService.setBodyClass(bodyClass);
            $anchorScroll();
            SUAnalytic.hit();
            SULogger.changeState(toState);
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

    function isSpecificValue(val) {
        return (
        //val instanceof Buffer ||
        val instanceof Date
        || val instanceof RegExp
        ) ? true : false;
    }

    function cloneSpecificValue(val) {
        //if (val instanceof Buffer) {
        //    var x = new Buffer(val.length);
        //    val.copy(x);
        //    return x;
        //} else
        if (val instanceof Date) {
            return new Date(val.getTime());
        } else if (val instanceof RegExp) {
            return new RegExp(val);
        } else {
            throw new Error('Unexpected situation');
        }
    }

    /**
     * Recursive cloning array.
     */
    function deepCloneArray(arr) {
        var clone = [];
        arr.forEach(function (item, index) {
            if (typeof item === 'object' && item !== null) {
                if (Array.isArray(item)) {
                    clone[index] = deepCloneArray(item);
                } else if (isSpecificValue(item)) {
                    clone[index] = cloneSpecificValue(item);
                } else {
                    clone[index] = deepExtend({}, item);
                }
            } else {
                clone[index] = item;
            }
        });
        return clone;
    }

    function deepExtend (/*obj_1, [obj_2], [obj_N]*/) {
        if (arguments.length < 1 || typeof arguments[0] !== 'object') {
            return false;
        }

        if (arguments.length < 2) {
            return arguments[0];
        }

        var target = arguments[0];

        // convert arguments to array and cut off target object
        var args = Array.prototype.slice.call(arguments, 1);

        var val, src, clone;

        args.forEach(function (obj) {
            // skip argument if it is array or isn't object
            if (typeof obj !== 'object' || Array.isArray(obj)) {
                return;
            }

            Object.keys(obj).forEach(function (key) {
                src = target[key]; // source value
                val = obj[key]; // new value

                // recursion prevention
                if (val === target) {
                    return;

                    /**
                     * if new value isn't object then just overwrite by new value
                     * instead of extending.
                     */
                } else if (typeof val !== 'object' || val === null) {
                    target[key] = val;
                    return;

                    // just clone arrays (and recursive clone objects inside)
                } else if (Array.isArray(val)) {
                    target[key] = deepCloneArray(val);
                    return;

                    // custom cloning and overwrite for specific objects
                } else if (isSpecificValue(val)) {
                    target[key] = cloneSpecificValue(val);
                    return;

                    // overwrite by new value if source isn't object or array
                } else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
                    target[key] = deepExtend({}, val);
                    return;

                    // source value and new value is objects both, extending...
                } else {
                    target[key] = deepExtend(src, val);
                    return;
                }
            });
        });

        return target;
    }

    _.mixin({
        getById: function(collection, id) {
            return _.find(collection, function(model) {
                return model.id === id;
            });
        },
        removeById: function(collection, id) {
            var index = _.findIndex(collection, function(model) {
                return _.has(model, 'id') && model.id === id;
            });

            if (index !== -1) {
                collection.splice(index, 1);
            }

            return collection;
        },
        insertArray: function(collection, position, item) {
            collection.splice(position, 0, item);

            return collection;
        },
        replaceItemArray: function(collection, find, replace) {
            if (_.contains(collection, find)) {
                collection[collection.indexOf(find)] = replace;
            }

            return collection;
        },
        copyModel: function(original, copyModel) {
            copyModel = angular.copy(original, copyModel);
            copyMany(original, copyModel, 0);

            //Hack for hasMany relation save
            function copyMany(original, copyModel, depth) {
                _.each(original, function(originalItem, key) {
                    if (_.has(originalItem, '$scope')) {
                        if (_.isObject(originalItem) && !_.isUndefined(originalItem.length)) {
                            copyModel[key] = originalItem;
                        } else {
                            if (depth <=2) {
                                copyMany(originalItem, copyModel[key], depth + 1);
                            }
                        }
                    }
                }, this);
            }

            return copyModel;
        },
        //https://github.com/unclechu/node-deep-extend
        deepExtend: deepExtend
    });
})();

'use strict';
(function() {
    angular.module('staffimUtils')
        .directive('btn', function() {
            return {
                restrict: 'C',
                link: function(scope, element) {
                    if (!element.data('no-waves')) {
                        if (element.hasClass('btn-icon') || element.hasClass('btn-float')) {
                            Waves.attach(element, ['waves-circle']);
                        } else if (element.hasClass('btn-light')) {
                            Waves.attach(element, ['waves-light']);
                        } else {
                            Waves.attach(element);
                        }

                        Waves.init();
                    }
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
            accept: '\'image/*\'',
            allowEmptyResponse: false,
            acceptDropClass: '',
            rejectDropClass: '',
            ngfResize: {
                width: 1000,
                quality: 0.7
            },
            ngfResizeIf: '$width > 1000 || $height > 1000'
        })
        .service('SUUploader', ['$q', 'Upload', 'cfpLoadingBar', 'SUUploaderOptions', function($q, Upload, cfpLoadingBar, SUUploaderOptions) {
            var defaults = {
                ngfAllowDir: SUUploaderOptions.ngfAllowDir,
                ngfMaxSize: SUUploaderOptions.ngfMaxSize,
                accept: SUUploaderOptions.accept,
                allowEmptyResponse: SUUploaderOptions.allowEmptyResponse,
                acceptDropClass: SUUploaderOptions.acceptDropClass,
                rejectDropClass: SUUploaderOptions.rejectDropClass,
                ngfResize: SUUploaderOptions.ngfResize,
                ngfResizeIf: SUUploaderOptions.ngfResizeIf
            };

            var Uploader = function(opts, object, url, isImage) {
                this.construct = function(opts, object, url, isImage) {
                    object = object || {file: null};
                    object.onChange = _.bind(this.onChange, this);

                    this.loading = false;
                    this.object = object;
                    this.isImage = isImage || true;
                    this.url = url || SUUploaderOptions.url;
                    this.options = angular.extend({}, defaults, opts);
                    object.accept = this.options.accept;
                    this.options.ngfAccept = this.options.accept;
                    this.options.ngfDragOverClass = {
                        accept: this.options.acceptDropClass,
                        reject: this.options.rejectDropClass,
                        pattern: this.options.accept
                    };
                    this.options.ngfResize = this.options.ngfResize;
                    this.options.ngfResizeIf = this.options.ngfResizeIf;

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

                this.getBase64 = function() {
                    if (this.object.file) {
                        return Upload.base64DataUrl(this.object.file);
                    }

                    return null;
                };

                this.beforeModelChange = function(file) {
                    if (file) {
                        this.loading = true;
                        cfpLoadingBar.start();
                    }
                };

                this.modelChange = function() {
                    this.loading = false;
                    cfpLoadingBar.complete();
                };

                this.upload = function(requiredFile) {
                    var that = this;
                    requiredFile = requiredFile || false;
                    var defer = $q.defer();

                    if (this.object.file) {
                        if (!this.loading) {
                            cfpLoadingBar.start();
                        }
                        var upload = Upload.upload({
                            url: _.result(this, 'url'),
                            data: {file: this.object.file},
                            ignoreLoadingBar: true
                        });
                        upload
                            .then(
                                function(response) {
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
                                that.loading = false;
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
        }]);
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

    SULogger.$inject = ['$window', '$injector', 'moment'];
    function SULogger($window, $injector, moment) {
        var logger,
            faker = {
                error: function() {},
                info: function() {},
                init: function() {}
            },
            rollbar = {
                isSupported: function() {
                    return Boolean('Rollbar' in $window && typeof $window.Rollbar === 'object');
                },
                error: function(name, error) {
                    this.configure();

                    return $window.Rollbar.error(name, error);
                },
                info: function(name, message) {
                    this.configure();

                    return $window.Rollbar.info(name, message);
                },
                init: function(person) {
                    this.person = person;
                    this.configure();
                },
                configure: function() {
                    var $state = $injector.get('$state');
                    $window.Rollbar.configure({
                        payload: {
                            environment: $window.location.hostname.toLowerCase(),
                            server: {
                                host: $window.location.hostname
                            },
                            person: this.person,
                            context: $state.current.name,
                            timeline: JSON.stringify(this.timeline)
                        }
                    });
                },
                person: {}
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
                },
                info: function(name, message) {
                    var params = ['Info: %s. ', name];
                    if (message) {
                        params.push(message);
                    }

                    console.info.apply(console, params);
                },
                init: function() {}
            };

        if (rollbar.isSupported()) {
            logger = rollbar;
        } else if (local.isSupported()) {
            logger = local;
        } else {
            logger = faker;
        }

        logger.timeline = [];
        logger.changeState = function(state) {
            logger.pushTimeline({
                controller: state.controller,
                name: state.name
            }, 'changeState');
        };
        logger.ngClick = function(element, functionName) {
            logger.pushTimeline({
                innerHtml: element[0].innerHTML,
                functionName: functionName
            }, 'ngClick');
        };
        logger.ngSubmit = function(element, functionName) {
            logger.pushTimeline({
                functionName: functionName,
                attributes: element.attr()
            }, 'ngSubmit');
        };
        logger.pushTimeline = function(data, type) {
            if (_.size(logger.timeline) > 20) {
                logger.timeline = _.last(logger.timeline, 20);
            }

            data.timeline = moment().unix();
            data.type = type;
            logger.timeline.push(data);
        };

        return logger;
    }
})();

'use strict';
(function() {
    angular.module('staffimUtils')
        .factory('SUFormatterDate', ['moment', function(moment) {
            return {
                formatter: function(val) {
                    if (val) {
                        var date;
                        if (val.length === 10 && _.size(_.words(val, '.')) === 3) {
                            date = moment(val, 'DD.MM.YYYY');
                        } else {
                            date = moment(val);
                        }

                        return date.format('YYYY-MM-DDT00:00:00.000') + 'Z';
                    }

                    return null;
                },
                parser: function(val) {
                    if (val) {
                        var date;
                        if (val.length === 10 && _.size(_.words(val, '.')) === 3) {
                            date = moment(val, 'DD.MM.YYYY');
                        } else {
                            date = moment(val);
                        }

                        return date.toDate();
                    }

                    return null;
                }
            };
        }])
        .factory('SUFormatterDateTime', ['moment', function(moment) {
            return {
                formatter: function(val) {
                    return val ? (moment(val).format('YYYY-MM-DDTHH:mm:ss') + 'Z') : null;
                },
                parser: function(val) {
                    return val ? moment(val).toDate() : null;
                }
            };
        }])
        .factory('SUFormatterWeek', ['moment', function(moment) {
            return {
                formatter: function(val) {
                    if (val) {
                        var date;
                        if (val.length === 10 && _.size(_.words(val, '.')) === 3) {
                            date = moment(val, 'DD.MM.YYYY');
                        } else {
                            date = moment(val);
                        }

                        return date.isoday(1).format('YYYY-MM-DDT00:00:00.000') + 'Z';
                    }

                    return null;
                },
                formatterEnd: function(val) {
                    if (val) {
                        var date;
                        if (val.length === 10 && _.size(_.words(val, '.')) === 3) {
                            date = moment(val, 'DD.MM.YYYY');
                        } else {
                            date = moment(val);
                        }

                        return date.isoday(7).format('YYYY-MM-DDT00:00:00.000') + 'Z';
                    }

                    return null;
                },
                parser: function(val) {
                    if (val) {
                        var date;
                        if (val.length === 10 && _.size(_.words(val, '.')) === 3) {
                            date = moment(val, 'DD.MM.YYYY');
                        } else {
                            date = moment(val);
                        }

                        return date.isoday(1).toDate();
                    }

                    return null;
                }
            };
        }]);
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
            link: function ($scope, element, attrs) {
                var oneTime = attrs.suUrlOneTime,
                    options = attrs.suUrlOptions,
                    params = attrs.suUrlParams,
                    route = attrs.suUrlRoute,
                    model = $scope.$eval(attrs.suUrl);

                setHref(element);
                if (!oneTime) {
                    $scope.$watch(attrs.suUrl, function(newVal, oldVal) {
                        if (!_.isEqual(getHref(newVal), getHref(oldVal))) {
                            setHref(element);
                        }
                    });
                }

                function setHref(element) {
                    element.attr('ui-sref', SUUrlService.getStateName(model, route, params));
                    element.attr('href', getHref(model));
                }

                function getHref(model) {
                    return SUUrlService.getUrl(model, route, params, options);
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
                    element.on('click.aDirective', clickHandler);
                }

                var destroyScopeDestroyListener = scope.$on('$destroy', function() {
                    element.off('.aDirective');

                    destroyScopeDestroyListener();
                });
            }
        };
    }

    _.each(['click', 'submit'], function(eventName) {
        var directiveName = _.camelize('ng-' + eventName);
        var updateButton = function(button, isRunning) {
            button.prop('disabled', isRunning);
        };

        angular.module('staffimUtils').directive(directiveName, ['$parse', 'SULogger', function($parse, SULogger) {
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
                        element.on(eventName + '.' + directiveName, function(event) {
                            if (!scope.eventRunning) {
                                scope.$apply(function() {
                                    scope.eventRunning = true;
                                    SULogger[directiveName](element, attr[directiveName]);
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

                        var destroyScopeDestroyListener = scope.$on('$destroy', function() {
                            element.off('.' + directiveName);

                            destroyScopeDestroyListener();
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

'use strict';
(function() {
    angular.module('staffimUtils.uploader')
        .config(fileManagerWhiteList)
        .service('SUFileManager', SUFileManager);

    SUFileManager.$inject = ['CONFIG', 'SAService'];
    function SUFileManager(CONFIG, SAService) {
        return {
            remote: function(id, params) {
                var queryString = '';
                if (!_.isUndefined(params)) {
                    params = _.extend({
                        type: 'thumbnail'
                    }, params);

                    queryString = '?' + $.param({q: JSON.stringify(params)});
                }

                return CONFIG.apiUrl + '/images/' + id + queryString;
            },
            local: function(path) {
                return CONFIG.assetsUrl + path;
            },
            remoteWithAccesToken: function(path, params) {
                params = _.extend({
                    token: SAService.getAccessToken()
                }, params || {});

                var queryString = '?' + $.param(params);

                if (_.startsWith(path, 'http')) {
                    return path + queryString;
                } else {
                    return CONFIG.apiUrl + path + queryString;
                }
            }
        };
    }

    fileManagerWhiteList.$inject = ['CONFIG', '$sceDelegateProvider'];
    function fileManagerWhiteList(CONFIG, $sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist([
            'self',
            'data:**',
            CONFIG.apiUrl + '/**'
        ]);
    }
})();

'use strict';
(function() {
    angular.module('staffimUtils')
        .filter('filesize', fileSizeFilter);

    function fileSizeFilter() {
        var units = [
            'байт',
            'Кб',
            'Мб',
            'Гб',
            'Тб',
            'Пб'
        ];

        return function(bytes, precision) {
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
                return '?';
            }

            var unit = 0;
            bytes = parseFloat(bytes);

            while (bytes >= 1024) {
                bytes /= 1024;
                unit ++;
            }

            return bytes.toFixed(+ precision) + ' ' + units[unit];
        };
    }
})();

'use strict';
(function() {
    angular.module('staffimUtils')
        .filter('distance', distanceFilter);

    function distanceFilter() {
        var units = [
            'м',
            'км',
            'тыс. км'
        ];

        return function(meters, precision) {
            if (isNaN(parseFloat(meters)) || !isFinite(meters)) {
                return '?';
            }

            var unit = 0;

            while (meters >= 1000) {
                meters /= 1000;
                unit ++;
            }

            return meters.toFixed(+ precision) + ' ' + units[unit];
        };
    }
})();

'use strict';
(function() {
    angular.module('staffimUtils')
        .config(tooltipConfig);

    tooltipConfig.$inject = ['$uibTooltipProvider'];
    function tooltipConfig($uibTooltipProvider) {
        $uibTooltipProvider.options({
            appendToBody: true
        });
    }
})();

'use strict';
(function() {
    angular.module('staffimUtils')
        .service('SUAnalytic', SUAnalytic);

    SUAnalytic.$inject = ['$state', '$rootScope', '$window'];
    function SUAnalytic($state, $rootScope, $window) {
        return {
            hit: function() {
                try {
                    var url = '/' + _.replaceAll($state.current.name, /\./, '/');
                    var params = $state.params;
                    $window.yaCounter.hit(url, {
                        params: params,
                        title: $rootScope.pageTitle
                    });
                } catch (e) {}
            },
            goal: function(key, value) {
                try {
                    $window.yaCounter.reachGoal(key, value);
                } catch (e) {}
            },
            init: function(params) {
                try {
                    $window.yaCounter.params(params);
                } catch (e) {}
            }
        };
    }
})();

'use strict';
(function() {
    angular.module('staffimUtils')
        .run(notifyConfig)
        .service('SUNotify', SUNotify);

    SUNotify.$inject = ['ngNotify', '$injector'];
    function SUNotify(ngNotify, $injector) {
        var service = {};
        service.success = success;
        service.error = error;
        service.errorResponse = errorResponse;
        service.info = info;
        service.warning = warning;

        function success(message, options) {
            return ngNotify.set(message, _.extend({type: 'success'}, options));
        }

        function error(message, options) {
            return ngNotify.set(message, _.extend({type: 'error', duration: 3000}, options));
        }

        function info(message, options) {
            return ngNotify.set(message, _.extend({type: 'info'}, options));
        }

        function warning(message, options) {
            return ngNotify.set(message, _.extend({type: 'warn'}, options));
        }

        function errorResponse(response, message) {
            var SRErrorTranslator = $injector.get('SRErrorTranslator');

            var translator = new SRErrorTranslator(response.modelName);
            var errors = translator.parseResponse(response.$response);
            if (_.size(errors) || message) {
                this.error(_.size(errors) ? _.toSentence(errors, '<br>', '<br>') : message);
            }
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

'use strict';
(function($) {
    // duck-punching to make attr() return a map
    var _old = $.fn.attr;
    $.fn.attr = function() {
        var a, aLength, attributes, map;
        if (this[0] && arguments.length === 0) {
            map = {};
            attributes = this[0].attributes;
            aLength = attributes.length;
            for (a = 0; a < aLength; a++) {
                map[attributes[a].name.toLowerCase()] = attributes[a].value;
            }
            return map;
        } else {
            return _old.apply(this, arguments);
        }
    }
}(window.$));

'use strict';
(function() {
    angular.module('staffimUtils')
        .directive('suAfterRender', suAfterRender);

    suAfterRender.$inject = ['$timeout'];
    function suAfterRender($timeout) {
        return {
            restrict: 'A',
            transclude: false,
            link: function (scope, element, attrs) {
                $timeout(scope.$eval(attrs.suAfterRender), 1000);
            }
        };
    }
})();

'use strict';
(function() {
    moment.durationSeconds = function(seconds) {
        return moment.duration(seconds, 'seconds').format('h [час], m [мин], s [сек]');
    };
})();

'use strict';
(function() {
    angular.module('staffimUtils')
        .service('SUStorage', SUStorage);

    SUStorage.$inject = ['$window', '$cookieStore'];
    function SUStorage($window, $cookieStore) {
        var storage,
            localStorageStore = {
                get: function(key) {
                    var value = $window.localStorage[key];

                    try {
                        return value ? angular.fromJson(value) : value;
                    } catch (e) {
                        return null;
                    }
                },
                put: function(key, value) {
                    $window.localStorage.setItem(key, angular.toJson(value));
                },
                remove: function(key) {
                    $window.localStorage.removeItem(key);
                },
                isSupported: function() {
                    var storage = $window.localStorage,
                        key = '__' + Math.round(Math.random() * 1e7);
                    try {
                        storage.setItem(key, '1');
                        storage.removeItem(key);

                        return 'localStorage' in $window && $window.localStorage;
                    } catch (error) {
                        return false;
                    }
                }
            },
            cookieStorage = {
                get: function(key, defaultValue) {
                    var value = $cookieStore.get(key);

                    if (_.isUndefined(value) && !_.isUndefined(defaultValue)) {
                        return defaultValue;
                    }

                    return value;
                },
                set: function(key, value) {
                    $cookieStore.put(key, value);
                },
                remove: function(key) {
                    $cookieStore.remove(key);
                },
                type: 'cookie'
            },
            localStorage = {
                get: function(key, defaultValue) {
                    var value = localStorageStore.get(key);

                    if (_.isUndefined(value) && !_.isUndefined(defaultValue)) {
                        return defaultValue;
                    }

                    return value;
                },
                set: function(key, value) {
                    localStorageStore.put(key, value);
                },
                remove: function(key) {
                    localStorageStore.remove(key);
                },
                type: 'localStorage'
            };

        if (localStorageStore.isSupported()) {
            storage = localStorage;
        } else {
            storage = cookieStorage;
        }

        storage.increment = function(key) {
            /*jshint bitwise: false */
            var current = this.get(key);
            var value = (current|0) ? current + 1 : 1;
            this.set(key, value);

            return value;
        };

        return storage;
    }
})();

'use strict';
(function() {
    angular.module('staffimUtils')
        .config(deferred);

    deferred.$inject = ['$provide'];
    function deferred($provide) {
        $provide.decorator('$q', ['$delegate', function($delegate) {
            var defer = $delegate.defer;
            $delegate.defer = function() {
                var deferred = defer();

                deferred.promise.state = deferred.state = 'pending';

                deferred.promise.then(function() {
                    deferred.promise.state = deferred.state = 'fulfilled';
                }, function () {
                    deferred.promise.state = deferred.state = 'rejected';
                });

                return deferred;
            };
            
            return $delegate;
        }]);
    }
})();

'use strict';
(function() {
    angular.module('staffimUtils')
        .run(broadcaster);

    broadcaster.$inject = ['$rootScope', '$window', 'SU_EVENTS'];
    function broadcaster($rootScope, $window, SU_EVENTS) {
        $window.onunload = onunload;
        function onunload() {
            $rootScope.$broadcast(SU_EVENTS.WINDOW_UNLOAD);
        }
    }
})();
