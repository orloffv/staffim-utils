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
