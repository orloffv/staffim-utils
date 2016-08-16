'use strict';
(function() {
    angular.module('staffimUtils')
        .service('SUStorage', SUStorage);

    SUStorage.$inject = ['$window', '$injector'];
    function SUStorage($window, $injector) {
        var storage,
            cookieStoragetore = {
                isSupported: function() {
                    return $injector.has('$cookieStore');
                },
                getStore: function() {
                    return $injector.get('$cookieStore');
                }
            },
            localStorageStore = {
                get: function(key) {
                    var value = $window.localStorage[key];

                    try {
                        return value ? angular.fromJson(value) : value;
                    } catch (e) {
                        return null;
                    }
                },
                put: function(key, value) {
                    $window.localStorage.setItem(key, angular.toJson(value));
                },
                remove: function(key) {
                    $window.localStorage.removeItem(key);
                },
                isSupported: function() {
                    var storage = $window.localStorage,
                        key = '__' + Math.round(Math.random() * 1e7);
                    try {
                        storage.setItem(key, '1');
                        storage.removeItem(key);

                        return 'localStorage' in $window && $window.localStorage;
                    } catch (error) {
                        return false;
                    }
                }
            },
            cookieStorage = {
                get: function(key, defaultValue) {
                    var value = cookieStoragetore.getStore().get(key);

                    if (_.isUndefined(value) && !_.isUndefined(defaultValue)) {
                        return defaultValue;
                    }

                    return value;
                },
                set: function(key, value) {
                    cookieStoragetore.getStore().put(key, value);
                },
                remove: function(key) {
                    cookieStoragetore.getStore().remove(key);
                },
                type: 'cookie'
            },
            localStorage = {
                get: function(key, defaultValue) {
                    var value = localStorageStore.get(key);

                    if (_.isUndefined(value) && !_.isUndefined(defaultValue)) {
                        return defaultValue;
                    }

                    return value;
                },
                set: function(key, value) {
                    localStorageStore.put(key, value);
                },
                remove: function(key) {
                    localStorageStore.remove(key);
                },
                type: 'localStorage'
            };

        if (localStorageStore.isSupported()) {
            storage = localStorage;
        } else if (cookieStoragetore.isSupported()) {
            storage = cookieStorage;
        } else {
            storage = {};
        }

        storage.increment = function(key) {
            /*jshint bitwise: false */
            var current = this.get(key);
            var value = (current|0) ? current + 1 : 1;
            this.set(key, value);

            return value;
        };

        return storage;
    }
})();
