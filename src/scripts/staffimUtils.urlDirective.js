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
                element.attr('ui-sref', SUUrlService.getStateName($scope.model, $scope.route, $scope.params));
                element.attr('href', SUUrlService.getUrl($scope.model, $scope.route, $scope.params, $scope.options));
            }
        };
    }
})();
