'use strict';
(function() {
    _.mixin(s.exports());

    _.mixin({
        getById: function(collection, id) {
            return _.find(collection, function(model) {
                return model.id === id;
            });
        }
    })
})();
