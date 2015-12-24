'use strict';
(function() {
    angular.module('staffimUtils')
        .service('SUUrlService', SUUrlService);

    SUUrlService.$inject = ['$state'];
    function SUUrlService($state) {
        var service = {};
        service.getState = getState;
        service.getUrl = getUrl;
        service.getStateName = getStateName;
        service.goToUrl = goToUrl;

        return service;

        function getState(model, route, params, options) {
            if (_.isUndefined(model._getState)) {
                throw new Error('_getState not found');
            }

            var state = model._getState(route, params);
            if (!$state.get(state.name)) {
                throw new Error('State(' + state.name + ') not found');
            }

            return state;
        }

        function getUrl(model, route, params, options) {
            var state = this.getState(model, route, params, options);

            return $state.href(state.name, state.params, _.extend({inherit: false}, options));
        }

        function getStateName(model, route, params) {
            var state = this.getState(model, route, params);

            return state.name;
        }

        function goToUrl(model, route, params, options) {
            var state = this.getState(model, route, params, options);

            return $state.go(state.name, state.params, _.extend({inherit: false}, options));
        }
    }
})();
