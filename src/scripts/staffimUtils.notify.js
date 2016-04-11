'use strict';
(function() {
    angular.module('staffimUtils')
        .run(notifyConfig)
        .service('SUNotify', SUNotify);

    SUNotify.$inject = ['ngNotify', '$injector'];
    function SUNotify(ngNotify, $injector) {
        var service = {};
        service.success = success;
        service.error = error;
        service.errorResponse = errorResponse;
        service.info = info;

        function success(message, options) {
            return ngNotify.set(message, _.extend({type: 'success'}, options));
        }

        function error(message, options) {
            return ngNotify.set(message, _.extend({type: 'error', duration: 3000}, options));
        }

        function info(message, options) {
            return ngNotify.set(message, _.extend({type: 'info'}, options));
        }

        function errorResponse(response, message) {
            var SRErrorTranslator = $injector.get('SRErrorTranslator');

            var translator = new SRErrorTranslator(response.modelName);
            var errors = translator.parseResponse(response.$response);
            if (_.size(errors) || message) {
                this.error(_.size(errors) ? _.toSentence(errors, '<br>', '<br>') : message);
            }
        }

        return service;
    }

    notifyConfig.$inject = ['ngNotify'];
    function notifyConfig(ngNotify) {
        ngNotify.config({
            theme: 'pure',
            position: 'top',
            duration: 1000,
            button: true,
            html: true
        });
    }
})();
