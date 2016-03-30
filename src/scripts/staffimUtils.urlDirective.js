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
                options: '@suUrlOptions',
                oneTime: '@oneTime'
            },
            link: function ($scope, element) {
                setHref(element);
                if (!$scope.oneTime) {
                    $scope.$watch('model', function(newVal, oldVal) {
                        if (!_.isEqual(getHref(newVal), getHref(oldVal))) {
                            setHref(element);
                        }
                    });
                }

                function setHref(element) {
                    element.attr('ui-sref', SUUrlService.getStateName($scope.model, $scope.route, $scope.params));
                    element.attr('href', getHref($scope.model));
                }

                function getHref(model) {
                    return SUUrlService.getUrl(model, $scope.route, $scope.params, $scope.options);
                }
            }
        };
    }
})();
