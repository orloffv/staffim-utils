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
