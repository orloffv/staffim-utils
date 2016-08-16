(function(){
    angular.module('staffimUtils', ['ui.router', 'ngSanitize', 'ngNotify']);
    angular.module('staffimUtils.uploader', ['ngFileUpload', 'staffimAuth']);
})();
