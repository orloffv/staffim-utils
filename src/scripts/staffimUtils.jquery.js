'use strict';
(function($) {
    // duck-punching to make attr() return a map
    var _old = $.fn.attr;
    $.fn.attr = function() {
        var a, aLength, attributes, map;
        if (this[0] && arguments.length === 0) {
            map = {};
            attributes = this[0].attributes;
            aLength = attributes.length;
            for (a = 0; a < aLength; a++) {
                map[attributes[a].name.toLowerCase()] = attributes[a].value;
            }
            return map;
        } else {
            return _old.apply(this, arguments);
        }
    }
}(window.$));
