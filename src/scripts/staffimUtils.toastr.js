'use strict';
(function() {
    angular.module('staffimUtils')
        .config(toastrConfig);

    toastrConfig.$inject = ['toastrConfig'];
    function toastrConfig(toastrConfig) {
        angular.extend(toastrConfig, {
            allowHtml: true
        });
    }
})();
