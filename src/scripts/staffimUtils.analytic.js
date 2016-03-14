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
