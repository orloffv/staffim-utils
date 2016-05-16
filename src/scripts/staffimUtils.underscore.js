'use strict';
(function() {
    _.mixin(s.exports());

    function isSpecificValue(val) {
        return (
        //val instanceof Buffer ||
        val instanceof Date
        || val instanceof RegExp
        ) ? true : false;
    }

    function cloneSpecificValue(val) {
        //if (val instanceof Buffer) {
        //    var x = new Buffer(val.length);
        //    val.copy(x);
        //    return x;
        //} else
        if (val instanceof Date) {
            return new Date(val.getTime());
        } else if (val instanceof RegExp) {
            return new RegExp(val);
        } else {
            throw new Error('Unexpected situation');
        }
    }

    /**
     * Recursive cloning array.
     */
    function deepCloneArray(arr) {
        var clone = [];
        arr.forEach(function (item, index) {
            if (typeof item === 'object' && item !== null) {
                if (Array.isArray(item)) {
                    clone[index] = deepCloneArray(item);
                } else if (isSpecificValue(item)) {
                    clone[index] = cloneSpecificValue(item);
                } else {
                    clone[index] = deepExtend({}, item);
                }
            } else {
                clone[index] = item;
            }
        });
        return clone;
    }

    function deepExtend (/*obj_1, [obj_2], [obj_N]*/) {
        if (arguments.length < 1 || typeof arguments[0] !== 'object') {
            return false;
        }

        if (arguments.length < 2) {
            return arguments[0];
        }

        var target = arguments[0];

        // convert arguments to array and cut off target object
        var args = Array.prototype.slice.call(arguments, 1);

        var val, src, clone;

        args.forEach(function (obj) {
            // skip argument if it is array or isn't object
            if (typeof obj !== 'object' || Array.isArray(obj)) {
                return;
            }

            Object.keys(obj).forEach(function (key) {
                src = target[key]; // source value
                val = obj[key]; // new value

                // recursion prevention
                if (val === target) {
                    return;

                    /**
                     * if new value isn't object then just overwrite by new value
                     * instead of extending.
                     */
                } else if (typeof val !== 'object' || val === null) {
                    target[key] = val;
                    return;

                    // just clone arrays (and recursive clone objects inside)
                } else if (Array.isArray(val)) {
                    target[key] = deepCloneArray(val);
                    return;

                    // custom cloning and overwrite for specific objects
                } else if (isSpecificValue(val)) {
                    target[key] = cloneSpecificValue(val);
                    return;

                    // overwrite by new value if source isn't object or array
                } else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
                    target[key] = deepExtend({}, val);
                    return;

                    // source value and new value is objects both, extending...
                } else {
                    target[key] = deepExtend(src, val);
                    return;
                }
            });
        });

        return target;
    }

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
            copyMany(original, copyModel, 0);

            //Hack for hasMany relation save
            function copyMany(original, copyModel, depth) {
                _.each(original, function(originalItem, key) {
                    if (_.has(originalItem, '$scope')) {
                        if (_.isObject(originalItem) && !_.isUndefined(originalItem.length)) {
                            copyModel[key] = originalItem;
                        } else {
                            if (depth <=2) {
                                copyMany(originalItem, copyModel[key], depth + 1);
                            }
                        }
                    }
                }, this);
            }

            return copyModel;
        },
        //https://github.com/unclechu/node-deep-extend
        deepExtend: deepExtend
    });
})();
