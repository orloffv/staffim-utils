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
