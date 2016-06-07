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
