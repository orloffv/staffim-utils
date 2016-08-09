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
    };

    $.fn.getXPath = function(rootNodeName){
        //other nodes may have the same XPath but because this function is used to determine the corresponding input name of a data node, index is not included
        var position,
            $node = this.first(),
            nodeName = $node.prop('nodeName'),
            $sibSameNameAndSelf = $node.siblings(nodeName).addBack(),
            steps = [],
            $parent = $node.parent(),
            parentName = $parent.prop('nodeName');

        position = ($sibSameNameAndSelf.length > 1) ? '['+($sibSameNameAndSelf.index($node)+1)+']' : '';
        steps.push(nodeName+position);

        while ($parent.length == 1 && parentName !== rootNodeName && parentName !== '#document'){
            $sibSameNameAndSelf = $parent.siblings(parentName).addBack();
            position = ($sibSameNameAndSelf.length > 1) ? '['+($sibSameNameAndSelf.index($parent)+1)+']' : '';
            steps.push(parentName+position);
            $parent = $parent.parent();
            parentName = $parent.prop('nodeName');
        }
        return '/'+steps.reverse().join('/');
    };
}(window.$));
