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
