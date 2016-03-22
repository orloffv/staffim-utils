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
