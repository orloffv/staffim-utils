'use strict';
(function() {
    angular.module('staffimUtils')
        .filter('lineBreaks', lineBreaks);

    lineBreaks.$inject = ['$sce'];
    function lineBreaks($sce) {
        return function(text) {
            /*jshint bitwise: false */
            text = text || '';

            return $sce.trustAsHtml(text.replace(/\n$/, '<br/>&nbsp;').replace(/\n/g, '<br/>'));
        };
    }
})();
