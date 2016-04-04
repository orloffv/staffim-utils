'use strict';
(function() {
    angular.module('staffimUtils')
        .directive('suUrl', SUUrlDirective);

    SUUrlDirective.$inject = ['SUUrlService'];
    function SUUrlDirective(SUUrlService) {
        return {
            restrict: 'A',
            link: function ($scope, element, attrs) {
                var oneTime = attrs.suUrlOneTime,
                    options = attrs.suUrlOptions,
                    params = attrs.suUrlParams,
                    route = attrs.suUrlRoute,
                    model = $scope.$eval(attrs.suUrl);

                setHref(element);
                if (!oneTime) {
                    $scope.$watch(attrs.suUrl, function(newVal, oldVal) {
                        if (!_.isEqual(getHref(newVal), getHref(oldVal))) {
                            setHref(element);
                        }
                    });
                }

                function setHref(element) {
                    element.attr('ui-sref', SUUrlService.getStateName(model, route, params));
                    element.attr('href', getHref(model));
                }

                function getHref(model) {
                    return SUUrlService.getUrl(model, route, params, options);
                }
            }
        };
    }
})();
