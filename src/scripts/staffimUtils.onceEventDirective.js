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
                        if (scope.running && page.stateStatus === 'loading') {
                            preventDefault = true;
                        } else {
                            scope.running = true;
                            if (!stateChangeHandler) {
                                stateChangeHandler = $rootScope.$on('$stateChangeSuccess', function() {
                                    scope.running = false;
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
                        scope.$watch('running', function(isRunning) {
                            if (eventName === 'submit') {
                                if (element[0].nodeName === 'FORM') {
                                    updateButton(element.find('button[type="submit"]'), isRunning);
                                }
                            }
                        });
                        element.on(eventName, function(event) {
                            if (!scope.running) {
                                scope.$apply(function() {
                                    var result = $parse(attr[directiveName])(scope, {$event: event});
                                    scope.running = true;
                                    if (!angular.isUndefined(result) && angular.isObject(result) && !angular.isUndefined(result.finally)) {
                                        result.finally(function() {
                                            scope.running = false;
                                        });
                                    } else {
                                        scope.running = false;
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
