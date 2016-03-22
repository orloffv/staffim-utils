'use strict';
(function() {
    angular.module('staffimUtils')
        .filter('filesize', fileSizeFilter);

    function fileSizeFilter() {
        var units = [
            'байт',
            'Кб',
            'Мб',
            'Гб',
            'Тб',
            'Пб'
        ];

        return function(bytes, precision) {
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
                return '?';
            }

            var unit = 0;
            bytes = parseFloat(bytes);

            while (bytes >= 1024) {
                bytes /= 1024;
                unit ++;
            }

            return bytes.toFixed(+ precision) + ' ' + units[unit];
        };
    }
})();
