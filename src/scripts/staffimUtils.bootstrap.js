'use strict';
(function() {
    angular.module('staffimUtils')
        .config(tooltipConfig);

    tooltipConfig.$inject = ['$uibTooltipProvider'];
    function tooltipConfig($uibTooltipProvider) {
        $uibTooltipProvider.options({
            appendToBody: true
        });
    }
})();
