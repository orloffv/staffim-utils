'use strict';
(function() {
    angular.module('staffimUtils')
        .factory('SUFormatterDate', function(moment) {
            return {
                formatter: function(val) {
                    return val ? (moment(val).format('YYYY-MM-DDT00:00:00.000') + 'Z') : null;
                },
                parser: function(val) {
                    return val ? moment(val).toDate() : null;
                }
            };
        })
        .factory('SUFormatterDateTime', function(moment) {
            return {
                formatter: function(val) {
                    return val ? (moment(val).format('YYYY-MM-DDTHH:mm:ss') + 'Z') : null;
                },
                parser: function(val) {
                    return val ? moment(val).toDate() : null;
                }
            };
        });
})();
