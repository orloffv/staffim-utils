'use strict';
(function() {
    angular.module('staffimUtils')
        .constant('SU_EVENTS', {
            //INVALID_REQUEST: 'invalid-request',
            APPLICATION_RUN: 'application-run',
            //FAILED_REQUEST_OFFLINE: 'failed-request-offline',
            FAILED_REQUEST_404: 'failed-request-404'
            //FAILED_REQUEST_403: 'failed-request-403',
            //FAILED_REQUEST_SERVER: 'failed-request-server'
        })
        .constant('moment', moment)
        .constant('jQuery', window.$);
})();
