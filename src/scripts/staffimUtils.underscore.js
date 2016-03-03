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
        },
        copyModel: function(original, copyModel) {
            copyModel = angular.copy(original, copyModel);
            _.each(original, function(item, key) { //Hack for hasMany relation save
                if (_.isObject(item) && !_.isUndefined(item.length) && _.has(item, '$scope')) {
                    copyModel[key] = item;
                }
            }, this);

            return copyModel;
        }
    });
})();
