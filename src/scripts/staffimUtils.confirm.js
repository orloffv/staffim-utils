'use strict';
(function() {
    angular.module('staffimUtils')
        .directive('suConfirm', suConfirm);

    suConfirm.$inject = [];
    function suConfirm() {
        return {
            priority: 1,
            restrict: 'A',
            scope: {
                ngClick: '&',
                suConfirm: '@'
            },
            link: function($scope, element) {
                element.unbind('click').bind('click', function($event) {
                    $event.preventDefault();
                    if (confirm($scope.suConfirm)) {
                        $scope.$apply($scope.ngClick);
                    }
                });
            }
        };
    }
})();
