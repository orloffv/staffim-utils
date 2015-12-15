'use strict';
(function() {
    angular.module('staffimUtils.uploader')
        .value('SUUploaderOptions', {
            url: '/',
            ngfAllowDir: false,
            ngfMaxSize: '10MB',
            accept: 'image/*',
            allowEmptyResponse: false
        })
        .service('SUUploader', function($q, Upload, cfpLoadingBar, SUUploaderOptions) {
            var defaults = {
                ngfAllowDir: SUUploaderOptions.ngfAllowDir,
                ngfMaxSize: SUUploaderOptions.ngfMaxSize,
                accept: SUUploaderOptions.accept,
                allowEmptyResponse: SUUploaderOptions.allowEmptyResponse
            };

            var Uploader = function(opts, object, url, isImage) {
                this.construct = function(opts, object, url, isImage) {
                    object = object || {file: null};
                    object.onChange = _.bind(this.onChange, this);

                    this.object = object;
                    this.isImage = isImage || true;
                    this.url = url || SUUploaderOptions.url;
                    this.options = angular.extend({}, defaults, opts);
                    object.accept = this.options.accept;

                    Upload.setDefaults(this.options);
                };

                this.onChange = function(file) {
                    if (this.isImage) {
                        if (file) {
                            Upload.dataUrl(file)
                                .then(function(url) {
                                    object.data = url;
                                });
                        } else {
                            object.data = null;
                        }
                    }
                };

                this.upload = function(requiredFile) {
                    var that = this;
                    requiredFile = requiredFile || false;
                    var defer = $q.defer();

                    if (this.object.file) {
                        cfpLoadingBar.start();
                        var upload = Upload.upload({
                            url: _.result(this, 'url'),
                            data: {file: this.object.file},
                            ignoreLoadingBar: true
                        });
                        upload
                            .then(function(response) {
                                if (that.isImage) {
                                    object.data = null;
                                }

                                if (!that.options.allowEmptyResponse && _.isObject(response) && _.isObject(response.data) && _.has(response.data, 'id')) {
                                    defer.resolve(response.data.id);
                                } else if (that.options.allowEmptyResponse) {
                                    defer.resolve(response.data);
                                } else {
                                    defer.reject();
                                }
                            }, function(response) {
                                defer.reject(response);
                            }, function(evt) {
                                cfpLoadingBar.set(evt.loaded / evt.total);
                            }
                        )
                            .finally(function() {
                                cfpLoadingBar.complete();
                            });
                    } else if (requiredFile) {
                        defer.reject();
                    } else {
                        defer.resolve();
                    }

                    return defer.promise;
                };

                this.clear = function() {
                    this.object.data = null;
                    this.object.file = null;
                };

                this.construct(opts, object, url, isImage);
            };

            return Uploader;
        });
})();
