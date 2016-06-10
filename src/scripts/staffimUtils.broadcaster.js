'use strict';
(function() {
    angular.module('staffimUtils')
        .run(broadcaster);

    broadcaster.$inject = ['$rootScope', '$window', 'SU_EVENTS'];
    function broadcaster($rootScope, $window, SU_EVENTS) {
        $window.onunload = onunload;
        function onunload() {
            $rootScope.$broadcast(SU_EVENTS.WINDOW_UNLOAD);
        }
    }
})();
