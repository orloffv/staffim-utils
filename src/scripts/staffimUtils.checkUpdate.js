'use strict';
(function() {
    angular.module('staffimUtils')
        .service('SUCheckUpdate', checkUpdate);

    checkUpdate.$inject = ['APP_VERSION', '$timeout', '$http', 'SUNotify', 'moment', '$window', '$sce', '$injector'];
    function checkUpdate(APP_VERSION, $timeout, $http, SUNotify, moment, $window, $sce, $injector) {
        /*jshint validthis:true */
        var service = {};
        service.init = init;
        service.check = check;
        service.canUpdate = canUpdate;
        service.checkAppCache = checkAppCache;
        service.checkAppJson = checkAppJson;
        service.isAppCache = isAppCache;
        service.getAppCache = getAppCache;
        service.delay = 1000 * 10 * 60;

        function init(delay) {
            if (delay) {
                this.delay = delay;
            }
            $timeout(_.bind(this.check, this), this.delay);
            $('body')
                .off('.checkUpdate')
                .on('click.checkUpdate', '[data-button="reload"]', function() {
                    $window.location.reload();
                });
        }

        function canUpdate() {
            SUNotify.info(
                $sce.trustAsHtml('Обнаружена новая версия приложения<br><button data-button="reload" class="btn btn-default waves-effect m-t-10">Обновить</button>'),
                {
                    sticky: true
                }
            );
        }

        function checkAppCache() {
            var that = this;
            this.getAppCache().checkUpdate()
                .then(function() {
                    that.getAppCache().swapCache();
                    that.canUpdate();
                });
        }

        function checkAppJson() {
            var that = this;

            $http
                .get('/app.json?' + moment().unix(), {ignoreLoadingBar: true})
                .then(function(response) {
                    if (response.data && response.data.appVersion) {
                        if (response.data.appVersion !== APP_VERSION) {
                            that.canUpdate();
                        }

                        APP_VERSION = response.data.appVersion;
                    }
                });
        }

        function check() {
            $timeout(_.bind(this.check, this), this.delay);
            if (this.isAppCache()) {
                this.checkAppCache();
            } else {
                this.checkAppJson();
            }
        }

        function isAppCache() {
            return this.getAppCache() && this.getAppCache().status && this.getAppCache().textStatus !== 'UNCACHED';
        }

        function getAppCache() {
            if (!$injector.has('appcache')) {
                return null;
            }

            return $injector.get('appcache');
        }

        return service;
    }
})();
