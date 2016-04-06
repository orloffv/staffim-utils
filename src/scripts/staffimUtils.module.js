(function(){
    angular.module('staffimUtils', ['ui.router', 'ngCookies', 'ngSanitize', 'ngNotify']);
    angular.module('staffimUtils.uploader', ['ngFileUpload', 'staffimAuth']);
})();
