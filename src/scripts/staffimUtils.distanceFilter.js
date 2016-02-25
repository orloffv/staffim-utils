'use strict';
(function() {
    angular.module('staffimUtils')
        .filter('distance', distanceFilter);

    function distanceFilter() {
        var units = [
            'м',
            'км',
            'тыс. км'
        ];

        return function(meters, precision) {
            if (isNaN(parseFloat(meters)) || !isFinite(meters)) {
                return '?';
            }

            var unit = 0;

            while (meters >= 1000) {
                meters /= 1000;
                unit ++;
            }

            return meters.toFixed(+ precision) + ' ' + units[unit];
        };
    }
})();
