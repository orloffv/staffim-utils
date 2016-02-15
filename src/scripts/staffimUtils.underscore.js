'use strict';
(function() {
    _.mixin(s.exports());

    _.mixin({
        getById: function(collection, id) {
            return _.find(collection, function(model) {
                return model.id === id;
            });
        },
        removeById: function(collection, id) {
            var index = _.findIndex(collection, function(model) {
                return _.has(model, 'id') && model.id === id;
            });

            if (index !== -1) {
                collection.splice(index, 1);
            }

            return collection;
        },
        insertArray: function(collection, position, item) {
            collection.splice(position, 0, item);

            return collection;
        }
    });
})();
